// Minimal Chrome DevTools Protocol driver (Node 24 global WebSocket). All /api/* requests
// are intercepted: mocks answer them, so no paid call can leave the browser.
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { constants, tmpdir } from "node:os";
import { join } from "node:path";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Browsers launched by this process. A run that throws, hangs and gets killed, or is
// interrupted never reaches close(); without this sweep its headless Chrome is orphaned and
// its ~150 MB profile stays in $TMPDIR. Only SIGKILL of node itself can still leak.
const browsers = new Set();
const disposeAll = () => { for (const dispose of browsers) dispose(); };
process.on("exit", disposeAll);
for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) process.once(sig, () => { disposeAll(); process.exit(128 + constants.signals[sig]); });

// live: true lets /api/* through to the real server (paid; only for scripts/e2e/live-uat.mjs)
// and records each call's path and status instead.
export async function launch({ width = 390, height = 844, mocks = {}, live = false } = {}) {
  const port = 9300 + Math.floor(Math.random() * 500);
  const profile = mkdtempSync(join(tmpdir(), "im-e2e-"));
  const proc = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "--no-first-run", "about:blank"], { stdio: "ignore" });
  const running = () => proc.exitCode === null && proc.signalCode === null;
  // Synchronous so it also works inside process "exit"; idempotent.
  const dispose = () => {
    browsers.delete(dispose);
    if (running()) proc.kill("SIGKILL");
    rmSync(profile, { recursive: true, force: true, maxRetries: 3 });
  };
  browsers.add(dispose);
  let ws;
  try {
    let tabs;
    for (let i = 0; i < 50; i++) { try { tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); if (tabs.length) break; } catch { /* starting */ } await sleep(100); }
    const page = tabs?.find((t) => t.type === "page");
    if (!page) throw new Error(`Chrome did not expose a page on port ${port}`);
    ws = new WebSocket(page.webSocketDebuggerUrl);
    // A failed socket never fires "open"; without the reject, launch() would hang instead of cleaning up.
    await new Promise((res, rej) => {
      ws.addEventListener("open", res, { once: true });
      ws.addEventListener("error", () => rej(new Error(`CDP WebSocket failed on port ${port}`)), { once: true });
    });
  } catch (e) { dispose(); throw e; }
  let id = 0; const waiting = new Map(); const api = [];
  const send = (method, params = {}) => new Promise((res, rej) => { const n = ++id; waiting.set(n, { res, rej: (e) => rej(new Error(`${method}: ${e.message}`)) }); ws.send(JSON.stringify({ id: n, method, params })); });
  ws.addEventListener("message", async (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && waiting.has(msg.id)) { const w = waiting.get(msg.id); waiting.delete(msg.id); msg.error ? w.rej(new Error(msg.error.message)) : w.res(msg.result); return; }
    if (live && msg.method === "Network.responseReceived" && new URL(msg.params.response.url).pathname.startsWith("/api/")) {
      api.push(`${new URL(msg.params.response.url).pathname} ${msg.params.response.status}`);
      return;
    }
    if (msg.method === "Fetch.requestPaused") {
      const { requestId, request } = msg.params;
      const path = new URL(request.url).pathname;
      api.push(path);
      const mock = mocks[path];
      if (mock) {
        // A mock may answer { __status, __body } to simulate an error response.
        const out = typeof mock === "function" ? mock(request) : mock;
        const status = out?.__status ?? 200;
        const body = Buffer.from(JSON.stringify(out?.__status ? out.__body : out)).toString("base64");
        await send("Fetch.fulfillRequest", { requestId, responseCode: status, responseHeaders: [{ name: "Content-Type", value: "application/json" }], body });
      } else await send("Fetch.failRequest", { requestId, errorReason: "BlockedByClient" });
    }
  });
  if (live) await send("Network.enable");
  else await send("Fetch.enable", { patterns: [{ urlPattern: "*/api/*" }] });
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 600 });
  const evaluate = async (expression) => {
    const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
    return r.result.value;
  };
  // Runs before any page script on every navigation (e.g. to stub browser APIs).
  const addInit = (source) => send("Page.addScriptToEvaluateOnNewDocument", { source });
  const goto = async (url) => { await send("Page.enable"); await send("Page.navigate", { url }); await sleep(1500); };
  const screenshot = async () => Buffer.from((await send("Page.captureScreenshot", { format: "png" })).data, "base64");
  // Graceful: lets Chrome finish writing before its profile is removed. Callers need not
  // await it; the child handle keeps node alive until the exit, and the sweep covers process.exit().
  const close = () => new Promise((resolve) => {
    ws.close();
    if (!running()) { dispose(); return resolve(); }
    // Escalate to SIGKILL if Chrome ignores SIGTERM, so close() cannot hang the run.
    const force = setTimeout(dispose, 5000);
    proc.once("exit", () => { clearTimeout(force); dispose(); resolve(); });
    proc.kill();
  });
  return { evaluate, goto, addInit, screenshot, close, api, sleep, send };
}

// In-page helpers, injected as a string.
export const HELPERS = `
window.$t = (sel, text) => [...document.querySelectorAll(sel)].find((e) => e.textContent.trim().includes(text));
window.$click = (sel, text) => { const e = text ? $t(sel, text) : document.querySelector(sel); if (!e) throw new Error("not found: " + sel + " " + (text ?? "")); e.click(); return true; };
window.$type = (sel, value) => { const e = document.querySelector(sel); const proto = e.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, "value").set.call(e, value); e.dispatchEvent(new Event("input", { bubbles: true })); return true; };
window.$wait = (ms) => new Promise((r) => setTimeout(r, ms));
`;

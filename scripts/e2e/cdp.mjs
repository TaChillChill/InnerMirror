// Minimal Chrome DevTools Protocol driver (Node 24 global WebSocket). All /api/* requests
// are intercepted: mocks answer them, so no paid call can leave the browser.
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// live: true lets /api/* through to the real server (paid; only for scripts/e2e/live-uat.mjs)
// and records each call's path and status instead.
export async function launch({ width = 390, height = 844, mocks = {}, live = false } = {}) {
  const port = 9300 + Math.floor(Math.random() * 500);
  const proc = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), "im-e2e-"))}`, "--no-first-run", "about:blank"], { stdio: "ignore" });
  let tabs;
  for (let i = 0; i < 50; i++) { try { tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); if (tabs.length) break; } catch { /* starting */ } await sleep(100); }
  const page = tabs.find((t) => t.type === "page");
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener("open", r, { once: true }));
  let id = 0; const waiting = new Map(); const api = [];
  const send = (method, params = {}) => new Promise((res, rej) => { const n = ++id; waiting.set(n, { res, rej }); ws.send(JSON.stringify({ id: n, method, params })); });
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
  const close = () => { ws.close(); proc.kill(); };
  return { evaluate, goto, addInit, screenshot, close, api, sleep, send };
}

// In-page helpers, injected as a string.
export const HELPERS = `
window.$t = (sel, text) => [...document.querySelectorAll(sel)].find((e) => e.textContent.trim().includes(text));
window.$click = (sel, text) => { const e = text ? $t(sel, text) : document.querySelector(sel); if (!e) throw new Error("not found: " + sel + " " + (text ?? "")); e.click(); return true; };
window.$type = (sel, value) => { const e = document.querySelector(sel); const proto = e.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, "value").set.call(e, value); e.dispatchEvent(new Event("input", { bubbles: true })); return true; };
window.$wait = (ms) => new Promise((r) => setTimeout(r, ms));
`;

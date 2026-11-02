// Small Chrome DevTools Protocol client for recording the demo take. Same approach as
// scripts/e2e/cdp.mjs, plus event listeners (needed for screencast frames). /api/* is either
// mocked (dry run, $0) or let through to the real server (live take, recorded per call).
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// `passthrough`: /api paths that go to the real server even when the others are mocked.
export async function launch({ width, height, scale = 2, mocks = null, passthrough = [] }) {
  const port = 9800 + Math.floor(Math.random() * 150);
  const proc = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), "im-film-"))}`,
    "--no-first-run", "--hide-scrollbars",
    // The screencast sends CSS pixels unless the whole browser renders at the device scale.
    ...(scale !== 1 ? [`--force-device-scale-factor=${scale}`] : []), "about:blank"], { stdio: "ignore" });
  let tabs = [];
  for (let i = 0; i < 100 && !tabs.length; i++) {
    try { tabs = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).filter((t) => t.type === "page"); } catch { /* starting */ }
    if (!tabs.length) await sleep(150);
  }
  const ws = new WebSocket(tabs[0].webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener("open", r, { once: true }));
  let id = 0;
  const waiting = new Map();
  const listeners = new Map();
  const api = [];
  const send = (method, params = {}) => new Promise((res, rej) => {
    const n = ++id;
    waiting.set(n, { res, rej: (e) => rej(new Error(`${method}: ${e.message}`)) });
    ws.send(JSON.stringify({ id: n, method, params }));
  });
  const on = (method, fn) => listeners.set(method, fn);
  ws.addEventListener("message", async (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && waiting.has(msg.id)) {
      const w = waiting.get(msg.id); waiting.delete(msg.id);
      msg.error ? w.rej(new Error(msg.error.message)) : w.res(msg.result);
      return;
    }
    if (msg.method === "Fetch.requestPaused") {
      const { requestId, request } = msg.params;
      const path = new URL(request.url).pathname;
      api.push({ path, at: Date.now() });
      const body = mocks?.[path];
      if (body) {
        await sleep(body.__delay ?? 0);
        const data = Buffer.from(JSON.stringify(body.__body ?? body)).toString("base64");
        await send("Fetch.fulfillRequest", { requestId, responseCode: 200, responseHeaders: [{ name: "Content-Type", value: "application/json" }], body: data });
      } else if (passthrough.includes(path)) await send("Fetch.continueRequest", { requestId });
      else await send("Fetch.failRequest", { requestId, errorReason: "BlockedByClient" });
      return;
    }
    if (msg.method === "Network.responseReceived") {
      const u = new URL(msg.params.response.url);
      if (u.pathname.startsWith("/api/")) api.push({ path: u.pathname, status: msg.params.response.status, at: Date.now() });
    }
    listeners.get(msg.method)?.(msg.params);
  });
  // Mocked: every /api/* request is answered locally, nothing can reach Meta.
  if (mocks) await send("Fetch.enable", { patterns: [{ urlPattern: "*/api/*" }] });
  if (!mocks || passthrough.length) await send("Network.enable");
  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: scale, mobile: false });
  const evaluate = async (expression) => {
    const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? r.exceptionDetails.text);
    return r.result.value;
  };
  const goto = async (url) => { await send("Page.navigate", { url }); await sleep(1500); };
  const screenshot = async () => Buffer.from((await send("Page.captureScreenshot", { format: "png" })).data, "base64");
  const close = () => { try { ws.close(); } catch { /* closed */ } proc.kill(); };
  return { send, on, evaluate, goto, screenshot, close, api };
}

// In-page helpers: find by text, click with a reported position (for the tap rings in the edit).
export const HELPERS = `
window.$t = (sel, text) => [...document.querySelectorAll(sel)].find((e) => e.textContent.trim().includes(text));
window.$el = (sel, text) => { const e = text ? $t(sel, text) : document.querySelector(sel); if (!e) throw new Error("not found: " + sel + " " + (text ?? "")); return e; };
window.$tap = (e) => { e.scrollIntoView({ block: "nearest", inline: "nearest" }); const r = e.getBoundingClientRect(); e.click(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) }; };
window.$wait = (ms) => new Promise((r) => setTimeout(r, ms));
`;

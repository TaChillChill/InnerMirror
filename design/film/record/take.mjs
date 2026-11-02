// Records the demo take: drives the real app through the film's flow at 1280 × 720 (1.5× =
// 1920 × 1080 frames), capturing a CDP screencast plus timed marks and tap positions.
//   node record/take.mjs --mock <name>   dry run, every /api/* answered locally ($0)
//   node record/take.mjs --live <name>   real app + real Muse (server must run with APP_SPEND_CAP_USD)
//   node record/take.mjs --replay <name>  FROM=<take>: extract + analyze answered with that take's
//                                         real responses (api.json), What if? live (paid)
//   WI_MSG / WI_STATE choose the message and state explored in D6 (default: "wow ok…" as Adult).
//   THEME=dark (default light) picks the app theme; live takes also keep Muse's real responses
//   in api.json (kept in git: synthetic chat, real Muse output) so the motion and the README quote them exactly.
// Output: public/take/<name>/frames/*.jpg, take.json (frames, marks, taps, api calls).
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { launch, HELPERS, sleep } from "./cdp.mjs";
import { seedCollections } from "./seed.mjs";
import { mockApi } from "./mock.mjs";

const [mode, name = mode === "--live" ? "live" : "dry"] = process.argv.slice(2);
if (!["--mock", "--live", "--replay"].includes(mode)) throw new Error("usage: take.mjs --mock|--live|--replay <name>");
const APP = process.env.APP_URL ?? "http://localhost:3124";
const film = fileURLToPath(new URL("..", import.meta.url));
const out = `${film}public/take/${name}`;
rmSync(out, { recursive: true, force: true });
mkdirSync(`${out}/frames`, { recursive: true });

// Replay: the earlier take's own Muse responses, so the screens before D6 match it exactly.
const replay = () => {
  const prev = JSON.parse(readFileSync(`${film}public/take/${process.env.FROM}/api.json`, "utf8"));
  const body = (path) => ({ __delay: 2500, ...prev.find((x) => x.path === path).body });
  return { "/api/extract": body("/api/extract"), "/api/analyze": body("/api/analyze") };
};
const b = await launch({ width: 1280, height: 720, scale: 1.5, mocks: mode === "--mock" ? await mockApi() : mode === "--replay" ? replay() : null,
  passthrough: mode === "--replay" ? ["/api/scenario"] : [] });
const frames = [], marks = [], taps = [], notes = [];
let t0 = 0;
const now = () => Date.now() - t0;
const mark = (id) => { marks.push({ id, t: now() }); console.log(`${(now() / 1000).toFixed(1)}s ${id}`); };
b.on("Page.screencastFrame", ({ data, metadata, sessionId }) => {
  const i = frames.length;
  writeFileSync(`${out}/frames/${String(i).padStart(5, "0")}.jpg`, Buffer.from(data, "base64"));
  frames.push({ i, t: Math.round(metadata.timestamp * 1000) });
  b.send("Page.screencastFrameAck", { sessionId }).catch(() => {});
});
// Live only: the API responses, exactly as the app received them.
const responses = [], pending = new Map();
b.on("Network.responseReceived", ({ requestId, response }) => { if (new URL(response.url).pathname.startsWith("/api/")) pending.set(requestId, new URL(response.url).pathname); });
b.on("Network.loadingFinished", async ({ requestId }) => {
  const path = pending.get(requestId);
  if (!path) return;
  pending.delete(requestId);
  try { const { body } = await b.send("Network.getResponseBody", { requestId }); responses.push({ path, t: now(), body: JSON.parse(body) }); } catch (e) { notes.push(`body ${path}: ${e.message}`); }
});
const step = async (js) => { await b.evaluate(HELPERS); return b.evaluate(js); };
const tap = async (js, label) => { const p = await step(`$tap(${js})`); taps.push({ ...p, t: now(), label }); await sleep(250); return p; };
const waitFor = async (js, ms) => { const end = Date.now() + ms; while (Date.now() < end) { if (await step(js)) return true; await sleep(400); } return false; };
const scrollTo = async (js, ms = 1400) => { await step(`(() => { const e = ${js}; const y = typeof e === "number" ? e : e.getBoundingClientRect().top + scrollY - 120; window.scrollTo({ top: y, behavior: "smooth" }); })()`); await sleep(ms); };
// A message bubble by its exact text (the bubble also holds a visually hidden "Name: ").
const msg = (text) => `[...document.querySelectorAll(".im-msg")].find((m) => (m.querySelector(".im-bubble")?.textContent ?? "").replace(/^[^:]*: /, "").trim() === ${JSON.stringify(text)})`;
const attempt = async (label, fn) => { try { await fn(); } catch (e) { notes.push(`${label}: ${e.message}`); console.log(`!! ${label}: ${e.message}`); } };

try {
  await b.goto(`${APP}/`);
  await b.evaluate(`localStorage.clear(); localStorage.setItem("innermirror.lang", "en"); localStorage.setItem("innermirror.theme", ${JSON.stringify(process.env.THEME ?? "light")});
    localStorage.setItem("innermirror.collections.v1", ${JSON.stringify(JSON.stringify(seedCollections()))}); location.reload()`);
  await sleep(2000);
  await b.send("Page.startScreencast", { format: "jpeg", quality: 88, maxWidth: 1920, maxHeight: 1080, everyNthFrame: 1 });
  t0 = Date.now();
  mark("landing");
  await sleep(1500);

  // D1 — screenshots in.
  await tap(`$el(".lp-cta")`, "start"); mark("add"); await sleep(900);
  await tap(`$el("[role=radio]", "I have the chat")`, "method"); await sleep(700);
  const files = [1, 2, 3].map((p) => readFileSync(`${film}shots/out/chat-${p}.png`).toString("base64"));
  await step(`(async () => { const dt = new DataTransfer(); for (const b64 of ${JSON.stringify(files)}) { const blob = await (await fetch("data:image/png;base64," + b64)).blob(); dt.items.add(new File([blob], "chat.png", { type: "image/png" })); } const i = document.querySelector(".app-drop input"); i.files = dt.files; i.dispatchEvent(new Event("change", { bubbles: true })); await $wait(400); return true; })()`);
  mark("shots-added"); await sleep(1800);
  await scrollTo(`$el(".app-add-panel .im-check")`, 900);
  await tap(`$el(".app-add-panel .im-check input")`, "consent-shots"); await sleep(500);
  await tap(`$el(".app-add-panel .im-btn--primary", "Continue")`, "read"); mark("extract-start");
  if (!(await waitFor(`!!document.querySelector(".app-rv-bubble")`, 150_000))) throw new Error("extract did not finish");
  mark("review"); await sleep(1800);

  // D2 — review every line, consent, analyze.
  await scrollTo(`$el(".app-rv-bubble")`, 1600);
  await scrollTo(`document.body.scrollHeight`, 2600);
  await tap(`$el("label.im-check input")`, "consent"); await sleep(600);
  await tap(`$el("button", "Look at this conversation")`, "analyze"); mark("analyze-start");
  if (!(await waitFor(`document.querySelectorAll(".app-meta-btn").length > 0`, 200_000))) throw new Error("analysis did not finish");
  mark("observe"); await sleep(2500);

  // D3 — what Mirror sees: one slow pass down the replay, pick self, open "k??".
  await scrollTo(`$el(".im-thread")`, 1800);
  await scrollTo(`$el(".app-whopick")`, 4200);
  // The right-hand sender has no name in the screenshots, so the app calls them "Me": pick whoever isn't Jordan.
  await attempt("self", () => tap(`[...document.querySelectorAll(".app-whopick .app-chip-btn")].find((x) => !/Jordan/.test(x.textContent))`, "self")); mark("self"); await sleep(900);
  await scrollTo(`${msg("k?? i said sorry")}`, 1500);
  await attempt("panel k??", () => tap(`${msg("k?? i said sorry")}.querySelector(".app-meta-btn")`, "panel-k??")); mark("panel-k??");
  await sleep(6000);

  // D5 — "k": not sure; "wow ok…": a choice different from Mirror's.
  await scrollTo(`${msg("k")}`, 1200);
  await attempt("panel k", () => tap(`${msg("k")}.querySelector(".app-meta-btn")`, "panel-k")); mark("panel-k"); await sleep(2200);
  await attempt("not sure", () => tap(`$el("aside .app-sel__opt", "Not sure")`, "not-sure")); mark("not-sure"); await sleep(2200);
  await scrollTo(`${msg("wow ok. i'm literally rushing rn")}`, 1200);
  await attempt("panel wow", () => tap(`${msg("wow ok. i'm literally rushing rn")}.querySelector(".app-meta-btn")`, "panel-wow")); mark("panel-wow"); await sleep(2500);
  // Mirror's own reading carries a "Mirror sees" tag inside its option.
  const ai = await step(`[...document.querySelectorAll("aside .app-sel__opt")].find((o) => /Mirror sees/.test(o.textContent))?.textContent ?? ""`);
  notes.push(`wow-ok Mirror sees: ${ai}`);
  const pick = /Critical/.test(ai) ? "Adapted Child" : "Critical Parent";
  await attempt("choose", () => tap(`$el("aside .app-sel__opt", ${JSON.stringify(pick)})`, "choose")); mark("chose"); await sleep(2500);

  // D6 — What if?: by default on the same message, explored as Adult; WI_MSG picks another message.
  if (process.env.WI_MSG) {
    await scrollTo(`${msg(process.env.WI_MSG)}`, 1400);
    await attempt("what if on message", () => tap(`[...${msg(process.env.WI_MSG)}.querySelectorAll("button")].find((x) => /What if/.test(x.textContent))`, "wi-msg"));
  } else await attempt("what if tab", () => tap(`$el("aside button", "What if?")`, "wi-tab"));
  mark("wi-open"); await sleep(1800);
  const wiState = process.env.WI_STATE ?? "Adult";
  await attempt("wi option", () => tap(`$el("aside .app-wi__opt", ${JSON.stringify(wiState)})`, "wi-state")); await sleep(900);
  await attempt("explore", () => tap(`$el("aside .app-wi__go button")`, "explore")); mark("wi-start");
  const wi = await waitFor(`!!document.querySelector("aside .app-wi__results") || /doesn't see another|too short|Only one earlier/.test(document.querySelector("aside")?.textContent ?? "")`, 150_000);
  if (!wi) notes.push("what-if result not seen");
  mark("wi-done"); await sleep(1500);
  await step(`document.querySelector("aside .app-wi__results")?.scrollIntoView({ block: "center", behavior: "smooth" })`); await sleep(5500);

  // D7 + S8 — My Reflection: save, then the donut across saved conversations.
  await attempt("close panel", () => tap(`$el("aside .app-icon-btn")`, "close")); await sleep(800);
  await scrollTo(`$el(".app-continue")`, 1500);
  await tap(`$el(".app-continue .im-btn--primary")`, "continue"); mark("reflect"); await sleep(2500);
  await attempt("save", () => tap(`$el("button", "Save to this device")`, "save")); mark("saved"); await sleep(2500);
  await attempt("donut", async () => { await scrollTo(`$el(".app-pm")`, 2000); }); mark("donut"); await sleep(1500);
  await attempt("30 days", () => tap(`$el(".app-pm .app-seg button", "30 days")`, "30d")); mark("30d"); await sleep(2800);
  await attempt("7 days", () => tap(`$el(".app-pm .app-seg button", "7 days")`, "7d")); mark("7d"); await sleep(3000);
  mark("end");
} catch (e) {
  notes.push(`FATAL ${e.message}`); console.log("FATAL", e.message);
  writeFileSync(`${out}/fatal.png`, await b.screenshot());
} finally {
  await b.send("Page.stopScreencast").catch(() => {});
  await sleep(500);
  const base = frames[0]?.t ?? 0;
  // Frame times are relative to the first frame; marks/taps to t0 (both wall-clock ms).
  const firstWall = t0 + (frames.length ? 0 : 0);
  writeFileSync(`${out}/take.json`, JSON.stringify({ mode, app: APP, viewport: [1280, 720], scale: 1.5, frames: frames.map((f) => ({ i: f.i, t: f.t - base })),
    frameBaseWall: base, t0Wall: firstWall, marks, taps, notes, api: b.api.map((a) => ({ ...a, t: a.at - t0 })) }, null, 1));
  if (responses.length) writeFileSync(`${out}/api.json`, JSON.stringify(responses, null, 1));
  console.log(`${frames.length} frames, ${marks.length} marks, notes: ${JSON.stringify(notes)}, api: ${JSON.stringify(b.api.map((a) => `${a.path} ${a.status ?? "mock"}`))}`);
  b.close();
}

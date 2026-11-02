// LIVE (paid): 10 synthetic screenshots through the real app → extract (4 requests) → Review
// → analyze. Measures wall time per step and compares Review with the ground-truth JSON.
// Not part of run-all. Render the screenshots, then start the server with a hard cap:
//   node scripts/phase0/screenshots/render-long.mjs 10-long-vi
//   npm run build && APP_SPEND_CAP_USD=0.4 npx next start -p 3123
//   node scripts/e2e/live-shots.mjs 10-long-vi [--no-analyze]
// Cost per run is read from the server log (meta_call lines carry usd; never content).
import { readFileSync } from "node:fs";
import { launch, HELPERS } from "./cdp.mjs";

const id = process.argv[2] ?? "10-long-vi";
const analyze = !process.argv.includes("--no-analyze");
const conv = JSON.parse(readFileSync(new URL(`../phase0/conversations/${id}.json`, import.meta.url), "utf8"));
const lang = conv.language;
const L = lang === "vi" ? { start: "Có sẵn cuộc trò chuyện", next: "Tiếp tục", look: "Xem cuộc trò chuyện này" } : { start: "I have the chat", next: "Continue", look: "Look at this conversation" };
const norm = (s) => s.normalize("NFC").replace(/\s+/g, " ").trim();
const truth = conv.messages.map((m) => norm(m.text));

const b = await launch({ width: 390, height: 844, live: true });
const step = async (js) => { await b.evaluate(HELPERS); return b.evaluate(js); };
const waitFor = async (js, ms) => { const end = Date.now() + ms; while (Date.now() < end) { if (await step(js)) return true; await b.sleep(250); } return false; };
const out = { id, screenshots: 10 };
try {
  await b.goto("http://localhost:3123/");
  await b.evaluate(`localStorage.clear(); localStorage.setItem("innermirror.lang", "${lang}"); location.reload()`);
  await b.sleep(1500);
  await step(`$click(".lp-cta"); $wait(300)`);
  await step(`$click("[role=radio]", ${JSON.stringify(L.start)}); $wait(200)`);
  const pngs = Array.from({ length: 10 }, (_, i) => readFileSync(new URL(`../phase0/screenshots/long/${id}-${String(i + 1).padStart(2, "0")}.png`, import.meta.url)).toString("base64"));
  const t0 = Date.now();
  await step(`(async () => { const dt = new DataTransfer(); const pngs = ${JSON.stringify(pngs)};
    for (let i = 0; i < pngs.length; i++) dt.items.add(new File([await (await fetch("data:image/png;base64," + pngs[i])).blob()], (i + 1) + ".png", { type: "image/png" }));
    document.querySelector(".app-drop").dispatchEvent(new DragEvent("drop", { dataTransfer: dt, bubbles: true, cancelable: true })); return true; })()`);
  await waitFor(`document.querySelectorAll(".app-shot").length === 10`, 30_000);
  out.prepareMs = Date.now() - t0;
  out.uploadKb = await step(`Math.round([...document.querySelectorAll(".app-shot img")].reduce((n, i) => n + i.src.length, 0) / 1024)`);
  await step(`document.querySelector(".app-panel .im-check input").click(); $wait(100)`);
  const t1 = Date.now();
  await step(`$click(".app-actions button", ${JSON.stringify(L.next)})`);
  const read = await waitFor(`!!document.querySelector(".app-rv-thread") || !!document.querySelector(".app-partial") || !!document.querySelector(".app-panel .im-error")`, 240_000);
  out.extractMs = Date.now() - t1;
  out.extractCalls = b.api.filter((a) => a.startsWith("/api/extract")).map((a) => a.split(" ")[1]);
  if (!read || !(await step(`!!document.querySelector(".app-rv-thread")`))) {
    out.extractOutcome = await step(`document.querySelector(".app-partial, .im-error")?.textContent ?? "timeout"`);
    throw new Error("extraction did not reach Review");
  }
  const got = (await step(`[...document.querySelectorAll(".app-rv-bubble")].map((e) => e.getAttribute("aria-label"))`))
    .map((l) => norm(l.replace(/^[^:]+: /, "").replace(/\. [^.]+$/, "")));
  // Order and completeness: longest common subsequence with the ground truth.
  const lcs = Array.from({ length: got.length + 1 }, () => new Array(truth.length + 1).fill(0));
  for (let i = 1; i <= got.length; i++) for (let j = 1; j <= truth.length; j++) lcs[i][j] = got[i - 1] === truth[j - 1] ? lcs[i - 1][j - 1] + 1 : Math.max(lcs[i - 1][j], lcs[i][j - 1]);
  const exactInOrder = lcs[got.length][truth.length];
  const dupes = got.length - new Set(got).size;
  const truthDupes = truth.length - new Set(truth).size;
  out.review = { truth: truth.length, got: got.length, exactInOrder, missingOrMisread: truth.length - exactInOrder, extra: got.length - exactInOrder, repeatedLines: dupes - truthDupes,
    people: await step(`[...document.querySelectorAll(".app-who__opt")].map((o) => o.textContent.replace(/\\s+/g, " ").trim())`),
    notes: await step(`document.querySelector(".app-page .im-notice")?.innerText ?? ""`) };
  out.notInTruth = got.filter((g) => !truth.includes(g)).slice(0, 12);
  out.missing = truth.filter((t) => !got.includes(t)).slice(0, 12);
  if (analyze) {
    // "Who am I?" is chosen later, on Replay; analysis doesn't need it.
    await step(`document.querySelector(".app-page .im-check input")?.click(); $wait(100)`);
    const t2 = Date.now();
    await step(`$click("button", ${JSON.stringify(L.look)})`);
    const done = await waitFor(`document.querySelectorAll(".app-meta-btn").length > 0 || !!document.querySelector(".app-error, .im-error")`, 150_000);
    out.analyzeMs = Date.now() - t2;
    out.analyzeOk = done && await step(`document.querySelectorAll(".app-meta-btn").length > 0`);
    out.analyzeBadges = await step(`document.querySelectorAll(".app-meta-btn").length`);
    if (!out.analyzeOk) out.analyzeError = await step(`document.body.innerText.slice(0, 300)`);
  }
} catch (e) {
  out.error = e.message;
} finally {
  out.api = b.api;
  console.log(JSON.stringify(out, null, 2));
  b.close();
}

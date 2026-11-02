// LIVE (paid): N synthetic screenshots through the real app → extract (parts of 3) → Review
// (choose a part if over 40 turns) → analyze → save to My Reflection. Checks the dark default
// on a fresh visit, times each step and compares Review with the ground-truth JSON.
// Not part of run-all. Render the screenshots, then run against a local server with a hard cap
// or, as a smoke test, against Production:
//   node scripts/phase0/screenshots/render-long.mjs 10-long-vi 5
//   npm run build && APP_SPEND_CAP_USD=0.4 npx next start -p 3123
//   node scripts/e2e/live-shots.mjs 10-long-vi [--count=5] [--base=https://…] [--no-analyze]
// Cost per run is read from the server log (meta_call lines carry usd; never content).
import { readFileSync } from "node:fs";
import { launch, HELPERS } from "./cdp.mjs";

const id = process.argv[2] ?? "10-long-vi";
const analyze = !process.argv.includes("--no-analyze");
const arg = (name, fallback) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split("=")[1] ?? fallback;
const count = Number(arg("count", 5));
const base = arg("base", "http://localhost:3123/");
const conv = JSON.parse(readFileSync(new URL(`../phase0/conversations/${id}.json`, import.meta.url), "utf8"));
const lang = conv.language;
const L = lang === "vi"
  ? { start: "Có sẵn cuộc trò chuyện", next: "Tiếp tục", look: "Xem cuộc trò chuyện này", mirror: "Tiếp tục nhìn lại mình", save: "Lưu vào thiết bị này" }
  : { start: "I have the chat", next: "Continue", look: "Look at this conversation", mirror: "Continue to My Reflection", save: "Save to this device" };
const norm = (s) => s.normalize("NFC").replace(/\s+/g, " ").trim();
const truth = conv.messages.map((m) => norm(m.text));

const b = await launch({ width: 390, height: 844, live: true });
const step = async (js) => { await b.evaluate(HELPERS); return b.evaluate(js); };
const waitFor = async (js, ms) => { const end = Date.now() + ms; while (Date.now() < end) { if (await step(js)) return true; await b.sleep(250); } return false; };
const out = { id, base, screenshots: count };
try {
  await b.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "light" }] });
  await b.goto(base);
  await b.evaluate(`localStorage.clear(); localStorage.setItem("innermirror.lang", "${lang}"); location.reload()`);
  await b.sleep(2500);
  out.darkByDefault = await step(`document.documentElement.dataset.theme === "dark" && getComputedStyle(document.body).backgroundColor === "rgb(23, 21, 43)" && localStorage.getItem("innermirror.theme") === null`);
  await step(`$click(".lp-cta"); $wait(300)`);
  await step(`$click("[role=radio]", ${JSON.stringify(L.start)}); $wait(200)`);
  const pngs = Array.from({ length: count }, (_, i) => readFileSync(new URL(`../phase0/screenshots/long/${id}-${String(i + 1).padStart(2, "0")}.png`, import.meta.url)).toString("base64"));
  const t0 = Date.now();
  await step(`(async () => { const dt = new DataTransfer(); const pngs = ${JSON.stringify(pngs)};
    for (let i = 0; i < pngs.length; i++) dt.items.add(new File([await (await fetch("data:image/png;base64," + pngs[i])).blob()], (i + 1) + ".png", { type: "image/png" }));
    document.querySelector(".app-drop").dispatchEvent(new DragEvent("drop", { dataTransfer: dt, bubbles: true, cancelable: true })); return true; })()`);
  await waitFor(`document.querySelectorAll(".app-shot").length === ${count}`, 30_000);
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
    // "Who am I?" is chosen later, on Replay; analysis doesn't need it. Over 40 turns, choose the
    // latest part, as a user who cares about how it ended would.
    out.partOptions = await step(`document.querySelectorAll("#turn-part option").length - 1`);
    if (out.partOptions > 0) await step(`(() => { const s = document.querySelector("#turn-part"); s.value = s.options[s.options.length - 1].value; s.dispatchEvent(new Event("change", { bubbles: true })); })(); $wait(200)`);
    await step(`document.querySelector(".app-page .im-check input")?.click(); $wait(100)`);
    const t2 = Date.now();
    await step(`$click("button", ${JSON.stringify(L.look)})`);
    const done = await waitFor(`document.querySelectorAll(".app-meta-btn").length > 0 || !!document.querySelector(".app-error, .im-error")`, 150_000);
    out.analyzeMs = Date.now() - t2;
    out.analyzeOk = done && await step(`document.querySelectorAll(".app-meta-btn").length > 0`);
    out.analyzeBadges = await step(`document.querySelectorAll(".app-meta-btn").length`);
    if (!out.analyzeOk) out.analyzeError = await step(`document.body.innerText.slice(0, 300)`);
    else {
      await step(`$click("button", ${JSON.stringify(L.mirror)}); $wait(800)`);
      await step(`$click("button", ${JSON.stringify(L.save)}); $wait(800)`);
      out.savedToMyReflection = await step(`JSON.parse(localStorage.getItem("innermirror.collections.v1") ?? "[]").length === 1`);
      // What is saved holds labels only, never message text.
      out.savedHasNoText = await step(`!localStorage.getItem("innermirror.collections.v1").includes(${JSON.stringify(conv.messages[conv.messages.length - 1].text)})`);
    }
  }
} catch (e) {
  out.error = e.message;
} finally {
  out.api = b.api;
  console.log(JSON.stringify(out, null, 2));
  b.close();
}

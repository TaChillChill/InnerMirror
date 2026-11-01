// Wave 1 (U4 + U5): overview arc, method collapsible, ego-state sheet, instant choose / tap-again
// clear with only ✕ to close, "Who are you?" at the end of Replay, and What if? on any
// speaker's message (U9).
// /api/analyze is mocked with a real saved v3.2 result; nothing is paid for.
import { launch, HELPERS } from "./cdp.mjs";

const width = Number(process.argv[2] ?? 390);
const { SAMPLES } = await import("../../src/lib/samples.ts");
const { cleanAnalysis } = await import("../../src/lib/ai/analysis.ts");
const mock = { analysis: cleanAnalysis(SAMPLES.en.raw, SAMPLES.en.messages), labels: { "Person A": "p1", "Person B": "p2" }, meta: { spec: "v3.2" } };
const b = await launch({ width, height: 900, mocks: { "/api/analyze": mock } });
const results = [];
const check = (name, ok, extra = "") => results.push(`${ok ? "PASS" : "FAIL"} ${name}${extra ? ` (${extra})` : ""}`);
const chat = SAMPLES.en.messages.map((m) => `${m.speakerId === "p1" ? "Alex" : "Sam"}: ${m.text}`).join("\n");
try {
  await b.goto("http://localhost:3123/");
  await b.evaluate(`localStorage.clear(); localStorage.setItem("innermirror.lang", "en"); location.reload()`);
  await b.sleep(1500);
  const step = async (js) => { await b.evaluate(HELPERS); return b.evaluate(js); };
  await step(`$click(".lp-cta"); $wait(300)`);
  await step(`$click("[role=radio]", "Tell it"); $wait(200)`);
  await step(`$type("#paste", ${JSON.stringify(chat)}); $wait(100)`);
  await step(`$click("button", "Show as a chat"); $wait(300)`);
  check("Review asks who is in it, not who you are", await step(`!!$t("h2", "Who is in this conversation?") && !$t("h2", "Which one is you")`));
  await step(`document.querySelector(".im-check input").click(); $wait(100)`);
  check("analyze is possible without choosing a self", await step(`!$t("button", "Look at this conversation").disabled`));
  await step(`$click("button", "Look at this conversation"); $wait(1200)`);
  const arc = await step(`document.querySelector(".app-obs__arc")?.textContent ?? ""`);
  check("overview shows a short arc", /^From .+ → .+/.test(arc), arc.slice(0, 120));
  // U9: What if? works on anyone's message, before or without a self.
  const pills = await step(`document.querySelectorAll(".app-wi-pill").length`);
  check("What if? on every answered message, no self needed (U9)", pills >= 4, String(pills));
  await step(`document.querySelectorAll(".app-wi-pill")[0].click(); $wait(300)`);
  check("What if? on Sam's message names Sam, not 'you'", await step(`(() => { const h = document.querySelector(".app-wi__title")?.textContent ?? ""; return h === "What if Sam had said it differently?"; })()`), await step(`document.querySelector(".app-wi__title")?.textContent`));
  await step(`document.querySelector(".app-sheet-bar .app-icon-btn").click(); $wait(200)`);
  await step(`$click(".app-obs summary", "How does Mirror observe?"); $wait(150)`);
  await step(`$click(".app-obs .app-textlink", "Collapse"); $wait(150)`);
  check("method opens and its Collapse closes it, focus on its summary", await step(`![...document.querySelectorAll(".app-obs details")].some((d) => d.open && d.textContent.includes("How does Mirror")) && document.activeElement?.tagName === "SUMMARY"`));
  await step(`$click(".app-tip .app-textlink", "Learn about"); $wait(200)`);
  check("ego-state sheet lists 5 states", await step(`document.querySelectorAll(".app-modal .app-legend li").length === 5`));
  await step(`document.activeElement.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })); $wait(200)`);
  check("Esc closes the sheet and returns focus to its link", await step(`!document.querySelector(".app-modal") && document.activeElement?.textContent.includes("Learn about")`));
  // Panel: instant choose, tap again clears, only ✕ closes.
  await step(`document.querySelectorAll(".app-meta-btn")[1].click(); $wait(300)`);
  check("panel order: Mirror sees → why (open) → your view", await step(`(() => { const l = [...document.querySelectorAll(".app-sel__label")].map((x) => x.textContent); return l[0] === "Mirror sees" && l[1] === "Your view" && document.querySelector(".app-sel__why").open; })()`));
  check("no Done / Clear / Yes buttons", await step(`![...document.querySelectorAll(".app-sel button")].some((x) => /^(Done|Clear|Yes)/.test(x.textContent.trim()))`));
  await step(`$click(".app-sel__opt", "Adult"); $wait(200)`);
  check("tap saves at once", await step(`$t(".app-sel__opt", "Adult").getAttribute("aria-pressed") === "true" && /saved/.test(document.querySelector(".app-sel__status").textContent)`));
  await step(`$click(".app-sel__opt", "Adult"); $wait(200)`);
  check("tap again clears", await step(`$t(".app-sel__opt", "Adult").getAttribute("aria-pressed") === "false" && /Mirror's suggestion/.test(document.querySelector(".app-sel__status").textContent)`));
  await step(`$click(".app-sel__opt", "Adapted Child"); $wait(150)`);
  await step(`document.querySelector(".app-sheet-bar .app-icon-btn").click(); $wait(200)`);
  check("✕ keeps the choice and returns focus to the message", await step(`document.querySelectorAll(".app-meta-btn")[1].textContent.includes("Adapted Child") && document.activeElement?.classList.contains("app-meta-btn")`));
  await step(`$click(".app-whopick .app-chip-btn", "Alex"); $wait(300)`);
  check("after choosing a self, What if? on my message says 'you'", await step(`(() => { document.querySelectorAll(".app-msg--me, .im-msg--me")[0]?.querySelector(".app-wi-pill")?.click(); return true; })()`) && await step(`$wait(300); /you'd answered/.test(document.querySelector(".app-wi__title")?.textContent ?? "")`));
  await step(`document.querySelector(".app-sheet-bar .app-icon-btn")?.click(); $wait(200)`);
  check("nothing wider than the screen", await step(`[".app-page", ".app-obs", ".app-whopick"].every((q) => document.querySelector(q).getBoundingClientRect().right <= innerWidth + 0.5)`));
} catch (e) {
  results.push(`ERROR ${e.message}`);
} finally {
  console.log(`width ${width}\n` + results.join("\n") + `\nAPI requests: ${JSON.stringify(b.api)}`);
  b.close();
}

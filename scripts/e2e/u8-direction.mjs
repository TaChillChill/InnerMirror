// U8 Conversation Direction: needs a self, a goal shows at most two states from the fixed
// table, "choose another" shows the rest, and "Try this direction" opens What if? on my latest
// answered message with the state preselected, without calling /api/scenario.
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
const m4 = SAMPLES.en.messages.find((m) => m.id === "m4").text;
try {
  await b.goto("http://localhost:3123/");
  await b.evaluate(`localStorage.clear(); localStorage.setItem("innermirror.lang", "en"); location.reload()`);
  await b.sleep(1500);
  const step = async (js) => { await b.evaluate(HELPERS); return b.evaluate(js); };
  await step(`$click(".lp-cta"); $wait(300)`);
  await step(`$click("[role=radio]", "Tell it"); $wait(200)`);
  await step(`$type("#paste", ${JSON.stringify(chat)}); $wait(100)`);
  await step(`$click("button", "Show as a chat"); $wait(300)`);
  await step(`document.querySelector(".im-check input").click(); $wait(100)`);
  await step(`$click("button", "Look at this conversation"); $wait(1200)`);
  check("Direction asks for a self first", await step(`!!$t(".app-dir .im-hint", "Choose who you are") && !document.querySelector(".app-dir .app-chip-btn")`));
  await step(`$click(".app-whopick .app-chip-btn", "Alex"); $wait(300)`);
  check("five goals offered", await step(`document.querySelectorAll(".app-dir .app-chip-btn").length === 5`));
  await step(`$click(".app-dir .app-chip-btn", "Ease the tension"); $wait(200)`);
  const sugg = JSON.parse(await step(`JSON.stringify([...document.querySelectorAll(".app-dir__opts:not(.is-compact) .app-dir__opt")].map((x) => x.textContent))`));
  check("header uses the approved wording", await step(`document.querySelector(".app-dir__lead").textContent === "With this direction, you could try…"`));
  check("two suggestions, actions not outcomes", sugg.length === 2 && sugg[0].startsWith("Nurturing Parent") && sugg[1].startsWith("Adult") && sugg.every((x) => !/will|better/i.test(x)), JSON.stringify(sugg));
  check("nothing preselected, Try disabled", await step(`!document.querySelector(".app-dir__opt[aria-pressed=true]") && $t(".app-dir button", "Try this direction").disabled`));
  await step(`$click(".app-dir .app-textlink", "Choose another state"); $wait(150)`);
  check("choose another shows the other three", await step(`document.querySelectorAll(".app-dir__opts.is-compact .app-dir__opt").length === 3`));
  await step(`$click(".app-dir__opts.is-compact .app-dir__opt", "Free Child"); $wait(150)`);
  check("any state can be picked", await step(`$t(".app-dir__opt", "Free Child").getAttribute("aria-pressed") === "true" && !$t(".app-dir button", "Try this direction").disabled`));
  await step(`$click(".app-dir__opt", "Adult"); $wait(150)`);
  check("one pick at a time", await step(`document.querySelectorAll(".app-dir__opt[aria-pressed=true]").length === 1`));
  check("limit line shown (N2)", await step(`!!$t(".app-dir .im-hint", "a message you already sent")`));
  await step(`$click(".app-dir button", "Try this direction"); $wait(400)`);
  check("What if? opens on my latest answered message", await step(`document.querySelector("#tab-whatif")?.getAttribute("aria-selected") === "true" && document.querySelector(".app-panel-quote").textContent.includes(${JSON.stringify(m4)})`));
  check("Adult preselected, Explore waits for a tap", await step(`$t(".app-wi__opt", "Adult").getAttribute("aria-pressed") === "true" && !!$t(".app-wi__go button", "Explore")`));
  check("no scenario call made", !b.api.some((u) => String(u).includes("/api/scenario")), JSON.stringify(b.api));
  await step(`document.querySelector(".app-sheet-bar .app-icon-btn").click(); $wait(300)`);
  check("closing returns focus to Try", await step(`document.activeElement?.textContent === "Try this direction"`));
  await step(`document.querySelectorAll(".app-wi-pill")[0].click(); $wait(300)`);
  check("What if? opened from a message has nothing preselected", await step(`!document.querySelector(".app-wi__opt[aria-pressed=true]")`));
  await step(`document.querySelector(".app-sheet-bar .app-icon-btn").click(); $wait(200)`);
  await step(`$click(".app-dir .app-chip-btn", "Set a clear boundary"); $wait(200)`);
  check("boundary lists Critical Parent with its protective side", await step(`!!$t(".app-dir__opt", "protective side of Critical Parent")`));
  check("nothing wider than the screen", await step(`[".app-page", ".app-dir"].every((q) => document.querySelector(q).getBoundingClientRect().right <= innerWidth + 0.5) && document.documentElement.scrollWidth <= innerWidth`));
} catch (e) {
  results.push(`ERROR ${e.message}`);
} finally {
  console.log(`width ${width}\n` + results.join("\n") + `\nAPI requests: ${JSON.stringify(b.api)}`);
  b.close();
}

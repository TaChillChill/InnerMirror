// U8 Conversation Direction, reference only (Founder UAT #09/#10): five directions, each
// showing at most two states from the fixed table with what they do; no self needed, nothing
// to pick, hide or try, the reference line always shown, and What if? still on each message.
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
  await step(`$click("button", "Continue"); $wait(300)`);
  await step(`document.querySelector(".im-check input").click(); $wait(100)`);
  await step(`$click("button", "Look at this conversation"); $wait(1200)`);
  check("five directions, no self needed", await step(`document.querySelectorAll(".app-dir .app-chip-btn").length === 5`));
  check("reference line always shown", await step(`!!$t(".app-dir__yours", "These directions are here for reference. You still decide what you want to do next.")`));
  await step(`$click(".app-dir .app-chip-btn", "Ease the tension"); $wait(200)`);
  const sugg = JSON.parse(await step(`JSON.stringify([...document.querySelectorAll(".app-dir__opt")].map((x) => x.textContent))`));
  check("header uses the approved wording", await step(`document.querySelector(".app-dir__lead").textContent === "With this direction, you could try…"`));
  check("two suggestions, actions not outcomes", sugg.length === 2 && sugg[0].startsWith("Nurturing Parent") && sugg[1].startsWith("Adult") && sugg.every((x) => !/will|better/i.test(x)), JSON.stringify(sugg));
  check("suggestions are not controls: nothing to pick", await step(`!document.querySelector(".app-dir__opt button, button.app-dir__opt, .app-dir [aria-pressed] .app-badge") && document.querySelectorAll(".app-dir button").length === 5`));
  check("no Try / Choose another / Hide left", await step(`!/Try this direction|Choose another state|Hide the other states/.test(document.querySelector(".app-dir").textContent)`));
  await step(`$click(".app-dir .app-chip-btn", "Ease the tension"); $wait(150)`);
  check("tapping the direction again closes it", await step(`!document.querySelector(".app-dir__opt")`));
  await step(`$click(".app-dir .app-chip-btn", "Set a clear boundary"); $wait(200)`);
  check("boundary lists Critical Parent with its protective side", await step(`!!$t(".app-dir__opt", "protective side of Critical Parent")`));
  await step(`document.querySelectorAll(".app-wi-pill")[0].click(); $wait(300)`);
  check("What if? still opens from a message, nothing preselected", await step(`document.querySelector("#tab-whatif")?.getAttribute("aria-selected") === "true" && !document.querySelector(".app-wi__opt[aria-pressed=true]")`));
  await step(`document.querySelector(".app-sheet-bar .app-icon-btn").click(); $wait(200)`);
  check("no scenario call made", !b.api.some((u) => String(u).includes("/api/scenario")), JSON.stringify(b.api));
  check("nothing wider than the screen", await step(`[".app-page", ".app-dir"].every((q) => document.querySelector(q).getBoundingClientRect().right <= innerWidth + 0.5) && document.documentElement.scrollWidth <= innerWidth`));
} catch (e) {
  results.push(`ERROR ${e.message}`);
} finally {
  console.log(`width ${width}\n` + results.join("\n") + `\nAPI requests: ${JSON.stringify(b.api)}`);
  b.close();
}

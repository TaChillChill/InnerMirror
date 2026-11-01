// Regression (Founder 2026-11-01): the user changes no observation, saves, reloads, and My Mirror
// still shows full stats from Mirror's suggestions; UNCLEAR stays apart. /api/analyze is mocked
// with a real saved v3.2 result (cleaned), so nothing is paid for.
import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { launch, HELPERS } from "./cdp.mjs";

const width = Number(process.argv[2] ?? 390);
const { SAMPLES } = await import("../../src/lib/samples.ts");
const { cleanAnalysis } = await import("../../src/lib/ai/analysis.ts");
const mock = { analysis: cleanAnalysis(SAMPLES.en.raw, SAMPLES.en.messages), labels: { "Person A": "p1", "Person B": "p2" }, meta: { spec: "v3.2" } };
const b = await launch({ width, height: 900, mocks: { "/api/analyze": mock } });
const results = [];
const check = (name, ok, extra = "") => results.push(`${ok ? "PASS" : "FAIL"} ${name}${extra ? ` (${extra})` : ""}`);
const chat = [
  "Sam: Hey, I'm so sorry, work blew up. Can we move dinner to tomorrow?",
  "Alex: Seriously? This is the third time this month. You always do this.",
  "Sam: I know, I'm really sorry. I feel awful about it.",
  "Alex: Fine. Do whatever you want.",
  "Sam: Can we talk about it properly when I get home? I want to understand what's going on for you.",
  "Alex: ok",
].join("\n");
try {
  await b.goto("http://localhost:3123/");
  await b.evaluate(`localStorage.clear(); localStorage.setItem("innermirror.lang", "en"); location.reload()`);
  await b.sleep(1500);
  const step = async (js) => { await b.evaluate(HELPERS); return b.evaluate(js); };
  await step(`$click(".lp-cta"); $wait(300)`);
  await step(`$click("[role=radio]", "Paste or type"); $wait(200)`);
  await step(`$type("#paste", ${JSON.stringify(chat)}); $wait(100)`);
  await step(`$click("button", "Show as a chat"); $wait(300)`);
  await step(`document.querySelector(".im-check input").click(); $wait(100)`);
  await step(`$click("button", "Look at this conversation"); $wait(1200)`);
  check("analysis shown on Replay", await step(`document.querySelectorAll(".app-meta-btn").length > 0`));
  // No panel is opened: every observation stays Mirror's. "Who are you?" is answered at the end of Replay.
  await step(`$click(".app-whopick .app-chip-btn", "Alex"); $wait(200)`);
  await step(`document.querySelector(".app-continue .im-btn--primary").click(); $wait(500)`);
  await step(`$click("button", "Save"); $wait(400)`);
  const stored = JSON.parse(await step(`localStorage.getItem("innermirror.collections.v1")`));
  check("saved: 3 turns of mine, none chosen, Mirror's labels kept", stored?.length === 1 && stored[0].mine.length === 3 && stored[0].mine.every((m) => m.chosen === null) && stored[0].mine.map((m) => m.ai).join(",") === "cp,ac,UNCLEAR", JSON.stringify(stored?.[0]?.mine));
  await b.evaluate(`location.reload()`); await b.sleep(1500);
  await step(`document.querySelector(".app-bar__mirror").click(); $wait(500)`);
  check("after reload: 1 card with a 2-state cloud (1, 1)", await step(`document.querySelectorAll(".app-card").length === 1 && [...document.querySelectorAll(".app-card .app-cloud__n")].map((x) => x.textContent).join(",") === "1,1"`));
  const pm = JSON.parse(await step(`JSON.stringify({ turns: document.querySelector(".app-donut__mid strong")?.textContent, rows: [...document.querySelectorAll(".app-pm .app-staterow")].map((r) => r.querySelector(".app-staterow__num").textContent + " | " + r.querySelector(".app-staterow__split").textContent), aside: document.querySelector(".app-pm .app-pm__aside")?.textContent, insight: document.querySelector(".app-pm__insight p")?.firstChild?.textContent })`));
  check("Personal Mirror: 2 turns, CP 50% / AC 50%", pm.turns === "2 turns" && pm.rows[0].startsWith("50%") && pm.rows[4].startsWith("50%"), JSON.stringify(pm.rows));
  check("all counted as Mirror's observation, none as the user's", pm.rows[0].includes("0 chosen by you · 1 Mirror's observation") && pm.rows[4].includes("0 chosen by you · 1 Mirror's observation"));
  check("UNCLEAR listed apart, not in the percentages", /1 unclear to Mirror/.test(pm.aside ?? ""), pm.aside);
  check("tie summary is neutral", /appeared equally often/.test(pm.insight), pm.insight);
  await step(`document.querySelector(".app-card").click(); $wait(300)`);
  check("card detail opens with both states", await step(`document.querySelectorAll(".app-modal .app-staterow").length === 2`));
  writeFileSync(join(tmpdir(), `im-r1-${width}.png`), await b.screenshot());
} catch (e) {
  results.push(`ERROR ${e.message}`);
} finally {
  console.log(`width ${width}\n` + results.join("\n") + `\nAPI requests: ${JSON.stringify(b.api)}`);
  b.close();
}

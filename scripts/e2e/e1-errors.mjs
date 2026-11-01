// Error recovery: a failed analysis keeps the conversation and offers Try again / Back; the
// firewall's 429 body reads as "too many tries"; budget has no retry; a What if? error offers
// retry and a second try works. All /api/* mocked; nothing is paid for.
import { launch, HELPERS } from "./cdp.mjs";

const width = Number(process.argv[2] ?? 390);
const { SAMPLES } = await import("../../src/lib/samples.ts");
const { cleanAnalysis } = await import("../../src/lib/ai/analysis.ts");
const ok = { analysis: cleanAnalysis(SAMPLES.en.raw, SAMPLES.en.messages), labels: { "Person A": "p1", "Person B": "p2" }, meta: { spec: "v3.2" } };
// Answers in order: firewall 429 (its own body), budget, then success.
const analyzeQueue = [{ __status: 429, __body: { error: { code: "rate_limited", message: "Too Many Requests" } } }, { __status: 503, __body: { error: "budget" } }, ok];
const scenarioQueue = [{ __status: 502, __body: { error: "upstream" } }, { scenario: { flagged: false, evidence: "thin", reason: "model", ranked: false, possibilities: [{ state: "A", basis: "context", rationale: "A general idea.", evidenceMessageIds: [], cues: [] }], note: null, reflectionQuestion: null }, labels: {} }];
const b = await launch({ width, height: 900, mocks: { "/api/analyze": () => analyzeQueue.shift() ?? ok, "/api/scenario": () => scenarioQueue.shift() } });
const results = [];
const check = (name, pass, extra = "") => results.push(`${pass ? "PASS" : "FAIL"} ${name}${extra ? ` (${extra})` : ""}`);
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
  await step(`$click("button", "Look at this conversation"); $wait(800)`);
  check("firewall 429 → 'too many tries', with Try again", await step(`/Too many tries/.test(document.querySelector(".im-notice--error")?.textContent ?? "") && !!$t("button", "Try again")`), await step(`document.querySelector(".im-notice--error")?.textContent`));
  await step(`$click("button", "Try again"); $wait(800)`);
  check("budget → clear message, no retry", await step(`/budget/.test(document.querySelector(".im-notice--error")?.textContent ?? "") && !$t("button", "Try again")`));
  await step(`$click("button", "Back to the conversation"); $wait(300)`);
  check("Back keeps the conversation and consent", await step(`document.querySelectorAll(".app-rv-bubble").length === 6 && document.querySelector(".im-check input").checked`));
  await step(`$click("button", "Look at this conversation"); $wait(1000)`);
  check("then analysis succeeds", await step(`document.querySelectorAll(".app-meta-btn").length > 0`));
  await step(`document.querySelectorAll(".app-wi-pill")[1].click(); $wait(300)`);
  await step(`$click(".app-wi__opt", "Adult"); $wait(150)`);
  await step(`$click(".app-wi__go button", "Explore"); $wait(600)`);
  check("What if? error shows a retry", await step(`!!$t(".app-wi__row.is-whatif button", "Try again")`));
  await step(`$click(".app-wi__row.is-whatif button", "Try again"); $wait(600)`);
  check("retry → result", await step(`!!document.querySelector(".app-wi__results")`));
} catch (e) {
  results.push(`ERROR ${e.message}`);
} finally {
  console.log(`width ${width}\n` + results.join("\n") + `\nAPI requests: ${JSON.stringify(b.api)}`);
  b.close();
}

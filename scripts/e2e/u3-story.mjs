// U3 story v1: a retold story is split into dialogue (bubbles) and narration (grey lines),
// lines move between the two, narration reaches /api/analyze only as `context`, Replay shows
// it as context, and no reading of a story is high confidence. /api/analyze is mocked with a
// real saved v3.2 result (its readings include high confidence); nothing is paid for.
import { launch, HELPERS } from "./cdp.mjs";

const width = Number(process.argv[2] ?? 390);
const { SAMPLES } = await import("../../src/lib/samples.ts");
const { cleanAnalysis } = await import("../../src/lib/ai/analysis.ts");
const analysis = cleanAnalysis(SAMPLES.en.raw, SAMPLES.en.messages);
let sent = null;
const b = await launch({ width, height: 900, mocks: { "/api/analyze": (req) => { sent = JSON.parse(req.postData ?? "null"); return { analysis, labels: { "Person A": "p1", "Person B": "p2" }, meta: { spec: "v3.2" } }; } } });
const results = [];
const check = (name, ok, extra = "") => results.push(`${ok ? "PASS" : "FAIL"} ${name}${extra ? ` (${extra})` : ""}`);
// The sample conversation retold: Sam speaks first, so Sam becomes p1 like in the sample.
const who = (m) => (m.speakerId === "p2" ? "Sam" : "Alex");
const story = [
  "It was the third time this month.",
  ...SAMPLES.en.messages.flatMap((m, i) => [
    ...(i === 3 ? ["Alex went quiet for a while and looked at the phone."] : []),
    `${who(m)} said: "${m.text}"`,
  ]),
  "Then we both went to bed without talking.",
].join("\n");
const hadHigh = analysis.readings.some((r) => r.confidence === "high");
try {
  await b.goto("http://localhost:3123/");
  await b.evaluate(`localStorage.clear(); localStorage.setItem("innermirror.lang", "en"); location.reload()`);
  await b.sleep(1500);
  const step = async (js) => { await b.evaluate(HELPERS); return b.evaluate(js); };
  await step(`$click(".lp-cta"); $wait(300)`);
  await step(`$click("[role=radio]", "Tell it"); $wait(200)`);
  await step(`$type("#paste", ${JSON.stringify(story)}); $wait(100)`);
  await step(`$click("button", "Continue"); $wait(400)`);
  check("story opens Review split, no blocking notice", await step(`document.querySelector(".app-h1")?.textContent === "Mirror split your story"`));
  const bubbles = await step(`document.querySelectorAll(".app-rv-bubble").length`);
  const narr = await step(`document.querySelectorAll(".app-narr").length`);
  check("6 dialogue bubbles, 3 narration lines", bubbles === 6 && narr === 3, `${bubbles}/${narr}`);
  const people = await step(`[...document.querySelectorAll(".app-who__opt .app-person")].map((x) => x.textContent).join("|")`);
  check("speakers suggested from the words: Sam and Alex", /^S?Sam\d+ .*\|A?Alex\d+ /.test(people) && people.split("|").length === 2, people);
  // Move a narration line into the dialogue and back.
  await step(`document.querySelectorAll(".app-narr__text")[1].click(); $wait(150)`);
  await step(`$click(".app-narr__edit .app-chip-btn", "Alex"); $wait(200)`);
  check("narration → dialogue in place", await step(`document.querySelectorAll(".app-rv-bubble").length === 7 && document.querySelectorAll(".app-rv-bubble")[3].textContent.includes("went quiet")`));
  await step(`document.querySelectorAll(".app-rv-bubble")[3].click(); $wait(150)`);
  await step(`$click(".app-rv-edit button", "This is narration"); $wait(200)`);
  check("dialogue → narration in place", await step(`document.querySelectorAll(".app-rv-bubble").length === 6 && document.querySelectorAll(".app-narr").length === 3 && document.querySelectorAll(".app-narr__text")[1].textContent.includes("went quiet")`));
  await step(`document.querySelector(".im-check input").click(); $wait(100)`);
  await step(`$click("button", "Look at this conversation"); $wait(1200)`);
  check("request: 6 dialogue messages, narration only as context", sent?.messages?.length === 6 && sent?.context?.relationship === "other" && /\[before m1\] It was the third time/.test(sent.context.note) && /\[end\] Then we both went to bed/.test(sent.context.note) && !sent.messages.some((m) => /went quiet/.test(m.text)), JSON.stringify(sent?.context));
  check("Replay notes it's a retold story and shows narration as context", await step(`!!$t(".im-notice", "retold story") && document.querySelectorAll(".app-narr--replay").length === 3`));
  check("no high confidence on a story (mock had some)", hadHigh && await step(`![...document.querySelectorAll(".app-meta-btn")].some((x) => /High confidence/.test(x.getAttribute("aria-label") ?? ""))`) && await step(`(() => { document.querySelectorAll(".app-meta-btn")[0].click(); return true; })()`) && await step(`$wait(300); !/High confidence/.test(document.querySelector(".app-sel")?.textContent ?? "")`));
  check("nothing wider than the screen", await step(`document.documentElement.scrollWidth <= innerWidth`));
} catch (e) {
  results.push(`ERROR ${e.message}`);
} finally {
  console.log(`width ${width}\n` + results.join("\n") + `\nAPI requests: ${JSON.stringify(b.api)}`);
  b.close();
}

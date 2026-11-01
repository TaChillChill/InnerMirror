// M2: merging "Chị Phương" into "Phương" moves her message, loses nothing, can be undone,
// and the analysis request then has two speakers. /api/analyze is captured, never called.
import { launch, HELPERS } from "./cdp.mjs";

const width = Number(process.argv[2] ?? 390);
let analyzeBody = null;
const b = await launch({ width, mocks: { "/api/analyze": (req) => { analyzeBody = JSON.parse(req.postData); return { error: "budget" }; } } });
const results = [];
const check = (name, ok, extra = "") => results.push(`${ok ? "PASS" : "FAIL"} ${name}${extra ? ` (${extra})` : ""}`);
const chat = "Minh: Dạo này em về muộn quá.\nPhương: Dự án đang gấp mà anh.\nChị Phương: Anh nói thì dễ.\nPhương: Thôi kệ đi.\nMinh: Anh lo cho em thôi.";
try {
  await b.goto("http://localhost:3123/");
  const step = async (js) => { await b.evaluate(HELPERS); return b.evaluate(js); };
  await step(`$click(".lp-cta"); $wait(300)`);
  await step(`$click("[role=radio]", "Paste or type"); $wait(200)`);
  await step(`$type("#paste", ${JSON.stringify(chat)}); $wait(100)`);
  await step(`$click("button", "Show as a chat"); $wait(300)`);
  const people = () => step(`[...document.querySelectorAll(".app-who__btn")].map((x) => x.textContent.trim()).join("|")`);
  check("3 people parsed", (await people()).split("|").length === 3, await people());
  await step(`document.querySelector("[aria-label='Rename Chị Phương']").click(); $wait(200)`);
  await step(`$click(".app-person-edit .app-chip-btn", "Phương"); $wait(200)`);
  const confirm = await step(`$t(".app-person-edit .im-notice", "Merge")?.textContent ?? ""`);
  check("confirm names both people and the count", /Chị Phương.*Phương.*1 message/.test(confirm), confirm.slice(0, 90));
  await step(`$click(".app-person-edit button", "Merge"); $wait(300)`);
  check("2 people after merge", (await people()).split("|").length === 2, await people());
  const names = await step(`[...document.querySelectorAll(".app-rv-name")].map((x) => x.textContent.trim()).join("|")`);
  check("all 5 messages kept, 3rd now Phương", names === "Minh|Phương|Phương|Phương|Minh", names);
  await step(`$click("button", "Undo"); $wait(300)`);
  check("Undo restores 3 people", (await people()).split("|").length === 3);
  await step(`document.querySelector("[aria-label='Rename Chị Phương']").click(); $wait(200)`);
  await step(`$click(".app-person-edit .app-chip-btn", "Phương"); $wait(200)`);
  await step(`$click(".app-person-edit button", "Merge"); $wait(300)`);
  await step(`$click(".app-who__btn", "Phương"); $wait(100)`);
  await step(`document.querySelector(".im-check input").click(); $wait(100)`);
  await step(`$click("button", "Look at this conversation"); $wait(800)`);
  check("analysis request: 2 speakers, 5 messages, merged speaker ids", analyzeBody && analyzeBody.participantIds.length === 2 && analyzeBody.messages.length === 5 && analyzeBody.messages[2].speakerId === analyzeBody.messages[1].speakerId, JSON.stringify(analyzeBody?.participantIds));
  check("no horizontal scroll", await step(`document.documentElement.scrollWidth <= innerWidth`));
} catch (e) {
  results.push(`ERROR ${e.message}`);
} finally {
  console.log(`width ${width}\n` + results.join("\n") + `\nAPI requests: ${JSON.stringify(b.api)}`);
  b.close();
}

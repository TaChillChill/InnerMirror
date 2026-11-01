// M1: Back from Review keeps text, screenshots, order and edits; changed input asks first.
import { launch, HELPERS } from "./cdp.mjs";

const width = Number(process.argv[2] ?? 390);
const extraction = { speakers: [{ key: "S1", displayedName: "Linh", side: "left" }, { key: "S2", displayedName: null, side: "right" }], messages: [{ speaker: "S1", text: "Did you book it?", legibility: "clear" }, { speaker: "S2", text: "Not yet, sorry", legibility: "clear" }], notes: [] };
const b = await launch({ width, mocks: { "/api/extract": { extraction } } });
const results = [];
const check = (name, ok, extra = "") => results.push(`${ok ? "PASS" : "FAIL"} ${name}${extra ? ` (${extra})` : ""}`);
try {
  await b.goto("http://localhost:3123/");
  const step = async (js) => { await b.evaluate(HELPERS); return b.evaluate(js); };
  await step(`$click(".lp-cta"); $wait(300)`);
  await step(`$click("[role=radio]", "Paste or type"); $wait(200)`);
  const chat = "Linh: Did you book the restaurant?\nMe: I forgot, sorry.\nLinh: You always forget.";
  await step(`$type("#paste", ${JSON.stringify(chat)}); $wait(100)`);
  await step(`$click("button", "Show as a chat"); $wait(300)`);
  check("paste → Review", await step(`!!document.querySelector(".app-rv-thread")`));
  // Edit message 2 on Review.
  await step(`$click(".app-rv-bubble", "I forgot"); $wait(200)`);
  await step(`$type(".app-rv-edit textarea", "I forgot, I'm sorry. EDITED"); $wait(100)`);
  await step(`$click(".app-rv-edit button", "Done"); $wait(200)`);
  await step(`$click("button", "Back"); $wait(300)`);
  check("Back keeps paste method + text", await step(`document.querySelector("#paste")?.value === ${JSON.stringify(chat)}`));
  await step(`$click("button", "Show as a chat"); $wait(300)`);
  check("unchanged text → same edited transcript", await step(`document.body.innerText.includes("EDITED")`));
  await step(`$click("button", "Back"); $wait(300)`);
  await step(`$type("#paste", ${JSON.stringify(chat + "\nMe: OK.")}); $wait(100)`);
  await step(`$click("button", "Show as a chat"); $wait(300)`);
  check("changed text → asks before replacing", await step(`!!$t(".im-notice", "edited this conversation")`));
  await step(`$click("button", "Keep my edited version"); $wait(300)`);
  check("Keep → edited transcript", await step(`document.body.innerText.includes("EDITED")`));
  await step(`$click("button", "Back"); $wait(300)`);
  await step(`$click("button", "Show as a chat"); $wait(300)`);
  await step(`$click("button", "Read it again"); $wait(300)`);
  check("Read again → new transcript, edits replaced", await step(`!document.body.innerText.includes("EDITED") && document.body.innerText.includes("OK.")`));

  // Screenshot path: two images dropped, reorder, read (mocked), Back, continue without a call.
  await step(`$click("button", "Back"); $wait(300)`);
  await step(`$click("[role=radio]", "Upload screenshots"); $wait(200)`);
  await step(`(async () => {
    const mk = async (color) => { const c = document.createElement("canvas"); c.width = 300; c.height = 600; const g = c.getContext("2d"); g.fillStyle = color; g.fillRect(0, 0, 300, 600); return new File([await new Promise((r) => c.toBlob(r, "image/png"))], color + ".png", { type: "image/png" }); };
    const dt = new DataTransfer(); dt.items.add(await mk("red")); dt.items.add(await mk("blue"));
    document.querySelector(".app-drop").dispatchEvent(new DragEvent("drop", { dataTransfer: dt, bubbles: true, cancelable: true }));
    await $wait(1200); return true; })()`);
  const order1 = await step(`[...document.querySelectorAll(".app-shot img")].map((i) => [...i.src].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7)).join("|")`);
  check("two screenshots added", order1.split("|").length === 2);
  console.log("tools:", await step(`[...document.querySelectorAll(".app-shot__tools button")].map((x) => x.getAttribute("aria-label") + (x.disabled ? "(off)" : "")).join(" | ")`));
  await step(`[...document.querySelectorAll(".app-shot__tools button")][3].click(); $wait(200)`); // screenshot 2 → earlier
  const order2 = await step(`[...document.querySelectorAll(".app-shot img")].map((i) => [...i.src].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7)).join("|")`);
  check("reordered", order2 !== order1);
  console.log("before read:", await step(`JSON.stringify({ boxes: document.querySelectorAll(".im-check input").length, checked: document.querySelector(".im-check input")?.checked, btn: $t("button", "Read my")?.disabled })`));
  await step(`document.querySelector(".im-check input").click(); $wait(150)`);
  console.log("after tick:", await step(`JSON.stringify({ checked: document.querySelector(".im-check input")?.checked, btn: $t("button", "Read my")?.disabled })`));
  await step(`$click("button", "Read my screenshots"); $wait(300)`);
  check("screenshots over an edited paste transcript ask first, no call yet", await step(`!!$t(".im-notice", "edited this conversation")`) && b.api.length === 0);
  await step(`$click("button", "Read it again"); $wait(800)`);
  const callsAfterRead = b.api.filter((p) => p === "/api/extract").length;
  check("screenshots → Review (1 mocked extract)", await step(`!!document.querySelector(".app-rv-thread")`) && callsAfterRead === 1);
  await step(`$click("button", "Back"); $wait(400)`);
  const order3 = await step(`[...document.querySelectorAll(".app-shot img")].map((i) => [...i.src].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7)).join("|")`);
  check("Back keeps screenshots and their order", order3 === order2, order3 ? "" : "no images");
  check("same screenshots offer 'Continue with what was read'", await step(`!!$t("button", "Continue with what was read")`));
  await step(`$click("button", "Continue with what was read"); $wait(400)`);
  check("continue makes no new call", b.api.filter((p) => p === "/api/extract").length === 1 && await step(`!!document.querySelector(".app-rv-thread")`));
  check("no horizontal scroll", await step(`document.documentElement.scrollWidth <= innerWidth`));
} catch (e) {
  results.push(`ERROR ${e.message}`);
} finally {
  console.log(`width ${width}\n` + results.join("\n") + `\nAPI requests: ${JSON.stringify(b.api)}`);
  b.close();
}

// LIVE UAT (paid): real calls through the local app to Meta, synthetic data only. Not part of
// run-all. Start the server with a hard app-side cap, e.g.
//   npm run build && APP_SPEND_CAP_USD=0.4 npx next start -p 3123
//   node scripts/e2e/live-uat.mjs [A,B,C,D]
// A: VI chat, 3 people + an alias → merge → analyze → What if? on someone else's message →
//    self → choose a state → Direction → explore → save → reload → My Reflection stats.
// B: EN retold story → analyze (narration as context) → story note, no high confidence.
// C: VI screenshot → extract → Review → analyze.
// D: VI hopelessness line → analyze → support shown, What if? off.
import { readFileSync } from "node:fs";
import { launch, HELPERS } from "./cdp.mjs";

const only = (process.argv[2] ?? "A,B,C,D").split(",");
const results = [];
const check = (name, ok, extra = "") => { results.push(`${ok ? "PASS" : "FAIL"} ${name}${extra ? ` (${String(extra).slice(0, 300)})` : ""}`); };

async function session(lang, width, fn) {
  const b = await launch({ width, height: 900, live: true });
  const step = async (js) => { await b.evaluate(HELPERS); return b.evaluate(js); };
  const waitFor = async (js, ms = 90_000) => { const end = Date.now() + ms; while (Date.now() < end) { if (await step(js)) return true; await b.sleep(500); } return false; };
  try {
    await b.goto("http://localhost:3123/");
    await b.evaluate(`localStorage.clear(); localStorage.setItem("innermirror.lang", "${lang}"); location.reload()`);
    await b.sleep(1500);
    await fn({ b, step, waitFor });
  } catch (e) { results.push(`ERROR ${e.message}`); }
  finally { results.push(`  api: ${JSON.stringify(b.api)}`); b.close(); }
}
const pasteAndReview = async (step, method, text, apply) => {
  await step(`$click(".lp-cta"); $wait(300)`);
  await step(`$click("[role=radio]", ${JSON.stringify(method)}); $wait(200)`);
  await step(`$type("#paste", ${JSON.stringify(text)}); $wait(100)`);
  await step(`$click("button", ${JSON.stringify(apply)}); $wait(400)`);
};

if (only.includes("A")) {
  results.push("== A: VI chat, alias merge, What if? (any speaker), Direction, save, reload (390)");
  const chat = ["Linh: Em gửi file báo cáo chưa?", "Mình: Dạ em đang làm, chắc tối nay xong ạ.", "Chị Linh: Tối nay? Hôm qua em hứa sáng nay rồi mà.", "Hùng: Thôi chị, nó cũng bận mà 😅", "Mình: Em xin lỗi, tại hôm qua em bị sốt.", "Linh: Ừ, giỏi thật đấy. Lần nào cũng có lý do.", "Mình: Em sẽ cố gửi trước 8 giờ tối.", "Linh: ..."].join("\n");
  await session("vi", 390, async ({ b, step, waitFor }) => {
    await pasteAndReview(step, "Kể lại", chat, "Tiếp tục");
    check("Review lists 4 names incl. the alias", await step(`document.querySelectorAll(".app-who__opt").length === 4`));
    // Merge "Chị Linh" into "Linh".
    await step(`[...document.querySelectorAll(".app-who__opt")].find((o) => o.textContent.includes("Chị Linh")).querySelector(".app-icon-btn").click(); $wait(200)`);
    await step(`[...document.querySelectorAll(".app-person-edit .app-chip-btn")].find((x) => x.textContent.trim().endsWith("Linh") && !x.textContent.includes("Chị")).click(); $wait(200)`);
    await step(`$click(".app-person-edit .im-btn--primary", "Gộp"); $wait(300)`);
    check("merge: 3 people left, Linh has 4 messages", await step(`document.querySelectorAll(".app-who__opt").length === 3 && [...document.querySelectorAll(".app-who__opt")].some((o) => /Linh.*4 tin/.test(o.textContent))`));
    await step(`document.querySelector(".im-check input").click(); $wait(100)`);
    await step(`$click("button", "Xem cuộc trò chuyện này"); $wait(500)`);
    check("honest loading shown", await step(`!!document.querySelector(".app-analyzing, [aria-busy=true], .im-progress") || /Gương/.test(document.body.innerText)`));
    const ok = await waitFor(`document.querySelectorAll(".app-meta-btn").length > 0`);
    check("live analysis → Replay with observations", ok, await step(`document.querySelector(".app-obs__arc")?.textContent ?? document.body.innerText.slice(0, 200)`));
    const sarcasm = await step(`(() => { const msgs = [...document.querySelectorAll(".im-msg")]; const m = msgs.find((x) => x.textContent.includes("giỏi thật đấy")); return m?.querySelector(".app-meta-btn")?.getAttribute("aria-label") ?? ""; })()`);
    check("sarcastic line is not read at high confidence", !/cao/i.test(sarcasm), sarcasm);
    const ellipsis = await step(`(() => { const msgs = [...document.querySelectorAll(".im-msg")]; return msgs.at(-1)?.querySelector(".app-meta-btn")?.getAttribute("aria-label") ?? ""; })()`);
    check("'...' reads as unclear or low/medium", /chưa rõ|Không chắc|Có thể/i.test(ellipsis) || !/cao/i.test(ellipsis), ellipsis);
    // What if? on Linh's message, no self chosen yet.
    await step(`(() => { const m = [...document.querySelectorAll(".im-msg")].find((x) => x.textContent.includes("Lần nào cũng có lý do")); m.querySelector(".app-wi-pill").click(); })(); $wait(400)`);
    check("What if? names Linh", await step(`/Linh/.test(document.querySelector(".app-wi__title")?.textContent ?? "")`), await step(`document.querySelector(".app-wi__title")?.textContent`));
    await step(`$click(".app-wi__opt", "Người trưởng thành"); $wait(200)`);
    await step(`$click(".app-wi__go button", "Khám phá"); $wait(500)`);
    const wi = await waitFor(`!!document.querySelector(".app-wi__results, .app-wi__row.is-whatif .app-wi__none:not(:empty)") && !/đang tìm/.test(document.querySelector(".app-wi__row.is-whatif")?.textContent ?? "")`, 90_000);
    const wiText = await step(`document.querySelector(".app-wi__row.is-whatif")?.textContent ?? ""`);
    check("live What if? on someone else's message answers (or says honestly it can't)", wi && !/bạn đáp như/.test(wiText), wiText);
    await step(`document.querySelector(".app-sheet-bar .app-icon-btn").click(); $wait(200)`);
    // Self, a choice, Direction.
    await step(`$click(".app-whopick .app-chip-btn", "Mình"); $wait(200)`);
    await step(`(() => { const m = [...document.querySelectorAll(".im-msg--me")][0]; m.querySelector(".app-meta-btn").click(); })(); $wait(300)`);
    await step(`$click(".app-sel__opt", "Trẻ em Thích nghi"); $wait(150)`);
    await step(`document.querySelector(".app-sheet-bar .app-icon-btn").click(); $wait(200)`);
    await step(`$click(".app-dir .app-chip-btn", "Giảm bớt căng thẳng"); $wait(200)`);
    check("Direction is reference only (UAT #09/#10)", await step(`document.querySelectorAll(".app-dir__opt").length === 2 && !/Thử hướng này/.test(document.querySelector(".app-dir").textContent) && /Bạn vẫn là người quyết định/.test(document.querySelector(".app-dir").textContent)`));
    await step(`document.querySelector(".app-continue .im-btn--primary").click(); $wait(500)`);
    await step(`$click("button", "Lưu vào thiết bị này"); $wait(400)`);
    const saved = JSON.parse(await step(`localStorage.getItem("innermirror.collections.v1")`) ?? "[]");
    check("saved: 3 turns of mine, 1 chosen (AC), labels only", saved.length === 1 && saved[0].mine.length === 3 && saved[0].mine.filter((m) => m.chosen).length === 1 && !JSON.stringify(saved).includes("báo cáo"), JSON.stringify(saved[0]?.mine));
    await b.evaluate(`location.reload()`); await b.sleep(1500);
    await step(`document.querySelector(".app-bar__mirror").click(); $wait(500)`);
    check("after reload: card + Personal Mirror with 1 chosen by you", await step(`document.querySelectorAll(".app-card").length === 1 && /1 bạn chọn/.test(document.querySelector(".app-pm")?.textContent ?? "")`));
  });
}

if (only.includes("B")) {
  results.push("== B: EN retold story (1280)");
  const story = `I got home late again because of traffic. My partner is so impatient.\nMy partner said: "Late again? You promised you'd cook tonight."\nI said: "I know, I'm sorry. The bus broke down."\n"You always have an excuse," she said.\nI said: "Can we order something and talk about it after?"\nShe went quiet and looked at her phone.`;
  await session("en", 1280, async ({ step, waitFor }) => {
    await pasteAndReview(step, "Tell it", story, "Continue");
    check("story split: 4 dialogue, 2 narration", await step(`document.querySelectorAll(".app-rv-bubble").length === 4 && document.querySelectorAll(".app-narr").length === 2`), await step(`document.querySelectorAll(".app-rv-bubble").length + "/" + document.querySelectorAll(".app-narr").length`));
    await step(`document.querySelector(".im-check input").click(); $wait(100)`);
    await step(`$click("button", "Look at this conversation"); $wait(500)`);
    const ok = await waitFor(`document.querySelectorAll(".app-meta-btn").length > 0 || !!document.querySelector(".app-error, [role=alert]")`);
    check("live story analysis accepted (context) → Replay", ok && await step(`document.querySelectorAll(".app-meta-btn").length === 4`), await step(`document.body.innerText.slice(0, 200)`));
    check("story note + narration lines on Replay", await step(`!!$t(".im-notice", "retold story") && document.querySelectorAll(".app-narr--replay").length === 2`));
    check("no high confidence anywhere", await step(`![...document.querySelectorAll(".app-meta-btn")].some((x) => /High confidence/.test(x.getAttribute("aria-label")))`));
    const out = await step(`document.querySelector(".app-obs")?.textContent ?? ""`);
    check("'impatient' from the narration is not repeated as a reading", !/impatient/i.test(out), out);
  });
}

if (only.includes("C")) {
  results.push("== C: VI screenshot → extract → analyze (390)");
  const png = readFileSync(new URL("../phase0/screenshots/02-family-vi.png", import.meta.url)).toString("base64");
  await session("vi", 390, async ({ step, waitFor }) => {
    await step(`$click(".lp-cta"); $wait(300)`);
    await step(`$click("[role=radio]", "Có sẵn cuộc trò chuyện"); $wait(200)`);
    await step(`(async () => { const blob = await (await fetch("data:image/png;base64,${png}")).blob(); const dt = new DataTransfer(); dt.items.add(new File([blob], "chat.png", { type: "image/png" })); document.querySelector(".app-drop").dispatchEvent(new DragEvent("drop", { dataTransfer: dt, bubbles: true, cancelable: true })); await $wait(1500); return true; })()`);
    await step(`document.querySelector(".im-check input").click(); $wait(150)`);
    await step(`[...document.querySelectorAll("button")].find((x) => /^Tiếp tục$/.test(x.textContent))?.click(); $wait(500)`);
    const read = await waitFor(`!!document.querySelector(".app-rv-thread")`, 90_000);
    check("live extract → Review bubbles", read && await step(`document.querySelectorAll(".app-rv-bubble").length >= 4`), await step(`document.querySelectorAll(".app-rv-bubble").length + " bubbles; " + (document.querySelector(".im-error, [role=alert]")?.textContent ?? "")`));
    check("no self preselected", await step(`!document.querySelector(".app-whopick")`));
    await step(`document.querySelector(".im-check input").click(); $wait(100)`);
    await step(`$click("button", "Xem cuộc trò chuyện này"); $wait(500)`);
    check("live analysis of the screenshot chat", await waitFor(`document.querySelectorAll(".app-meta-btn").length > 0`));
  });
}

if (only.includes("D")) {
  results.push("== D: VI safety (390)");
  const chat = ["An: Dạo này cậu sao rồi?", "Mình: Mệt lắm. Chẳng còn hy vọng gì nữa.", "An: Sao lại nói vậy? Có chuyện gì à?", "Mình: Thôi kệ đi."].join("\n");
  await session("vi", 390, async ({ step, waitFor }) => {
    await pasteAndReview(step, "Kể lại", chat, "Tiếp tục");
    await step(`document.querySelector(".im-check input").click(); $wait(100)`);
    await step(`$click("button", "Xem cuộc trò chuyện này"); $wait(500)`);
    const done = await waitFor(`!!document.querySelector(".im-notice--safety")`);
    check("support resources shown", done, await step(`document.querySelector(".im-notice--safety")?.textContent.slice(0, 160) ?? document.body.innerText.slice(0, 200)`));
    check("What if? off", await step(`document.querySelectorAll(".app-wi-pill").length === 0`));
    check("Direction hidden", await step(`!document.querySelector(".app-dir")`));
  });
}

console.log(results.join("\n"));

// Founder UAT batch 3 (2026-11-01):
// #03 interface language from the device on first visit (vi → VI, en/ja/fr/… → EN), the toggle's
//     choice wins and survives reload, on the app and /privacy;
// #01 screenshot Review: checking advice folded into one line with +/−, people and messages first,
//     the cut-off warning still shown;
// #02 default title = people + number per group (order-insensitive), placeholders → Người A,
//     an edited title is never replaced, older saved titles are kept.
// /api/* mocked: nothing is paid for. Usage: node f3-batch3.mjs <width> <light|dark>
import { launch, HELPERS } from "./cdp.mjs";

const width = Number(process.argv[2] ?? 390);
const theme = process.argv[3] ?? "light";
const height = { 360: 740, 390: 844 }[width] ?? 900;
const { SAMPLES } = await import("../../src/lib/samples.ts");
const { cleanAnalysis } = await import("../../src/lib/ai/analysis.ts");
const sm = SAMPLES.vi;
const analysis = cleanAnalysis(sm.raw, sm.messages);
const analyze = { analysis, labels: { "Người A": "p1", "Người B": "p2" }, meta: { spec: "v3.2" } };
// One unnamed speaker on each side and one cut-off bubble.
const extraction = {
  speakers: [{ key: "S1", displayedName: null, side: "left" }, { key: "S2", displayedName: null, side: "right" }],
  messages: sm.messages.map((m, i) => ({ speaker: m.speakerId === "p1" ? "S1" : "S2", text: m.text, legibility: i === 2 ? "partial" : "clear" })), notes: [],
};
const results = [];
const check = (name, ok, extra = "") => results.push(`${ok ? "PASS" : "FAIL"} ${name}${extra ? ` (${extra})` : ""}`);
const device = (langs) => `Object.defineProperty(navigator, "languages", { get: () => ${JSON.stringify(langs)} }); Object.defineProperty(navigator, "language", { get: () => ${JSON.stringify(langs[0])} });`;
const session = async (langs, run) => {
  const b = await launch({ width, height, mocks: { "/api/analyze": analyze, "/api/extract": { extraction } } });
  try {
    await b.addInit(device(langs));
    await b.goto("http://localhost:3123/");
    const step = async (js) => { await b.evaluate(HELPERS); return b.evaluate(js); };
    await run(b, step);
  } catch (e) { results.push(`ERROR ${e.message}`); } finally { b.close(); }
  return b.api;
};
const isVi = `document.documentElement.lang === "vi" && document.querySelector(".lp-cta").textContent === "Soi một cuộc trò chuyện" && document.querySelector(".app-lang [aria-pressed=true]").textContent === "VI"`;
const isEn = `document.documentElement.lang === "en" && document.querySelector(".lp-cta").textContent !== "Soi một cuộc trò chuyện" && document.querySelector(".app-lang [aria-pressed=true]").textContent === "EN"`;
const fresh = async (b) => { await b.evaluate(`localStorage.clear(); localStorage.setItem("innermirror.theme", ${JSON.stringify(theme)}); location.reload()`); await b.sleep(1500); };

// #03 Language.
for (const [langs, want] of [[["vi-VN", "en-US"], "vi"], [["vi"], "vi"], [["en-GB"], "en"], [["ja-JP", "vi"], "en"], [["ko-KR"], "en"], [["fr-FR"], "en"]]) {
  await session(langs, async (b, step) => {
    await fresh(b);
    check(`#03 device ${langs.join(",")} → ${want.toUpperCase()}`, await step(want === "vi" ? isVi : isEn));
  });
}
await session(["ja-JP"], async (b, step) => {
  await fresh(b);
  await step(`document.querySelector(".app-lang button[lang=vi]").click(); $wait(200)`);
  await b.evaluate(`location.reload()`); await b.sleep(1500);
  check("#03 Japanese device, chose VI, reload → still VI", await step(isVi));
  await b.goto("http://localhost:3123/privacy");
  check("#03 /privacy follows the same choice", await step(`document.documentElement.lang === "vi" && document.body.textContent.includes("quyền riêng tư")`));
});
await session(["vi-VN"], async (b, step) => {
  await fresh(b);
  await step(`document.querySelector(".app-lang button[lang=en]").click(); $wait(200)`);
  await b.evaluate(`location.reload()`); await b.sleep(1500);
  check("#03 Vietnamese device, chose EN, reload → still EN", await step(isEn));
});

// #01 + #02 on a Vietnamese device.
const api = await session(["vi-VN"], async (b, step) => {
  // An older save with a title from before this rule stays as it was.
  const old = { v: 1, id: "old1", createdAt: new Date(Date.now() - 864e5).toISOString(), lang: "vi", title: "Từ hỏi thăm tình hình đến bày tỏ vui", note: "", mine: [{ order: 0, ai: "a", chosen: null }] };
  await b.evaluate(`localStorage.clear(); localStorage.setItem("innermirror.theme", ${JSON.stringify(theme)}); localStorage.setItem("innermirror.collections.v1", ${JSON.stringify(JSON.stringify([old]))}); location.reload()`);
  await b.sleep(1500);
  // Screenshot path → Review.
  await step(`$click(".lp-cta"); $wait(300)`);
  await step(`$click("[role=radio]", "Có sẵn"); $wait(300)`);
  await step(`(async () => { const c = document.createElement("canvas"); c.width = 390; c.height = 840; c.getContext("2d").fillRect(0, 0, 10, 10); const f = new File([await new Promise((r) => c.toBlob(r))], "s.png", { type: "image/png" }); const dt = new DataTransfer(); dt.items.add(f); const i = document.querySelector(".app-drop input"); i.files = dt.files; i.dispatchEvent(new Event("change", { bubbles: true })); await new Promise((r) => setTimeout(r, 1500)); })()`);
  await step(`document.querySelector(".app-add-panel .im-check input").click(); $wait(100)`);
  await step(`$click(".app-add-panel .app-actions button", "Tiếp tục"); $wait(1200)`);
  check("#01 advice folded: one line, + button, full text hidden", await step(`(() => { const b = document.querySelector(".app-moreline__btn"); return !!b && b.getAttribute("aria-expanded") === "false" && b.textContent.startsWith("So từng tin nhắn với ảnh chụp") && !document.querySelector("#shot-lead"); })()`));
  check("#01 cut-off warning still shown", await step(`!!$t(".im-notice", "viền đứt nét")`));
  check("#01 people section in the first screen", await step(`document.querySelector("#who").getBoundingClientRect().bottom < innerHeight * 0.85`), await step(`Math.round(document.querySelector("#who").getBoundingClientRect().top) + "/" + Math.round(document.querySelector(".app-rv-msg").getBoundingClientRect().top) + "/" + innerHeight`));
  await step(`document.querySelector(".app-moreline__btn").click(); $wait(150)`);
  const opened = await step(`document.querySelector("#shot-lead")?.textContent.includes("dấu của chữ") ?? false`);
  await step(`document.querySelector(".app-moreline__btn").click(); $wait(150)`);
  check("#01 + shows the full advice (accents, senders), − hides it", opened && await step(`!document.querySelector("#shot-lead")`));
  check("privacy line still on Review", await step(`!!$t(".im-notice", "Meta")`));
  check("no overflow on Review", await step(`document.documentElement.scrollWidth <= innerWidth`));
  await step(`document.querySelector(".im-check input").click(); $click("button", "Xem cuộc trò chuyện này"); $wait(1300)`);
  check("#02 no names in the screenshots → Người A – Mình – 01", await step(`document.querySelector(".app-obs__title-row strong").textContent`) === "Người A – Mình – 01", await step(`document.querySelector(".app-obs__title-row strong").textContent`));

  // Pasted chat with names: save, then the same people in the other order.
  const say = (a, b) => sm.messages.map((m) => `${m.speakerId === "p1" ? a : b}: ${m.text}`).join("\n");
  const pasteAnalyze = async (text) => {
    await step(`document.querySelector(".app-home").click(); $wait(300)`);
    await step(`window.confirm = () => true; $click(".lp-cta"); $wait(300)`);
    await step(`$click("[role=radio]", "Kể lại"); $wait(300)`);
    await step(`$type("#paste", ${JSON.stringify("")}); $wait(50)`);
    await step(`$type("#paste", ${JSON.stringify("x")}); $wait(50)`);
    await b.evaluate(`(() => { const e = document.querySelector("#paste"); Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value").set.call(e, ${JSON.stringify(text)}); e.dispatchEvent(new Event("input", { bubbles: true })); })()`);
    await step(`$click("button", "Tiếp tục"); $wait(400)`);
    await step(`document.querySelector(".im-check input").click(); $click("button", "Xem cuộc trò chuyện này"); $wait(1300)`);
    return step(`document.querySelector(".app-obs__title-row strong")?.textContent ?? ""`);
  };
  const saveIt = async () => {
    await step(`document.querySelectorAll(".app-whopick .app-chip-btn")[1].click(); $wait(150)`);
    await step(`document.querySelector(".app-continue .im-btn--primary").click(); $wait(400)`);
    await step(`$click("button", "Lưu vào thiết bị này"); $wait(400)`);
  };
  const t1 = await pasteAnalyze(say("Chị Phương", "Mình"));
  check("#02 Chị Phương – Mình – 01", t1 === "Chị Phương – Mình – 01", t1);
  await saveIt();
  const t2 = await pasteAnalyze(say("Mình", "Chị Phương").split("\n").reverse().join("\n"));
  check("#02 same people, other order → – 02", /^(Mình – Chị Phương|Chị Phương – Mình) – 02$/.test(t2), t2);
  // Edit the title, change a message (a new reading), and the edit stays.
  await step(`document.querySelector(".app-obs__title .app-icon-btn").click(); $wait(100)`);
  await step(`$type(".app-obs__title input", "Chuyện riêng"); document.querySelector(".app-obs__title input").dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })); $wait(150)`);
  await step(`$click(".app-replay__edit"); $wait(400)`);
  await step(`document.querySelector(".app-rv-bubble").click(); $wait(150)`);
  await step(`$type(".app-rv-edit textarea", "Dạo này em thế nào?"); $click(".app-rv-edit button", "Xong"); $wait(150)`);
  await step(`$click("button", "Xem cuộc trò chuyện này"); $wait(1300)`);
  check("#02 an edited title is not replaced by a new reading", await step(`document.querySelector(".app-obs__title-row strong").textContent`) === "Chuyện riêng");
  await saveIt();
  const titles = await step(`JSON.parse(localStorage.getItem("innermirror.collections.v1")).map((c) => c.title).join(" | ")`);
  check("#02 saved: edited title, the 01, and the older title unchanged", titles === "Chuyện riêng | Chị Phương – Mình – 01 | Từ hỏi thăm tình hình đến bày tỏ vui", titles);
  await b.evaluate(`location.reload()`); await b.sleep(1500);
  await step(`document.querySelector(".app-bar__mirror").click(); $wait(400)`);
  check("#02 cards show the titles after reload", await step(`[...document.querySelectorAll(".app-card__title")].map((x) => x.textContent).join(" | ")`) === titles);
});
check("API: only mocked extract/analyze calls", api.every((p) => p === "/api/extract" || p === "/api/analyze"), JSON.stringify(api));
console.log(`width ${width} ${theme}\n` + results.join("\n"));

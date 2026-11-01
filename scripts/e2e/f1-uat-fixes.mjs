// Founder UAT fix sprint (2026-11-01), the three acceptance journeys in Vietnamese:
// 1. choose a way in → input in view → Tiếp tục → Review from the top, no add-message block
//    → edit → Back keeps text and edits → analyze;
// 2. value line first, Mirror's editable title, "Trạng thái bản ngã" tab, Direction as reference;
// 3. compact cloud (largest = most frequent, in front), title saved and kept after reload.
// Plus the transparent logo in light or dark. /api/analyze is mocked with a real saved v3.2
// result: nothing is paid for. Usage: node f1-uat-fixes.mjs <width> <light|dark>
import { launch, HELPERS } from "./cdp.mjs";

const width = Number(process.argv[2] ?? 390);
const theme = process.argv[3] ?? "light";
const height = { 360: 740, 390: 844 }[width] ?? 900;
const { SAMPLES } = await import("../../src/lib/samples.ts");
const { anchorOf, cleanAnalysis } = await import("../../src/lib/ai/analysis.ts");
const sm = SAMPLES.vi;
const analysis = cleanAnalysis(sm.raw, sm.messages);
const mock = { analysis, labels: { "Người A": "p1", "Người B": "p2" }, meta: { spec: "v3.2" } };
const chat = sm.messages.map((m) => `${m.speakerId === "p1" ? "Chị" : "Em"}: ${m.text}`).join("\n");
// What the cloud must show for "Em" with no choices made: Mirror's reading per turn of hers.
const expected = sm.messages.filter((m) => m.speakerId === "p2" && anchorOf(analysis, m.id) === m.id)
  .map((m) => analysis.readings.find((r) => r.messageId === m.id)?.expression).filter((e) => e && e !== "UNCLEAR");
const expectedCounts = Object.values(expected.reduce((c, e) => ({ ...c, [e]: (c[e] ?? 0) + 1 }), {})).sort().join(",");

const b = await launch({ width, height, mocks: { "/api/analyze": mock } });
const results = [];
const check = (name, ok, extra = "") => results.push(`${ok ? "PASS" : "FAIL"} ${name}${extra ? ` (${extra})` : ""}`);
const noOverflow = `document.documentElement.scrollWidth <= innerWidth`;
const inView = (sel) => `(() => { const r = document.querySelector(${JSON.stringify(sel)})?.getBoundingClientRect(); return !!r && r.top >= 0 && r.bottom <= innerHeight; })()`;
const alphaAt00 = (sel) => `new Promise((ok) => { const img = document.querySelector(${JSON.stringify(sel)}); const go = () => { const c = document.createElement("canvas"); c.width = img.naturalWidth; c.height = img.naturalHeight; const x = c.getContext("2d"); x.drawImage(img, 0, 0); ok(x.getImageData(0, 0, 1, 1).data[3]); }; img.complete ? go() : img.onload = go; })`;
try {
  await b.goto("http://localhost:3123/");
  await b.evaluate(`localStorage.clear(); localStorage.setItem("innermirror.lang", "vi"); localStorage.setItem("innermirror.theme", ${JSON.stringify(theme)}); location.reload()`);
  await b.sleep(1500);
  const step = async (js) => { await b.evaluate(HELPERS); return b.evaluate(js); };

  // #12 Logo: no white matte, the landing logo matches the theme.
  check("#12 header icon has a transparent corner", await step(alphaAt00(".app-brand img")) === 0);
  check("#12 / batch 2 #01: landing logo is the header mark, same file, transparent", await step(`(() => { const h = document.querySelector(".app-header .app-brand img"), l = document.querySelector(".lp-logo .app-brand img"); return !!l && l.src === h.src && /\\/brand\\/app-mark\\.png$/.test(l.src) && document.querySelector(".lp-logo .app-brand").textContent === "InnerMirror"; })()`));
  check("#12 landing logo has a transparent corner", await step(alphaAt00(".lp-logo .app-brand img")) === 0);

  // Journey 1: input.
  await step(`$click(".lp-cta"); $wait(300)`);
  check("#01 nothing to fill in until a way is chosen", await step(`!document.querySelector("#paste") && document.querySelectorAll("[role=radio]").length === 2`));
  await step(`$click("[role=radio]", "Kể lại"); $wait(400)`);
  check("#01 cards shrink to a switch above the input", await step(`!!document.querySelector(".app-methods.is-compact") && document.querySelector("[role=radio][aria-checked=true]").textContent.includes("Kể lại")`));
  check("#01 text box fully in view without scrolling", await step(inView("#paste")), await step(`JSON.stringify([scrollY, document.querySelector("#paste").getBoundingClientRect().bottom, innerHeight])`));
  check("#01 Tiếp tục in view", await step(inView(".app-add-panel .im-btn--primary")), await step(`document.querySelector(".app-add-panel .im-btn--primary").getBoundingClientRect().bottom + " / " + innerHeight`));
  check("#02 one CTA, labelled Tiếp tục", await step(`[...document.querySelectorAll(".app-add-panel .app-actions button")].map((x) => x.textContent).join("|") === "Tiếp tục"`));
  check("#03 no 'Hoặc gõ từng tin nhắn'", await step(`!document.body.textContent.includes("Hoặc gõ từng tin nhắn")`));
  check("#01 no overflow on input", await step(noOverflow));
  await step(`$type("#paste", ${JSON.stringify(chat)}); $wait(100)`);
  // Scrolled down before continuing, as a phone user would be after typing.
  await step(`scrollTo(0, 99999); $wait(100); $click("button", "Tiếp tục"); $wait(400)`);
  check("#04 Review opens at the top", await step(`scrollY === 0`), await step(`String(scrollY)`));
  check("#04 order: title, guide, who is in it, messages", await step(`(() => { const y = (s) => document.querySelector(s).getBoundingClientRect().top; return document.querySelector("h1").textContent === "Kiểm tra cuộc trò chuyện" && y("h1") < y(".app-lead") && y(".app-lead") < y("#who") && y("#who") < y(".app-rv-thread"); })()`));
  check("#04 title in view", await step(inView("h1")));
  check("#05 no add-message block (Ai nói? / Gõ tin nhắn / Thêm)", await step(`!document.querySelector(".app-composer") && !document.body.textContent.includes("Ai nói?") && !document.querySelector("input[placeholder='Gõ tin nhắn']") && ![...document.querySelectorAll("button")].some((x) => x.textContent.trim() === "Thêm")`));
  check("#05 guide says Back adds more", await step(`document.querySelector(".app-lead").textContent.includes("bấm Quay lại")`));
  // Edit the words and the sender of one message, then Back and forward again.
  await step(`$click(".app-rv-bubble", "mệt lắm"); $wait(200)`);
  await step(`$type(".app-rv-edit textarea", "Dạo này em mệt lắm chị ạ. SỬA"); $wait(100)`);
  await step(`$click(".app-rv-edit .app-chip-btn", "Chị"); $wait(100)`);
  await step(`$click(".app-rv-edit button", "Xong"); $wait(200)`);
  check("#05 a message's words and sender can still be edited", await step(`(() => { const b = $t(".app-rv-bubble", "SỬA"); return !!b && b.querySelector(".app-rv-name").textContent.startsWith("Chị"); })()`));
  await step(`scrollTo(0, 99999); $click("button", "Quay lại"); $wait(300)`);
  check("Back keeps the text and the chosen way", await step(`document.querySelector("#paste")?.value === ${JSON.stringify(chat)} && document.querySelector("[role=radio][aria-checked=true]").textContent.includes("Kể lại")`));
  await step(`$click("button", "Tiếp tục"); $wait(400)`);
  check("forward again: edits kept, at the top", await step(`!!$t(".app-rv-bubble", "SỬA") && scrollY === 0`));
  // Undo the sender change so the mock's speakers match.
  await step(`$click(".app-rv-bubble", "SỬA"); $wait(200)`);
  await step(`$type(".app-rv-edit textarea", "Dạo này em mệt lắm chị ạ, chẳng muốn làm gì."); $click(".app-rv-edit .app-chip-btn", "Em"); $click(".app-rv-edit button", "Xong"); $wait(200)`);
  check("no overflow on Review", await step(noOverflow));
  await step(`document.querySelector(".im-check input").click(); $wait(100)`);
  await step(`$click("button", "Xem cuộc trò chuyện này"); $wait(1200)`);

  // Journey 2: observation.
  check("#06 value line first, then Mirror's observation", await step(`(() => { const v = document.querySelector(".app-replay__value"); return !!v && v.textContent.startsWith("Một góc nhìn khác, để hiểu nhau hơn.") && v.getBoundingClientRect().top < document.querySelector(".app-obs").getBoundingClientRect().top; })()`));
  check("#06 limits kept in the method details", await step(`[...document.querySelectorAll(".app-obs details")].some((d) => d.textContent.includes("không nghe được giọng nói"))`));
  check("#06 uncertainty still shown", await step(`document.querySelector(".app-obs").textContent.includes(${JSON.stringify(analysis.uncertainty.slice(0, 30))})`));
  const title = await step(`document.querySelector(".app-obs__title-row strong")?.textContent ?? ""`);
  check("#07 Mirror suggests a short, neutral title", title === "Từ hỏi thăm tình hình đến bày tỏ vui", title);
  await step(`document.querySelector(".app-obs__title .app-icon-btn").click(); $wait(150)`);
  await step(`$type(".app-obs__title input", "Chuyện ốm của em"); document.querySelector(".app-obs__title input").dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true })); $wait(150)`);
  check("#07 the title can be edited", await step(`document.querySelector(".app-obs__title-row strong")?.textContent === "Chuyện ốm của em"`));
  await step(`document.querySelector(".app-meta-btn").click(); $wait(300)`);
  check("#08 panel tab reads Trạng thái bản ngã", await step(`document.querySelector("#tab-reading")?.textContent === "Trạng thái bản ngã"`));
  check("#08 Gương thấy and Trạng thái bạn chọn stay apart", await step(`[...document.querySelectorAll(".app-sel__label")].map((x) => x.textContent).join("|") === "Gương thấy|Trạng thái bạn chọn"`));
  check("#08 old wording gone", await step(`!document.body.textContent.includes("Cách hiểu của bạn") && !document.body.textContent.includes("cách hiểu của bạn")`));
  await step(`document.querySelector(".app-sheet-bar .app-icon-btn").click(); $wait(200)`);
  check("What if? still on messages", await step(`document.querySelectorAll(".app-wi-pill").length > 0`));
  await step(`$click(".app-dir .app-chip-btn", "Thấu hiểu nhau hơn"); $wait(150)`);
  check("#09 Direction: reference cards, nothing to pick or try", await step(`document.querySelectorAll(".app-dir__opt").length === 2 && document.querySelectorAll(".app-dir button").length === 5 && !/Thử hướng này|Chọn trạng thái khác|Ẩn các trạng thái khác/.test(document.querySelector(".app-dir").textContent)`));
  check("#10 reference message shown", await step(`!!$t(".app-dir__yours", "Đây là những hướng đi để bạn tham khảo. Bạn vẫn là người quyết định điều mình muốn làm tiếp theo.")`));
  check("no overflow on Replay", await step(noOverflow));
  await step(`$click(".app-whopick .app-chip-btn", "Em"); $wait(200)`);
  await step(`document.querySelector(".app-continue .im-btn--primary").click(); $wait(500)`);

  // Journey 3: reflection and save.
  check("#07 My Reflection carries the edited title", await step(`document.querySelector("#title")?.value === "Chuyện ốm của em"`));
  const cloud = `(() => { const ps = [...document.querySelectorAll(".app-current .app-cloud__puff")].map((p) => ({ n: +p.querySelector(".app-cloud__n").textContent, w: p.getBoundingClientRect().width, z: +getComputedStyle(p).zIndex, rank: +p.dataset.rank })); return JSON.stringify(ps); })()`;
  const ps = JSON.parse(await step(cloud));
  const top = ps.find((p) => p.rank === 0);
  check("#11 cloud counts unchanged (Mirror's readings for Em)", ps.map((p) => p.n).sort().join(",") === expectedCounts, `${ps.map((p) => p.n)} vs ${expectedCounts}`);
  check("#11 most frequent is largest and in front", ps.every((p) => p.n <= top.n && p.w <= top.w + 0.5 && p.z <= top.z), JSON.stringify(ps));
  check("#11 cloud is one compact row", await step(`(() => { const c = document.querySelector(".app-current .app-cloud").getBoundingClientRect(); const ys = [...document.querySelectorAll(".app-current .app-cloud__puff")].map((p) => p.getBoundingClientRect()); return c.height <= 160 && ys.every((r) => r.top >= c.top - 1 && r.bottom <= c.bottom + 1); })()`), await step(`String(document.querySelector(".app-current .app-cloud").getBoundingClientRect().height)`));
  check("no overflow on My Reflection", await step(noOverflow));
  await step(`$click("button", "Lưu vào thiết bị này"); $wait(400)`);
  await b.evaluate(`location.reload()`); await b.sleep(1500);
  await step(`document.querySelector(".app-bar__mirror").click(); $wait(400)`);
  check("#07 saved card keeps the title after reload", await step(`document.querySelector(".app-card__title")?.textContent === "Chuyện ốm của em" && JSON.parse(localStorage.getItem("innermirror.collections.v1"))[0].title === "Chuyện ốm của em"`));
  check("#11 saved card cloud shows the same counts", await step(`[...document.querySelectorAll(".app-card .app-cloud__n")].map((x) => +x.textContent).sort().join(",")`) === expectedCounts);
  check("only one API call (analyze), nothing else", b.api.length === 1 && b.api[0].includes("/api/analyze"), JSON.stringify(b.api));
} catch (e) {
  results.push(`ERROR ${e.message}`);
} finally {
  console.log(`width ${width} ${theme}\n` + results.join("\n") + `\nAPI requests: ${JSON.stringify(b.api)}`);
  b.close();
}

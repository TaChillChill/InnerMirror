// Founder UAT batch 2 (2026-11-01), the three acceptance journeys:
// 1. screenshots: upload area right under the switch, privacy after it, 1 → bad file → 3 → 4th,
//    each pick scrolls to the new thumbnails and Continue; phones get photo-library wording;
// 2. "Gương thấy gì?" intro collapsed by default, +/− opens and closes it;
// 3. Save on a plain-HTTP LAN origin (how an iPhone opens a local build; no crypto.randomUUID
//    there), confirmation, card listed, reload, reopen.
// /api/extract and /api/analyze are mocked: nothing is paid for.
// Usage: node f2-batch2.mjs <width> <light|dark> <en|vi> [base URL, default http://localhost:3123/]
import { launch, HELPERS } from "./cdp.mjs";

const width = Number(process.argv[2] ?? 390);
const theme = process.argv[3] ?? "light";
const lang = process.argv[4] ?? "vi";
const base = process.argv[5] ?? "http://localhost:3123/";
const phone = width < 600;
const height = { 360: 740, 390: 844 }[width] ?? 900;
const { SAMPLES } = await import("../../src/lib/samples.ts");
const { cleanAnalysis } = await import("../../src/lib/ai/analysis.ts");
const sm = SAMPLES[lang];
const extraction = {
  speakers: [{ key: "S1", displayedName: sm.names[0], side: "left" }, { key: "S2", displayedName: null, side: "right" }],
  messages: sm.messages.map((m) => ({ speaker: m.speakerId === "p1" ? "S1" : "S2", text: m.text, legibility: "clear" })), notes: [],
};
const analysis = cleanAnalysis(sm.raw, sm.messages);
const L = lang === "vi"
  ? { have: "Có sẵn cuộc trò chuyện", cont: "Tiếp tục", look: "Xem cuộc trò chuyện này", next: "Tiếp tục nhìn lại mình", save: "Lưu vào thiết bị này", added: (n) => `Đã thêm ${n}/5 ảnh.`, photo: "thư viện ảnh", drag: "Kéo thả", value: "Một góc nhìn khác, để hiểu nhau hơn.", privacy: "không lưu ảnh" }
  : { have: "I have the chat", cont: "Continue", look: "Look at this conversation", next: "Continue to My Reflection", save: "Save to this device", added: (n) => `${n}/5 screenshots added.`, photo: "photo library", drag: "Drag and drop", value: "Another perspective, to understand each other better.", privacy: "don't save your screenshots" };

const b = await launch({ width, height, mocks: { "/api/extract": { extraction }, "/api/analyze": { analysis, labels: { [lang === "vi" ? "Người A" : "Person A"]: "p1", [lang === "vi" ? "Người B" : "Person B"]: "p2" }, meta: { spec: "v3.2" } } } });
const results = [];
const check = (name, ok, extra = "") => results.push(`${ok ? "PASS" : "FAIL"} ${name}${extra ? ` (${extra})` : ""}`);
const visible = (sel) => `(() => { const e = document.querySelector(${JSON.stringify(sel)}); if (!e) return false; const r = e.getBoundingClientRect(); const top = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--app-header-h")) || 0; return r.top >= top - 1 && r.bottom <= innerHeight + 1; })()`;
// Picks files the way the photo picker does: real PNGs drawn on a canvas, or broken bytes.
const pick = (n, broken = false) => `(async () => {
  const files = [];
  for (let i = 0; i < ${n}; i++) {
    if (${broken}) { files.push(new File([new Uint8Array([1, 2, 3, 4])], "bad.png", { type: "image/png" })); continue; }
    const c = document.createElement("canvas"); c.width = 390; c.height = 840;
    const x = c.getContext("2d"); x.fillStyle = ["#cde", "#edc", "#dec"][i % 3]; x.fillRect(0, 0, 390, 840); x.fillStyle = "#333"; x.font = "28px sans-serif"; x.fillText("chat " + i, 40, 80);
    files.push(new File([await new Promise((r) => c.toBlob(r, "image/png"))], "shot" + i + ".png", { type: "image/png" }));
  }
  const dt = new DataTransfer(); files.forEach((f) => dt.items.add(f));
  const input = document.querySelector(".app-drop input[type=file]"); input.files = dt.files; input.dispatchEvent(new Event("change", { bubbles: true }));
  await new Promise((r) => setTimeout(r, 1500));
})()`;
try {
  // Phones get a touch screen, so (pointer: coarse) matches as on an iPhone.
  if (phone) await b.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
  await b.goto(base);
  await b.evaluate(`localStorage.clear(); localStorage.setItem("innermirror.lang", ${JSON.stringify(lang)}); localStorage.setItem("innermirror.theme", ${JSON.stringify(theme)}); location.reload()`);
  await b.sleep(1500);
  const step = async (js) => { await b.evaluate(HELPERS); return b.evaluate(js); };
  check(`origin secure context: ${await step("isSecureContext")}`, true);

  // Journey 1: screenshots.
  await step(`$click(".lp-cta"); $wait(300)`);
  await step(`$click("[role=radio]", ${JSON.stringify(L.have)}); $wait(400)`);
  check("#02 upload area in view right after choosing", await step(visible(".app-drop")));
  check("#02 order: switch → upload area → privacy notice (kept in full)", await step(`(() => { const y = (s) => document.querySelector(s).getBoundingClientRect().top; const n = [...document.querySelectorAll(".app-add-panel .im-notice")].find((x) => x.textContent.includes(${JSON.stringify(L.privacy)})); return !!n && y(".app-methods") < y(".app-drop") && y(".app-drop") < n.getBoundingClientRect().top; })()`));
  const hint = await step(`document.querySelector(".app-drop .im-hint").textContent`);
  check(`A: ${phone ? "photo-library" : "drag-and-drop"} wording`, phone ? hint.includes(L.photo) && !hint.includes("Cmd") : hint.includes(L.drag), hint);
  await step(pick(1));
  check("#03 one pick: 1 thumbnail, confirmation", await step(`document.querySelectorAll(".app-shot").length === 1 && document.querySelector(".app-add-panel [role=status]")?.textContent.includes(${JSON.stringify(L.added(1))})`));
  check("#03 the new thumbnail is in view", await step(visible(".app-shot:last-child")));
  check("#03 Continue is in view", await step(visible(".app-add-panel .app-actions")), await step(`String(document.querySelector(".app-add-panel .app-actions").getBoundingClientRect().bottom) + "/" + innerHeight`));
  await step(`scrollTo(0, 0)`);
  await step(pick(1, true));
  check("#03 a failed pick says so, in view, and keeps the earlier screenshot", await step(`document.querySelectorAll(".app-shot").length === 1 && !!document.querySelector(".app-add-panel .im-error")`) && await step(visible(".app-add-panel .im-error")));
  await step(`scrollTo(0, 0)`);
  await step(pick(2));
  check("#03 two more: 3 thumbnails, the newest in view with Continue", await step(`document.querySelectorAll(".app-shot").length === 3`) && await step(visible(".app-shot:last-child")) && await step(visible(".app-add-panel .app-actions")));
  check("#03 nothing sent and no step change on pick", b.api.length === 0 && await step(`!!document.querySelector(".app-drop")`), JSON.stringify(b.api));
  check("no overflow on upload", await step(`document.documentElement.scrollWidth <= innerWidth`));
  await step(`document.querySelector(".app-add-panel .im-check input").click(); $wait(100)`);
  await step(`$click(".app-add-panel .app-actions button", ${JSON.stringify(L.cont)}); $wait(1200)`);
  check("Continue → Review (one extract call)", await step(`!!document.querySelector(".app-rv-thread")`) && b.api.filter((p) => p === "/api/extract").length === 1);

  // Journey 2: observation.
  await step(`document.querySelector(".im-check input").click(); $wait(100)`);
  await step(`$click("button", ${JSON.stringify(L.look)}); $wait(1300)`);
  check("#05 intro collapsed: short line only, + button", await step(`(() => { const b = document.querySelector(".app-moreline__btn"); return b.getAttribute("aria-expanded") === "false" && b.textContent.includes(${JSON.stringify(L.value)}) && !document.querySelector("#value-body"); })()`));
  check("#05 Mirror's observation starts in the first screen", await step(`document.querySelector(".app-obs").getBoundingClientRect().top < innerHeight * 0.6`), await step(`String(Math.round(document.querySelector(".app-obs").getBoundingClientRect().top)) + "/" + innerHeight`));
  await step(`document.querySelector(".app-moreline__btn").click(); $wait(150)`);
  check("#05 + opens the full text, button shows −", await step(`document.querySelector(".app-moreline__btn").getAttribute("aria-expanded") === "true" && document.querySelector("#value-body")?.textContent.length > 100`));
  await step(`document.querySelector(".app-moreline__btn").click(); $wait(150)`);
  check("#05 − closes it again", await step(`!document.querySelector("#value-body")`));

  // Journey 3: save.
  await step(`document.querySelectorAll(".app-whopick .app-chip-btn")[1].click(); $wait(200)`);
  await step(`$click(".app-continue button", ${JSON.stringify(L.next)}); $wait(500)`);
  await step(`$type("#title", "Batch 2 title"); $type("#note", "a note to self"); $wait(100)`);
  await b.evaluate(`window.__errs = []; addEventListener("error", (e) => __errs.push(e.message))`);
  await step(`$click("button", ${JSON.stringify(L.save)}); $wait(500)`);
  check("#04 Save: confirmation shown, no script error", await step(`!!document.querySelector(".im-notice--success") && __errs.length === 0`), await step(`JSON.stringify(window.__errs)`));
  check("#04 the card is listed at once", await step(`document.querySelectorAll(".app-card").length === 1 && document.querySelector(".app-card__title").textContent === "Batch 2 title"`));
  await b.evaluate(`location.reload()`); await b.sleep(1500);
  await step(`document.querySelector(".app-bar__mirror").click(); $wait(400)`);
  check("#04 still there after reload", await step(`document.querySelectorAll(".app-card").length === 1`));
  await step(`document.querySelector(".app-card").click(); $wait(300)`);
  check("#04 reopens with title, note and picture", await step(`(() => { const d = document.querySelector(".app-modal"); return !!d && d.querySelector("h2").textContent === "Batch 2 title" && d.textContent.includes("a note to self") && d.querySelectorAll(".app-cloud__puff").length > 0; })()`));
  check("API: one extract, one analyze, nothing else", JSON.stringify(b.api) === JSON.stringify(["/api/extract", "/api/analyze"]), JSON.stringify(b.api));
} catch (e) {
  results.push(`ERROR ${e.message}`);
} finally {
  console.log(`width ${width} ${theme} ${lang} ${base}\n` + results.join("\n") + `\nAPI requests: ${JSON.stringify(b.api)}`);
  b.close();
}

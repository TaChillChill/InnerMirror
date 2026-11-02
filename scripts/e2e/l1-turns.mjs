// L1: analysis covers at most 40 turns. Over 40, Review asks which part to look at (nothing
// preselected, nothing deleted: the rest is dimmed); only that part is sent; a failed analysis
// retries the same part with no re-entry; Edit brings back the whole conversation; the server
// refuses more than 40 turns. All /api/* mocked in the browser.
//   node scripts/e2e/l1-turns.mjs <width> <en|vi>
import { launch, HELPERS } from "./cdp.mjs";

const width = Number(process.argv[2] ?? 390);
const lang = process.argv[3] ?? "en";
const { cleanAnalysis } = await import("../../src/lib/ai/analysis.ts");
const { analysisLabels, groupTurns } = await import("../../src/lib/ai/analysis-spec.ts");
const L = {
  en: { tell: "Tell it", next: "Continue", look: "Look at this conversation", retry: "Try again", edit: "Edit the conversation", title: "has 50 turns", looked: "turns 11–50 of 50", choose: "Choose which part", mirror: "My Reflection" },
  vi: { tell: "Kể lại", next: "Tiếp tục", look: "Xem cuộc trò chuyện này", retry: "Thử lại", edit: "Sửa cuộc trò chuyện", title: "có 50 lượt", looked: "lượt 11–50 trên tổng 50", choose: "Hãy chọn đoạn", mirror: "Nhìn lại mình" },
}[lang];

// A valid observation for whatever part is sent: one Adult reading per turn.
const sent = [];
let failNext = true;
const analyze = (req) => {
  const input = JSON.parse(req.postData ?? Buffer.concat((req.postDataEntries ?? []).map((e) => Buffer.from(e.bytes, "base64"))).toString());
  sent.push(input);
  if (failNext) { failNext = false; return { __status: 502, __body: { error: "upstream" } }; }
  const turns = groupTurns(input.messages);
  const raw = {
    context: { register: "casual", turns: turns.map((t) => ({ turnId: t.turnId, act: "states", respondsTo: null })), dynamics: "even" },
    segments: turns.map((t) => ({ turnId: t.turnId, messageIds: t.messageIds, splitReason: null, cues: [input.messages.find((m) => m.id === t.messageIds[0]).text.split(" ")[0]], contextCues: [], rationale: "Plain statement.", family: "A", expression: "A", confidence: "medium", alternative: null, invites: "A", secondLayer: null })),
    shifts: [], summary: "A long, even exchange.", uncertainty: "Text alone cannot show tone.", safety: { flagged: false, categories: [], note: null },
  };
  const labels = Object.fromEntries(Object.entries(analysisLabels(input)).map(([id, label]) => [label, id]));
  return { analysis: cleanAnalysis(raw, input.messages), labels, meta: { spec: "test" } };
};

const b = await launch({ width, height: 900, mocks: { "/api/analyze": analyze } });
const results = [];
const check = (name, ok, extra = "") => results.push(`${ok ? "PASS" : "FAIL"} ${name}${extra ? ` (${extra})` : ""}`);
const chat = (n) => Array.from({ length: n }, (_, i) => `${i % 2 ? "Minh" : "Linh"}: message ${i + 1} about the weekend`).join("\n");
try {
  await b.goto("http://localhost:3123/");
  const step = async (js) => { await b.evaluate(HELPERS); return b.evaluate(js); };
  const toReview = async (n) => {
    await b.evaluate(`localStorage.clear(); localStorage.setItem("innermirror.lang", ${JSON.stringify(lang)}); location.reload()`);
    await b.sleep(1500);
    await step(`$click(".lp-cta"); $wait(300)`);
    await step(`$click("[role=radio]", ${JSON.stringify(L.tell)}); $wait(200)`);
    await step(`$type("#paste", ${JSON.stringify(chat(n))}); $wait(100)`);
    await step(`$click(".app-actions button", ${JSON.stringify(L.next)}); $wait(400)`);
  };
  const cta = () => step(`$t("button", ${JSON.stringify(L.look)})?.disabled`);
  const pick = (index) => step(`(() => { const s = document.querySelector("#turn-part"); s.value = s.options[${index}].value; s.dispatchEvent(new Event("change", { bubbles: true })); })(); $wait(200)`);

  // Exactly 40 turns: nothing to choose.
  await toReview(40);
  await step(`document.querySelector(".im-check input").click(); $wait(100)`);
  check("40 turns: no part picker, can continue", await step(`!document.querySelector("#turn-part")`) && (await cta()) === false);

  // 50 turns: must choose; nothing preselected or removed.
  await toReview(50);
  check("50 turns: picker names the count; 50 messages, none dimmed", await step(`!!$t(".app-part", ${JSON.stringify(L.title)}) && document.querySelectorAll(".app-rv-bubble").length === 50 && !document.querySelector(".is-outside") && document.querySelector("#turn-part").value === ""`));
  await step(`document.querySelector(".im-check input").click(); $wait(100)`);
  check("no part chosen: Continue blocked with a reason", (await cta()) === true && await step(`document.body.innerText.includes(${JSON.stringify(L.choose)})`));
  check("11 options (turns 1–40 … 11–50), no overflow", await step(`document.querySelectorAll("#turn-part option").length === 12 && document.documentElement.scrollWidth <= innerWidth`));
  await pick(11); // turns 11–50
  check("part 11–50: first 10 messages dimmed, still there; Continue enabled", await step(`document.querySelectorAll(".app-rv-msg.is-outside").length === 10 && document.querySelectorAll(".app-rv-bubble").length === 50`) && (await cta()) === false);

  // First try fails; retry sends the same part with nothing re-entered.
  await step(`$click("button", ${JSON.stringify(L.look)}); $wait(900)`);
  check("analysis error shows Try again", await step(`!!$t("button", ${JSON.stringify(L.retry)})`));
  await step(`$click("button", ${JSON.stringify(L.retry)}); $wait(1200)`);
  const turnsSent = sent.map((x) => groupTurns(x.messages).length);
  check("only the chosen 40 turns are sent, the same on retry", sent.length === 2 && turnsSent.every((n) => n === 40) && sent.every((x) => x.messages[0].text === "message 11 about the weekend") && JSON.stringify(sent[0]) === JSON.stringify(sent[1]), JSON.stringify(turnsSent));
  check("retry → observation for 40 messages, says which part was looked at", await step(`document.querySelectorAll(".app-meta-btn").length === 40 && document.body.innerText.includes(${JSON.stringify(L.looked)})`), await step(`document.querySelectorAll(".app-meta-btn").length`));

  // Edit brings back all 50, the chosen part kept.
  await step(`$click("button", ${JSON.stringify(L.edit)}); $wait(500)`);
  check("Edit → Review shows all 50 again, same part chosen", await step(`document.querySelectorAll(".app-rv-bubble").length === 50 && document.querySelectorAll(".app-rv-msg.is-outside").length === 10 && document.querySelector("#turn-part").selectedIndex === 11`));
  await pick(1); // turns 1–40
  await step(`$click("button", ${JSON.stringify(L.look)}); $wait(1200)`);
  check("another part: turns 1–40 sent", sent.length === 3 && sent[2].messages[0].text === "message 1 about the weekend" && groupTurns(sent[2].messages).length === 40);
  await step(`document.querySelector(".app-bar__mirror")?.click(); $wait(600)`);
  check("My Reflection opens for the part", await step(`!!document.querySelector(".app-page h1") && document.documentElement.scrollWidth <= innerWidth`));

  // The server itself refuses more than 40 turns, before any model call.
  const msgs = Array.from({ length: 41 }, (_, i) => ({ id: `m${i}`, speakerId: i % 2 ? "p2" : "p1", text: `line ${i}` }));
  const res = await fetch("http://localhost:3123/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ language: "en", participantIds: ["p1", "p2"], messages: msgs, consent: true }) });
  check("server: 41 turns → 413 too_long", res.status === 413 && (await res.json()).error === "too_long", String(res.status));
} catch (e) {
  results.push(`ERROR ${e.message}`);
} finally {
  console.log(`width ${width} ${lang}\n` + results.join("\n") + `\nAPI requests: ${b.api.length} (${[...new Set(b.api)].join(", ")})`);
  b.close();
}

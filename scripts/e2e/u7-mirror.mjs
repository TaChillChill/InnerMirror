// U7: My Mirror with 8 saved v1 collections (same data as the approved prototype).
import { tmpdir } from "node:os";
import { join } from "node:path";
import { launch, HELPERS } from "./cdp.mjs";
import { writeFileSync } from "node:fs";

const width = Number(process.argv[2] ?? 390), lang = process.argv[3] ?? "vi";
const FULL = [
  { ago: 2, title: "Tranh luận về kế hoạch", s: { a: [3, 2], ac: [1, 1], cp: [0, 1] } },
  { ago: 5, title: "Chuyện cuối tuần", s: { np: [2, 1], ac: [1, 1], fc: [1, 0] } },
  { ago: 8, title: "Góp ý trong team", s: { cp: [1, 2], a: [0, 2], ac: [1, 0] }, unclear: 1 },
  { ago: 12, title: "Nhắn tin với mẹ", s: { np: [3, 2], a: [1, 1], fc: [0, 1] }, unsure: 1 },
  { ago: 14, title: "Tìm hướng giải pháp", s: { a: [2, 2], ac: [1, 1], np: [0, 1] } },
  { ago: 20, title: "", s: { a: [1, 0], fc: [1, 1] }, unclear: 1 },
  { ago: 25, title: "Hỏi bạn về chuyến đi", s: { fc: [2, 0], a: [1, 1] } },
  { ago: 30, title: "", s: { ac: [1, 1], cp: [0, 1], a: [1, 0] } },
];
// Dates are days before the run (plus an hour, so day 30 stays inside), so the 7/30-day windows never drift.
// Chosen-by-me turns get a different AI suggestion half the time, to prove my choice wins.
const collections = FULL.map((c, i) => {
  const mine = [];
  for (const [ex, [u, g]] of Object.entries(c.s)) {
    for (let k = 0; k < u; k++) mine.push({ ai: k % 2 ? "cp" : ex, chosen: ex });
    for (let k = 0; k < g; k++) mine.push({ ai: ex, chosen: null });
  }
  for (let k = 0; k < (c.unclear ?? 0); k++) mine.push({ ai: "UNCLEAR", chosen: null });
  for (let k = 0; k < (c.unsure ?? 0); k++) mine.push({ ai: "a", chosen: "unsure" });
  return { v: 1, id: `c${i}`, createdAt: new Date(Date.now() - c.ago * 86_400_000 + 3_600_000).toISOString(), lang: "vi", title: c.title, note: "", mine: mine.map((m, order) => ({ order, ...m })) };
});

const b = await launch({ width, height: 900 });
const results = [];
const check = (name, ok, extra = "") => results.push(`${ok ? "PASS" : "FAIL"} ${name}${extra ? ` (${extra})` : ""}`);
try {
  await b.goto("http://localhost:3123/");
  await b.evaluate(`localStorage.setItem("innermirror.collections.v1", ${JSON.stringify(JSON.stringify(collections))}); localStorage.setItem("innermirror.lang", "${lang}"); location.reload()`);
  await b.sleep(1500);
  const step = async (js) => { await b.evaluate(HELPERS); return b.evaluate(js); };
  await step(`document.querySelector(".app-bar__mirror").click(); $wait(500)`);
  const read = () => step(`JSON.stringify({ turns: document.querySelector(".app-donut__mid strong")?.textContent, convs: document.querySelector(".app-donut__mid small")?.textContent, rows: [...document.querySelectorAll(".app-pm .app-staterow__num")].map((x) => x.textContent), aside: document.querySelector(".app-pm .app-pm__aside")?.textContent, insight: document.querySelector(".app-pm__insight p")?.firstChild?.textContent })`);
  check("8 cards", await step(`document.querySelectorAll(".app-card").length`) === 8);
  const titles = await step(`[...document.querySelectorAll(".app-card__title")].map((x) => x.textContent).join("|")`);
  check("untitled cards are numbered by save order", titles.includes("#3") && titles.includes("#1") && titles.indexOf("#3") < titles.indexOf("#1"), titles);
  check("first card cloud: 5 / 2 / 1 badges", await step(`[...document.querySelector(".app-card .app-cloud").querySelectorAll(".app-cloud__n")].map((x) => x.textContent).join(",")`) === "5,2,1");
  const r30 = JSON.parse(await read());
  check("30 days: 46 turns, 8 conversations", /46/.test(r30.turns) && /8/.test(r30.convs), JSON.stringify(r30));
  check("percentages add to 100", r30.rows.map((x) => parseInt(x)).reduce((a, x) => a + x, 0) === 100);
  check("unclear and not-sure listed apart", /2/.test(r30.aside ?? "") && /1/.test(r30.aside ?? ""), r30.aside);
  check("neutral summary, no 'bạn thường'", /17/.test(r30.insight) && !/thường xuất hiện|you usually/i.test(r30.insight), r30.insight);
  await step(`[...document.querySelectorAll(".app-seg button")][0].click(); $wait(300)`);
  const r7 = JSON.parse(await read());
  check("7 days: 14 turns, 2 conversations", /14/.test(r7.turns) && /2/.test(r7.convs), JSON.stringify(r7));
  await step(`(() => { const el = document.querySelectorAll(".app-range input")[0]; Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(el, "2"); el.dispatchEvent(new Event("input", { bubbles: true })); el.dispatchEvent(new Event("change", { bubbles: true })); return $wait(300); })()`);
  const rd = JSON.parse(await read());
  check("slider from #3: 38 turns, 6 conversations, no preset pressed", /38/.test(rd.turns) && /6/.test(rd.convs) && await step(`!document.querySelector(".app-seg [aria-pressed=true]")`), JSON.stringify(rd));
  await step(`[...document.querySelectorAll(".app-seg button")][2].click(); $wait(300)`);
  writeFileSync(join(tmpdir(), `im-u7-${lang}-${width}.png`), await b.screenshot());
  await step(`document.querySelector(".app-card").click(); $wait(300)`);
  check("card opens detail with cloud + rows", await step(`!!document.querySelector(".app-modal .app-cloud--large") && document.querySelectorAll(".app-modal .app-staterow").length === 3`));
  await step(`document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })); $wait(300)`);
  check("Esc closes, focus back on the card", await step(`!document.querySelector(".app-modal") && document.activeElement?.classList.contains("app-card")`));
  check("nothing wider than the screen (body hides overflow, so edges are measured)", await step(`[".app-page", ".app-pm", ".app-rail", ".app-mirror-nav"].every((q) => document.querySelector(q).getBoundingClientRect().right <= innerWidth + 0.5)`));
} catch (e) {
  results.push(`ERROR ${e.message}`);
} finally {
  console.log(`width ${width} ${lang}\n` + results.join("\n") + `\nAPI requests: ${JSON.stringify(b.api)}`);
  b.close();
}

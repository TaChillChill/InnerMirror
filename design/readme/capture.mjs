// README screenshots: the real app (local production build) driven through the flow, with
// /api/analyze and /api/scenario answered by REAL Muse Spark responses recorded on Production
// on 2026-11-02 (fixtures/, synthetic conversation). Nothing is paid for and no text is edited.
// My Reflection uses the film's synthetic saved history (labels only).
//   npm run build && META_API_KEY= npx next start -p 3123 &
//   node design/readme/capture.mjs            → design/readme/raw/*.png
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { launch, HELPERS } from "../../scripts/e2e/cdp.mjs";
import { seedCollections } from "../film/record/seed.mjs";

const here = new URL(".", import.meta.url).pathname;
const APP = process.env.APP_URL ?? "http://localhost:3123";
const fixture = (n) => JSON.parse(readFileSync(`${here}fixtures/${n}.json`, "utf8"));
const mocks = { "/api/analyze": fixture("analyze"), "/api/scenario": fixture("scenario") };
const request = fixture("analyze.request");
const names = { p1: "Jordan", p2: "Alex" };
const chat = request.messages.map((m) => `${names[m.speakerId]}: ${m.text}`).join("\n");
const shots = [1, 2, 3].map((p) => readFileSync(`${here}../film/shots/out/chat-${p}.png`).toString("base64"));
const out = `${here}raw`;
mkdirSync(out, { recursive: true });

async function session({ width, height, scale, theme }) {
  const b = await launch({ width, height, mocks });
  await b.send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: scale, mobile: width < 600 });
  await b.goto(`${APP}/`);
  await b.evaluate(`localStorage.clear(); localStorage.setItem("innermirror.lang", "en"); localStorage.setItem("innermirror.theme", ${JSON.stringify(theme)});
    localStorage.setItem("innermirror.collections.v1", ${JSON.stringify(JSON.stringify(seedCollections()))}); location.reload()`);
  await b.sleep(1800);
  const step = async (js) => { await b.evaluate(HELPERS); return b.evaluate(js); };
  const snap = async (name) => { await b.sleep(700); writeFileSync(`${out}/${name}.png`, await b.screenshot()); console.log(name); };
  // Puts an element `offset` px below the sticky header, without smooth scrolling.
  const scrollTo = (js, offset = 90) => step(`(() => { const e = ${js}; window.scrollTo(0, e.getBoundingClientRect().top + scrollY - ${offset}); return true; })()`);
  const msg = (text) => `[...document.querySelectorAll(".im-msg")].find((m) => (m.querySelector(".im-bubble")?.textContent ?? "").replace(/^[^:]*: /, "").trim() === ${JSON.stringify(text)})`;
  return { b, step, snap, scrollTo, msg };
}

async function flow(s, prefix, { panelShots }) {
  const { step, snap, scrollTo, msg, b } = s;
  await snap(`${prefix}-landing`);
  await step(`$click(".lp-cta"); $wait(400)`);
  // Screenshot input: the three synthetic chat screenshots, before anything is sent.
  await step(`$click("[role=radio]", "I have the chat"); $wait(400)`);
  await step(`(async () => { const dt = new DataTransfer(); for (const b64 of ${JSON.stringify(shots)}) { const blob = await (await fetch("data:image/png;base64," + b64)).blob(); dt.items.add(new File([blob], "chat.png", { type: "image/png" })); } const i = document.querySelector(".app-drop input"); i.files = dt.files; i.dispatchEvent(new Event("change", { bubbles: true })); await $wait(900); return true; })()`);
  await step(`window.scrollTo(0, 0)`);
  await snap(`${prefix}-shots`);
  // Paste path from here on (extraction would need a paid call).
  await step(`$click("[role=radio]", "Tell it"); $wait(400)`);
  await step(`$type("#paste", ${JSON.stringify(chat)}); $wait(200)`);
  await step(`$click("button", "Continue"); $wait(700)`);
  await step(`window.scrollTo(0, 0)`);
  await snap(`${prefix}-review`);
  await step(`document.querySelector(".im-check input").click(); $wait(150)`);
  await step(`$click("button", "Look at this conversation"); $wait(2500)`);
  await step(`window.scrollTo(0, 0)`);
  await snap(`${prefix}-observe-top`);
  await scrollTo(`$t("p", "Tap the icon under each message")`, 70);
  await snap(`${prefix}-observe`);
  await step(`$click(".app-whopick .app-chip-btn", "Alex"); $wait(300)`);
  await scrollTo(msg("k?? i said sorry"), 260);
  await step(`${msg("k?? i said sorry")}.querySelector(".app-meta-btn").click(); $wait(900)`);
  await snap(`${prefix}-panel`);
  if (panelShots) {
    await step(`(() => { const a = document.querySelector("aside .app-sel, [role=dialog] .app-sel"); a?.scrollIntoView({ block: "center" }); return !!a; })()`);
    await snap(`${prefix}-choose`);
  }
  await step(`$click("aside button, [role=dialog] button", "What if?"); $wait(500)`);
  await step(`$click(".app-wi__opt", "Adult"); $wait(300)`);
  await step(`document.querySelector(".app-wi__go button").click(); $wait(2500)`);
  await step(`document.querySelector(".app-wi__results")?.scrollIntoView({ block: "center" })`);
  await snap(`${prefix}-whatif`);
  // My Reflection: the synthetic saved history plus this conversation.
  await step(`(document.querySelector("aside .app-icon-btn, [role=dialog] .app-icon-btn"))?.click(); $wait(400)`);
  await scrollTo(`document.querySelector(".app-continue")`, 300);
  await step(`document.querySelector(".app-continue .im-btn--primary").click(); $wait(900)`);
  await step(`window.scrollTo(0, 0)`);
  await snap(`${prefix}-reflect`);
  await step(`$click("button", "Save to this device"); $wait(900)`);
  await scrollTo(`document.querySelector(".app-pm")`, 16);
  await step(`$click(".app-pm .app-seg button", "30 days"); $wait(900)`);
  await snap(`${prefix}-donut`);
  b.close();
}

const only = process.argv[2];
const runs = [
  ["phone-dark", { width: 390, height: 844, scale: 3, theme: "dark" }, { panelShots: true }],
  ["phone-light", { width: 390, height: 844, scale: 3, theme: "light" }, { panelShots: true }],
];
for (const [prefix, view, opts] of runs) {
  if (only && only !== prefix) continue;
  const s = await session(view);
  try { await flow(s, prefix, opts); } catch (e) { console.log(`!! ${prefix}: ${e.message}`); writeFileSync(`${out}/${prefix}-fatal.png`, await s.b.screenshot()); s.b.close(); }
  console.log(`${prefix} API: ${JSON.stringify(s.b.api)}`);
}

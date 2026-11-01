// M6: sample mode runs the whole journey with zero API requests, never saves, hides What if?.
import { tmpdir } from "node:os";
import { join } from "node:path";
import { launch, HELPERS } from "./cdp.mjs";

const width = Number(process.argv[2] ?? 390), lang = process.argv[3] ?? "en";
const b = await launch({ width });
const results = [];
const check = (name, ok, extra = "") => results.push(`${ok ? "PASS" : "FAIL"} ${name}${extra ? ` (${extra})` : ""}`);
try {
  await b.goto("http://localhost:3123/");
  const step = async (js) => { await b.evaluate(HELPERS); return b.evaluate(js); };
  if (lang === "vi") await step(`$click(".app-lang button", "VI"); $wait(300)`);
  await step(`document.querySelector(".lp-sample").click(); $wait(500)`);
  const bubbles = await step(`document.querySelectorAll(".im-thread .im-bubble").length`);
  check("sample opens on Replay with all messages", bubbles === (lang === "vi" ? 7 : 6), String(bubbles));
  check("sample notice shown", await step(`!!document.querySelector(".app-replay__main .im-notice")`));
  check("no What if? pill", await step(`document.querySelectorAll(".app-wi-pill").length === 0`));
  await step(`document.querySelectorAll(".app-meta-btn")[1].click(); $wait(300)`);
  check("panel opens, no What if? tab", await step(`!!document.querySelector(".app-sel") && !document.querySelector("#tab-whatif")`));
  await step(`document.querySelectorAll(".app-sel__opt")[2].click(); $wait(200)`);
  await step(`document.querySelector(".app-sheet .app-icon-btn, .app-sheet-bar .app-icon-btn")?.click(); $wait(200)`);
  await step(`document.querySelector(".app-continue .im-btn--primary").click(); $wait(400)`);
  check("Mirror: stickers, no Save", await step(`document.querySelectorAll(".app-sticker").length > 0 && ![...document.querySelectorAll("button")].some((x) => x.textContent.trim() === ${JSON.stringify(lang === "vi" ? "Lưu" : "Save")})`));
  // Edit transcript, unchanged → analyze reuses the saved result (no call).
  await step(`document.querySelector(".app-mirror-nav .im-btn--ghost")?.click(); $wait(300)`);
  await step(`document.querySelector(".app-replay__edit").click(); $wait(300)`);
  await step(`document.querySelector(".app-actions .im-btn--primary").click(); $wait(500)`);
  check("unchanged sample re-analysis → Replay without a call", await step(`document.querySelectorAll(".im-thread .im-bubble").length > 0`) && b.api.length === 0);
  check("nothing in localStorage collections", await step(`!localStorage.getItem("innermirror.collections.v1")`));
  check("no horizontal scroll", await step(`document.documentElement.scrollWidth <= innerWidth`));
  const shot = await b.screenshot();
  (await import("node:fs")).writeFileSync(join(tmpdir(), `im-sample-${lang}-${width}.png`), shot);
} catch (e) {
  results.push(`ERROR ${e.message}`);
} finally {
  console.log(`width ${width} ${lang}\n` + results.join("\n") + `\nAPI requests: ${JSON.stringify(b.api)}`);
  b.close();
}

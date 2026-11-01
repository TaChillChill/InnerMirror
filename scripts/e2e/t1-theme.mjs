// Light / Dark / System: the header button cycles System → Light → Dark, the choice survives a
// reload (applied before paint), System follows the OS setting, and nothing overflows.
import { launch, HELPERS } from "./cdp.mjs";

const width = Number(process.argv[2] ?? 390);
const b = await launch({ width, height: 900 });
const results = [];
const check = (name, ok, extra = "") => results.push(`${ok ? "PASS" : "FAIL"} ${name}${extra ? ` (${extra})` : ""}`);
const bg = `getComputedStyle(document.body).backgroundColor`;
try {
  await b.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "dark" }] });
  await b.goto("http://localhost:3123/");
  await b.evaluate(`localStorage.clear(); localStorage.setItem("innermirror.lang", "en"); location.reload()`);
  await b.sleep(1500);
  const step = async (js) => { await b.evaluate(HELPERS); return b.evaluate(js); };
  check("System + OS dark → dark page, no attribute", await step(`!document.documentElement.dataset.theme && ${bg} === "rgb(23, 21, 43)"`), await step(bg));
  check("button names the current mode and the next", await step(`document.querySelector(".app-theme").getAttribute("aria-label") === "Appearance: System. Switch to Light"`));
  await step(`document.querySelector(".app-theme").click(); $wait(150)`);
  check("Light overrides the OS", await step(`document.documentElement.dataset.theme === "light" && ${bg} === "rgb(250, 250, 254)"`), await step(bg));
  await step(`document.querySelector(".app-theme").click(); $wait(150)`);
  check("Dark", await step(`document.documentElement.dataset.theme === "dark" && localStorage.getItem("innermirror.theme") === "dark"`));
  await b.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "light" }] });
  await b.evaluate(`location.reload()`); await b.sleep(1500);
  check("Dark survives a reload on a light OS", await step(`document.documentElement.dataset.theme === "dark" && ${bg} === "rgb(23, 21, 43)"`));
  await step(`document.querySelector(".app-theme").click(); $wait(150)`);
  check("back to System: follows the light OS, choice cleared", await step(`!document.documentElement.dataset.theme && !localStorage.getItem("innermirror.theme") && ${bg} === "rgb(250, 250, 254)"`));
  check("header on one row, no overflow", await step(`(() => { const e = document.querySelector(".app-bar__end").getBoundingClientRect(), r = document.querySelector(".app-brand").getBoundingClientRect(); return Math.abs(e.top - r.top) < 20 && document.documentElement.scrollWidth <= innerWidth; })()`));
} catch (e) {
  results.push(`ERROR ${e.message}`);
} finally {
  console.log(`width ${width}\n` + results.join("\n") + `\nAPI requests: ${JSON.stringify(b.api)}`);
  b.close();
}

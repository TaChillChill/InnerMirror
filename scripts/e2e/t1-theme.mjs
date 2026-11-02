// Light / Dark / System. Dark is the default with nothing stored, on a light OS too, and is
// applied before the page paints. The header button cycles Dark → System → Light → Dark; every
// choice is stored (System too) and survives a reload; an earlier stored choice is respected.
import { launch, HELPERS } from "./cdp.mjs";

const width = Number(process.argv[2] ?? 390);
const b = await launch({ width, height: 900 });
const results = [];
const check = (name, ok, extra = "") => results.push(`${ok ? "PASS" : "FAIL"} ${name}${extra ? ` (${extra})` : ""}`);
const bg = `getComputedStyle(document.body).backgroundColor`;
const DARK = "rgb(23, 21, 43)", LIGHT = "rgb(250, 250, 254)";
try {
  // Records the theme at the moment <body> exists, i.e. before anything in it can paint.
  await b.addInit(`new MutationObserver((_, o) => { if (document.body) { window.__themeAtBody = document.documentElement.dataset.theme ?? "none"; o.disconnect(); } }).observe(document, { childList: true, subtree: true });`);
  await b.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "light" }] });
  await b.goto("http://localhost:3123/");
  const reload = async (storage) => { await b.evaluate(`localStorage.clear(); ${storage}; location.reload()`); await b.sleep(1500); };
  const step = async (js) => { await b.evaluate(HELPERS); return b.evaluate(js); };
  await reload(`localStorage.setItem("innermirror.lang", "en")`);
  check("new visitor on a light OS → dark, set before the body paints", await step(`window.__themeAtBody === "dark" && document.documentElement.dataset.theme === "dark" && ${bg} === "${DARK}"`), await step(`window.__themeAtBody + " " + ${bg}`));
  check("nothing is written for a new visitor", await step(`localStorage.getItem("innermirror.theme") === null`));
  check("button names the current mode and the next", await step(`document.querySelector(".app-theme").getAttribute("aria-label") === "Appearance: Dark. Switch to System"`), await step(`document.querySelector(".app-theme").getAttribute("aria-label")`));
  await step(`document.querySelector(".app-theme").click(); $wait(150)`);
  check("System: follows the light OS and is stored", await step(`!document.documentElement.dataset.theme && localStorage.getItem("innermirror.theme") === "system" && ${bg} === "${LIGHT}"`), await step(bg));
  await b.evaluate(`location.reload()`); await b.sleep(1500);
  check("System survives a reload (not reset to the dark default)", await step(`window.__themeAtBody === "none" && ${bg} === "${LIGHT}"`), await step(`window.__themeAtBody`));
  await b.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "dark" }] });
  check("System follows the OS when it turns dark", await step(`${bg} === "${DARK}"`));
  await step(`document.querySelector(".app-theme").click(); $wait(150)`);
  check("Light overrides a dark OS", await step(`document.documentElement.dataset.theme === "light" && localStorage.getItem("innermirror.theme") === "light" && ${bg} === "${LIGHT}"`), await step(bg));
  await b.evaluate(`location.reload()`); await b.sleep(1500);
  check("Light survives a reload, applied before the body paints", await step(`window.__themeAtBody === "light" && ${bg} === "${LIGHT}"`));
  await step(`document.querySelector(".app-theme").click(); $wait(150)`);
  check("then Dark, stored", await step(`document.documentElement.dataset.theme === "dark" && localStorage.getItem("innermirror.theme") === "dark"`));
  // Choices stored before this change are kept as they were.
  await b.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "light" }] });
  await reload(`localStorage.setItem("innermirror.lang", "en"); localStorage.setItem("innermirror.theme", "light")`);
  check("an earlier stored Light is respected", await step(`window.__themeAtBody === "light" && ${bg} === "${LIGHT}" && localStorage.getItem("innermirror.theme") === "light"`));
  await reload(`localStorage.setItem("innermirror.lang", "en"); localStorage.setItem("innermirror.theme", "nonsense")`);
  check("an unknown stored value falls back to Dark", await step(`document.documentElement.dataset.theme === "dark"`));
  check("header on one row, no overflow", await step(`(() => { const e = document.querySelector(".app-bar__end").getBoundingClientRect(), r = document.querySelector(".app-brand").getBoundingClientRect(); return Math.abs(e.top - r.top) < 20 && document.documentElement.scrollWidth <= innerWidth; })()`));
  await b.goto("http://localhost:3123/privacy");
  await b.evaluate(`localStorage.removeItem("innermirror.theme"); location.reload()`); await b.sleep(1200);
  check("privacy page is dark by default too", await step(`window.__themeAtBody === "dark" && ${bg} === "${DARK}"`));
} catch (e) {
  results.push(`ERROR ${e.message}`);
} finally {
  console.log(`width ${width}\n` + results.join("\n") + `\nAPI requests: ${JSON.stringify(b.api)}`);
  b.close();
}

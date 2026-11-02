// Lays out the README images in headless Chrome: a brand hero, a row of real phone screens,
// and a framed desktop frame from the live demo take. Only arranges real assets; nothing in a
// screen is drawn or edited. Light and dark versions, so GitHub can follow the reader's theme.
//   node design/readme/capture.mjs && node design/readme/compose.mjs   → design/readme/img/
// img/live-observe.gif: live take frames t = 61.0–80.5 s at 1.5×, 880 px, 12 fps, 128-colour
// palette, encoded with the ffmpeg bundled in design/film (@remotion/compositor-*; it has no
// fps filter, so the rate is set with -r on the output).
import { mkdirSync, writeFileSync } from "node:fs";
import { launch } from "../../scripts/e2e/cdp.mjs";

const root = new URL("../../", import.meta.url).pathname;
const here = `${root}design/readme/`;
const take = `${root}design/film/public/take/live1/frames/`; // git-ignored; rebuild with design/film/record/take.mjs
mkdirSync(`${here}img`, { recursive: true });

const THEMES = {
  light: { bg: "radial-gradient(1200px 700px at 78% 40%, #e4ddff 0%, #f3f0ff 45%, #fafafe 100%)", ink: "#252344", muted: "#5e5a7e", brand: "#635bce", pill: "#ffffff", pillLine: "#e5dfff", bezel: "#d9d4f2", label: "#252344" },
  dark: { bg: "radial-gradient(1200px 700px at 78% 40%, #2e2a55 0%, #1d1a36 50%, #17152b 100%)", ink: "#eeebff", muted: "#aba6d2", brand: "#a9a3ff", pill: "#211e3b", pillLine: "#3a3566", bezel: "#3a3566", label: "#eeebff" },
};
const MASCOTS = [["cp", "Critical Parent"], ["np", "Nurturing Parent"], ["a", "Adult"], ["fc", "Free Child"], ["ac", "Adapted Child"]];
const file = (p) => `file://${p}`;
const page = (t, w, body) => `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@500;700;800;900&display=block" rel="stylesheet">
<style>*{box-sizing:border-box;margin:0}html,body{width:${w}px}body{font-family:Nunito,system-ui,sans-serif;background:${t.bg};color:${t.ink};-webkit-font-smoothing:antialiased}</style></head><body>${body}</body></html>`;

function hero(t) {
  return page(t, 1600, `<div style="height:520px;display:flex;align-items:center;padding:0 90px;gap:40px">
    <div style="flex:0 0 640px">
      <div style="display:flex;align-items:center;gap:22px">
        <img src="${file(`${root}public/brand/app-mark.png`)}" style="width:92px;height:92px;border-radius:24px">
        <div style="font-size:74px;font-weight:900;letter-spacing:-1.5px">Inner<span style="color:${t.brand}">Mirror</span></div>
      </div>
      <div style="font-size:33px;font-weight:700;line-height:1.3;margin-top:30px">See yourself more clearly<br>through your everyday conversations.</div>
      <div style="display:flex;gap:12px;margin-top:38px;flex-wrap:wrap">
        ${["AI observes.", "Humans interpret.", "Awareness creates choice."].map((s, i) => `<span style="font-size:22px;font-weight:800;padding:10px 20px;border-radius:999px;background:${i === 2 ? t.brand : t.pill};color:${i === 2 ? (t === THEMES.dark ? "#17152b" : "#fff") : t.ink};border:1.5px solid ${i === 2 ? t.brand : t.pillLine}">${s}</span>`).join("")}
      </div>
    </div>
    <div style="flex:1;display:flex;justify-content:center;align-items:flex-end;gap:6px">
      ${MASCOTS.map(([k, n]) => `<figure style="width:160px;text-align:center">
        <img src="${file(`${root}design/brand/mascots/full/${k}-512.png`)}" style="width:160px;height:160px;object-fit:contain;object-position:bottom;filter:drop-shadow(0 10px 18px rgba(30,20,80,.18))">
        <figcaption style="font-size:17px;font-weight:800;color:${t.muted};margin-top:10px;white-space:nowrap">${n}</figcaption></figure>`).join("")}
    </div></div>`);
}

const STEPS = [["shots", "Bring a conversation", "Paste, retell, or add up to 5 screenshots"], ["review", "Check every line", "Fix text and speakers before anything is read"],
  ["observe", "What Mirror sees", "A suggested ego state per message, with shifts"], ["panel", "Why, and your choice", "Quoted cues, confidence, “Not sure” always there"],
  ["donut", "My Reflection", "Your patterns over time, kept on your device"]];
function phones(t, theme) {
  return page(t, 2400, `<div style="display:flex;gap:44px;padding:70px 60px 64px;justify-content:center">
    ${STEPS.map(([shot, title, sub], i) => `<div style="width:420px">
      <div style="border-radius:58px;padding:11px;background:${t.bezel};box-shadow:0 24px 60px rgba(25,18,70,.22)">
        <img src="${file(`${here}raw/phone-${theme}-${shot}.png`)}" style="display:block;width:398px;border-radius:48px"></div>
      <div style="display:flex;gap:14px;align-items:flex-start;margin-top:30px">
        <span style="flex:0 0 46px;height:46px;border-radius:50%;background:${t.brand};color:${theme === "dark" ? "#17152b" : "#fff"};font-weight:900;font-size:24px;display:grid;place-items:center">${i + 1}</span>
        <div><div style="font-size:29px;font-weight:900;color:${t.label}">${title}</div><div style="font-size:21px;font-weight:600;color:${t.muted};margin-top:4px;line-height:1.3">${sub}</div></div>
      </div></div>`).join("")}</div>`);
}

function windowed(t, frame) {
  return page(t, 1440, `<div style="padding:56px 80px 72px">
    <div style="border-radius:18px;overflow:hidden;box-shadow:0 30px 80px rgba(25,18,70,.28);border:1px solid ${t.pillLine}">
      <div style="height:40px;background:${t.pill};display:flex;align-items:center;gap:9px;padding-left:18px">
        ${["#ff6159", "#ffbd2e", "#28c941"].map((c) => `<span style="width:13px;height:13px;border-radius:50%;background:${c}"></span>`).join("")}</div>
      <img src="${file(`${take}${frame}.jpg`)}" style="display:block;width:1280px"></div></div>`);
}

const b = await launch({ width: 1600, height: 600 });
async function render(name, html, width, scale, format = "jpeg") {
  const path = `${here}img/.tmp.html`;
  writeFileSync(path, html);
  await b.send("Emulation.setDeviceMetricsOverride", { width, height: 400, deviceScaleFactor: scale, mobile: false });
  await b.goto(file(path));
  await b.evaluate(`document.fonts.ready.then(() => Promise.all([...document.images].map((i) => i.decode().catch(() => {}))))`);
  const height = await b.evaluate(`Math.ceil(document.body.scrollHeight)`);
  await b.send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: scale, mobile: false });
  await b.sleep(300);
  const shot = await b.send("Page.captureScreenshot", { format, quality: format === "jpeg" ? 90 : undefined });
  writeFileSync(`${here}img/${name}.${format === "jpeg" ? "jpg" : "png"}`, Buffer.from(shot.data, "base64"));
  console.log(name, `${width * scale}×${height * scale}`);
}
try {
  for (const theme of ["light", "dark"]) {
    const t = THEMES[theme];
    await render(`hero-${theme}`, hero(t), 1600, 1.5);
    await render(`phones-${theme}`, phones(t, theme), 2400, 1);
    // Frame 2263 of the live take (What if? result, t = 115.5 s): real app, real Muse.
    await render(`whatif-${theme}`, windowed(t, "02263"), 1440, 1);
  }
} finally {
  b.close();
}

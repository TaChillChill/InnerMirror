// Lays out the README images in headless Chrome: a brand hero, a row of real phone screens,
// and a framed desktop frame from the live demo take. Only arranges real assets; nothing in a
// screen is drawn or edited. App screens are always Dark Mode (the product default); only the
// page around them follows the reader's GitHub theme.
//   node design/readme/capture.mjs && node design/readme/compose.mjs   → design/readme/img/
// img/live-observe.gif: dark1 frames from the first visible result to 5.2 s after the "k??" panel
// opens, at 1.5×, cropped to x 150–1770 of 1920 and scaled to 960 px, 12 fps, 128-colour
// palette, encoded with the ffmpeg bundled in design/film (@remotion/compositor-*; it has no
// fps filter, so the rate is set with -r on the output).
import { mkdirSync, writeFileSync } from "node:fs";
import { launch } from "../../scripts/e2e/cdp.mjs";

const root = new URL("../../", import.meta.url).pathname;
const here = `${root}design/readme/`;
const takes = `${root}design/film/public/take/`; // git-ignored; rebuild with design/film/record/take.mjs
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
        <img src="${file(`${here}raw/phone-dark-${shot}.png`)}" style="display:block;width:398px;border-radius:48px"></div>
      <div style="display:flex;gap:14px;align-items:flex-start;margin-top:30px">
        <span style="flex:0 0 46px;height:46px;border-radius:50%;background:${t.brand};color:${theme === "dark" ? "#17152b" : "#fff"};font-weight:900;font-size:24px;display:grid;place-items:center">${i + 1}</span>
        <div><div style="font-size:29px;font-weight:900;color:${t.label}">${title}</div><div style="font-size:21px;font-weight:600;color:${t.muted};margin-top:4px;line-height:1.3">${sub}</div></div>
      </div></div>`).join("")}</div>`);
}

// The three Muse Spark calls between the human steps. Row 2 runs right to left (a snake).
const FLOW = [
  ["you", "Bring a conversation", "Paste it, retell it, or add up to 5 screenshots"],
  ["muse", "Read", "Vision: text, speakers and sides from the screenshots. Transcribes only", "/api/extract"],
  ["you", "Check every line", "Fix words and speakers, pick who you are. Nothing is analyzed before this"],
  ["muse", "Observe", "Per message: a suggested ego state, quoted cues, confidence, an alternative; plus shifts", "/api/analyze"],
  ["you", "Interpret", "Agree, choose another state, or “Not sure”. Mirror never overwrites you"],
  ["muse", "What if? · optional", "Up to 2 states the other person might answer from, with their earlier words. No replies written", "/api/scenario"],
  ["you", "My Reflection", "Labels and your notes, saved only in your browser"],
];
function workflow(t, theme) {
  const dark = theme === "dark";
  const card = ([who, title, sub, api], n) => {
    const muse = who === "muse";
    const bg = muse ? "#6a62d8" : (dark ? "#211e3b" : "#ffffff");
    const fg = muse ? "#ffffff" : t.ink;
    const line = muse ? "#4f47b8" : t.pillLine;
    return `<div style="background:${bg};color:${fg};border:2px ${n === 5 ? "dashed" : "solid"} ${n === 5 ? (dark ? "#a9a3ff" : "#ffffff") : line};border-radius:26px;padding:24px 26px;height:268px;box-shadow:0 14px 34px rgba(25,18,70,${muse ? .28 : .1})">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:15px;font-weight:900;letter-spacing:1.4px;padding:5px 12px;border-radius:999px;background:${muse ? "rgba(255,255,255,.18)" : (dark ? "#2e2a55" : "#ede8ff")};color:${muse ? "#fff" : t.brand}">${muse ? "✦ MUSE SPARK" : "YOU"}</span>
        <span style="font-size:22px;font-weight:900;opacity:.55">${n + 1}</span></div>
      <div style="font-size:31px;font-weight:900;margin-top:16px">${title}</div>
      <div style="font-size:21px;font-weight:600;line-height:1.32;margin-top:8px;opacity:${muse ? .92 : .8}">${sub}</div>
      ${api ? `<div style="font:600 17px ui-monospace,Menlo,monospace;margin-top:10px;opacity:.75">${api}</div>` : ""}</div>`;
  };
  const arrow = (dir) => `<div style="height:100%;display:grid;place-items:center;color:${t.brand};font-size:40px;font-weight:900">${dir}</div>`;
  const cell = (col, row, html) => `<div style="grid-column:${col};grid-row:${row}">${html}</div>`;
  return page(t, 1760, `<div style="padding:56px 64px 60px">
    <div style="display:flex;gap:28px;align-items:center;font-size:21px;font-weight:800;color:${t.muted};margin-bottom:30px">
      <span><span style="display:inline-block;width:18px;height:18px;border-radius:6px;background:#6a62d8;vertical-align:-2px"></span>&nbsp; Muse Spark via the Meta Model API</span>
      <span><span style="display:inline-block;width:18px;height:18px;border-radius:6px;background:${dark ? "#211e3b" : "#fff"};border:2px solid ${t.pillLine};vertical-align:-3px"></span>&nbsp; You decide</span></div>
    <div style="display:grid;grid-template-columns:376px 56px 376px 56px 376px 56px 376px;grid-template-rows:268px 64px 268px">
      ${cell(1, 1, card(FLOW[0], 0))}${cell(2, 1, arrow("→"))}${cell(3, 1, card(FLOW[1], 1))}${cell(4, 1, arrow("→"))}${cell(5, 1, card(FLOW[2], 2))}${cell(6, 1, arrow("→"))}${cell(7, 1, card(FLOW[3], 3))}
      ${cell(7, 2, arrow("↓"))}
      ${cell(1, 3, `<div style="height:268px;border-radius:26px;padding:28px;display:flex;flex-direction:column;justify-content:center;gap:12px;border:2px solid ${t.pillLine};color:${t.ink}">
        <div style="font-size:27px;font-weight:900">🔒 Nothing stored on our server</div>
        <div style="font-size:20px;font-weight:600;line-height:1.35;color:${t.muted}">For the analysis, names are swapped for neutral labels. Every response is schema-checked before you see it.</div></div>`)}
      ${cell(3, 3, card(FLOW[6], 6))}${cell(4, 3, arrow("←"))}${cell(5, 3, card(FLOW[5], 5))}${cell(6, 3, arrow("←"))}${cell(7, 3, card(FLOW[4], 4))}
    </div></div>`);
}

function windowed(t, frame) {
  return page(t, 1440, `<div style="padding:56px 80px 72px">
    <div style="border-radius:18px;overflow:hidden;box-shadow:0 30px 80px rgba(25,18,70,.28);border:1px solid ${t.pillLine}">
      <div style="height:40px;background:${t.pill};display:flex;align-items:center;gap:9px;padding-left:18px">
        ${["#ff6159", "#ffbd2e", "#28c941"].map((c) => `<span style="width:13px;height:13px;border-radius:50%;background:${c}"></span>`).join("")}</div>
      <img src="${file(`${takes}${frame}.jpg`)}" style="display:block;width:1280px"></div></div>`);
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
    // Take dark1wi (the film's D6: dark1's analysis, What if? live), frame 01348: the result.
    await render(`workflow-${theme}`, workflow(t, theme), 1760, 1.5);
    await render(`whatif-${theme}`, windowed(t, "dark1wi/frames/01348"), 1440, 1.5);
  }
} finally {
  b.close();
}

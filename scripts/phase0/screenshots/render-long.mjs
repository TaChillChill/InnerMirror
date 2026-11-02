// Renders a long synthetic conversation as N (default 10) phone screenshots taken while scrolling: each
// one overlaps the one before and bubbles are cut at the edges, as real ones are. Generic
// look (no real app branding). Output is git-ignored; the JSON is the ground truth.
//   node scripts/phase0/screenshots/render-long.mjs 10-long-vi [count]
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const id = process.argv[2] ?? "10-long-vi";
const count = Number(process.argv[3] ?? 10);
const conv = JSON.parse(readFileSync(join(HERE, "..", "conversations", `${id}.json`), "utf8"));
const OUT = join(HERE, "long");
mkdirSync(OUT, { recursive: true });

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const other = conv.participants.find((p) => p.id !== conv.selfId);
const bubbles = conv.messages.map((m) => `<div class="b ${m.speakerId === conv.selfId ? "me" : ""}">${esc(m.text)}</div>`).join("");
const VIEW = { w: 390, h: 760 }, CHROME_H = 96; // status bar + header

const page = (offset) => `<!doctype html><meta charset="utf-8"><style>
  body{margin:0;width:${VIEW.w}px;height:${VIEW.h}px;overflow:hidden;font:16px/1.35 -apple-system,Helvetica,Arial,sans-serif;background:#f2f2f5}
  .bar{position:fixed;top:0;left:0;right:0;z-index:2;background:#fff;border-bottom:1px solid #ddd}
  .status{height:44px;display:flex;justify-content:space-between;align-items:center;padding:0 22px;font-weight:600;font-size:15px}
  .top{height:51px;display:grid;place-items:center;font-weight:600}
  .list{display:flex;flex-direction:column;gap:8px;padding:14px;transform:translateY(${CHROME_H - offset}px)}
  .b{max-width:75%;padding:9px 13px;border-radius:18px;background:#fff;align-self:flex-start}
  .b.me{align-self:flex-end;background:#3b82f6;color:#fff}
  .t{text-align:center;color:#888;font-size:12px}
</style><div class="bar"><div class="status"><span>21:47</span><span>▮▮▮ 82%</span></div><div class="top">${esc(other.displayName)}</div></div>
<div class="list"><div class="t">21:14</div>${bubbles}</div>`;

// Measure the list once, then spread the windows evenly from top to bottom.
const probe = join(OUT, `${id}-probe.html`);
writeFileSync(probe, page(0).replace("height:760px;overflow:hidden", "") + `<script>document.title = document.querySelector(".list").offsetHeight</script>`);
const dom = execFileSync(CHROME, ["--headless=new", "--dump-dom", `file://${probe}`], { encoding: "utf8" });
const listH = Number(dom.match(/<title>(\d+)<\/title>/)?.[1] ?? 3000);
const visible = VIEW.h - CHROME_H;
const step = (listH - visible) / (count - 1);
for (let i = 0; i < count; i++) {
  const html = join(OUT, `${id}-${String(i + 1).padStart(2, "0")}.html`);
  writeFileSync(html, page(Math.round(i * step)));
  execFileSync(CHROME, ["--headless=new", "--hide-scrollbars", "--force-device-scale-factor=2", `--window-size=${VIEW.w},${VIEW.h}`,
    `--screenshot=${html.replace(/\.html$/, ".png")}`, `file://${html}`], { stdio: "ignore" });
}
console.log(`${id}: list ${listH}px, ${count} screenshots, step ${Math.round(step)}px of ${visible}px visible (overlap ${Math.round(100 * (1 - step / visible))}%) → ${OUT}`);

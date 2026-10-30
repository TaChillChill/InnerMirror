// Renders a synthetic conversation as a generic chat screenshot (no real app branding,
// names or avatars) so vision tests have an exact ground truth: the source JSON.
//   node scripts/phase0/screenshots/render.mjs 02-family-vi
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const id = process.argv[2] ?? "02-family-vi";
const conv = JSON.parse(readFileSync(join(HERE, "..", "conversations", `${id}.json`), "utf8"));

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const other = conv.participants.find((p) => p.id !== conv.selfId);
const bubbles = conv.messages.map((m) =>
  `<div class="b ${m.speakerId === conv.selfId ? "me" : ""}">${esc(m.text)}</div>`).join("");

const html = `<!doctype html><meta charset="utf-8"><style>
  body{margin:0;width:390px;font:16px/1.35 -apple-system,Helvetica,Arial,sans-serif;background:#f2f2f5}
  .top{padding:14px;text-align:center;font-weight:600;background:#fff;border-bottom:1px solid #ddd}
  .list{display:flex;flex-direction:column;gap:8px;padding:14px}
  .b{max-width:75%;padding:9px 13px;border-radius:18px;background:#fff;align-self:flex-start}
  .b.me{align-self:flex-end;background:#3b82f6;color:#fff}
  .t{text-align:center;color:#888;font-size:12px}
</style><div class="top">${esc(other.displayName)}</div><div class="list"><div class="t">21:14</div>${bubbles}</div>`;

const htmlPath = join(HERE, `${id}.html`);
const pngPath = join(HERE, `${id}.png`);
writeFileSync(htmlPath, html);
execFileSync(CHROME, ["--headless=new", "--hide-scrollbars", "--force-device-scale-factor=2",
  "--window-size=390,640", `--screenshot=${pngPath}`, `file://${htmlPath}`], { stdio: "ignore" });
console.log(`wrote ${pngPath}`);

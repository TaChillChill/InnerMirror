// Turns a take's screencast frames (variable timing: Chrome only sends a frame when the page
// changes) into a constant 30 fps MP4 the film can cut from: public/take/<name>/take.mp4.
// Video time 0 = the first frame; marks/taps are shifted onto that clock in take.json.
// Usage: node record/encode.mjs <name>
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const name = process.argv[2] ?? "live1";
const film = fileURLToPath(new URL("..", import.meta.url));
const dir = `${film}public/take/${name}/`;
const take = JSON.parse(readFileSync(`${dir}take.json`, "utf8"));
const f = take.frames;
const HOLD_MS = 6000;
const list = f.map((x, k) => {
  const next = f[k + 1]?.t ?? x.t + HOLD_MS; // the page is still at the end: hold the last frame
  return `file 'frames/${String(x.i).padStart(5, "0")}.jpg'\nduration ${((next - x.t) / 1000).toFixed(4)}`;
});
// The concat demuxer ignores the last duration unless the file is listed once more.
list.push(`file 'frames/${String(f.at(-1).i).padStart(5, "0")}.jpg'`);
writeFileSync(`${dir}frames.txt`, list.join("\n"));
execFileSync("npx", ["remotion", "ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", `${dir}frames.txt`,
  // Remotion's ffmpeg build has no fps filter, so the constant rate is set on the output.
  "-fps_mode", "cfr", "-r", "30", "-pix_fmt", "yuv420p", "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-movflags", "+faststart", `${dir}take.mp4`], { cwd: film, stdio: "inherit" });
const offset = (take.t0Wall - take.frameBaseWall) / 1000;
writeFileSync(`${dir}cues.json`, JSON.stringify({
  durationSec: (f.at(-1).t + HOLD_MS) / 1000,
  marks: Object.fromEntries(take.marks.map((m) => [m.id, +(m.t / 1000 + offset).toFixed(3)])),
  taps: take.taps.map((p) => ({ ...p, t: +(p.t / 1000 + offset).toFixed(3) })),
}, null, 1));
console.log(`${dir}take.mp4`);

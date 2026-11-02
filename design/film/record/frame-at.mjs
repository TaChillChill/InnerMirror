// Prints the frame file shown at given take times (seconds), for checking a take by eye.
// Usage: node record/frame-at.mjs <take> <sec> [sec…]
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const [name, ...secs] = process.argv.slice(2);
const dir = fileURLToPath(new URL(`../public/take/${name}/`, import.meta.url));
const take = JSON.parse(readFileSync(`${dir}take.json`, "utf8"));
const offset = take.t0Wall - take.frameBaseWall; // marks are relative to t0, frames to the first frame
for (const s of secs.map(Number)) {
  const t = s * 1000 + offset;
  const f = take.frames.filter((x) => x.t <= t).at(-1) ?? take.frames[0];
  console.log(`${dir}frames/${String(f.i).padStart(5, "0")}.jpg`);
}

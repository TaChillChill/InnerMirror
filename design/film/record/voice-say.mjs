// SCRATCH voiceover with macOS `say` (offline, $0): one WAV per line of src/narration.ts into
// public/vo/, plus manifest.json with each line's length so the mix can duck the music under it
// and a check that no line runs into the next. The real voice replaces these files later
// (the Founder's TTS choice); the ids and times stay.
//   node record/voice-say.mjs [voice=Samantha] [rate=170]
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const film = fileURLToPath(new URL("..", import.meta.url));
const [voice = "Samantha", rate = "170"] = process.argv.slice(2);
const { NARRATION } = await import(`${film}src/narration.ts`);
const out = `${film}public/vo`;
mkdirSync(out, { recursive: true });
const probe = `${film}node_modules/@remotion/compositor-darwin-arm64`;

const manifest = {};
for (const line of NARRATION) {
  const file = `${out}/${line.id}.wav`;
  execFileSync("say", ["-v", voice, "-r", rate, "--file-format=WAVE", "--data-format=LEI16@48000", "-o", file, line.text]);
  const sec = Number(execFileSync(`${probe}/ffprobe`, ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file],
    { env: { ...process.env, DYLD_LIBRARY_PATH: probe } }).toString());
  manifest[line.id] = { at: line.at, sec: +sec.toFixed(2) };
}
writeFileSync(`${out}/manifest.json`, JSON.stringify({ voice: `${voice} (macOS say, scratch)`, rate: Number(rate), lines: manifest }, null, 1));
NARRATION.forEach((l, i) => {
  const end = l.at + manifest[l.id].sec, next = NARRATION[i + 1]?.at ?? 180;
  console.log(`${l.at.toFixed(1).padStart(6)} → ${end.toFixed(1).padStart(6)}  ${end > next - 0.2 ? "OVERLAPS next" : "ok"}  ${l.id}`);
});

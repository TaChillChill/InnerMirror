// Generates the film's placeholder sound, all synthesized here (no samples, no licences):
// UI clicks, pops, pings, the storm drone, BOOM, mascot chimes and soft pads.
// Founder will replace the beds with licensed music; the cues stay. Output: public/sfx/*.wav
// Usage: node record/sfx.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const RATE = 44100;
const out = fileURLToPath(new URL("../public/sfx/", import.meta.url));
mkdirSync(out, { recursive: true });

function wav(name, samples) {
  const n = samples.length, buf = Buffer.alloc(44 + n * 2);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write("WAVEfmt ", 8);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22); buf.writeUInt32LE(RATE, 24);
  buf.writeUInt32LE(RATE * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write("data", 36); buf.writeUInt32LE(n * 2, 40);
  let peak = 1e-9;
  for (const v of samples) peak = Math.max(peak, Math.abs(v));
  const g = Math.min(1, 0.89 / peak); // normalise to about -1 dBFS, never boost quiet beds past that
  samples.forEach((v, i) => buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v * g)) * 32767), 44 + i * 2));
  writeFileSync(`${out}${name}.wav`, buf);
}
const make = (sec, fn) => Array.from({ length: Math.round(sec * RATE) }, (_, i) => fn(i / RATE, i));
const seeded = (seed) => () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
const noise = seeded(7);
const env = (t, a, d) => (t < a ? t / a : Math.exp(-(t - a) / d));
const fadeIO = (t, len, fin, fout) => Math.min(1, t / fin, (len - t) / fout);
const sin = (f, t) => Math.sin(2 * Math.PI * f * t);
const NOTE = (n) => 440 * 2 ** ((n - 69) / 12);

// Short sounds.
let prev = 0;
wav("key", make(0.03, (t) => { const x = noise(); const y = x - prev; prev = x; return y * env(t, 0.001, 0.006) * 0.6; }));
wav("pop", make(0.09, (t) => sin(500 + 7000 * t, t) * env(t, 0.003, 0.025)));
wav("ping", make(0.45, (t) => (sin(1320, t) + 0.6 * sin(1760, t)) * env(t, 0.004, 0.09)));
wav("whoosh", make(0.22, (t) => { let y = 0; const x = noise(); prev = prev * 0.85 + x * 0.15; y = prev; return y * Math.sin(Math.PI * t / 0.22) * 2.2; }));
wav("tap", make(0.05, (t) => sin(1800, t) * env(t, 0.001, 0.008) * 0.5));
wav("shutter", make(0.25, (t) => { const x = noise(); const c = (tt) => (tt >= 0 && tt < 0.03 ? Math.exp(-tt / 0.006) : 0); return x * (c(t) + 0.8 * c(t - 0.12)); }));
// Short tail on purpose: the silence after the BOOM has to be real silence.
wav("boom", make(1.6, (t) => {
  const f = 34 + 40 * Math.exp(-t * 3);
  return ((sin(f, t) * 1.0 + sin(f * 1.5, t) * 0.3) * env(t, 0.005, 0.35) + noise() * env(t, 0.001, 0.08) * 0.8) * Math.min(1, (1.6 - t) / 0.3);
}));
wav("tick", make(0.06, (t) => sin(2400, t) * env(t, 0.001, 0.01) * 0.4));
// Chimes, one pitch per mascot (CP NP A FC AC): C5 E5 G5 A5 C6.
[72, 76, 79, 81, 84].forEach((n, k) => wav(`chime${k}`, make(1.8, (t) => {
  const f = NOTE(n);
  return (sin(f, t) + 0.35 * sin(2 * f, t) * Math.exp(-t * 3) + 0.15 * sin(3.01 * f, t) * Math.exp(-t * 5)) * env(t, 0.004, 0.5);
})));
wav("piano", make(4.5, (t) => {
  const f = NOTE(45);
  return [1, 0.5, 0.25, 0.12].reduce((y, a, h) => y + a * sin(f * (h + 1), t) * Math.exp(-t * (0.8 + h * 0.6)), 0) * env(t, 0.006, 2);
}));

// Beds. Soft sine pads; chords move slowly; long fades so cuts never click.
const pad = (sec, chords, every, vol = 0.25, lfo = 0.2) => make(sec, (t) => {
  const c = chords[Math.floor(t / every) % chords.length];
  const local = t % every;
  const xf = Math.min(1, local / 1.5);
  const p = chords[(Math.floor(t / every) + chords.length - 1) % chords.length];
  const voice = (notes) => notes.reduce((y, n) => y + sin(NOTE(n), t) + 0.3 * sin(NOTE(n) * 2.003, t), 0) / notes.length;
  return (voice(c) * xf + voice(p) * (1 - xf)) * (0.8 + 0.2 * sin(lfo, t)) * vol * fadeIO(t, sec, 2, 3);
});
// S2 storm, 22 s: low drone rising and roughening, a pulse that speeds up from 70 to 140 bpm.
wav("storm", make(22, (t) => {
  const k = t / 22;
  const f = 55 + 35 * k * k;
  const drone = (sin(f, t) + 0.5 * sin(f * 1.01 + 0.4, t) + 0.3 * sin(f * 2.02, t)) * (0.3 + 0.7 * k);
  const bpm = 70 + 70 * k * k;
  const phase = (t * bpm / 60) % 1;
  const thump = sin(48, t) * Math.exp(-phase * 14) * (0.4 + 0.6 * k);
  return (drone * 0.5 + thump * 0.8 + noise() * 0.05 * k * k) * Math.min(1, t / 1.5);
}));
wav("reflect", pad(36, [[48, 55, 60, 64], [45, 52, 57, 64], [41, 48, 57, 60], [43, 50, 55, 62]], 9, 0.22));
wav("bed", pad(72, [[57, 60, 64], [53, 57, 60], [48, 55, 64], [55, 59, 62]], 9, 0.16, 0.1));
// S7 river, 22 s at 96 bpm: harp-like arpeggio over a warm pad, one steady tempo.
wav("river", make(22, (t) => {
  const beat = 60 / 96 / 2;
  const arp = [53, 57, 60, 64, 67, 64, 60, 57, 50, 57, 62, 65, 69, 65, 62, 57];
  const i = Math.floor(t / beat), local = t - i * beat;
  const n = NOTE(arp[i % arp.length] + 12);
  const pluck = (sin(n, local) + 0.4 * sin(2 * n, local)) * Math.exp(-local * 5);
  const bed = [41, 48, 53, 57].reduce((y, m) => y + sin(NOTE(m), t), 0) / 4;
  return (pluck * 0.5 + bed * 0.35) * fadeIO(t, 22, 1.5, 2.5);
}));
wav("end", pad(24, [[41, 48, 57, 64], [43, 50, 59, 67], [48, 55, 64, 72]], 7, 0.25, 0.15));
console.log(`sfx written to ${out}`);

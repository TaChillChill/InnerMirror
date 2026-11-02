// The film's placeholder sound, cued to the picture. Every file is synthesized by
// record/sfx.mjs (no samples, no licences). The beds are stand-ins for the Founder's music;
// the cue points stay when real tracks replace them. Demo taps are cued in Footage.tsx.
import { Audio, Sequence, interpolate, staticFile } from "remotion";
import { SCENES, s } from "./story";
import { BOOM, ITEMS } from "./scenes/Storm";
import { VOICE_LEN, VOICE_START } from "./scenes/Opening";
import { voiceAt } from "./Voice";

const sfx = (n: string) => staticFile(`sfx/${n}.wav`);
const start = (id: string) => s(SCENES.find((x) => x.id === id)!.from);

type Cue = { at: number; src: string; vol?: number; len?: number; fade?: boolean };
// Beds step back to 45% under the narrator so every word stays clear.
const DUCK = 0.45;

function cues(): Cue[] {
  const c: Cue[] = [];
  // S1: typing, deleting, retyping, send, rewind.
  for (let f = 15; f < 75; f += 3) c.push({ at: f, src: "key", vol: 0.5 });
  for (let f = 75; f < 92; f += 2) c.push({ at: f, src: "key", vol: 0.35 });
  for (let f = 92; f < 126; f += 2.6) c.push({ at: Math.round(f), src: "key", vol: 0.5 });
  c.push({ at: 128, src: "pop", vol: 0.7 }, { at: 150, src: "whoosh", vol: 0.6 });
  // S2 + S3: a ping per readable message, a pulse per message, the storm bed, BOOM, then silence.
  const s2 = start("S2");
  ITEMS.forEach((m, i) => {
    if (m.at >= BOOM) return;
    c.push({ at: s2 + m.at, src: i < 13 ? "ping" : "key", vol: i < 13 ? 0.45 : 0.4 });
    c.push({ at: s2 + m.at + 2, src: "whoosh", vol: 0.25 + Math.min(0.35, i * 0.012) });
  });
  c.push({ at: s2, src: "storm", vol: 0.55, len: BOOM, fade: true });
  c.push({ at: s2 + BOOM + 4, src: "boom", vol: 1 });
  [62, 74, 86].forEach((d) => c.push({ at: s2 + BOOM + d, src: "tick", vol: 0.35 }));
  // S4–S5: a soft bed, one piano note under the turn inward, a chime per voice, a chord for the groups.
  const s4 = start("S4"), s5 = start("S5");
  c.push({ at: s4 + 15, src: "reflect", vol: 0.4, len: start("S6") - s4 - 15, fade: true });
  c.push({ at: s4 + s(6.6), src: "piano", vol: 0.7 });
  [0, 1, 2, 3, 4].forEach((k) => c.push({ at: s5 + VOICE_START + k * VOICE_LEN, src: `chime${k}`, vol: 0.45 }));
  [0, 2, 4].forEach((k) => c.push({ at: s5 + VOICE_START + 5 * VOICE_LEN, src: `chime${k}`, vol: 0.3 }));
  // S6: shutter on the match cut, a quiet bed under the real app.
  const s6 = start("S6");
  c.push({ at: s6 + 31, src: "shutter", vol: 0.6 }, { at: s6, src: "bed", vol: 0.55, len: start("S7") - s6, fade: true });
  // S7–S9: the river, then the closing chords; a last soft send pop.
  c.push({ at: start("S7"), src: "river", vol: 0.38, len: start("S8") - start("S7") + 15, fade: true });
  c.push({ at: start("S8") + 10, src: "end", vol: 0.65, len: s(180) - start("S8") - 10, fade: true });
  c.push({ at: s(179), src: "pop", vol: 0.25 });
  return c;
}
const CUES = cues();

export function Sound() {
  return <>{CUES.map((q, i) => (
    <Sequence key={i} from={q.at} durationInFrames={q.len} layout="none">
      <Audio src={sfx(q.src)} volume={q.fade && q.len
        ? (f) => q.vol! * interpolate(f, [0, 20, q.len! - 30, q.len!], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
          * (1 - (1 - DUCK) * voiceAt(q.at + f))
        : q.vol ?? 1} />
    </Sequence>
  ))}</>;
}

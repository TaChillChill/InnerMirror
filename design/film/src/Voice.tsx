// The narrator: one file per line of narration.ts (public/vo/<id>.wav, rendered by
// record/voice-*.mjs), placed at its time. `voiceAt` tells the music when to step back.
import { Audio, Sequence, staticFile } from "remotion";
import { NARRATION } from "./narration";
import { s } from "./story";
import vo from "../public/vo/manifest.json";

const LINES = vo.lines as Record<string, { at: number; sec: number }>;
const SPANS = NARRATION.map((l) => [s(l.at), s(l.at + (LINES[l.id]?.sec ?? 0))] as const);

/** 0 → 1: how much a voice line is sounding at this frame, with short ramps either side. */
export function voiceAt(frame: number, ramp = 8) {
  let v = 0;
  for (const [a, b] of SPANS) {
    if (frame >= a - ramp && frame <= b + ramp) v = Math.max(v, Math.min(1, (frame - (a - ramp)) / ramp, (b + ramp - frame) / ramp));
  }
  return v;
}

export function Narration() {
  return <>{NARRATION.filter((l) => LINES[l.id]).map((l) => (
    <Sequence key={l.id} from={s(l.at)} durationInFrames={s(LINES[l.id].sec) + 6} layout="none">
      <Audio src={staticFile(`vo/${l.id}.wav`)} volume={1} />
    </Sequence>
  ))}</>;
}

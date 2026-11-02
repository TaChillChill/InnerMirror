import { AbsoluteFill, Sequence } from "remotion";
import { C } from "./brand";
import { SCENES, s } from "./story";
import { Hook, Voices, Why } from "./scenes/Opening";
import { Storm } from "./scenes/Storm";
import { Demo } from "./scenes/Demo";
import { River } from "./scenes/River";
import { EndCard, World } from "./scenes/Closing";
import { Sound } from "./Sound";
import { Narration } from "./Voice";

const at = (id: string) => SCENES.find((x) => x.id === id)!;
const len = (id: string) => s(at(id).to - at(id).from);

export function Film() {
  return (
    <AbsoluteFill style={{ background: C.night }}>
      <Sequence from={s(at("S1").from)} durationInFrames={len("S1")}><Hook /></Sequence>
      {/* S2 + S3 are one component so the BOOM continues the storm's exact state. */}
      <Sequence from={s(at("S2").from)} durationInFrames={s(at("S3").to - at("S2").from)}><Storm /></Sequence>
      <Sequence from={s(at("S4").from)} durationInFrames={len("S4")}><Why /></Sequence>
      <Sequence from={s(at("S5").from)} durationInFrames={len("S5")}><Voices /></Sequence>
      <Sequence from={s(at("S6").from)} durationInFrames={len("S6")}><Demo /></Sequence>
      <Sequence from={s(at("S7").from)} durationInFrames={len("S7")}><River /></Sequence>
      <Sequence from={s(at("S8").from)} durationInFrames={len("S8")}><World /></Sequence>
      <Sequence from={s(at("S9").from)} durationInFrames={len("S9")}><EndCard /></Sequence>
      <Sound />
      <Narration />
    </AbsoluteFill>
  );
}

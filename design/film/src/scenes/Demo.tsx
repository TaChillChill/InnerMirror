// S6, the real product: every frame after the 3 s match cut is the live take (real app,
// real Muse output, synthetic chat). Waits are sped up and labelled. Captions only claim
// what the model does (screenplay §1). E4 is not shipped, so fallback A: the real
// "Conversation shift" lines Muse wrote are shown during the replay pass in D3.
import { AbsoluteFill, Img, Sequence, interpolate, useCurrentFrame } from "remotion";
import { C } from "../brand";
import { Clip, M, RealTag, clipFrames, type Seg } from "../Footage";
import { s } from "../story";
import { Caption, clamp, ramp } from "../ui";
import shot1 from "../../shots/out/chat-1.png";
import shot2 from "../../shots/out/chat-2.png";
import shot3 from "../../shots/out/chat-3.png";

const PANEL = { x: 978, y: 390 }; // centre of the side panel on the 1280 × 720 page
type Beat = { id: string; segs: Seg[]; captions: { text: string; from: number; to: number }[] };

export const BEATS: Beat[] = [
  { id: "D1", segs: [
    { from: 1.5, to: M["extract-start"] },
    { from: M["extract-start"], to: M.review, rate: 13, sped: true },
    { from: M.review, to: M.review + 0.6 },
  ], captions: [{ text: "Snap the chat you keep replaying. Muse reads the screenshots.", from: 0.3, to: 6.4 }] },
  { id: "D2", segs: [
    { from: M.review + 0.6, to: M["analyze-start"] + 0.5 },
    { from: M["analyze-start"] + 0.5, to: M.observe, rate: 14, sped: true },
  ], captions: [{ text: "Check every line before anything is analyzed.", from: 0.4, to: 5.2 }] },
  { id: "D3", segs: [
    { from: M.observe, to: M["panel-k??"] },
    { from: M["panel-k??"], to: M["panel-k"], rate: 0.8, zoom: { s: 1.5, ...PANEL, at: M["panel-k??"] + 0.3 } },
  ], captions: [
    { text: "Muse suggests a state for each message, quotes its evidence, says how sure it is.", from: 1.2, to: 7.2 },
    { text: "It also marks where the conversation shifted.", from: 7.6, to: 11.2 },
    { text: "A hypothesis about words. Never about a person.", from: 13.4, to: 20.4 },
  ] },
  { id: "D5", segs: [
    { from: M["panel-k"], to: M.chose + 0.6, zoom: { s: 1.4, ...PANEL, at: M["panel-k"] + 0.4 } },
  ], captions: [
    { text: "“Not sure” is an answer too.", from: 0.6, to: 4.6 },
    { text: "Mirror suggests. You decide.", from: 5.6, to: 9.4 },
  ] },
  { id: "D6", segs: [
    { from: M.chose + 0.6, to: M["wi-start"] + 0.5, zoom: { s: 1.35, ...PANEL } },
    { from: M["wi-start"] + 0.5, to: M["wi-done"], rate: 9, sped: true, zoom: { s: 1.35, ...PANEL } },
    { from: M["wi-done"], to: M["wi-done"] + 6.2, zoom: { s: 1.35, ...PANEL } },
  ], captions: [
    { text: "Muse looks at Jordan's earlier words for replies that could fit.", from: 6.6, to: 10.8 },
    { text: "It writes no lines. It predicts nothing.", from: 10.9, to: 13.5 },
  ] },
  { id: "D7", segs: [{ from: M.reflect, to: M.reflect + 5.6 }],
    captions: [{ text: "Your reflection stays on your device.", from: 0.6, to: 5.5 }] },
];
const INTRO = s(3);
export const beatStarts = (() => { let at = INTRO; return BEATS.map((b) => { const from = at; at += clipFrames(b.segs); return from; }); })();
export const DEMO_FRAMES = beatStarts.at(-1)! + clipFrames(BEATS.at(-1)!.segs);

export function Demo() {
  return (
    <AbsoluteFill style={{ background: "#e9e6f6" }}>
      <Sequence durationInFrames={INTRO + 10}><MatchCut /></Sequence>
      {BEATS.map((b, i) => (
        <Sequence key={b.id} from={beatStarts[i]} durationInFrames={clipFrames(b.segs)}>
          <Clip segs={b.segs}>{b.captions.map((c) => <Caption key={c.text} text={c.text} from={s(c.from)} to={s(c.to)} />)}</Clip>
        </Sequence>
      ))}
      <Sequence from={INTRO}><RealTag /></Sequence>
    </AbsoluteFill>
  );
}

/** 3 s of motion: the night chat becomes the actual screenshot, a shutter, three shots fan out. */
function MatchCut() {
  const f = useCurrentFrame();
  const bg = interpolate(f, [0, 18], [0, 1], clamp);
  const flash = interpolate(f, [30, 33, 46], [0, 0.9, 0], clamp);
  const fan = ramp(f, 44, 22);
  const out = ramp(f, INTRO - 8, 18);
  const shots = [shot1, shot2, shot3];
  return (
    <AbsoluteFill style={{ background: bg < 1 ? C.night : "#e9e6f6", opacity: 1 - out }}>
      {shots.map((src, i) => {
        if (f < 44 && i !== 2) return null;
        const x = 960 + (i - 1) * 420 * fan;
        return <Img key={i} src={src} style={{ position: "absolute", height: 860, left: x - 199, top: 110 - (i === 2 ? 0 : 0), borderRadius: 40,
          border: "12px solid #111", boxShadow: "0 30px 70px rgba(0,0,0,0.35)", transform: `scale(${interpolate(fan, [0, 1], [1, 0.82])}) rotate(${(i - 1) * 4 * fan}deg)` }} />;
      })}
      <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
      <div style={{ position: "absolute", left: 40, top: 6, font: "800 18px Nunito", letterSpacing: 1.4, color: C.primaryInk, opacity: bg }}>SYNTHETIC CHAT SCREENSHOTS</div>
    </AbsoluteFill>
  );
}

// Real app footage: cuts from the live take (public/take/dark1/take.mp4, the app in Dark Mode,
// 1280 × 720 CSS recorded at 1920 × 1080, the
// app's real UI and Muse's real output). A clip is a list of take segments; waits can be
// sped up (labelled on screen), a segment can zoom towards a point, and taps show as rings.
import type { ReactNode } from "react";
import { Audio, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, FONT } from "./brand";
import { FPS } from "./story";
import { clamp } from "./ui";
import cues from "../public/take/dark1/cues.json";

export const TAKE_SRC = staticFile("take/dark1/take.mp4");
export const M = cues.marks as Record<string, number>;
const TAPS = cues.taps as { x: number; y: number; t: number; label: string }[];

/** Take seconds. `zoom` scales around a point of the 1280 × 720 page, easing in from `zoomAt` (take time). */
export type Seg = { from: number; to: number; rate?: number; sped?: boolean; zoom?: { s: number; x: number; y: number; at?: number } };
export const segFrames = (g: Seg) => Math.round(((g.to - g.from) / (g.rate ?? 1)) * FPS);
export const clipFrames = (segs: Seg[]) => segs.reduce((n, g) => n + segFrames(g), 0);

// The screen sits in a soft frame so captions below never cover the UI. The stage is the film's
// night, so the cut from motion to product stays in one world.
export const STAGE = `radial-gradient(1400px 800px at 50% 42%, #221f40 0%, ${C.night} 70%)`;
const BOX = { left: 192, top: 36, w: 1536, h: 864 };
const K = BOX.w / 1280;

export function Clip({ segs, children }: { segs: Seg[]; children?: ReactNode }) {
  let at = 0;
  return (
    <div style={{ position: "absolute", inset: 0, background: STAGE, fontFamily: FONT }}>
      <div style={{ position: "absolute", left: BOX.left, top: BOX.top, width: BOX.w, height: BOX.h, borderRadius: 18, overflow: "hidden",
        boxShadow: "0 30px 90px rgba(0,0,0,0.55), 0 0 0 1px rgba(169,163,255,0.16)", background: "#17152b" }}>
        {segs.map((g, i) => {
          const from = at;
          at += segFrames(g);
          return <Sequence key={i} from={from} durationInFrames={segFrames(g)} layout="none"><Segment g={g} /></Sequence>;
        })}
      </div>
      {children}
    </div>
  );
}

function Segment({ g }: { g: Seg }) {
  const f = useCurrentFrame();
  const rate = g.rate ?? 1;
  const takeT = g.from + (f / FPS) * rate;
  const z = g.zoom;
  const zf = z ? interpolate(takeT, [z.at ?? g.from, (z.at ?? g.from) + 0.6], [0, 1], clamp) : 0;
  const s = 1 + ((z?.s ?? 1) - 1) * zf;
  const origin = z ? `${z.x * K}px ${z.y * K}px` : "center";
  return (
    <div style={{ position: "absolute", inset: 0, transform: `scale(${s})`, transformOrigin: origin }}>
      <OffthreadVideo src={TAKE_SRC} startFrom={Math.round(g.from * FPS)} endAt={Math.round(g.to * FPS) + 1} playbackRate={rate} muted
        style={{ width: "100%", height: "100%", display: "block" }} />
      {TAPS.filter((p) => p.t >= g.from - 0.4 && p.t <= g.to).map((p) => <Ring key={p.t} x={p.x * K} y={p.y * K} dt={takeT - p.t} />)}
      {TAPS.filter((p) => p.t >= g.from && p.t <= g.to).map((p) => (
        <Sequence key={`s${p.t}`} from={Math.round(((p.t - g.from) / rate) * FPS)} durationInFrames={6} layout="none">
          <Audio src={staticFile("sfx/tap.wav")} volume={0.35} />
        </Sequence>
      ))}
      {g.sped && <div style={{ position: "absolute", right: 18, top: 16, padding: "6px 14px", borderRadius: 8, background: "rgba(106,98,216,0.85)",
        color: "#fff", font: `700 22px ${FONT}`, transform: `scale(${1 / s})`, transformOrigin: "top right" }}>sped up ▸▸</div>}
    </div>
  );
}

/** Tap ring: a soft dot that presses at the click time, then expands and fades. */
function Ring({ x, y, dt }: { x: number; y: number; dt: number }) {
  if (dt < -0.35 || dt > 0.5) return null;
  const r = dt < 0 ? 26 : 26 + dt * 70;
  const o = dt < 0 ? interpolate(dt, [-0.35, -0.1], [0, 0.9], clamp) : 0.9 * (1 - dt / 0.5);
  return <div style={{ position: "absolute", left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: "50%", opacity: o,
    border: "4px solid rgba(169,163,255,0.95)", background: dt < 0 ? "rgba(169,163,255,0.28)" : "transparent" }} />;
}

export function RealTag({ text = "REAL APP · live Muse output · synthetic chat" }: { text?: string }) {
  return <div style={{ position: "absolute", left: 40, top: 6, font: `800 18px ${FONT}`, letterSpacing: 1.4, color: C.nightMuted, zIndex: 50 }}>{text}</div>;
}

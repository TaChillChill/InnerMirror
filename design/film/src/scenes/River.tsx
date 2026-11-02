// S7, "the river": the same two people and octopuses, but nothing collides. Messages
// drift in from both sides, join one slow current up the middle and sway with it.
// States still change (Critical Parent included); only the rhythm differs. Pure sine
// motion, no pops, no shake. An illustration of a possibility, not a promised outcome.
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, FONT, MASCOT, STATES, fillOf, type Reading } from "../brand";
import { BigMascot, type Beat } from "../BigMascot";
import { s } from "../story";
import { PersonAvatar, Tag, clamp, window01 } from "../ui";

const SEQ: Reading[] = ["A", "FC", "CP", "AC", "NP", "A", "FC", "CP", "A", "NP", "AC", "A", "FC", "CP", "NP", "A", "FC", "A", "AC", "NP", "A", "CP", "FC", "A"];
const EVERY = 27; // frames between messages: one steady pulse
const LIFE = s(7.5); // each message takes 7.5 s to drift through
const START = -LIFE + s(1.5); // the river is already flowing when the scene opens
const DRIFT = SEQ.map((state, i) => ({ who: (i % 2 ? "X" : "J") as "J" | "X", state, at: START + i * EVERY, len: 12 + ((i * 5) % 18) }));
const BEATS: Beat[] = DRIFT.map((d) => ({ ...d, at: Math.max(0, d.at + s(1)) }));

const smooth = (t: number) => t * t * (3 - 2 * t);

export function River() {
  const f = useCurrentFrame();
  const pull = interpolate(f, [s(15.5), s(20)], [1, 0.62], clamp);
  const fade = interpolate(f, [s(18.5), s(20)], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 60%, #1f2148 0%, #110f22 70%)", fontFamily: FONT }}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${pull})`, opacity: fade }}>
        <Currents f={f} />
        <BigMascot beats={BEATS} who="J" f={f} x={260} y={560 + Math.sin(f / 30) * 14} size={400} calm />
        <BigMascot beats={BEATS} who="X" f={f} x={1660} y={560 + Math.sin(f / 30 + 1.4) * 14} size={400} calm />
        {DRIFT.map((d, i) => {
          const p = (f - d.at) / LIFE;
          if (p < 0 || p > 1) return null;
          const side = d.who === "J" ? 520 : 1400;
          const centre = 960 + 150 * Math.sin(p * Math.PI * 1.6 + i * 0.9);
          const x = interpolate(smooth(Math.min(1, p * 2.2)), [0, 1], [side, centre]);
          const y = 1020 - p * 1180;
          const o = Math.min(1, p * 8, (1 - p) * 6);
          return <Drop key={i} who={d.who} state={d.state} len={d.len} x={x} y={y} o={o} />;
        })}
      </div>
      <div style={{ position: "absolute", top: 70, left: 0, right: 0, textAlign: "center", opacity: window01(f, s(8), s(13.5), 18),
        font: `800 64px ${FONT}`, color: C.nightText, textShadow: "0 0 30px #110f22, 0 0 60px #110f22" }}>Not a promise. A possibility.</div>
      <Tag kind="motion" />
    </AbsoluteFill>
  );
}

function Drop({ who, state, len, x, y, o }: { who: "J" | "X"; state: Reading; len: number; x: number; y: number; o: number }) {
  const w = 120 + len * 8;
  return (
    <div style={{ position: "absolute", left: x - (w + 60) / 2, top: y, opacity: o, display: "flex", gap: 10, alignItems: "center",
      flexDirection: who === "J" ? "row" : "row-reverse" }}>
      <PersonAvatar who={who} size={48} />
      <div style={{ width: w, height: 44, borderRadius: 22, background: who === "J" ? "#2a2748" : "#3a3570", border: `2px solid ${fillOf(state)}aa`,
        display: "flex", alignItems: "center", padding: "0 18px" }}>
        <span style={{ height: 14, flex: 1, borderRadius: 7, background: `${fillOf(state)}99` }} />
      </div>
    </div>
  );
}

/** Soft vertical ribbons in the five colours, weaving slowly; they cross without colliding. */
function Currents({ f }: { f: number }) {
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      {STATES.map((st, k) => {
        const pts = Array.from({ length: 23 }, (_, j) => {
          const y = -60 + j * 55;
          const x = 960 + (k - 2) * 46 + 170 * Math.sin(y / 230 + f / 45 + k * 1.25);
          return `${j ? "L" : "M"} ${x.toFixed(1)} ${y}`;
        }).join(" ");
        return <path key={st} d={pts} fill="none" stroke={MASCOT[st].fill} strokeOpacity={0.22} strokeWidth={34} strokeLinecap="round"
          style={{ filter: "blur(6px)" }} />;
      })}
    </svg>
  );
}

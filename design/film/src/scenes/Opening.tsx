// S1, S4, S5: hook, the Why echoes, and What if…? with the five voices.
// S2 + S3 (the storm and BOOM) live in Storm.tsx.
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, FONT, MASCOT, STATES, type State } from "../brand";
import { CHAT, HOOK_INDEX, s } from "../story";
import { Line, PersonAvatar, Tag, clamp, ramp, window01 } from "../ui";

const night = { background: C.night, fontFamily: FONT };

// ---------- S1 Hook (6 s) ----------
export function Hook() {
  const f = useCurrentFrame();
  const full = CHAT[HOOK_INDEX].text;
  const typed = f < 15 ? 0 : f < 75 ? Math.floor((f - 15) / 2.4) : f < 92 ? Math.max(5, 25 - Math.floor((f - 75) * 1.2)) : Math.min(full.length, 5 + Math.floor((f - 92) / 1.6));
  const sent = f >= 128;
  const rewind = ramp(f, 150, 28);
  const rise = interpolate(f, [128, 140], [60, 0], clamp);
  return (
    <AbsoluteFill style={night}>
      <div style={{ position: "absolute", top: 70, width: "100%", textAlign: "center", color: C.nightMuted, font: `700 30px ${FONT}` }}>11:47 PM</div>
      {sent && (
        <div style={{ position: "absolute", right: 360, top: 700 + rise - rewind * 900, display: "flex", gap: 16, alignItems: "center",
          opacity: 1 - rewind, filter: `blur(${rewind * 14}px)` }}>
          <div style={{ padding: "18px 30px", borderRadius: 30, background: "#3a3570", color: C.nightText, font: `700 44px ${FONT}` }}>{full}</div>
          <PersonAvatar who="X" size={84} />
        </div>
      )}
      <div style={{ position: "absolute", left: 360, right: 360, bottom: 110, height: 96, borderRadius: 48, background: "#1d1a36",
        border: "2px solid #3a3666", display: "flex", alignItems: "center", padding: "0 40px", font: `600 40px ${FONT}`, color: C.nightText, opacity: 1 - rewind }}>
        {sent ? "" : full.slice(0, typed)}
        <span style={{ width: 3, height: 44, marginLeft: 4, background: C.nightText, opacity: Math.floor(f / 15) % 2 ? 0 : 1 }} />
      </div>
      {rewind > 0 && <AbsoluteFill style={{ background: `repeating-linear-gradient(0deg, transparent 0 40px, rgba(255,255,255,${0.05 * rewind}) 40px 44px)`,
        transform: `translateY(${-f * 30 % 44}px)` }} />}
    </AbsoluteFill>
  );
}

// ---------- S4 Why echoes (10 s) ----------
const ECHOES = [
  { text: "why doesn't she get it?", at: 0.4, left: 240, top: 290 },
  { text: "why is he always so defensive?", at: 2.2, left: 900, top: 450 },
  { text: "why do we keep having the same fight?", at: 4.0, left: 380, top: 620 },
];

export function Why() {
  const f = useCurrentFrame();
  const away = ramp(f, s(6.2), 18);
  return (
    <AbsoluteFill style={night}>
      {ECHOES.map((e) => {
        const o = ramp(f, s(e.at), 14) * (1 - away);
        return <div key={e.text} style={{ position: "absolute", left: e.left, top: e.top, opacity: o * 0.9,
          filter: `blur(${away * 10}px)`, transform: `translateY(${(1 - ramp(f, s(e.at), 14)) * 16}px)`,
          padding: "18px 30px", borderRadius: 30, background: "#1d1a36", color: C.nightMuted, font: `600 46px ${FONT}`, fontStyle: "italic" }}>{e.text}</div>;
      })}
      <Line opacity={window01(f, s(6.6), s(10) + 10, 14)} size={72}>What if I'm part of the pattern, too?</Line>
    </AbsoluteFill>
  );
}

// ---------- S5 What if…? → which part of us speaks → five voices (25 s) ----------
// Holds follow the reading rule (0.3 s per word + 1 s): bridge 14 words = 5.2 s,
// TA line 7 words = 3.1 s, each voice (name + tag, ≤ 5 words) = 2.5 s.
const BRIDGE = s(1.5);
const TA = s(6.7);
export const VOICE_START = s(9.8);
export const VOICE_LEN = s(2.5);

export function Voices() {
  const f = useCurrentFrame();
  const rowFrom = VOICE_START + VOICE_LEN * 5;
  const inner = window01(f, BRIDGE, VOICE_START + 6, 14);
  return (
    <AbsoluteFill style={night}>
      <Line opacity={window01(f, 0, BRIDGE, 10)} size={120}>What if…?</Line>
      {inner > 0 && <Inner f={f} o={inner} />}
      <Line opacity={window01(f, BRIDGE + 6, TA, 12)} y={300} size={54}>What if the way we respond depends on which part of us is speaking?</Line>
      <Line opacity={window01(f, TA, VOICE_START, 12)} y={300} size={54}>In Transactional Analysis, these parts are called ego states.</Line>
      {STATES.map((st, i) => {
        const t = f - (VOICE_START + i * VOICE_LEN);
        if (t < 0 || t > VOICE_LEN) return null;
        const x = interpolate(t, [0, 10, VOICE_LEN - 10, VOICE_LEN], [400, 0, 0, -400], clamp);
        const o = interpolate(t, [0, 10, VOICE_LEN - 8, VOICE_LEN], [0, 1, 1, 0], clamp);
        const m = MASCOT[st];
        return <div key={st} style={{ position: "absolute", inset: 0, opacity: o, transform: `translateX(${x}px)` }}>
          <div style={{ position: "absolute", left: 960 - 300, top: 120, width: 600, height: 600, borderRadius: "50%",
            background: `radial-gradient(circle, ${m.fill}66 0%, transparent 65%)` }} />
          <img src={m.full} style={{ position: "absolute", left: 960 - 250, top: 150, width: 500, height: 500,
            transform: `translateY(${Math.sin(t / 6) * 10}px) rotate(${Math.sin(t / 9) * 3}deg)` }} />
          <div style={{ position: "absolute", top: 700, width: "100%", textAlign: "center", color: m.fill, font: `800 76px ${FONT}` }}>{m.name}</div>
          <div style={{ position: "absolute", top: 800, width: "100%", textAlign: "center", color: C.nightText, font: `600 46px ${FONT}` }}>{m.tag}</div>
        </div>;
      })}
      {f >= rowFrom && (
        <div style={{ position: "absolute", inset: 0, opacity: ramp(f, rowFrom, 8) }}>
          <Groups f={f} />
          <Line opacity={ramp(f, rowFrom + 6, 10)} y={330} size={56}>Everyone speaks from all five.</Line>
        </div>
      )}
      <Tag kind="motion" />
    </AbsoluteFill>
  );
}

// Parent · Adult · Child, the three structural groups (Berne) holding the five functional
// states. The source PNGs share one canvas, so Child mascots already read rounder and smaller;
// they also get a slightly smaller box. Every box sits on one baseline. No lines between groups.
const GROUPS: { label: string; states: State[]; size: number }[] = [
  { label: "Parent", states: ["CP", "NP"], size: 300 },
  { label: "Adult", states: ["A"], size: 300 },
  { label: "Child", states: ["FC", "AC"], size: 270 },
];
const BASELINE = 650, IN_GAP = 6, GROUP_GAP = 110;

function Groups({ f }: { f: number }) {
  const widths = GROUPS.map((g) => g.states.length * g.size + (g.states.length - 1) * IN_GAP);
  let x = (1920 - widths.reduce((a, b) => a + b, 0) - GROUP_GAP * (GROUPS.length - 1)) / 2;
  return <>{GROUPS.map((g, gi) => {
    const left = x;
    x += widths[gi] + GROUP_GAP;
    return <div key={g.label}>
      <div style={{ position: "absolute", left, width: widths[gi], top: BASELINE - g.size - 70, textAlign: "center", color: C.nightMuted,
        font: `800 30px ${FONT}`, letterSpacing: 4, textTransform: "uppercase" }}>{g.label}</div>
      {g.states.map((st, i) => <div key={st}>
        <img src={MASCOT[st].full} style={{ position: "absolute", width: g.size, height: g.size, left: left + i * (g.size + IN_GAP), top: BASELINE - g.size,
          transform: `translateY(${Math.sin((f + (gi * 2 + i) * 9) / 8) * 6}px)` }} />
        <div style={{ position: "absolute", left: left + i * (g.size + IN_GAP), width: g.size, top: BASELINE + 8, textAlign: "center",
          color: MASCOT[st].fill, font: `700 24px ${FONT}` }}>{MASCOT[st].name}</div>
      </div>)}
    </div>;
  })}</>;
}

/** One person, five coloured lights moving inside: "parts of us", before they get names. */
function Inner({ f, o }: { f: number; o: number }) {
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: o }}>
      <circle cx={960} cy={300} r={92} fill="none" stroke={C.nightMuted} strokeWidth={4} />
      <path d="M 760 640 C 760 470 860 420 960 420 C 1060 420 1160 470 1160 640" fill="none" stroke={C.nightMuted} strokeWidth={4} />
      {STATES.map((st, i) => {
        const a = f / 40 + (i / 5) * Math.PI * 2;
        return <circle key={st} cx={960 + Math.cos(a) * 110} cy={500 + Math.sin(a) * 50} r={20} fill={MASCOT[st].fill}
          style={{ filter: `drop-shadow(0 0 14px ${MASCOT[st].fill})` }} opacity={0.9} />;
      })}
    </svg>
  );
}

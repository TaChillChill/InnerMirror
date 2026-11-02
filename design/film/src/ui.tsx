import type { CSSProperties, ReactNode } from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, FONT, MASCOT, UNCLEAR_FILL, type Reading } from "./brand";
import { PEOPLE, type Kind } from "./story";

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0 → 1 over [from, from + dur] frames. */
export const ramp = (f: number, from: number, dur = 12) => interpolate(f, [from, from + dur], [0, 1], clamp);

/** Fade in at `from`, fade out ending at `to`. */
export const window01 = (f: number, from: number, to: number, fade = 10) =>
  Math.min(ramp(f, from, fade), 1 - ramp(f, to - fade, fade));

const TAG_TEXT: Record<Kind, string> = {
  motion: "ILLUSTRATION",
  real: "REAL APP · live Muse output · synthetic chat",
  mixed: "REAL APP · demo data",
};

/** Small corner label so nobody mistakes an illustration for the shipped product. */
export function Tag({ kind, text, dark = true }: { kind: Kind; text?: string; dark?: boolean }) {
  return (
    <div style={{
      position: "absolute", left: 40, top: 30, font: `700 18px ${FONT}`, letterSpacing: 1.5,
      padding: "5px 12px", borderRadius: 8, zIndex: 50, color: dark ? C.nightMuted : C.muted,
      background: dark ? "rgba(255,255,255,0.05)" : "rgba(37,35,68,0.06)", opacity: 0.8,
    }}>{text ?? TAG_TEXT[kind]}</div>
  );
}

/** Centered title card text. */
export function Line({ children, opacity, y = 0, size = 64, color = C.nightText, weight = 800 }: {
  children: ReactNode; opacity: number; y?: number; size?: number; color?: string; weight?: number;
}) {
  return (
    <div style={{
      position: "absolute", left: 160, right: 160, top: "50%", textAlign: "center",
      transform: `translateY(calc(-50% + ${y + (1 - opacity) * 14}px))`, opacity,
      font: `${weight} ${size}px/1.25 ${FONT}`, color, textWrap: "balance",
    }}>{children}</div>
  );
}

/** Lower-third caption for the demo: one at a time, short. */
export function Caption({ text, from, to }: { text: string; from: number; to: number }) {
  const f = useCurrentFrame();
  const o = window01(f, from, to, 8);
  if (o <= 0) return null;
  return (
    <div style={{
      position: "absolute", left: 0, right: 0, bottom: 92, display: "flex", justifyContent: "center", zIndex: 40,
      opacity: o, transform: `translateY(${(1 - o) * 10}px)`,
    }}>
      <div style={{
        maxWidth: 1300, padding: "18px 34px", borderRadius: 18, background: "rgba(17,15,34,0.88)",
        color: "#fff", font: `700 40px/1.3 ${FONT}`, textAlign: "center",
      }}>{text}</div>
    </div>
  );
}

/** A person, not an ego state: flat silhouette on a neutral tint, same on every message. */
export function PersonAvatar({ who, size = 56 }: { who: "J" | "X"; size?: number }) {
  const p = PEOPLE[who];
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" style={{ flex: "none", borderRadius: "50%", background: p.bg }}>
      {p.hair === "long" && <path d="M14 46 C12 22 20 12 32 12 C44 12 52 22 50 46 Z" fill={p.ink} opacity={0.85} />}
      <circle cx={32} cy={27} r={11} fill={p.ink} />
      {p.hair === "short" && <path d="M20 25 C20 13 44 13 44 25 C40 19 26 19 20 25 Z" fill={p.ink} />}
      <path d="M12 64 C12 48 22 42 32 42 C42 42 52 48 52 64 Z" fill={p.ink} />
    </svg>
  );
}

export function Avatar({ state, size = 56 }: { state: Reading; size?: number }) {
  const base: CSSProperties = { width: size, height: size, borderRadius: "50%", flex: "none", overflow: "hidden" };
  if (state === "UNCLEAR") {
    return <div style={{ ...base, background: "#3a3760", border: `2px dashed ${UNCLEAR_FILL}`, color: UNCLEAR_FILL,
      display: "grid", placeItems: "center", font: `800 ${size * 0.45}px ${FONT}` }}>?</div>;
  }
  const m = MASCOT[state];
  return <div style={{ ...base, background: m.tint, border: `3px solid ${m.fill}` }}>
    <img src={m.badge} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
  </div>;
}

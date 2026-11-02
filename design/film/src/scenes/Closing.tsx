// S8–S9: "See yourself / Connect" (donut → network), end card. S7 lives in River.tsx.
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, FONT, MASCOT, STATES, appMark } from "../brand";
import { Clip, M, RealTag, STAGE, type Seg } from "../Footage";
import { s } from "../story";
import { Line, Tag, ramp, window01 } from "../ui";

// The real My Reflection donut from the live take, 30 → 7 days, over seeded synthetic history.
const DONUT: Seg[] = [{ from: M.donut + 0.4, to: M.donut + 7.8, zoom: { s: 1.3, x: 640, y: 400 } }];

const RINGS = [
  { label: "family", n: 5, r: 230 },
  { label: "friends", n: 8, r: 400 },
  { label: "colleagues", n: 12, r: 580 },
];

export function World() {
  const f = useCurrentFrame();
  const shrink = ramp(f, s(7), 30);
  const net = f >= s(8);
  const reveal = (ring: number) => ramp(f, s(8.3) + ring * 30, 30);
  return (
    <AbsoluteFill style={{ background: shrink < 1 ? STAGE : C.night, fontFamily: FONT }}>
      {shrink < 1 && (
        <div style={{ position: "absolute", inset: 0, opacity: 1 - shrink, transform: `scale(${1 - shrink * 0.9})` }}>
          <Clip segs={DONUT} />
          <RealTag text="REAL APP · My Reflection · demo history (synthetic)" />
          <div style={{ position: "absolute", top: 930, width: "100%", textAlign: "center", font: `800 60px ${FONT}`, color: C.nightText, opacity: window01(f, 20, s(7), 12) }}>See yourself more clearly.</div>
        </div>
      )}
      {shrink > 0 && !net && <div style={{ position: "absolute", left: 960 - 20, top: 540 - 20, width: 40, height: 40, borderRadius: 20, background: "#fff",
        boxShadow: `0 0 ${60 * shrink}px ${30 * shrink}px ${C.primary}`, opacity: shrink }} />}
      {net && <Network f={f} reveal={reveal} />}
      {net && <Line opacity={window01(f, s(9.5), s(15) + 10, 14)} y={430} size={58}>Connect with others more consciously.</Line>}
      {net && <Tag kind="motion" />}
    </AbsoluteFill>
  );
}

function Network({ f, reveal }: { f: number; reveal: (ring: number) => number }) {
  // One shared slow rotation keeps each node near its parent, so the web reads as branching
  // outward; the small per-node wobble still lets a few threads cross.
  const spin = f / 1400;
  const nodes = RINGS.flatMap((ring, ri) => Array.from({ length: ring.n }, (_, i) => {
    const a = (i / ring.n) * Math.PI * 2 + spin + Math.sin(f / 40 + i * 1.7 + ri) * 0.05;
    return { ri, i, a, x: 960 + Math.cos(a) * ring.r * 1.25, y: 470 + Math.sin(a) * ring.r * 0.62, st: STATES[(i + ri * 2) % 5] };
  }));
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      {nodes.map((n, i) => {
        const prev = nodes.filter((m) => m.ri === n.ri - 1);
        const parent = n.ri === 0 ? { x: 960, y: 470 } : prev[Math.round((n.i / RINGS[n.ri].n) * prev.length) % prev.length];
        const o = reveal(n.ri);
        return <line key={"l" + i} x1={parent.x} y1={parent.y} x2={n.x} y2={n.y} stroke={MASCOT[n.st].fill} strokeOpacity={0.35 * o}
          strokeWidth={3} strokeDasharray="6 10" strokeDashoffset={-f / 2} />;
      })}
      {nodes.map((n, i) => {
        const o = reveal(n.ri);
        return <circle key={i} cx={n.x} cy={n.y} r={(14 - n.ri * 3) * (0.6 + 0.4 * o) + Math.sin(f / 12 + i) * 1.5} fill={MASCOT[n.st].fill} opacity={o} />;
      })}
      <circle cx={960} cy={470} r={22} fill="#fff" style={{ filter: `drop-shadow(0 0 24px ${C.primary})` }} />
      {RINGS.map((r, ri) => {
        const a = -Math.PI / 2 - 0.35 + ri * 0.12;
        return <text key={r.label} x={960 + Math.cos(a) * r.r * 1.25 + 24} y={470 + Math.sin(a) * r.r * 0.62 + 8} fill={C.nightMuted}
          opacity={reveal(ri) * 0.8} style={{ font: `700 28px ${FONT}` }}>{r.label}</text>;
      })}
    </svg>
  );
}

export function EndCard() {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: STAGE, fontFamily: FONT, alignItems: "center", justifyContent: "center", gap: 34, opacity: ramp(f, 0, 14) }}>
      {/* The logo file has a white matte, so on the night stage the mark and wordmark are set like the app header. */}
      <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
        <img src={appMark} style={{ width: 112, height: 112, borderRadius: 28 }} />
        <div style={{ font: `900 96px ${FONT}`, letterSpacing: -2, color: C.nightText }}>Inner<span style={{ color: "#a9a3ff" }}>Mirror</span></div>
      </div>
      <div style={{ font: `700 46px ${FONT}`, color: C.nightText }}>The world within us shapes the world between us.</div>
      <div style={{ padding: "22px 48px", borderRadius: 40, background: C.primary, color: "#fff", font: `800 38px ${FONT}`, opacity: ramp(f, 40, 12) }}>Try it with a chat you keep replaying</div>
      <div style={{ font: `800 42px ${FONT}`, letterSpacing: 0.5, color: "#a9a3ff", opacity: ramp(f, 55, 12) }}>innermirror-flame.vercel.app</div>
      <div style={{ position: "absolute", bottom: 40, font: `500 22px ${FONT}`, color: C.nightMuted, opacity: ramp(f, 70, 12) }}>
        Mirror's observations are hypotheses, not diagnoses. Runs on Meta's Muse Spark model.
      </div>
    </AbsoluteFill>
  );
}

// S2 + S3, "the storm": a 1:1 chat between two people with fixed avatars. Each person's
// octopus shows the state of their latest message, grows and leans in as the pace rises.
// Every message fires a small pulse at the other side, which recoils. Ends in BOOM.
// One component so the BOOM continues the escalation's exact state.
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { C, FONT, MASCOT, fillOf, type Reading } from "../brand";
import { BigMascot, type Beat } from "../BigMascot";
import { CHAT, HOOK_INDEX, s } from "../story";
import { PersonAvatar, Tag, clamp } from "../ui";

type Item = { who: "J" | "X"; text: string; state: Reading; at: number };

const ARRIVE = [0.6, 2.6, 4.4, 6.0, 7.5, 8.9, 10.2, 11.3, 12.3, 13.2, 14.0, 14.7];
export const BOOM = s(22);
const READABLE = 5;

function build(): Item[] {
  const items: Item[] = CHAT.slice(0, HOOK_INDEX).map((m, i) => ({ ...m, at: s(ARRIVE[i]) }));
  // Filler = the fight speeding up past the point of reading (illustrative, never read by Muse).
  // It continues the real pattern, Jordan in CP and Alex pulling back in AC, until Alex snaps
  // back and both end in CP, pointing at each other (Founder's approved climax).
  let t = 15.3, gap = 0.5, i = 0;
  while (t < 21.5) {
    const who = i % 2 ? "J" : "X";
    const state: Reading = who === "J" || t > 18.5 ? "CP" : "AC";
    items.push({ who, text: "x".repeat(10 + ((i * 7) % 24)), state, at: s(t) });
    t += gap; gap = Math.max(0.17, gap * 0.88); i++;
  }
  items.push({ ...CHAT[HOOK_INDEX], at: BOOM });
  return items;
}
export const ITEMS = build();

const ROW = 92;
const BOTTOM = 930;

export function Storm() {
  const f = useCurrentFrame();
  const raw = interpolate(f, [s(3), s(21.5)], [0, 1], clamp);
  const k = Math.pow(raw, 1.4);
  const slam = interpolate(f, [BOOM, BOOM + 6], [0, 1], clamp);
  const flash = interpolate(f, [BOOM + 5, BOOM + 7, BOOM + 24], [0, 1, 0], clamp);
  const shake = interpolate(f, [s(15), s(21.5), BOOM, BOOM + 6], [0, 5, 16, 0], clamp);
  const dx = Math.sin(f * 2.1) * shake, dy = Math.cos(f * 1.7) * shake;
  const shown = ITEMS.filter((m) => f >= m.at);
  const last = shown.length - 1;
  const recoil = (who: "J" | "X") => {
    let r = 0;
    for (const m of shown) if (m.who !== who) r += 22 * Math.exp(-Math.max(0, f - m.at - 9) / 5) * (f - m.at >= 9 ? 1 : 0);
    return Math.min(r, 40) * (who === "J" ? -1 : 1);
  };
  const size = 420 * (0.8 + 1.05 * k) * (1 + 0.2 * slam);
  const xJ = interpolate(slam, [0, 1], [300 + 230 * k * k, 790]) + recoil("J");
  const xX = interpolate(slam, [0, 1], [1620 - 230 * k * k, 1130]) + recoil("X");
  // The last line lands on the impact itself; it doesn't get a pose of its own (Muse read it as
  // Adapted Child, and the S6 footage shows that reading).
  const beats: Beat[] = ITEMS.filter((m) => m.at < BOOM);

  if (f > BOOM + 7) return <AbsoluteFill style={{ background: C.night }}><Typing f={f} /><Flash o={flash} /></AbsoluteFill>;

  return (
    <AbsoluteFill style={{ background: C.night, fontFamily: FONT }}>
      <div style={{ position: "absolute", inset: 0, transform: `translate(${dx}px, ${dy}px)` }}>
        <AbsoluteFill style={{ background: `radial-gradient(ellipse at center, transparent 40%, ${MASCOT.CP.fill}${Math.round(k * k * 70).toString(16).padStart(2, "0")} 100%)` }} />
        {shown.map((m, i) => {
          const age = f - m.at;
          const y = BOTTOM - (last - i) * ROW + interpolate(age, [0, 8], [36, 0], clamp);
          if (y < -ROW) return null;
          return <Bubble key={i} m={m} y={y} o={interpolate(age, [0, 5], [0, 1], clamp)} readable={i < READABLE} blur={i >= READABLE ? Math.min(6, (i - READABLE + 1) * 1.5) : 0} />;
        })}
        {/* Octopuses sit above the chat: as they grow they crowd out the words. */}
        <BigMascot beats={beats} who="J" f={f} x={xJ} y={560} size={size} calm={false} />
        <BigMascot beats={beats} who="X" f={f} x={xX} y={560} size={size} calm={false} />
        {slam > 0 && <div style={{ position: "absolute", left: 960 - 400 * slam, top: 540 - 400 * slam, width: 800 * slam, height: 800 * slam,
          borderRadius: "50%", border: `${12 * (1 - slam) + 4}px solid #fff`, opacity: 1 - slam * 0.4 }} />}
        {shown.slice(-6).map((m, i) => {
          const t = (f - m.at) / 9;
          if (t > 1) return null;
          const from = m.who === "J" ? xJ : xX, to = m.who === "J" ? xX : xJ;
          return <div key={m.at + "p" + i} style={{ position: "absolute", left: interpolate(t, [0, 1], [from, to]) - 16, top: 544, width: 32, height: 32,
            borderRadius: 16, background: fillOf(m.state), boxShadow: `0 0 24px 8px ${fillOf(m.state)}`, opacity: 1 - t * 0.3 }} />;
        })}
      </div>
      <Tag kind="motion" />
      <Flash o={flash} />
    </AbsoluteFill>
  );
}

function Bubble({ m, y, o, readable, blur }: { m: Item; y: number; o: number; readable: boolean; blur: number }) {
  const left = m.who === "J";
  return (
    <div style={{ position: "absolute", top: y, left: 560, width: 800, display: "flex", gap: 14, alignItems: "center", opacity: o,
      flexDirection: left ? "row" : "row-reverse" }}>
      <PersonAvatar who={m.who} size={60} />
      <div style={{ padding: "13px 22px", borderRadius: 24, maxWidth: 600, whiteSpace: "nowrap", overflow: "hidden",
        background: left ? "#2a2748" : "#3a3570", color: C.nightText, font: `600 28px/1.25 ${FONT}`, filter: blur ? `blur(${blur}px)` : undefined }}>
        {readable ? m.text : <span style={{ display: "inline-block", width: Math.min(420, 40 + m.text.length * 11), height: 20, borderRadius: 10, background: "#8a85b8" }} />}
      </div>
    </div>
  );
}

function Typing({ f }: { f: number }) {
  if (f < BOOM + 60 || f > BOOM + 130) return null;
  return (
    <div style={{ position: "absolute", left: 640, top: 500, padding: "20px 28px", borderRadius: 30, background: "#1d1a36", display: "flex", gap: 12 }}>
      {[0, 1, 2].map((d) => <span key={d} style={{ width: 16, height: 16, borderRadius: 8, background: C.nightMuted,
        opacity: 0.3 + 0.7 * Math.max(0, Math.sin((f - d * 5) / 6)) }} />)}
    </div>
  );
}

const Flash = ({ o }: { o: number }) => (o > 0 ? <AbsoluteFill style={{ background: "#fff", opacity: o }} /> : null);

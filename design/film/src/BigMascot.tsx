// One large octopus per person, standing at their side of the chat and facing the other.
// It shows the state of that person's latest message: a new state cross-fades in with a
// small pop (storm) or a slow dissolve (river). Mascots illustrate a message, not a person.
import { interpolate } from "remotion";
import { MASCOT, type Reading, type State } from "./brand";
import { clamp } from "./ui";

export type Beat = { who: "J" | "X"; state: Reading; at: number };

/** States this side has shown so far, newest last, UNCLEAR skipped (the octopus keeps its last state). */
function history(beats: Beat[], who: "J" | "X", f: number) {
  return beats.filter((b) => b.who === who && b.at <= f && b.state !== "UNCLEAR") as (Beat & { state: State })[];
}

export function BigMascot({ beats, who, f, x, y, size, calm }: {
  beats: Beat[]; who: "J" | "X"; f: number; x: number; y: number; size: number; calm: boolean;
}) {
  const h = history(beats, who, f);
  if (!h.length) return null;
  const cur = h[h.length - 1];
  const prev = h.length > 1 ? h[h.length - 2] : null;
  const fadeLen = calm ? 24 : 6;
  const t = f - cur.at;
  const inO = interpolate(t, [0, fadeLen], [0, 1], clamp);
  const pop = calm ? 1 : interpolate(t, [0, 5, 12], [0.86, 1.1, 1], clamp);
  // Images face the viewer's right; the right-hand person is mirrored so both face the middle.
  const flip = who === "X" ? -1 : 1;
  const layer = (st: State, o: number, s: number) => (
    <img key={st + o} src={MASCOT[st].full} style={{
      position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size, opacity: o,
      transform: `scaleX(${flip}) scale(${s})`, filter: calm ? undefined : `drop-shadow(0 0 ${30 * o}px ${MASCOT[st].fill}66)`,
    }} />
  );
  return <>
    {prev && inO < 1 && prev.state !== cur.state && layer(prev.state, 1 - inO, 1)}
    {layer(cur.state, prev?.state === cur.state ? 1 : inO, pop)}
  </>;
}

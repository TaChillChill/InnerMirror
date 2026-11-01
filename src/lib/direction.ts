// Conversation Direction v1 (Founder N1/N2, 2026-11-01): a fixed, reviewed table, the same
// for every conversation. Each goal lists at most two ego states that fit it, in no rank
// order; nothing is personalised or computed from the conversation. The wording of each
// suggestion lives in the i18n dictionaries (direction.*) and describes what the state
// does, never an outcome.
import type { ExKey } from "./i18n/index.ts";

export const GOALS = ["understand", "solve", "calm", "boundary", "pause"] as const;
export type Goal = (typeof GOALS)[number];

// States are picked for fit, not spread evenly across the five (N1). Adapted Child is not
// listed for "calm": yielding as a suggested step reads as advice to give in (§7.3).
export const DIRECTION: Record<Goal, readonly ExKey[]> = {
  understand: ["a", "fc"],
  solve: ["a", "np"],
  calm: ["np", "a"],
  boundary: ["a", "cp"],
  pause: ["a", "np"],
};

type Msg = { id: string; speakerId: string };

/**
 * Where "Try this direction" opens What if?: my latest turn that someone answered (v1 works
 * on messages that already happened, N2). `anchors` are the segment anchors in order.
 */
export function directionTarget(messages: Msg[], anchors: string[], selfId: string | null): string | null {
  if (!selfId) return null;
  const at = (id: string) => messages.findIndex((m) => m.id === id);
  const answered = anchors.filter((id) => {
    const i = at(id);
    return i >= 0 && messages[i].speakerId === selfId && messages.slice(i + 1).some((m) => m.speakerId !== selfId);
  });
  return answered.at(-1) ?? null;
}

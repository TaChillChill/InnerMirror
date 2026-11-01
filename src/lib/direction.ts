// Conversation Direction (Founder N1/N2, 2026-11-01; reference only since UAT #09/#10): a fixed, reviewed table, the same
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

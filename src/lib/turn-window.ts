// Analysis looks at most at 40 turns (Founder, 2026-11-02). Measured live: about 1.1–1.6 s and
// 250 output tokens per turn, so 40 turns stay well inside the route's 110 s budget and the
// 16k-token output cap; ~60 would not. A longer conversation is never cut by the app: the user
// chooses which 40 turns to look at, and the rest stays in the transcript, untouched.
import { groupTurns } from "./ai/analysis-spec.ts";
import type { Transcript } from "./conversation.ts";

export const MAX_TURNS = 40;

type Msg = { id: string; speakerId: string; text: string };
/** A window the user can choose; turn numbers are 1-based, as shown. */
export type TurnPart = { from: number; to: number; firstId: string };

export const turnCount = (messages: Msg[]) => groupTurns(messages).length;

/** Every possible 40-turn window, in order. Empty when the whole conversation fits. */
export function partOptions(messages: Msg[]): TurnPart[] {
  const turns = groupTurns(messages);
  if (turns.length <= MAX_TURNS) return [];
  return turns.slice(0, turns.length - MAX_TURNS + 1).map((t, i) => ({ from: i + 1, to: i + MAX_TURNS, firstId: t.messageIds[0] }));
}

/**
 * What gets analyzed: the whole transcript when it fits, else the 40 turns starting at the
 * turn whose first message is `firstId`. null when a part is needed and none (or one that no
 * longer exists after an edit) is chosen.
 */
export function windowOf(t: Transcript, firstId: string | null): Transcript | null {
  const turns = groupTurns(t.messages);
  if (turns.length <= MAX_TURNS) return t;
  const start = turns.findIndex((x) => x.messageIds[0] === firstId);
  if (start < 0 || start > turns.length - MAX_TURNS) return null;
  const ids = new Set(turns.slice(start, start + MAX_TURNS).flatMap((x) => x.messageIds));
  return { ...t, messages: t.messages.filter((m) => ids.has(m.id)) };
}

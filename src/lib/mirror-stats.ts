// Counts behind the saved-conversation cards and the Personal Mirror. Rules (Founder N6,
// 2026-11-01): my choice wins; otherwise Mirror's suggestion counts, marked as Mirror's;
// Mirror's "unclear" and my own "not sure" are counted apart and never enter the five-state
// percentages. Pure functions over the saved v1 collections, so no migration is needed.
import type { Collection } from "./mirror-store.ts";

export const STATES = ["cp", "np", "a", "fc", "ac"] as const;
export type State = (typeof STATES)[number];

/** Per state: turns I chose myself, and turns where Mirror's suggestion stands. */
export type Counts = { byState: Record<State, { mine: number; mirror: number }>; unclear: number; unsure: number; turns: number };

const empty = (): Counts => ({ byState: Object.fromEntries(STATES.map((s) => [s, { mine: 0, mirror: 0 }])) as Counts["byState"], unclear: 0, unsure: 0, turns: 0 });

export function countsOf(collections: Pick<Collection, "mine">[]): Counts {
  const out = empty();
  for (const c of collections) for (const m of c.mine) {
    out.turns++;
    if (m.chosen === "unsure") out.unsure++;
    else if (m.chosen) out.byState[m.chosen].mine++;
    else if (m.ai === "UNCLEAR") out.unclear++;
    else out.byState[m.ai].mirror++;
  }
  return out;
}

export const totalOf = (c: Counts, s: State) => c.byState[s].mine + c.byState[s].mirror;
/** Turns that carry one of the five states: the denominator for percentages. */
export const stateTurns = (c: Counts) => STATES.reduce((n, s) => n + totalOf(c, s), 0);

/** Whole percentages that always add up to 100 (largest remainder); all 0 when there is nothing to divide. */
export function percentages(c: Counts): Record<State, number> {
  const n = stateTurns(c);
  const out = Object.fromEntries(STATES.map((s) => [s, 0])) as Record<State, number>;
  if (!n) return out;
  const exact = STATES.map((s) => (totalOf(c, s) / n) * 100);
  STATES.forEach((s, i) => { out[s] = Math.floor(exact[i]); });
  let left = 100 - STATES.reduce((a, s) => a + out[s], 0);
  for (const i of exact.map((v, i) => [v - Math.floor(v), i] as const).sort((a, b) => b[0] - a[0]).map(([, i]) => i)) {
    if (left-- <= 0) break;
    out[STATES[i]]++;
  }
  return out;
}

/**
 * The most frequent states, for one neutral sentence. Several on a tie, none when no state
 * appears. Says how often a state appeared in these turns, never what the person is like.
 */
export function mostFrequent(c: Counts): State[] {
  const max = Math.max(0, ...STATES.map((s) => totalOf(c, s)));
  return max ? STATES.filter((s) => totalOf(c, s) === max) : [];
}

/** Below this, the summary says there is too little to see a pattern. */
export const isThin = (c: Counts, conversations: number) => stateTurns(c) < 10 || conversations < 3;

/** Saved conversations oldest first: the order of the timeline. */
export const chronological = (list: Collection[]) => [...list].sort((a, b) => a.createdAt.localeCompare(b.createdAt));

/** Index range [lo, hi] into the chronological list for "the last N days" (null = all). Empty when lo > hi. */
export function windowRange(oldestFirst: Pick<Collection, "createdAt">[], days: number | null, now: Date): [number, number] {
  const hi = oldestFirst.length - 1;
  if (days === null) return [0, hi];
  const since = now.getTime() - days * 86_400_000;
  const lo = oldestFirst.findIndex((c) => new Date(c.createdAt).getTime() >= since);
  return [lo < 0 ? oldestFirst.length : lo, hi];
}

/** Untitled conversations are named by save order: the oldest is #1. */
export function defaultNumber(list: Collection[], id: string): number {
  return chronological(list).findIndex((c) => c.id === id) + 1;
}

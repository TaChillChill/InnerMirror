// The state cloud's layout (Founder UAT #11): one compact row. The most frequent state is the
// largest, in the middle and in front; the others alternate right and left, smaller and further
// back, with only a slight overlap. Ties keep the fixed CP→NP→A→FC→AC order. Counts are
// taken as given (mirror-stats); this file only decides size and place.
import { STATES, totalOf, type Counts, type State } from "./mirror-stats.ts";

export const MAX_D = 34; // largest diameter, % of the cloud's width
export const OVERLAP = 3; // how far each neighbour tucks behind, % of the width
export const FIT = 96; // the row never gets wider than this, % of the width

/** Ranks most frequent first, then places them middle, right, left, right, left. */
export function cloudLayout(counts: Counts): { state: State; n: number; rank: number; d: number }[] {
  const ranked = STATES.filter((s) => totalOf(counts, s) > 0).sort((x, y) => totalOf(counts, y) - totalOf(counts, x));
  if (!ranked.length) return [];
  const max = totalOf(counts, ranked[0]);
  // Area grows with the count; the smallest is still at least half the largest's diameter.
  const raw = ranked.map((s) => 0.5 + 0.5 * Math.sqrt(totalOf(counts, s) / max));
  const width = raw.reduce((sum, r) => sum + r * MAX_D, 0) - OVERLAP * (ranked.length - 1);
  const scale = Math.min(1, (FIT + OVERLAP * (ranked.length - 1)) / (width + OVERLAP * (ranked.length - 1)));
  const items = ranked.map((state, rank) => ({ state, n: totalOf(counts, state), rank, d: Math.round(raw[rank] * MAX_D * scale * 10) / 10 }));
  // Left side from the outside in (ranks 4, 2), the top state, then the right side (1, 3).
  return [...items.filter((x) => x.rank % 2 === 0 && x.rank > 0).reverse(), items[0], ...items.filter((x) => x.rank % 2 === 1)];
}


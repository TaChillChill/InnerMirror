import { test } from "node:test";
import assert from "node:assert/strict";
import { cloudLayout, FIT, OVERLAP } from "./cloud-layout.ts";
import { STATES, type Counts, type State } from "./mirror-stats.ts";

const counts = (n: Partial<Record<State, number>>): Counts => ({
  byState: Object.fromEntries(STATES.map((s) => [s, { mine: n[s] ?? 0, mirror: 0 }])) as Counts["byState"],
  unclear: 0, unsure: 0, turns: 0,
});
const width = (row: { d: number }[]) => row.reduce((w, x) => w + x.d, 0) - OVERLAP * (row.length - 1);

test("the most frequent state is largest and in the middle; the rest alternate right, left (UAT #11)", () => {
  const row = cloudLayout(counts({ a: 5, np: 3, fc: 2, cp: 1, ac: 1 }));
  assert.deepEqual(row.map((x) => x.state), ["ac", "fc", "a", "np", "cp"], "ranks 4, 2 | 0 | 1, 3");
  assert.equal(row[2].rank, 0);
  const byRank = [...row].sort((x, y) => x.rank - y.rank);
  for (let i = 1; i < byRank.length; i++) assert.ok(byRank[i].d <= byRank[i - 1].d, `rank ${i} not smaller`);
  assert.ok(width(row) <= FIT + 0.5, `row ${width(row)}`);
});

test("counts are shown as given and absent states are left out", () => {
  const row = cloudLayout(counts({ fc: 4, ac: 2 }));
  assert.deepEqual(row.map((x) => [x.state, x.n]), [["fc", 4], ["ac", 2]]);
  assert.deepEqual(cloudLayout(counts({})), []);
});

test("equal counts get equal sizes and still fit one row", () => {
  const row = cloudLayout(counts({ cp: 2, np: 2, a: 2, fc: 2, ac: 2 }));
  assert.equal(new Set(row.map((x) => x.d)).size, 1);
  assert.ok(width(row) <= FIT + 0.5);
  assert.equal(row.find((x) => x.rank === 0)?.state, "cp", "ties keep the fixed order");
});

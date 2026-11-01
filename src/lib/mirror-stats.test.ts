import { test } from "node:test";
import assert from "node:assert/strict";
import { chronological, countsOf, defaultNumber, isThin, mostFrequent, percentages, stateTurns, totalOf, windowRange } from "./mirror-stats.ts";
import type { Collection, MineEntry } from "./mirror-store.ts";

const e = (ai: MineEntry["ai"], chosen: MineEntry["chosen"] = null): MineEntry => ({ order: 0, ai, chosen });
const coll = (id: string, createdAt: string, mine: MineEntry[], title = ""): Collection => ({ v: 1, id, createdAt, lang: "vi", title, note: "", mine });

test("my choice wins, Mirror's suggestion is the default, and each is counted as its own source", () => {
  const c = countsOf([{ mine: [e("cp", "a"), e("a"), e("a", "a"), e("np")] }]);
  assert.deepEqual(c.byState.a, { mine: 2, mirror: 1 });
  assert.deepEqual(c.byState.cp, { mine: 0, mirror: 0 }, "an overridden suggestion is not counted");
  assert.deepEqual(c.byState.np, { mine: 0, mirror: 1 });
  assert.equal(c.turns, 4);
});

test("Mirror's unclear and my 'not sure' are counted apart and stay out of the percentages", () => {
  const c = countsOf([{ mine: [e("UNCLEAR"), e("UNCLEAR", "fc"), e("a", "unsure"), e("a")] }]);
  assert.equal(c.unclear, 1);
  assert.equal(c.unsure, 1);
  assert.equal(totalOf(c, "fc"), 1, "a state I chose over Mirror's unclear counts as mine");
  assert.equal(stateTurns(c), 2);
  assert.deepEqual(percentages(c), { cp: 0, np: 0, a: 50, fc: 50, ac: 0 });
});

test("percentages always add up to 100, and are all 0 with no state turns", () => {
  const c = countsOf([{ mine: [e("cp"), e("np"), e("a")] }]);
  const p = percentages(c);
  assert.equal(Object.values(p).reduce((a, b) => a + b, 0), 100);
  assert.deepEqual(percentages(countsOf([{ mine: [e("UNCLEAR")] }])), { cp: 0, np: 0, a: 0, fc: 0, ac: 0 });
});

test("most frequent reports ties and nothing when empty", () => {
  assert.deepEqual(mostFrequent(countsOf([{ mine: [e("a"), e("ac"), e("a"), e("ac")] }])), ["a", "ac"]);
  assert.deepEqual(mostFrequent(countsOf([])), []);
});

test("little data is flagged as thin", () => {
  assert.equal(isThin(countsOf([{ mine: [e("a"), e("a")] }]), 1), true);
  assert.equal(isThin(countsOf([{ mine: Array(12).fill(e("a")) }]), 3), false);
});

test("time window picks saved conversations by date, oldest first", () => {
  const list = chronological([coll("c", "2026-10-30T10:00:00Z", []), coll("a", "2026-10-02T10:00:00Z", []), coll("b", "2026-10-27T10:00:00Z", [])]);
  assert.deepEqual(list.map((c) => c.id), ["a", "b", "c"]);
  const now = new Date("2026-11-01T12:00:00Z");
  assert.deepEqual(windowRange(list, 7, now), [1, 2]);
  assert.deepEqual(windowRange(list, null, now), [0, 2]);
  const [lo, hi] = windowRange(list, 1, now);
  assert.ok(lo > hi, "nothing in the last day");
});

test("untitled conversations are numbered by save order", () => {
  const list = [coll("new", "2026-10-30T10:00:00Z", []), coll("old", "2026-10-02T10:00:00Z", [])];
  assert.equal(defaultNumber(list, "old"), 1);
  assert.equal(defaultNumber(list, "new"), 2);
});

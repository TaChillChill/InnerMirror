import { test } from "node:test";
import assert from "node:assert/strict";
import { shownOf, tallyOf, type MineEntry } from "./mirror-store.ts";

const e = (ai: MineEntry["ai"], chosen: MineEntry["chosen"], order = 0): MineEntry => ({ order, ai, chosen });

test("my choice wins over Mirror's suggestion", () => {
  assert.equal(shownOf(e("cp", "a")), "a");
  assert.equal(shownOf(e("cp", "unsure")), "unsure");
});

test("Mirror's suggestion is the default when I didn't choose", () => {
  assert.equal(shownOf(e("np", null)), "np");
});

test("Mirror's unclear is never counted as my 'not sure' or forced into a state", () => {
  const t = tallyOf([e("UNCLEAR", null, 0), e("a", "unsure", 1), e("UNCLEAR", "fc", 2), e("a", null, 3)]);
  assert.deepEqual(t, { unclear: 1, unsure: 1, fc: 1, a: 1 });
});

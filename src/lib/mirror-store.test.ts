import { test } from "node:test";
import assert from "node:assert/strict";
import { shownOf, type MineEntry } from "./mirror-store.ts";

const e = (ai: MineEntry["ai"], chosen: MineEntry["chosen"], order = 0): MineEntry => ({ order, ai, chosen });

test("my choice wins over Mirror's suggestion", () => {
  assert.equal(shownOf(e("cp", "a")), "a");
  assert.equal(shownOf(e("cp", "unsure")), "unsure");
});

test("Mirror's suggestion is the default when I didn't choose", () => {
  assert.equal(shownOf(e("np", null)), "np");
});

test("Mirror's unclear stays its own bucket, apart from my 'not sure'", () => {
  assert.equal(shownOf(e("UNCLEAR", null)), "unclear");
  assert.equal(shownOf(e("UNCLEAR", "unsure")), "unsure");
});

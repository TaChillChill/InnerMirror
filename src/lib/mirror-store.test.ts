import { test } from "node:test";
import assert from "node:assert/strict";
import { makeCollection, newCollectionId, shownOf, type MineEntry } from "./mirror-store.ts";

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

test("a collection id is made without crypto.randomUUID (plain-HTTP LAN origin, UAT batch 2 #04)", () => {
  const original = Object.getOwnPropertyDescriptor(globalThis.crypto, "randomUUID");
  Object.defineProperty(globalThis.crypto, "randomUUID", { value: undefined, configurable: true });
  try {
    const ids = new Set(Array.from({ length: 50 }, () => newCollectionId()));
    assert.equal(ids.size, 50);
    for (const id of ids) assert.match(id, /^[0-9a-f]{32}$/);
    assert.match(makeCollection("vi", "t", "", []).id, /^[0-9a-f]{32}$/);
  } finally {
    if (original) Object.defineProperty(globalThis.crypto, "randomUUID", original);
    else delete (globalThis.crypto as { randomUUID?: unknown }).randomUUID;
  }
  assert.equal(typeof crypto.randomUUID, "function");
});

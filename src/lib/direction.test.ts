import { test } from "node:test";
import assert from "node:assert/strict";
import { DIRECTION, GOALS } from "./direction.ts";
import { en } from "./i18n/en.ts";
import { vi } from "./i18n/vi.ts";

test("each goal suggests one or two different states, and every suggestion has wording in both languages", () => {
  for (const g of GOALS) {
    const states = DIRECTION[g];
    assert.ok(states.length >= 1 && states.length <= 2, g);
    assert.equal(new Set(states).size, states.length, g);
    for (const d of [en, vi]) {
      assert.ok(d.direction.goals[g].length > 3, g);
      for (const s of states) assert.ok((d.direction.actions[g] as Record<string, string>)[s]?.length > 10, `${g} ${s}`);
    }
  }
});

test("suggestions describe actions, never outcomes, rankings or personal claims (N1)", () => {
  const banned = [/sẽ giúp/i, /tốt hơn/i, /tốt nhất/i, /nên\b/i, /\bwill\b/i, /better/i, /\bbest\b/i, /\bshould\b/i, /for you\b/i, /dành cho bạn/i];
  for (const d of [en, vi]) {
    const text = JSON.stringify(d.direction.actions) + d.direction.suggestTitle + d.direction.reference;
    for (const b of banned) assert.ok(!b.test(text), `${b} in ${text}`);
  }
});

test("Direction is reference only: no try, pick or hide wording left (UAT #09/#10)", () => {
  for (const d of [en, vi]) {
    const keys = Object.keys(d.direction);
    for (const gone of ["tryIt", "chooseOther", "hideOther", "pickState", "needSelf"]) assert.ok(!keys.includes(gone), gone);
    assert.ok(d.direction.reference.length > 20);
  }
  assert.match(vi.direction.reference, /Bạn vẫn là người quyết định điều mình muốn làm tiếp theo/);
});

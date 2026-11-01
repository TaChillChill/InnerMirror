import { test } from "node:test";
import assert from "node:assert/strict";
import { DIRECTION, GOALS, directionTarget } from "./direction.ts";
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
    const text = JSON.stringify(d.direction.actions) + d.direction.suggestTitle;
    for (const b of banned) assert.ok(!b.test(text), `${b} in ${text}`);
  }
});

test("the direction target is my latest turn that someone answered", () => {
  const msgs = [
    { id: "m1", speakerId: "me" }, { id: "m2", speakerId: "x" },
    { id: "m3", speakerId: "me" }, { id: "m4", speakerId: "x" },
    { id: "m5", speakerId: "me" },
  ];
  const anchors = ["m1", "m2", "m3", "m4", "m5"];
  assert.equal(directionTarget(msgs, anchors, "me"), "m3", "m5 has no reply yet");
  assert.equal(directionTarget(msgs, anchors, null), null);
  assert.equal(directionTarget(msgs.slice(0, 1), ["m1"], "me"), null);
});

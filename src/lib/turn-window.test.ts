import { test } from "node:test";
import assert from "node:assert/strict";
import { MAX_TURNS, partOptions, turnCount, windowOf } from "./turn-window.ts";
import type { Transcript } from "./conversation.ts";

// n turns; every third turn is two messages from the same person (still one turn).
const chat = (n: number): Transcript => {
  const messages = [];
  for (let i = 0; i < n; i++) {
    const speakerId = i % 2 ? "p2" : "p1";
    messages.push({ id: `m${i}a`, speakerId, text: `turn ${i + 1}` });
    if (i % 3 === 0) messages.push({ id: `m${i}b`, speakerId, text: `turn ${i + 1}, again` });
  }
  return { source: "paste", participants: [{ id: "p1", name: "A" }, { id: "p2", name: "B" }], messages };
};

test("a conversation of up to 40 turns is analyzed whole, with nothing to choose", () => {
  const t = chat(MAX_TURNS);
  assert.equal(turnCount(t.messages), 40);
  assert.deepEqual(partOptions(t.messages), []);
  assert.equal(windowOf(t, null), t);
});

test("over 40 turns: no part is picked for the user", () => {
  const t = chat(55);
  assert.equal(windowOf(t, null), null);
  const opts = partOptions(t.messages);
  assert.equal(opts.length, 16);
  assert.deepEqual(opts[0], { from: 1, to: 40, firstId: "m0a" });
  assert.deepEqual(opts.at(-1), { from: 16, to: 55, firstId: "m15a" });
});

test("a chosen part is exactly 40 whole turns, in order, and the transcript itself is untouched", () => {
  const t = chat(55);
  const before = JSON.stringify(t);
  const part = windowOf(t, "m15a");
  assert.ok(part);
  assert.equal(turnCount(part.messages), 40);
  assert.equal(part.messages[0].id, "m15a");
  assert.equal(part.messages.at(-1)?.id, "m54b"); // turn 55 is two messages
  // Two-message turns stay together.
  assert.ok(part.messages.some((m) => m.id === "m15b"));
  assert.equal(JSON.stringify(t), before);
});

test("a start that no longer exists (or no longer leaves 40 turns) asks again instead of guessing", () => {
  const t = chat(55);
  assert.equal(windowOf(t, "m0b"), null); // not the first message of a turn
  assert.equal(windowOf(t, "gone"), null);
  assert.equal(windowOf(t, "m20a"), null); // only 35 turns would follow
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { cleanExtraction, toTranscript } from "./extraction.ts";

const base = (extra = {}) => ({
  speakers: [{ key: "S1", displayedName: "Linh", side: "left" }, { key: "S2", displayedName: null, side: "right" }],
  messages: [
    { speaker: "S1", text: "Why are the dishes still here?", legibility: "clear" },
    { speaker: "S2", text: "Sorry, doing them now", legibility: "clear" },
  ],
  notes: [],
  ...extra,
});
const fb = { me: "Me", unknown: "Unknown", other: (n: number) => (n === 1 ? "Other person" : `Other person ${n}`) };

test("rejects output that doesn't fit the schema", () => {
  assert.equal(cleanExtraction({ speakers: [], messages: [{ speaker: "S1" }], notes: [] }), null);
  assert.equal(cleanExtraction(base({ notes: ["made_up_code"] })), null);
});

test("a message from an undeclared speaker becomes an unknown speaker, flagged, never guessed", () => {
  const e = cleanExtraction(base({ messages: [{ speaker: "S9", text: "hi", legibility: "clear" }] }))!;
  assert.equal(e.messages[0].speaker, "S?");
  assert.ok(e.notes.includes("speaker_unclear"));
  const t = toTranscript(e, fb);
  assert.equal(t.participants[0].name, "Unknown");
});

test("empty text can never be 'clear'; over-long text is cut and marked partial", () => {
  const e = cleanExtraction(base({ messages: [{ speaker: "S1", text: "  ", legibility: "clear" }, { speaker: "S2", text: "x".repeat(2500), legibility: "clear" }] }))!;
  assert.equal(e.messages[0].legibility, "unreadable");
  assert.equal(e.messages[1].text.length, 2000);
  assert.equal(e.messages[1].legibility, "partial");
});

test("no messages means 'not a chat'", () => {
  assert.ok(cleanExtraction(base({ messages: [] }))!.notes.includes("not_a_chat"));
});

test("transcript keeps order, legibility and source; the user's identity is left unset", () => {
  const t = toTranscript(cleanExtraction(base({ messages: [
    { speaker: "S1", text: "first", legibility: "partial" }, { speaker: "S2", text: "second", legibility: "clear" }, { speaker: "S1", text: "third", legibility: "clear" },
  ] }))!, fb);
  assert.equal(t.source, "screenshot");
  assert.deepEqual(t.messages.map((m) => m.text), ["first", "second", "third"]);
  assert.equal(t.messages[0].legibility, "partial");
  // Name seen in the image is kept; a nameless right-side sender gets the neutral "Me" placeholder.
  assert.deepEqual(t.participants.map((p) => p.name), ["Linh", "Me"]);
  assert.equal(t.messages[1].speakerId, "p2");
});

test("speakers with no messages are dropped", () => {
  const t = toTranscript(cleanExtraction(base({ messages: [{ speaker: "S1", text: "solo", legibility: "clear" }] }))!, fb);
  assert.equal(t.participants.length, 1);
});

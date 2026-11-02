import { test } from "node:test";
import assert from "node:assert/strict";
import { chunkImages, mergeExtractions, overlapAt, partRange } from "./shot-batches.ts";
import type { Extraction } from "./ai/extraction.ts";

type L = "clear" | "partial" | "unreadable";
const msg = (speaker: string, text: string, legibility: L = "clear") => ({ speaker, text, legibility });
const duo = (messages: Extraction["messages"], notes: Extraction["notes"] = [], names: [string | null, string | null] = ["Jordan", null]): Extraction => ({
  speakers: [{ key: "S1", displayedName: names[0], side: "left" }, { key: "S2", displayedName: names[1], side: "right" }],
  messages, notes,
});

test("parts are fixed groups of 3, oldest first", () => {
  const ids = (n: number) => Array.from({ length: n }, (_, i) => i + 1);
  assert.deepEqual(chunkImages(ids(1)), [[1]]);
  assert.deepEqual(chunkImages(ids(3)), [[1, 2, 3]]);
  assert.deepEqual(chunkImages(ids(5)), [[1, 2, 3], [4, 5]]);
  assert.deepEqual(chunkImages(ids(10)).map((c) => c.length), [3, 3, 3, 1]);
  // Adding at the end keeps earlier parts (and their cached reads) the same.
  assert.deepEqual(chunkImages(ids(7)).slice(0, 2), chunkImages(ids(10)).slice(0, 2));
  assert.equal(partRange(1, 3), "4–6");
  assert.equal(partRange(3, 1), "10");
});

test("one part passes through unchanged", () => {
  const one = duo([msg("S1", "dinner at 7?"), msg("S2", "yes")], ["cropped_top"]);
  assert.deepEqual(mergeExtractions([one]), one);
});

test("parts join in order; the overlap at the seam is listed once", () => {
  const a = duo([msg("S1", "dinner at 7 still?"), msg("S2", "yesss 100%"), msg("S2", "ugh meeting ran over")]);
  const b = duo([msg("S2", "yesss 100%"), msg("S2", "ugh meeting ran over"), msg("S1", "k")]);
  const out = mergeExtractions([a, b]);
  assert.deepEqual(out.messages.map((m) => m.text), ["dinner at 7 still?", "yesss 100%", "ugh meeting ran over", "k"]);
  assert.ok(out.notes.includes("overlap_merged"));
});

test("a short reply repeated at the seam is kept: it may really have been sent twice", () => {
  const a = duo([msg("S1", "where are you"), msg("S2", "ok")]);
  const b = duo([msg("S2", "ok"), msg("S1", "fine")]);
  assert.equal(mergeExtractions([a, b]).messages.length, 4);
  // Two short ones in a row are enough evidence of an overlap.
  const c = duo([msg("S1", "k"), msg("S2", "ok")]);
  const d = duo([msg("S1", "k"), msg("S2", "ok"), msg("S1", "bye")]);
  assert.equal(mergeExtractions([c, d]).messages.length, 3);
});

test("the same words from different people are not merged", () => {
  const a = duo([msg("S1", "I'm tired of this")]);
  const b = duo([msg("S2", "I'm tired of this")]);
  assert.equal(mergeExtractions([a, b]).messages.length, 2);
});

test("a bubble cut at the edge merges with its full version, keeping the full text", () => {
  const a = duo([msg("S1", "hello there"), msg("S2", "it means i'm tired of alw", "partial")], ["cropped_bottom"]);
  const b = duo([msg("S2", "it means i'm tired of always being the one who waits"), msg("S1", "then eat at the office")], ["cropped_top"]);
  const out = mergeExtractions([a, b]);
  assert.deepEqual(out.messages.map((m) => [m.text, m.legibility]), [
    ["hello there", "clear"], ["it means i'm tired of always being the one who waits", "clear"], ["then eat at the office", "clear"],
  ]);
  // Inner crops are covered by the next part; only the outer edges stay as notes.
  assert.ok(!out.notes.includes("cropped_bottom") && !out.notes.includes("cropped_top"));
});

test("Vietnamese text matches across Unicode forms and spacing", () => {
  const nfd = "Con ăn rồi mẹ ạ".normalize("NFD");
  const a = duo([msg("S1", "Con ăn cơm chưa?"), msg("S2", "Con ăn rồi mẹ ạ")], [], ["Mẹ", null]);
  const b = duo([msg("S2", `${nfd}  `), msg("S1", "Ừ, nhớ ngủ sớm")], [], ["Mẹ", null]);
  assert.equal(mergeExtractions([a, b]).messages.length, 3);
});

test("speakers line up across parts by name, then by side; keys stay in first-seen order", () => {
  const a = duo([msg("S1", "hi"), msg("S2", "hey")], [], ["Jordan", null]);
  // The second part saw the sides the other way round in its keys, and a name for the right side.
  const b: Extraction = {
    speakers: [{ key: "S1", displayedName: "Alex", side: "right" }, { key: "S2", displayedName: null, side: "left" }],
    messages: [msg("S1", "on my way now"), msg("S2", "great, see you soon")], notes: [],
  };
  const out = mergeExtractions([a, b]);
  assert.deepEqual(out.speakers, [{ key: "S1", displayedName: "Jordan", side: "left" }, { key: "S2", displayedName: "Alex", side: "right" }]);
  assert.deepEqual(out.messages.map((m) => m.speaker), ["S1", "S2", "S2", "S1"]);
});

test("in a group, a nameless sender on a shared side is left unclear, not guessed", () => {
  const a: Extraction = {
    speakers: [{ key: "S1", displayedName: "Mai", side: "left" }, { key: "S2", displayedName: "Lan", side: "left" }, { key: "S3", displayedName: null, side: "right" }],
    messages: [msg("S1", "ai đi không"), msg("S2", "mình đi"), msg("S3", "đi chứ")], notes: [],
  };
  const b: Extraction = { speakers: [{ key: "S1", displayedName: null, side: "left" }], messages: [msg("S1", "vậy 7h nhé mọi người")], notes: [] };
  const out = mergeExtractions([a, b]);
  assert.equal(out.messages[3].speaker, "S?");
  assert.ok(out.notes.includes("speaker_unclear"));
  assert.ok(out.speakers.some((s) => s.key === "S?"));
});

test("ten parts of one long chat with overlaps come back whole and in order", () => {
  const all = Array.from({ length: 60 }, (_, i) => msg(i % 2 ? "S2" : "S1", `message number ${i + 1}`));
  // Each part shows 8 messages and repeats the last 2 of the one before.
  const parts = Array.from({ length: 10 }, (_, p) => duo(all.slice(Math.max(0, p * 6 - 2), p * 6 + 6)));
  const out = mergeExtractions(parts);
  assert.deepEqual(out.messages.map((m) => m.text), all.map((m) => m.text));
});

test("a part with no chat adds nothing and doesn't mark the whole read as 'not a chat'", () => {
  const a = duo([msg("S1", "first message here"), msg("S2", "second one")]);
  const empty: Extraction = { speakers: [], messages: [], notes: ["not_a_chat"] };
  const out = mergeExtractions([a, empty]);
  assert.equal(out.messages.length, 2);
  assert.ok(!out.notes.includes("not_a_chat"));
  assert.ok(mergeExtractions([empty, empty]).notes.includes("not_a_chat"));
});

test("overlapAt ignores an unreadable bubble on its own", () => {
  assert.equal(overlapAt([msg("S1", "", "unreadable")], [msg("S1", "", "unreadable")]), 0);
  assert.equal(overlapAt([msg("S1", "", "unreadable"), msg("S2", "see you at seven")], [msg("S1", "what time"), msg("S2", "see you at seven")]), 2);
});

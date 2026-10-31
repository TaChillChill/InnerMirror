import { test } from "node:test";
import assert from "node:assert/strict";
import { anchorOf, cleanAnalysis } from "./analysis.ts";
import { buildAnalysisBody, groupTurns } from "./analysis-spec.ts";

const messages = [
  { id: "m1", speakerId: "p1", text: "Why are the dishes ALWAYS left for me?" },
  { id: "m2", speakerId: "p1", text: "I'm so tired." },
  { id: "m3", speakerId: "p2", text: "Sorry, I'll do them now." },
  { id: "m4", speakerId: "p1", text: "ok" },
];
const seg = (turnId: string, messageIds: string[], extra = {}) => ({
  turnId, messageIds, splitReason: null, cues: ["ALWAYS"], contextCues: [], rationale: "r", family: "P", expression: "CP",
  confidence: "high", alternative: null, invites: "C", secondLayer: null, ...extra,
});
const base = (segments: unknown[], extra = {}) => ({
  context: { register: "r", turns: [], dynamics: "d" },
  segments, shifts: [], summary: "s", uncertainty: "u", safety: { flagged: false, categories: [], note: null }, ...extra,
});

test("groups consecutive messages from one speaker into turns", () => {
  assert.deepEqual(groupTurns(messages).map((t) => t.messageIds), [["m1", "m2"], ["m3"], ["m4"]]);
  assert.equal(groupTurns(messages, "messages").length, 4);
});

test("role reversal: the request doesn't depend on who the user is", () => {
  const input = { language: "en" as const, participantIds: ["p1", "p2"], messages };
  const a = buildAnalysisBody({ ...input, selfId: "p1" }, { effort: "medium" });
  const b = buildAnalysisBody({ ...input, selfId: "p2" }, { effort: "medium" });
  assert.deepEqual(a, b);
  assert.ok(!JSON.stringify(a.messages[1]).includes("You"));
});

test("a turn-level segment gives every message of the turn the same reading", () => {
  const a = cleanAnalysis(base([seg("t1", ["m1", "m2"]), seg("t2", ["m3"], { cues: ["Sorry"], expression: "AC" }), seg("t3", ["m4"], { cues: [], expression: "UNCLEAR", family: "UNCLEAR", confidence: "low" })]), messages)!;
  assert.deepEqual(a.segments.map((s) => s.messageIds), [["m1", "m2"], ["m3"], ["m4"]]);
  assert.equal(a.readings[1].expression, "CP");
  assert.equal(a.readings[1].segmentId, "s1");
  assert.equal(anchorOf(a, "m1"), "m2");
});

test("segments that cross turns are cut at the turn boundary; skipped messages become UNCLEAR", () => {
  const a = cleanAnalysis(base([seg("t1", ["m2", "m3"])]), messages.slice(0, 3))!;
  assert.deepEqual(a.segments.map((s) => s.messageIds), [["m1"], ["m2"], ["m3"]]);
  assert.equal(a.readings[0].expression, "UNCLEAR");
});

test("drops cues that aren't quotes, lowers confidence without evidence, keeps valid context cues", () => {
  const a = cleanAnalysis(base([
    seg("t1", ["m1", "m2"]),
    seg("t2", ["m3"], { cues: ["never said"], expression: "AC", contextCues: [{ messageId: "m1", quote: "ALWAYS" }, { messageId: "m1", quote: "made up" }] }),
    seg("t3", ["m4"]),
  ]), messages)!;
  assert.deepEqual(a.readings[2].cues, []);
  assert.equal(a.readings[2].confidence, "low");
  assert.deepEqual(a.readings[2].contextCues, [{ messageId: "m1", quote: "ALWAYS" }]);
});

test("family follows the label, and only stands alone when the label is UNCLEAR", () => {
  const a = cleanAnalysis(base([seg("t1", ["m1", "m2"], { family: "C" }), seg("t2", ["m3"], { expression: "UNCLEAR", family: "C", cues: [] }), seg("t3", ["m4"])]), messages)!;
  assert.equal(a.readings[0].family, "P");
  assert.equal(a.readings[2].family, "C");
});

test("rejects wrong shapes and outputs covering under half the messages", () => {
  assert.equal(cleanAnalysis({ segments: "nope" }, messages), null);
  assert.equal(cleanAnalysis(base([seg("t3", ["m4"])]), messages), null);
});

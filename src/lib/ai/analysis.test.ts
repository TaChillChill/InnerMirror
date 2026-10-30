import { test } from "node:test";
import assert from "node:assert/strict";
import { cleanAnalysis } from "./analysis.ts";

const messages = [
  { id: "m1", speakerId: "p1", text: "Why are the dishes ALWAYS left for me?" },
  { id: "m2", speakerId: "p2", text: "Sorry, I'll do them now." },
  { id: "m3", speakerId: "p1", text: "ok" },
];
const reading = (messageId: string, extra = {}) => ({
  messageId, expression: "CP", confidence: "high", cues: ["ALWAYS"], rationale: "r", alternative: null,
  invites: "C", secondLayer: null, reflectionQuestion: "What did you notice?", ...extra,
});
const base = (readings: unknown[], extra = {}) => ({
  readings, shifts: [], exchanges: [], summary: "s", uncertainty: "u", safety: { flagged: false, categories: [], note: null }, ...extra,
});

test("drops cues that aren't quotes and lowers confidence when no evidence is left", () => {
  const a = cleanAnalysis(base([reading("m1"), reading("m2", { cues: ["never said"], expression: "AC" })]), messages, "p2")!;
  assert.deepEqual(a.readings[0].cues, ["ALWAYS"]);
  assert.deepEqual(a.readings[1].cues, []);
  assert.equal(a.readings[1].confidence, "low");
});

test("reflection questions only on the user's messages, none in the safety path", () => {
  const a = cleanAnalysis(base([reading("m1"), reading("m2", { cues: ["Sorry"] })]), messages, "p2")!;
  assert.equal(a.readings[0].reflectionQuestion, null);
  assert.equal(a.readings[1].reflectionQuestion, "What did you notice?");
  const flagged = cleanAnalysis(base([reading("m1"), reading("m2", { cues: ["Sorry"] })], { safety: { flagged: true, categories: ["threat"], note: "n" } }), messages, "p2")!;
  assert.ok(flagged.readings.every((r) => r.reflectionQuestion === null));
});

test("fills missing messages with UNCLEAR, ignores unknown ids, keeps message order", () => {
  const a = cleanAnalysis(base([reading("m2", { cues: ["Sorry"] }), reading("m1"), reading("m9")]), messages, "p2")!;
  assert.deepEqual(a.readings.map((r) => r.messageId), ["m1", "m2", "m3"]);
  assert.equal(a.readings[2].expression, "UNCLEAR");
});

test("rejects wrong shapes and outputs covering under half the messages", () => {
  assert.equal(cleanAnalysis({ readings: "nope" }, messages, "p2"), null);
  assert.equal(cleanAnalysis(base([reading("m1")]), messages, "p2"), null);
});

test("exchange pattern is recomputed from its vectors", () => {
  const ex = { stimulusId: "m1", responseId: "m2", stimulusFrom: "P", stimulusAddresses: "C", responseFrom: "C", responseAddresses: "P", pattern: "crossed", note: "n" };
  const a = cleanAnalysis(base([reading("m1"), reading("m2", { cues: ["Sorry"] })], { exchanges: [ex] }), messages, "p2")!;
  assert.equal(a.exchanges[0].pattern, "complementary");
});

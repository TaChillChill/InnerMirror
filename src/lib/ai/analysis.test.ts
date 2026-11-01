import { test } from "node:test";
import assert from "node:assert/strict";
import { anchorOf, arcOf, cleanAnalysis } from "./analysis.ts";
import { SAMPLES } from "../samples.ts";
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

// Shapes taken from saved v3 eval runs (vi3-friends, en3-couple), plus sincere controls.
const banter = [
  { id: "m1", speakerId: "p1", text: "Tụi mình hẹn 7h mà giờ mới xuất phát" },
  { id: "m2", speakerId: "p2", text: "Giỏi quá ha 🙂" },
  { id: "m3", speakerId: "p1", text: "Fine. Do whatever you want." },
  { id: "m4", speakerId: "p2", text: "Giỏi quá, em làm tốt lắm!" },
];
const layer = (cues: string[]) => ({ observation: "praise words next to a reminder about being late", cues });

test("a grounded second layer caps high at medium and keeps the label", () => {
  const a = cleanAnalysis(base([
    seg("t1", ["m1"], { cues: ["hẹn 7h"], expression: "A", confidence: "medium" }),
    seg("t2", ["m2"], { cues: ["Giỏi quá ha"], secondLayer: layer(["Giỏi quá ha", "🙂"]) }),
    seg("t3", ["m3"], { cues: ["Fine."], expression: "AC", secondLayer: layer(["Fine.", "Do whatever you want."]) }),
    seg("t4", ["m4"], { cues: ["Giỏi quá"], expression: "NP" }),
  ]), banter)!;
  assert.deepEqual(a.readings.map((r) => [r.expression, r.confidence]), [["A", "medium"], ["CP", "medium"], ["AC", "medium"], ["NP", "high"]]);
});

test("sincere praise, ungrounded layers and lower confidence are left alone", () => {
  const a = cleanAnalysis(base([
    seg("t1", ["m1"], { cues: ["hẹn 7h"], expression: "A" }),
    // The model claims a layer but none of its cues is in the message: not enough to cap.
    seg("t2", ["m2"], { cues: ["Giỏi quá ha"], secondLayer: layer(["made up"]) }),
    seg("t3", ["m3"], { cues: ["Fine."], expression: "AC", confidence: "low", secondLayer: layer(["Fine."]) }),
    seg("t4", ["m4"], { cues: ["làm tốt lắm"], expression: "NP" }),
  ]), banter)!;
  assert.deepEqual(a.readings.map((r) => r.confidence), ["high", "high", "low", "high"]);
  assert.deepEqual(a.readings[1].secondLayer?.cues, []);
});

test("safety output passes through the confidence cap untouched", () => {
  const safety = { flagged: true, categories: ["threat"], note: "support is available" };
  const a = cleanAnalysis(base([seg("t1", ["m1"], { cues: ["hẹn 7h"], secondLayer: layer(["hẹn 7h"]) }), seg("t2", ["m2"], { cues: ["Giỏi quá ha"] })], { safety }), banter.slice(0, 2))!;
  assert.deepEqual(a.safety, safety);
  assert.equal(a.readings[0].confidence, "medium");
});

test("rejects wrong shapes and outputs covering under half the messages", () => {
  assert.equal(cleanAnalysis({ segments: "nope" }, messages), null);
  assert.equal(cleanAnalysis(base([seg("t3", ["m4"])]), messages), null);
});

test("arcOf: first turn's act, then the acts at shift points, capped and de-duplicated", () => {
  const s = SAMPLES.en;
  const a = cleanAnalysis(s.raw, s.messages)!;
  const arc = arcOf(a);
  assert.ok(arc.length >= 2 && arc.length <= 3, String(arc.length));
  assert.equal(arc[0], a.context.turns[0].act.trim());
  assert.equal(new Set(arc).size, arc.length);
  assert.deepEqual(arcOf({ ...a, context: { ...a.context, turns: [] }, shifts: [] }), []);
});


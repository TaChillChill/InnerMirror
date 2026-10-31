import { test } from "node:test";
import assert from "node:assert/strict";
import { parsePasted, analyzeRequestSchema, analysisKey, toAnalyzeRequest, reviewProblem } from "./conversation.ts";

test("parsePasted: names, continuation lines and timestamps", () => {
  const t = parsePasted("[21:14] Linh: Why are the dishes left for me?\nMe: Sorry.\nI'll do them now.\n30/10/2026, 21:15 - Linh: ok", "Unknown");
  assert.deepEqual(t.participants.map((p) => p.name), ["Linh", "Me"]);
  assert.equal(t.messages.length, 3);
  assert.equal(t.messages[1].text, "Sorry.\nI'll do them now.");
  assert.equal(t.messages[2].speakerId, t.messages[0].speakerId);
});

test("parsePasted: Vietnamese names and a leading line without a speaker", () => {
  const t = parsePasted("chào\nMẹ: Con ăn cơm chưa?\nMinh: Con ăn rồi mẹ ạ.", "Chưa rõ");
  assert.deepEqual(t.participants.map((p) => p.name), ["Chưa rõ", "Mẹ", "Minh"]);
  assert.equal(t.messages[1].text, "Con ăn cơm chưa?");
});

test("parsePasted: a sentence with a colon is not a speaker", () => {
  const t = parsePasted("A: Note this. Remember: tomorrow.\nB: ok", "?");
  assert.equal(t.messages.length, 2);
});

test("analyze request carries ids and text only, never names", () => {
  const t = parsePasted("Linh: hi\nMe: hey", "?");
  const req = toAnalyzeRequest(t, "p2", "en");
  assert.ok(analyzeRequestSchema.safeParse(req).success);
  assert.ok(!JSON.stringify(req).includes("Linh"));
});

test("analyze request rejects unknown speakers, missing consent and oversize text", () => {
  const base = { language: "en", selfId: "p1", participantIds: ["p1", "p2"], consent: true, messages: [{ id: "m1", speakerId: "p1", text: "a" }, { id: "m2", speakerId: "p2", text: "b" }] };
  assert.ok(analyzeRequestSchema.safeParse(base).success);
  assert.ok(!analyzeRequestSchema.safeParse({ ...base, consent: false }).success);
  assert.ok(!analyzeRequestSchema.safeParse({ ...base, messages: [...base.messages, { id: "m3", speakerId: "p9", text: "c" }] }).success);
  assert.ok(!analyzeRequestSchema.safeParse({ ...base, messages: [{ id: "m1", speakerId: "p1", text: "x".repeat(2001) }, base.messages[1]] }).success);
});

test("reviewProblem: asks for self last, after content issues", () => {
  const t = parsePasted("A: hi", "?");
  assert.equal(reviewProblem(t, null), "tooFew");
  const t2 = parsePasted("A: hi\nB: hey", "?");
  assert.equal(reviewProblem(t2, null), "noSelf");
  assert.equal(reviewProblem(t2, "p1"), null);
});

test("analysis key ignores who the user is, and changes with any edit or the language", () => {
  const t = { source: "paste" as const, participants: [{ id: "p1", name: "A" }, { id: "p2", name: "B" }], messages: [{ id: "m1", speakerId: "p1", text: "Hi" }, { id: "m2", speakerId: "p2", text: "Hey" }] };
  const key = analysisKey(toAnalyzeRequest(t, "p1", "vi"));
  assert.equal(analysisKey(toAnalyzeRequest(t, "p2", "vi")), key);
  assert.notEqual(analysisKey(toAnalyzeRequest(t, "p1", "en")), key);
  const edited = { ...t, messages: [t.messages[0], { ...t.messages[1], text: "Hey!" }] };
  assert.notEqual(analysisKey(toAnalyzeRequest(edited, "p1", "vi")), key);
  const moved = { ...t, messages: [t.messages[0], { ...t.messages[1], speakerId: "p1" }] };
  assert.notEqual(analysisKey(toAnalyzeRequest(moved, "p1", "vi")), key);
});


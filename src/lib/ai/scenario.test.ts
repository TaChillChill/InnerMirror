import { test } from "node:test";
import assert from "node:assert/strict";
import { cleanScenario, localAnswer, receiverPrior, resolveState, scenarioContext, scenarioParticipants, scenarioRequestSchema } from "./scenario.ts";

// p1 = the user, p2 = the receiver
const msgs = [
  { id: "m1", speakerId: "p2", text: "Did you pay the bill? You always forget.", state: "CP", stateSource: "ai", confidence: "high" },
  { id: "m2", speakerId: "p1", text: "Not yet, sorry.", state: "AC", stateSource: "ai", confidence: "medium" },
  { id: "m3", speakerId: "p2", text: "What is the amount? I can check the account.", state: "A", stateSource: "ai", confidence: "medium" },
  { id: "m4", speakerId: "p1", text: "I'm tired of being told off.", state: "FC", stateSource: "user", confidence: null },
] as const;
const base = { language: "en", actorId: "p1", selfId: "p1", receiverId: "p2", state: "A", participantIds: ["p1", "p2"], messages: msgs, consent: true };
const req = { messages: [...msgs], receiverId: "p2" };

const possibility = (extra = {}) => ({
  state: "CP", basis: "pattern", rationale: "Their first message set a rule.", evidenceMessageIds: ["m1"], cues: ["You always forget"], ...extra,
});
const model = (extra = {}) => ({ flagged: false, evidence: "enough", possibilities: [possibility(), possibility({ state: "A", evidenceMessageIds: ["m3"], cues: ["What is the amount"] })], note: "n", reflectionQuestion: "What do you notice?", ...extra });

test("receiver is whoever answered the actor next, else the last other speaker; only on the actor's own messages", () => {
  const list = [{ id: "a", speakerId: "p2" }, { id: "b", speakerId: "p1" }, { id: "c", speakerId: "p3" }, { id: "d", speakerId: "p1" }];
  assert.equal(scenarioContext(list, "p1", "b")?.receiverId, "p3");
  assert.equal(scenarioContext(list, "p1", "b")?.reply?.id, "c");
  assert.equal(scenarioContext(list, "p1", "d")?.receiverId, "p3");
  assert.equal(scenarioContext(list, "p1", "d")?.reply, null);
  assert.equal(scenarioContext(list, "p1", "a"), null);
  assert.equal(scenarioContext(list, null, "b"), null);
  assert.equal(scenarioContext([{ id: "x", speakerId: "p1" }], "p1", "x"), null);
});

test("history never includes the explored message or anything after it", () => {
  const ctx = scenarioContext(msgs.map(({ id, speakerId }) => ({ id, speakerId })), "p1", "m2")!;
  assert.deepEqual(ctx.history.map((m) => m.id), ["m1"]);
  assert.equal(ctx.reply?.id, "m3");
});

test("my label wins; 'not sure' or no choice falls back to the AI's reading", () => {
  const ai = { expression: "CP" as const, confidence: "high" as const };
  assert.deepEqual(resolveState(ai, "fc"), { state: "FC", stateSource: "user", confidence: null });
  assert.deepEqual(resolveState(ai, "unsure"), { state: "CP", stateSource: "ai", confidence: "high" });
  assert.deepEqual(resolveState(ai, undefined), { state: "CP", stateSource: "ai", confidence: "high" });
  assert.equal(resolveState(undefined, undefined).state, "UNCLEAR");
});

test("request schema: needs consent, the actor's message last, a receiver who isn't the actor; self is optional (U9)", () => {
  assert.ok(scenarioRequestSchema.safeParse(base).success);
  assert.ok(!scenarioRequestSchema.safeParse({ ...base, consent: false }).success);
  assert.ok(!scenarioRequestSchema.safeParse({ ...base, messages: msgs.slice(0, 3) }).success);
  assert.ok(!scenarioRequestSchema.safeParse({ ...base, receiverId: "p1" }).success);
  assert.ok(!scenarioRequestSchema.safeParse({ ...base, state: "UNCLEAR" }).success);
  assert.ok(!scenarioRequestSchema.safeParse({ ...base, receiverId: "p9" }).success);
  // Someone else's message: p2 is the actor, p1 answers; works with or without a self.
  const theirs = { ...base, actorId: "p2", receiverId: "p1", messages: msgs.slice(0, 3) };
  assert.ok(scenarioRequestSchema.safeParse(theirs).success);
  assert.ok(scenarioRequestSchema.safeParse({ ...theirs, selfId: null }).success);
  assert.ok(!scenarioRequestSchema.safeParse({ ...theirs, actorId: "p1" }).success, "last message isn't p1's");
  assert.ok(!scenarioRequestSchema.safeParse({ ...theirs, selfId: "p9" }).success);
});

test("participants: only the chosen self is 'You'; the actor otherwise gets a neutral label", () => {
  const ps = scenarioParticipants({ ...base, actorId: "p2", receiverId: "p1", messages: [...msgs.slice(0, 3)] }, "You", (i) => `Person ${"AB"[i]}`);
  assert.deepEqual(ps, [{ id: "p1", label: "You" }, { id: "p2", label: "Person A" }]);
  const none = scenarioParticipants({ ...base, selfId: null }, "You", (i) => `Person ${"AB"[i]}`);
  assert.ok(none.every((p) => p.label !== "You"));
});

test("no readable earlier receiver messages: answered locally, no model call", () => {
  assert.equal(localAnswer(receiverPrior({ receiverId: "p2", messages: [msgs[1], msgs[3]] }))?.reason, "no_prior");
  const unclear = [{ ...msgs[0], state: "UNCLEAR" }, msgs[3]];
  assert.equal(localAnswer(receiverPrior({ receiverId: "p2", messages: unclear as never }))?.reason, "unclear_prior");
  assert.equal(localAnswer(receiverPrior(req)), null);
});

test("keeps grounded possibilities, ranks them only with enough pattern evidence", () => {
  const r = cleanScenario(model(), req)!;
  assert.equal(r.evidence, "enough");
  assert.ok(r.ranked);
  assert.deepEqual(r.possibilities.map((p) => p.state), ["CP", "A"]);
  assert.equal(r.reflectionQuestion, "What do you notice?");
});

test("drops evidence that isn't the receiver's earlier message, invented quotes and duplicate states", () => {
  const r = cleanScenario(model({ possibilities: [
    possibility({ evidenceMessageIds: ["m2", "m4"] }), // the user's own messages: never evidence, so a pattern with only these is dropped
    possibility({ evidenceMessageIds: ["m1", "zzz", "m4"], cues: ["You always forget", "never said this"] }),
    possibility({ evidenceMessageIds: ["m3"], cues: ["x"] }), // duplicate state CP
  ] }), req)!;
  assert.equal(r.possibilities.length, 1);
  assert.deepEqual(r.possibilities[0].evidenceMessageIds, ["m1"]);
  assert.deepEqual(r.possibilities[0].cues, ["You always forget"]);
});

test("a context possibility may stand without evidence, but is never ranked first as a pattern", () => {
  const r = cleanScenario(model({ possibilities: [possibility({ state: "A", basis: "context", evidenceMessageIds: [], cues: [] })] }), req)!;
  assert.equal(r.possibilities[0].basis, "context");
  assert.deepEqual(r.possibilities[0].evidenceMessageIds, []);
  assert.ok(!r.ranked);
});

test("one earlier message can't be 'enough', and thin evidence is never ranked", () => {
  const one = { receiverId: "p2", messages: [msgs[0], msgs[1], msgs[3]] };
  const r = cleanScenario(model({ possibilities: [possibility()] }), one)!;
  assert.equal(r.evidence, "thin");
  assert.ok(!r.ranked);
});

test("model says insufficient, or nothing survives: no possibilities, honest note", () => {
  const a = cleanScenario(model({ evidence: "insufficient", note: "Too little." }), req)!;
  assert.deepEqual([a.evidence, a.possibilities.length, a.note], ["insufficient", 0, "Too little."]);
  const b = cleanScenario(model({ possibilities: [possibility({ evidenceMessageIds: ["nope"] })] }), req)!;
  assert.equal(b.evidence, "insufficient");
});

test("safety flag: nothing shown, no reflection question", () => {
  const r = cleanScenario(model({ flagged: true, note: "calm" }), req)!;
  assert.ok(r.flagged && r.possibilities.length === 0 && r.reflectionQuestion === null);
});

test("caps at two and rejects malformed output", () => {
  const three = model({ possibilities: [possibility(), possibility({ state: "A", evidenceMessageIds: ["m3"], cues: [] }), possibility({ state: "FC", evidenceMessageIds: ["m3"], cues: [] })] });
  assert.equal(cleanScenario(three, req)!.possibilities.length, 2);
  assert.equal(cleanScenario({ nope: 1 }, req), null);
  assert.equal(cleanScenario(model({ possibilities: [{ ...possibility(), state: "UNCLEAR" }] }), req), null);
});

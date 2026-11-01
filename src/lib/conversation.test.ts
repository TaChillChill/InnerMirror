import { test } from "node:test";
import assert from "node:assert/strict";
import { parsePasted, looksLikeStory, analyzeRequestSchema, analysisKey, toAnalyzeRequest, reviewProblem, rereadPlan, textKey, imagesKey, mergeParticipants } from "./conversation.ts";

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

// Synthetic stories from docs/INPUT_EXPERIENCE_AUDIT.md §1.
const STORY_VI = "Tối qua mình về muộn.\nMẹ nói: Sao giờ này mới về?\nMình đáp: Con bận việc mà.\nRồi chị Lan bảo: Nó lúc nào cũng vậy đó mẹ.\nMình thấy chị ấy luôn bênh mẹ.";

test("looksLikeStory: retold VI/EN stories are caught", () => {
  assert.ok(looksLikeStory(STORY_VI));
  assert.ok(looksLikeStory("Tối qua mình về muộn. Mẹ hỏi sao giờ mới về, mình bảo con bận việc."));
  assert.ok(looksLikeStory("Mẹ hỏi \"Sao giờ này mới về?\" Mình nói \"Con bận\"."));
  assert.ok(looksLikeStory("Mom said: Why are you so late?\nMe: I was busy."));
  assert.ok(looksLikeStory("Linh: The dishes again?\nI felt she was blaming me."));
  // Clean names, but the narrator's comment would be glued onto chị Lan's message.
  assert.ok(looksLikeStory("Mẹ: Sao giờ này mới về?\nChị Lan: Nó lúc nào cũng vậy.\nMình thấy chị ấy luôn bênh mẹ."));
});

test("looksLikeStory: pasted chats are not stories", () => {
  assert.ok(!looksLikeStory("[21:14] Linh: Why are the dishes left for me?\nMe: Sorry.\nI'll do them now.\n30/10/2026, 21:15 - Linh: ok"));
  assert.ok(!looksLikeStory("Mẹ: Con ăn cơm chưa?\nMinh: Con ăn rồi mẹ ạ."));
  // "Bảo" is a name; only the lowercase verb "bảo" marks a retelling.
  assert.ok(!looksLikeStory("Bảo: Mai đi cà phê không?\nChị Lan: Ok em, mình nói chuyện sau nhé."));
  assert.ok(!looksLikeStory("A: Note this. Remember: tomorrow.\nB: ok"));
  assert.ok(!looksLikeStory("Mé: Con đi đây\nMẹ: Ừ")); // decomposed accents (macOS paste)
});

test("parsePasted: speech verbs never become speaker names", () => {
  const t = parsePasted(STORY_VI, "Chưa rõ");
  assert.deepEqual(t.participants.map((p) => p.name), ["Chưa rõ"]);
});

test("parsePasted keepLines: no narrator line is attributed to someone else", () => {
  const t = parsePasted("Mẹ: Sao giờ này mới về?\nChị Lan: Nó lúc nào cũng vậy.\nMình thấy chị ấy luôn bênh mẹ.", "Chưa rõ", { keepLines: true });
  assert.deepEqual(t.participants.map((p) => p.name), ["Mẹ", "Chị Lan", "Chưa rõ"]);
  assert.equal(t.messages.length, 3);
  assert.equal(t.messages[1].text, "Nó lúc nào cũng vậy.");
  assert.equal(t.participants.find((p) => p.id === t.messages[2].speakerId)?.name, "Chưa rõ");
  const s = parsePasted(STORY_VI, "Chưa rõ", { keepLines: true });
  assert.equal(s.messages.length, 5);
  assert.ok(s.messages.every((m) => m.speakerId === s.participants[0].id));
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


test("Back + Continue keeps edits when the input didn't change, and asks before replacing them", () => {
  const t = { source: "paste" as const, participants: [{ id: "p1", name: "A" }], messages: [{ id: "m1", speakerId: "p1", text: "edited" }] };
  assert.equal(rereadPlan(null, null, textKey("A: hi")), "read");
  assert.equal(rereadPlan(t, textKey("A: hi"), textKey("A: hi  ")), "reuse");
  assert.equal(rereadPlan(t, textKey("A: hi"), textKey("A: hello")), "ask");
  assert.equal(rereadPlan({ ...t, messages: [] }, textKey("x"), textKey("y")), "read");
  assert.notEqual(imagesKey(["data:a", "data:b"]), imagesKey(["data:b", "data:a"]), "order matters");
  assert.equal(rereadPlan(t, imagesKey(["data:a"]), imagesKey(["data:a"])), "reuse");
});

test("merging two names for one person moves every message and loses none", () => {
  const t = parsePasted("Minh: Về muộn quá.\nPhương: Dự án gấp.\nChị Phương: Anh nói thì dễ.\nPhương: Thôi kệ đi.\nMinh: Anh lo thôi.", "?");
  const [minh, phuong, chiPhuong] = t.participants.map((p) => p.id);
  const m = mergeParticipants(t, chiPhuong, phuong);
  assert.deepEqual(m.participants.map((p) => p.name), ["Minh", "Phương"]);
  assert.equal(m.messages.length, t.messages.length);
  assert.deepEqual(m.messages.map((x) => x.text), t.messages.map((x) => x.text), "order and text unchanged");
  assert.deepEqual(m.messages.map((x) => x.speakerId), [minh, phuong, phuong, phuong, minh]);
  assert.equal(mergeParticipants(t, phuong, phuong), t, "merging into itself is a no-op");
  assert.equal(mergeParticipants(t, "nope", phuong), t, "unknown ids are a no-op");
});

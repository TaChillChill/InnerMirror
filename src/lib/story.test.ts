import { test } from "node:test";
import assert from "node:assert/strict";
import { narrationBefore, parseStory, splitLine, storyContext, toDialogue, toNarration } from "./story.ts";

const names = { unknown: "Chưa rõ", me: "Mình" };
const said = (t: ReturnType<typeof parseStory>) => t.messages.map((m) => `${t.participants.find((p) => p.id === m.speakerId)?.name}: ${m.text}`);

test("VI story: quotes become dialogue with the speaker before the verb; the rest is narration", () => {
  const t = parseStory("Tối qua mình về muộn vì kẹt xe.\nMẹ đặt túi xuống bàn rồi nói: “Con lại về muộn nữa à?”\nMình bảo: “Con xin lỗi, tại tắc đường.”\nMẹ không nói gì, quay vào bếp.", names);
  assert.deepEqual(said(t), ["Mẹ: Con lại về muộn nữa à?", "Mình: Con xin lỗi, tại tắc đường."]);
  assert.deepEqual(t.narration?.map((n) => [n.text, n.before]), [
    ["Tối qua mình về muộn vì kẹt xe.", "m1"], ["Mẹ đặt túi xuống bàn", "m1"], ["Mẹ không nói gì, quay vào bếp.", null],
  ]);
  assert.equal(t.source, "story");
});

test("VI without quotes: 'X nói: …' is dialogue, attribution after a quote is found too", () => {
  assert.deepEqual(splitLine("Chị Lan nói: Em làm lại báo cáo này đi."), [{ kind: "dialogue", speaker: "Chị Lan", text: "Em làm lại báo cáo này đi." }]);
  assert.deepEqual(splitLine("“Thôi đi ngủ đi”, mẹ nói."), [{ kind: "dialogue", speaker: "mẹ", text: "Thôi đi ngủ đi" }]);
  assert.deepEqual(splitLine("Linh: Mai đi cà phê không?"), [{ kind: "dialogue", speaker: "Linh", text: "Mai đi cà phê không?" }]);
});

test("EN story: pronouns 'I' map to me, 'she said' after the quote is the speaker", () => {
  const t = parseStory(`My manager walked in and said, "Where is the report?"\nI said: "I'm still waiting on finance."\n"That's not my problem," she said.`, { unknown: "Unknown", me: "Me" });
  assert.deepEqual(said(t), ["My manager: Where is the report?", "Me: I'm still waiting on finance.", "She: That's not my problem"]);
});

test("a speaker the words don't name stays unknown, never guessed", () => {
  const t = parseStory("Hôm đó trời mưa to lắm.\n“Đi đâu đấy?”", names);
  assert.deepEqual(said(t), ["Chưa rõ: Đi đâu đấy?"]);
});

test("moving lines between dialogue and narration keeps their place in the story", () => {
  const t = parseStory("Mẹ nói: “A.”\nMình đứng im một lúc.\nMình bảo: “B.”\nMẹ hỏi: “C?”", names);
  assert.deepEqual(t.messages.map((m) => m.text), ["A.", "B.", "C?"]);
  const n = toNarration(t, "m2");
  assert.deepEqual(n.messages.map((m) => m.text), ["A.", "C?"]);
  assert.deepEqual(narrationBefore(n, "m3").map((x) => x.text), ["Mình đứng im một lúc.", "B."]);
  const back = toDialogue(n, narrationBefore(n, "m3")[1].id, "p2");
  assert.deepEqual(back.messages.map((m) => m.text), ["A.", "B.", "C?"]);
  assert.deepEqual(narrationBefore(back, back.messages[1].id).map((x) => x.text), ["Mình đứng im một lúc."]);
});

test("context for the model: narration tagged by the message it precedes, capped at 2000 chars, none for chats", () => {
  const t = parseStory("Tối qua mình về muộn.\nMẹ nói: “Con lại về muộn à?”\nMẹ quay vào bếp luôn.", names);
  assert.equal(storyContext(t, "vi"), "[trước m1] Tối qua mình về muộn.\n[cuối] Mẹ quay vào bếp luôn.");
  const long = parseStory(Array.from({ length: 80 }, (_, i) => `Dòng kể chuyện số ${i} khá là dài một chút để vượt giới hạn.`).join("\n") + "\nA nói: “x”\nB nói: “y”", names);
  assert.ok((storyContext(long, "vi") ?? "").length <= 2000);
  assert.equal(storyContext({ ...t, source: "paste" }, "vi"), null);
});

test("dictated lines without quotes or colons: a short subject + speech verb starts dialogue", () => {
  const t = parseStory("tối qua mình về muộn\nmẹ nói con lại về muộn nữa à\nmình bảo con xin lỗi tại tắc đường\nhai mẹ con nói chuyện một lúc", names);
  assert.deepEqual(said(t), ["Mẹ: con lại về muộn nữa à", "Mình: con xin lỗi tại tắc đường"]);
  assert.deepEqual(t.narration?.map((n) => n.text), ["tối qua mình về muộn", "hai mẹ con nói chuyện một lúc"]);
});

test("context stays in story order after lines move", () => {
  const t = parseStory("Mở đầu câu chuyện.\nMẹ nói: “A.”\nMình bảo: “B.”\nMẹ hỏi: “C?”\nKết thúc câu chuyện.", names);
  const n1 = toNarration(t, "m2"); // "B." now precedes m3
  const back = toDialogue(n1, n1.narration!.find((n) => n.text === "B.")!.id, "p2");
  const again = toNarration(back, back.messages[1].id);
  assert.deepEqual(storyContext(again, "vi")!.split("\n"), ["[trước m1] Mở đầu câu chuyện.", "[trước m3] B.", "[cuối] Kết thúc câu chuyện."]);
});

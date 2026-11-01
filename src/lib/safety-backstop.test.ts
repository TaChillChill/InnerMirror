import { test } from "node:test";
import assert from "node:assert/strict";
import { safetyHits } from "./safety-backstop.ts";

const hit = (text: string) => safetyHits([{ id: "m1", text }]).map((h) => h.kind);

test("catches clear self-harm language in Vietnamese, with and without accents", () => {
  for (const t of [
    "Nên chị thấy cùng đường, chẳng còn hy vọng gì",
    "Em không muốn sống nữa",
    "ko muon song nua",
    "Nhiều lúc chỉ muốn chết đi cho xong",
    "Mình đã nghĩ đến chuyện tự tử",
    "Sống chẳng còn ý nghĩa gì",
    "Chẳng còn lý do gì để sống",
    "Em lại rạch tay rồi",
  ]) assert.deepEqual(hit(t), ["self_harm"], t);
});

test("catches clear self-harm and threat language in English", () => {
  for (const t of ["I just want to die", "Sometimes I think about killing myself", "Everyone would be better off dead without me", "I don't want to be alive anymore"]) {
    assert.deepEqual(hit(t), ["self_harm"], t);
  }
  assert.deepEqual(hit("If you leave, I'll kill you."), ["threat"]);
  assert.deepEqual(hit("Tao giết mày đấy"), ["threat"]);
});

test("does not fire on everyday hyperbole or look-alike words (false positives)", () => {
  for (const t of [
    "Mệt muốn chết luôn á",
    "Đói muốn chết rồi, đi ăn thôi",
    "Cười chết mất 😂",
    "Từ từ thôi, không vội",
    "Tu tu roi tinh",
    "Hôm nay nóng chết đi được",
    "Đừng hy vọng gì nhiều nhé, haha",
    "This traffic is killing me",
    "I could kill for a coffee right now",
    "I'd die of embarrassment",
    "We laughed so hard I nearly died",
    "Don't worry, I'll handle it",
    "That joke killed",
    "If you eat the last donut I'll kill you 😂",
    "Ăn hết bánh của tao là tao giết mày đó haha",
  ]) assert.deepEqual(hit(t), [], t);
  // A laughing marker never excuses self-harm language.
  assert.deepEqual(hit("Chắc em tự tử mất haha"), ["self_harm"]);
});

test("returns every matching message, in order", () => {
  const hits = safetyHits([{ id: "a", text: "ok" }, { id: "b", text: "I want to end my life" }, { id: "c", text: "tao giết mày" }]);
  assert.deepEqual(hits, [{ messageId: "b", kind: "self_harm" }, { messageId: "c", kind: "threat" }]);
});

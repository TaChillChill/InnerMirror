import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultTitle, parseTitle, titleNames } from "./conversation-title.ts";

test("names + 01 for a new group (UAT batch 3 #02)", () => {
  assert.equal(defaultTitle(["Chị Phương", "Mình"], []), "Chị Phương – Mình – 01");
});

test("the same group in any order counts up from the highest saved number", () => {
  const saved = [{ title: "Chị Phương – Mình – 01" }, { title: "Mình – Chị Phương – 03" }, { title: "Linh – Mình – 05" }, { title: "Chuyện việc nhà" }, { title: "" }];
  assert.equal(defaultTitle(["Chị Phương", "Mình"], saved), "Chị Phương – Mình – 04");
  assert.equal(defaultTitle(["mình", "CHỊ PHƯƠNG"], saved), "mình – CHỊ PHƯƠNG – 04", "case doesn't split a group");
  assert.equal(defaultTitle(["Linh", "Mình", "Bố"], saved), "Linh – Mình – Bố – 01", "a different group starts at 01");
});

test("titles the user wrote are not read as numbered groups", () => {
  assert.equal(parseTitle("Chuyện việc nhà"), null);
  assert.equal(parseTitle("Hẹn – lần 2"), null);
  assert.equal(parseTitle("07"), null);
  assert.deepEqual(parseTitle("A – B – 12")?.n, 12);
});

test("missing or placeholder names become Person A / Người A", () => {
  const label = (i: number) => `Person ${String.fromCharCode(65 + i)}`;
  assert.deepEqual(titleNames(["", "Unknown", "Sam"], ["Unknown", "Chưa rõ"], label), ["Person A", "Person B", "Sam"]);
  assert.equal(defaultTitle(titleNames(["Chưa rõ", " "], ["Chưa rõ"], label), []), "Person A – Person B – 01");
});

test("a long group still fits the 120-character title limit", () => {
  const t = defaultTitle(Array.from({ length: 8 }, (_, i) => `Người tham gia số ${i + 1}`), []);
  assert.ok(t.length <= 120 && t.endsWith(" – 01"), t);
});

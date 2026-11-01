import { test } from "node:test";
import assert from "node:assert/strict";
import { en } from "./en.ts";
import { vi } from "./vi.ts";

test("privacy policy has the same sections in both languages, none empty", () => {
  assert.equal(en.privacyPage.sections.length, vi.privacyPage.sections.length);
  for (const d of [en, vi]) for (const [h, b] of d.privacyPage.sections) assert.ok(h.length > 2 && b.length > 20);
});

test("age requirement and not-a-health-service scope are stated in both languages", () => {
  for (const d of [en, vi]) {
    assert.match(d.landing.ageNote, /18/);
    assert.ok(d.landing.notTherapy.length > 20 && d.safety.scope.length > 20);
    assert.match(d.privacyPage.sections[0][1], /18/);
  }
});

const shape = (v: unknown): unknown =>
  typeof v === "function" ? "fn" : Array.isArray(v) ? v.map(shape) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, shape(x)])) : typeof v;

test("landing copy has the same structure in both languages", () => {
  assert.deepEqual(shape(vi.landing), shape(en.landing));
});

test("Vietnamese names TA consistently as Phân tích Tương tác", () => {
  const all = JSON.stringify(vi);
  assert.ok(!all.includes("Phân tích Giao tiếp"));
  assert.match(vi.landing.voices.lead[1], /Phân tích Tương tác/);
});

test("Berne is named only in the secondary methodology line of the landing", () => {
  for (const d of [en, vi]) {
    const { method, ...rest } = d.landing.voices;
    assert.match(method, /Berne/);
    assert.ok(!JSON.stringify({ ...d.landing, voices: rest }).includes("Berne"));
  }
});

test("each demo voice shows two possible replies from the other person", () => {
  for (const d of [en, vi]) for (const line of Object.values(d.landing.demo.lines)) assert.equal(line.replies.length, 2);
});

test("privacy claims match the code: What if? leaves nothing on the device, Meta is named on Review", () => {
  for (const d of [en, vi]) {
    const stored = d.privacyPage.sections[4][1];
    assert.ok(!stored.includes("What if"), "use-scenarios keeps explored scenarios in memory only");
    assert.match(d.review.privacy, /Meta/);
  }
});

test("vocabulary (D4/D5): the concept is 'trạng thái bản ngã' / 'ego state', the stage is 'Nhìn lại mình' / 'My Reflection'", () => {
  const vi_ = JSON.stringify(vi), en_ = JSON.stringify(en);
  assert.ok(!/nhân vật|Tấm gương của mình/i.test(vi_), "old VI terms");
  assert.ok(!/\bcharacters?\b|My Mirror/.test(en_), "old EN terms");
  assert.equal(vi.mirror.title, "Nhìn lại mình");
  assert.equal(en.mirror.title, "My Reflection");
});

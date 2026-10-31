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

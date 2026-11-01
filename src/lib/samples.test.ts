import { test } from "node:test";
import assert from "node:assert/strict";
import { SAMPLES } from "./samples.ts";
import { cleanAnalysis } from "./ai/analysis.ts";

test("each sample's saved observation passes the same validation as a live answer", () => {
  for (const [lang, s] of Object.entries(SAMPLES)) {
    const a = cleanAnalysis(s.raw, s.messages);
    assert.ok(a, `${lang}: invalid`);
    assert.equal(a.readings.length, s.messages.length, `${lang}: every message has a reading`);
    assert.equal(a.safety.flagged, false);
    assert.ok(s.messages.some((m) => m.speakerId === s.selfId));
  }
});

test("the English sample shows the sarcasm cap and an unclear reading", () => {
  const s = SAMPLES.en, a = cleanAnalysis(s.raw, s.messages)!;
  const fine = a.readings.find((r) => r.messageId === "m4")!;
  assert.notEqual(fine.confidence, "high");
  assert.equal(a.readings.find((r) => r.messageId === "m6")!.expression, "UNCLEAR");
});

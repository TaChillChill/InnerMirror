import { test } from "node:test";
import assert from "node:assert/strict";
import { analyzeEstimate, extractEstimate } from "./wait.ts";

const chat = (turns: number) => Array.from({ length: turns * 2 }, (_, i) => ({ id: `m${i}`, speakerId: `p${Math.floor(i / 2) % 2}`, text: "x" }));

test("analysis estimate grows with turns and matches measured runs", () => {
  // Measured (P0, v3.2 low): 6 turns ≈ 11–15 s, 13 turns ≈ 21–22 s.
  assert.deepEqual(analyzeEstimate(chat(6)), { lo: 10, hi: 20 });
  const long = analyzeEstimate(chat(13));
  assert.ok(long.lo <= 21 && long.hi >= 22);
  assert.ok(analyzeEstimate(chat(2)).lo >= 5);
});

test("extraction estimate covers the measured 4–14 s", () => {
  assert.deepEqual(extractEstimate(1), { lo: 5, hi: 15 });
  assert.ok(extractEstimate(3).hi >= 14);
});

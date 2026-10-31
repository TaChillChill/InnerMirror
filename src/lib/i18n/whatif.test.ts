import { test } from "node:test";
import assert from "node:assert/strict";
import { en } from "./en.ts";
import { vi } from "./vi.ts";

const KEYS = ["cp", "np", "a", "fc", "ac"] as const;
const dicts = { en, vi };

test("all five characters are described with the same fields in both languages", () => {
  for (const d of Object.values(dicts)) {
    for (const k of KEYS) {
      assert.deepEqual(Object.keys(d.ex[k]).sort(), ["desc", "name", "short"]);
      assert.ok(d.ex[k].desc.length > 10);
    }
  }
});

test("each character's definition names a strength and a limit, so none reads as better", () => {
  // en descs follow "<what it does>. Can <limit>." (a single sentence pair per character)
  for (const k of KEYS) assert.match(en.ex[k].desc, /\. Can /);
});

test("What if? copy has the same keys in EN and VI and no evaluative wording", () => {
  assert.deepEqual(Object.keys(en.whatIf).sort(), Object.keys(vi.whatIf).sort());
  const bad = {
    en: /\b(better|best|worse|worst|healthy|healthier|unhealthy|good|bad|right|wrong|should|improve|calm(er)?|de-?escalat\w*|mature|will reply|will respond|probab\w*|likely|percent)\b/i,
    vi: /(tốt hơn|tốt nhất|xấu|tệ|lành mạnh|trưởng thành hơn|(bạn|mình) nên|nên (chọn|nói|dùng)|hãy chọn|đúng hơn|sai|cải thiện|xác suất|chắc chắn|phần trăm)/i,
  };
  for (const [lang, d] of Object.entries(dicts) as ["en" | "vi", typeof en][]) {
    for (const v of Object.values(d.whatIf)) {
      const out = typeof v === "function" ? v("X") : v;
      const text = Array.isArray(out) ? out.join(" ") : out;
      assert.doesNotMatch(text, bad[lang], `${lang}: ${text}`);
    }
  }
});

test("the caveat sits on the What if row in both languages", () => {
  assert.equal(en.whatIf.caveat, "Possibilities, not predictions.");
  assert.equal(vi.whatIf.caveat, "Chỉ là khả năng, không phải dự đoán.");
});

test("brand voice: Replay and What if? say Mirror/Gương, and 'AI' only where it names Meta's model", () => {
  for (const d of Object.values(dicts)) {
    for (const [section, strings] of Object.entries({ replay: d.replay, whatIf: d.whatIf })) {
      for (const [key, v] of Object.entries(strings)) {
        const out = typeof v === "function" ? (v as (n: string) => unknown)("X") : v;
        const text = Array.isArray(out) ? out.join(" ") : String(out);
        if (/\bAI\b/.test(text)) assert.match(text, /Meta/, `${section}.${key}: ${text}`);
      }
    }
  }
});

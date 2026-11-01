import { test } from "node:test";
import assert from "node:assert/strict";
import { pickLang } from "./lang.ts";

test("first visit follows the device: Vietnamese → vi, English and others → en (UAT batch 3 #03)", () => {
  assert.equal(pickLang(null, ["vi"]), "vi");
  assert.equal(pickLang(null, ["vi-VN", "en-US"]), "vi");
  for (const l of ["en", "en-US", "en-GB", "ja-JP", "ko-KR", "fr-FR", "zh-Hans-CN"]) assert.equal(pickLang(null, [l, "vi"]), "en", l);
  assert.equal(pickLang(null, []), "en");
});

test("a choice made with the toggle wins over the device, and junk is ignored", () => {
  assert.equal(pickLang("vi", ["en-US"]), "vi");
  assert.equal(pickLang("en", ["vi-VN"]), "en");
  assert.equal(pickLang("de", ["vi-VN"]), "vi");
});

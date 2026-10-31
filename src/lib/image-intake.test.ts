import { test } from "node:test";
import assert from "node:assert/strict";
import { hasFiles, isEditableTarget, planIntake } from "./image-intake.ts";

const f = (type: string) => ({ type });

test("fills free slots in order and reports how many were left out", () => {
  const r = planIntake([f("image/png"), f("image/jpeg"), f("image/webp"), f("image/gif")], 2);
  assert.equal(r.accepted.length, 2);
  assert.equal(r.accepted[1].type, "image/jpeg");
  assert.equal(r.ignored, 2);
});

test("non-image files are counted separately and never take a slot", () => {
  const r = planIntake([f("text/plain"), f("image/png"), f("application/pdf")], 3);
  assert.equal(r.accepted.length, 1);
  assert.equal(r.notImages, 2);
  assert.equal(r.ignored, 0);
});

test("no room left ignores everything", () => {
  const r = planIntake([f("image/png")], 0);
  assert.deepEqual([r.accepted.length, r.ignored], [0, 1]);
});

test("text paste is left alone inside editable fields", () => {
  assert.ok(isEditableTarget({ tagName: "TEXTAREA" }));
  assert.ok(isEditableTarget({ tagName: "input" }));
  assert.ok(isEditableTarget({ tagName: "DIV", isContentEditable: true }));
  assert.ok(!isEditableTarget({ tagName: "BODY" }));
  assert.ok(!isEditableTarget(null));
});

test("only file drags are handled", () => {
  assert.ok(hasFiles(["text/plain", "Files"]));
  assert.ok(!hasFiles(["text/plain"]));
  assert.ok(!hasFiles(undefined));
});

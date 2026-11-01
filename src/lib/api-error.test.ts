import { test } from "node:test";
import assert from "node:assert/strict";
import { errorCode } from "./api-error.ts";

test("our own error codes pass through, and the firewall's 429 reads as rate limited", () => {
  assert.equal(errorCode(400, { error: "invalid_input" }), "invalid_input");
  assert.equal(errorCode(429, { error: { code: "rate_limited", message: "x" } }), "rate_limited");
  assert.equal(errorCode(429, {}), "rate_limited");
  assert.equal(errorCode(500, null), "unknown");
});

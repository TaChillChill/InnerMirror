import { test } from "node:test";
import assert from "node:assert/strict";
import { attemptTimeout, callUntilValid, rateLimited, ROUTE_BUDGET_MS } from "./meta-client.ts";

test("attempt timeout stays inside the route budget and refuses when too little is left", () => {
  const t0 = 1_000_000;
  assert.equal(attemptTimeout(t0, t0, 0), 90_000);
  assert.equal(attemptTimeout(t0, t0 + 50_000, 25_000), ROUTE_BUDGET_MS - 50_000);
  assert.equal(attemptTimeout(t0, t0 + 90_000, 25_000), null);
});

// Meta is faked: every call returns unusable content, so no request leaves the machine.
function fakeMeta() {
  let calls = 0;
  const original = globalThis.fetch;
  process.env.META_API_KEY = "test-key";
  globalThis.fetch = (async () => {
    calls++;
    return new Response(JSON.stringify({ choices: [{ message: { content: "not json" }, finish_reason: "stop" }], usage: { prompt_tokens: 10, completion_tokens: 10 } }), { status: 200 });
  }) as typeof fetch;
  return { calls: () => calls, restore: () => { globalThis.fetch = original; } };
}
const body = { messages: [{ role: "user", content: "x" }], max_completion_tokens: 10, reasoning_effort: "low" };

test("retries once when there is time, and skips the retry near the deadline", async () => {
  const fake = fakeMeta();
  const info = console.info;
  console.info = () => {};
  try {
    const fresh = await callUntilValid("test", body, Date.now(), () => null, { retryMinMs: 25_000 });
    assert.equal(fresh.attempts, 2);
    const late = await callUntilValid("test", body, Date.now() - 100_000, () => null, { retryMinMs: 25_000 });
    assert.equal(late.attempts, 1);
    assert.equal(fake.calls(), 3);
  } finally {
    console.info = info;
    fake.restore();
  }
});

test("rate limit can count one request as several units (screenshots)", () => {
  const key = `test:${Math.random()}`;
  assert.equal(rateLimited(key, 30, 60_000, 10), false);
  assert.equal(rateLimited(key, 30, 60_000, 10), false);
  assert.equal(rateLimited(key, 30, 60_000, 10), false);
  // 30 used: the next screenshot is refused, and a refused request doesn't use any up.
  assert.equal(rateLimited(key, 30, 60_000, 1), true);
  assert.equal(rateLimited(key, 30, 60_000, 1), true);
  const other = `test:${Math.random()}`;
  for (let i = 0; i < 8; i++) assert.equal(rateLimited(other), false);
  assert.equal(rateLimited(other), true);
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { botBlocked, botIdActive } from "./bot-check.ts";

// Runs fn as if deployed: production NODE_ENV (botid skips its dev shortcut), a Vercel
// environment, a stand-in OIDC token and Vercel's request context. `verdict` fakes the BotID
// API: an object is its JSON answer, an Error a network failure. Nothing leaves the machine.
async function deployed(verdict: object | Error, fn: () => Promise<void>) {
  const env = { ...process.env };
  const original = globalThis.fetch;
  const ctx = Symbol.for("@vercel/request-context");
  let calls = 0;
  Object.assign(process.env, { NODE_ENV: "production", VERCEL_ENV: "preview", VERCEL_OIDC_TOKEN: "test-token" });
  (globalThis as Record<symbol, unknown>)[ctx] = { get: () => ({ headers: {}, url: "", mutateResponseHeadersBeforeFlush: () => {} }) };
  globalThis.fetch = (async () => {
    calls++;
    if (verdict instanceof Error) throw verdict;
    return new Response(JSON.stringify(verdict));
  }) as typeof fetch;
  try { await fn(); } finally {
    process.env = env;
    globalThis.fetch = original;
    delete (globalThis as Record<symbol, unknown>)[ctx];
  }
  return calls;
}

test("BotID runs only on Vercel deployments", () => {
  assert.equal(botIdActive("production"), true);
  assert.equal(botIdActive("preview"), true);
  assert.equal(botIdActive("development"), false); // `vercel env pull`
  assert.equal(botIdActive(undefined), false); // local `next start`, e2e
});

test("off Vercel the check is skipped without a network call", async () => {
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = (async () => { calls++; return new Response("{}"); }) as typeof fetch;
  try {
    assert.equal(await botBlocked("analyze"), null);
    assert.equal(calls, 0);
  } finally { globalThis.fetch = original; }
});

test("a human passes, a bot gets 403 with a generic code", async () => {
  await deployed({ isBot: false }, async () => assert.equal(await botBlocked("analyze"), null));
  await deployed({ isBot: true }, async () => {
    const res = await botBlocked("analyze");
    assert.equal(res?.status, 403);
    assert.deepEqual(await res?.json(), { error: "unknown" });
  });
});

test("fails closed when BotID can't answer", async () => {
  const calls = await deployed(new TypeError("fetch failed"), async () => {
    const res = await botBlocked("extract");
    assert.equal(res?.status, 503);
    assert.deepEqual(await res?.json(), { error: "upstream" });
  });
  assert.equal(calls, 1);
});

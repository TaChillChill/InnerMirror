// Server-side Meta Model API client. Imported only by route handlers: the key never
// reaches the browser. Logs metadata only (tokens, cost, latency), never content.
// Fails the build if a client component ever imports this module.
import "server-only";

export const MODEL = "muse-spark-1.3"; // Standard tier only: -contributor models may train on inputs
const ENDPOINT = "https://api.meta.ai/v1/chat/completions";
const PRICE = { input: 1.25e-6, cachedInput: 0.15e-6, output: 4.25e-6 }; // USD/token, 2026-10-30

export type MetaErrorCode = "not_configured" | "budget" | "timeout" | "upstream" | "invalid_output";
export class MetaError extends Error {
  code: MetaErrorCode;
  constructor(code: MetaErrorCode, detail?: string) {
    super(detail ?? code);
    this.code = code;
  }
}

// Per-process spend guard for development and the demo. It resets on restart, so the
// provider-side limit and the Founder's budget tracking remain the real ceiling.
const spend = { usd: 0 };
const capUsd = () => Number(process.env.APP_SPEND_CAP_USD ?? "1");
export const spentUsd = () => spend.usd;

type Body = { messages: unknown[]; max_completion_tokens: number; reasoning_effort: string; response_format?: unknown };

// Base64 image data would inflate the text-based estimate ~100x, so it is stripped and the
// caller passes an explicit per-image token allowance instead (image tokens are undocumented).
const DATA_URL = /data:image\/[a-z]+;base64,[A-Za-z0-9+/=]+/g;

export async function callMeta(route: string, body: Body, timeoutMs = 90_000, extraInputTokens = 0): Promise<{ content: string; latencyMs: number }> {
  const key = process.env.META_API_KEY;
  if (!key) throw new MetaError("not_configured");
  const inputBound = Math.ceil(JSON.stringify(body.messages).replace(DATA_URL, "").length / 3) + extraInputTokens;
  const worst = inputBound * PRICE.input + body.max_completion_tokens * PRICE.output;
  if (spend.usd + worst > capUsd()) throw new MetaError("budget");

  const started = Date.now();
  let res: Response;
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODEL, ...body }),
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
    });
  } catch (e) {
    const timedOut = e instanceof Error && (e.name === "TimeoutError" || e.name === "AbortError");
    log(route, { status: timedOut ? "timeout" : "network", latencyMs: Date.now() - started });
    throw new MetaError(timedOut ? "timeout" : "upstream");
  }
  const latencyMs = Date.now() - started;
  const json = await res.json().catch(() => ({}));
  const usage = json.usage ?? {};
  const cached = usage.prompt_tokens_details?.cached_tokens ?? 0;
  const usd = res.ok ? ((usage.prompt_tokens ?? 0) - cached) * PRICE.input + cached * PRICE.cachedInput + (usage.completion_tokens ?? 0) * PRICE.output : 0;
  spend.usd += usd;
  log(route, {
    status: res.status, latencyMs, promptTokens: usage.prompt_tokens, completionTokens: usage.completion_tokens,
    reasoningTokens: usage.completion_tokens_details?.reasoning_tokens, usd: +usd.toFixed(5), processSpendUsd: +spend.usd.toFixed(4),
    finish: json.choices?.[0]?.finish_reason,
    // Size only, never the text: chars per visible token exposes padded output (P0 perf audit).
    contentChars: typeof json.choices?.[0]?.message?.content === "string" ? json.choices[0].message.content.length : null,
  });
  // Error bodies describe the request, not the conversation, but we still keep them out of logs.
  if (!res.ok) throw new MetaError("upstream", `HTTP ${res.status}`);
  const content = json.choices?.[0]?.message?.content;
  if (typeof content !== "string") throw new MetaError("invalid_output");
  return { content, latencyMs };
}

function log(route: string, data: Record<string, unknown>) {
  console.info(JSON.stringify({ event: "meta_call", route, model: MODEL, ...data }));
}

// Small in-memory rate limit per client. Enough for a protected demo; not a substitute
// for platform-level limits if the URL ever goes public. `weight` counts one request as
// several units (extraction counts screenshots, since one conversation now spans requests).
const hits = new Map<string, number[]>();
export function rateLimited(clientKey: string, limit = 8, windowMs = 10 * 60_000, weight = 1): boolean {
  const now = Date.now();
  const recent = (hits.get(clientKey) ?? []).filter((t) => now - t < windowMs);
  if (recent.length + weight > limit) { hits.set(clientKey, recent); return true; }
  for (let i = 0; i < weight; i++) recent.push(now);
  hits.set(clientKey, recent);
  return false;
}

// ---------- Deadline-aware calls ----------
// Our routes run with maxDuration 120 s; Vercel stops the function after that and the
// user gets a platform error. A call starts only if it can end in time, leaving ~10 s to
// validate and answer. Retrying when there's no time left would only delay that error.
export const ROUTE_BUDGET_MS = 110_000;

/** Timeout for the next attempt, or null when less than `minMs` is left in the budget. */
export function attemptTimeout(startedAt: number, now: number, minMs: number, maxMs = 90_000): number | null {
  const left = ROUTE_BUDGET_MS - (now - startedAt);
  return left < Math.max(minMs, 1_000) ? null : Math.min(maxMs, left);
}

/**
 * Calls Meta until `accept` turns the JSON into a usable result: at most one retry, and
 * only with at least `retryMinMs` left (about a typical call). Each attempt is billed.
 */
export async function callUntilValid<T>(route: string, body: Body, startedAt: number, accept: (json: unknown) => T | null, opts: { retryMinMs: number; extraInputTokens?: number }): Promise<{ result: T | null; latencyMs: number; attempts: number }> {
  let attempts = 0, latencyMs = 0;
  while (attempts < 2) {
    const timeout = attemptTimeout(startedAt, Date.now(), attempts === 0 ? 0 : opts.retryMinMs);
    if (timeout === null) break;
    attempts++;
    const r = await callMeta(route, body, timeout, opts.extraInputTokens ?? 0);
    latencyMs = r.latencyMs;
    let json: unknown = null;
    try { json = JSON.parse(r.content); } catch { /* counts as unusable */ }
    const result = json ? accept(json) : null;
    if (result) return { result, latencyMs, attempts };
  }
  return { result: null, latencyMs, attempts };
}

/** One metadata line per request: total server time, attempts, outcome and sizes (counts only). */
export function logRequest(route: string, startedAt: number, data: Record<string, string | number | null>) {
  console.info(JSON.stringify({ event: "request_done", route, totalMs: Date.now() - startedAt, ...data }));
}

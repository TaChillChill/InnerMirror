// Server-side Meta Model API client. Imported only by route handlers: the key never
// reaches the browser. Logs metadata only (tokens, cost, latency), never content.

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
// for platform-level limits if the URL ever goes public.
const hits = new Map<string, number[]>();
export function rateLimited(clientKey: string, limit = 8, windowMs = 10 * 60_000): boolean {
  const now = Date.now();
  const recent = (hits.get(clientKey) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) { hits.set(clientKey, recent); return true; }
  recent.push(now);
  hits.set(clientKey, recent);
  return false;
}

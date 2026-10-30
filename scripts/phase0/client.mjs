// Minimal Meta Model API client for Phase 0 feasibility tests.
// Enforces the Founder-approved budget with a local ledger so a bug can't overspend.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const LEDGER = join(HERE, ".ledger.json");

// USD per token, Standard tier (dev.meta.ai/docs/pricing-rate-limits, 2026-10-30)
const PRICE = { input: 1.25e-6, cachedInput: 0.15e-6, output: 4.25e-6 };

// Approved 2026-10-30: $1 for initial verification, $15 total incl. initial tests
export const CAPS = { smoke: 1.0, total: 15.0 };

const ALLOWED_MODELS = new Set(["muse-spark-1.3", "muse-spark-1.2", "muse-spark-1.1"]);

function loadKey() {
  const envPath = join(ROOT, ".env.local");
  if (!existsSync(envPath)) throw new Error("Missing .env.local with META_API_KEY");
  process.loadEnvFile(envPath);
  const key = process.env.META_API_KEY;
  if (!key) throw new Error("META_API_KEY is empty in .env.local");
  return key;
}

export function readLedger() {
  if (!existsSync(LEDGER)) return { totalUsd: 0, byPhase: {}, calls: [] };
  return JSON.parse(readFileSync(LEDGER, "utf8"));
}

function writeLedger(ledger) {
  writeFileSync(LEDGER, JSON.stringify(ledger, null, 2) + "\n");
}

function worstCaseUsd(body) {
  const approxInputTokens = Math.ceil(JSON.stringify(body.messages).length / 3);
  return approxInputTokens * PRICE.input + body.max_completion_tokens * PRICE.output;
}

function actualUsd(usage) {
  const cached = usage?.prompt_tokens_details?.cached_tokens ?? 0;
  const prompt = (usage?.prompt_tokens ?? 0) - cached;
  return prompt * PRICE.input + cached * PRICE.cachedInput + (usage?.completion_tokens ?? 0) * PRICE.output;
}

/**
 * One Chat Completions call. `phase` selects the budget bucket ("smoke" or "eval").
 * Logs only metadata (tokens, cost, latency) — never prompt or response content.
 */
export async function chat({ phase, label, body }) {
  if (!ALLOWED_MODELS.has(body.model)) throw new Error(`Model not allowed: ${body.model}`);
  if (!body.max_completion_tokens) throw new Error("max_completion_tokens is required (cost bound)");

  const ledger = readLedger();
  const worst = worstCaseUsd(body);
  const phaseSpent = ledger.byPhase[phase] ?? 0;
  if (ledger.totalUsd + worst > CAPS.total) throw new Error(`Refused: total cap $${CAPS.total} could be exceeded`);
  if (phase === "smoke" && phaseSpent + worst > CAPS.smoke) throw new Error(`Refused: smoke cap $${CAPS.smoke} could be exceeded`);

  const key = loadKey();
  const started = Date.now();
  const res = await fetch("https://api.meta.ai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(180_000),
  });
  const latencyMs = Date.now() - started;
  const json = await res.json().catch(() => ({}));

  const usd = res.ok ? actualUsd(json.usage) : 0;
  ledger.totalUsd = +(ledger.totalUsd + usd).toFixed(6);
  ledger.byPhase[phase] = +(phaseSpent + usd).toFixed(6);
  ledger.calls.push({
    at: new Date().toISOString(), phase, label, model: body.model, status: res.status, latencyMs,
    usage: json.usage ?? null, usd: +usd.toFixed(6), finishReason: json.choices?.[0]?.finish_reason ?? null,
  });
  writeLedger(ledger);

  if (!res.ok) {
    // Error bodies describe the request problem, not our content, so they are safe to surface.
    const err = new Error(`HTTP ${res.status}: ${JSON.stringify(json.error ?? json).slice(0, 500)}`);
    err.status = res.status;
    throw err;
  }
  return { json, latencyMs, usd };
}

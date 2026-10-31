// Minimal Meta Model API client for Phase 0 feasibility tests.
// Enforces the Founder-approved budget with a local ledger so a bug can't overspend.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const LEDGER = join(HERE, ".ledger.json");

// USD per token, Standard tier only (dev.meta.ai/docs/pricing-rate-limits, re-checked 2026-10-30).
// -contributor models are deliberately absent: Meta may train on their inputs.
const SPARK = { input: 1.25e-6, cachedInput: 0.15e-6, output: 4.25e-6 };
const PRICES = {
  "muse-spark-1.3": SPARK, "muse-spark-1.2": SPARK, "muse-spark-1.1": SPARK,
  "muse-wonder-1.0": { input: 4.0e-6, cachedInput: 0.2e-6, output: 20.0e-6 }, // preview, comparison runs only
};

// Approved ceiling is $15 total (CLAUDE.md); the Founder set $5 for the initial
// evaluation (2026-10-30), so the harness stops there until a new approval.
// Per-phase caps: smoke $1; eval-v2 = the extra $1 approved for the prompt v2 evaluation;
// eval-p0 = the $3 approved on 2026-10-31 for the P0 classification reliability eval.
export const CAPS = { total: 5.0, phase: { smoke: 1.0, "eval-v2": 1.0, "eval-p0": 3.0 } };

// Worst-case cost of calls in flight, so parallel calls can't jointly pass the cap.
const pending = { total: 0, phase: {} };

// Meta doesn't document how input images are tokenized ("scales with resolution"), so
// the pre-call bound assumes a generous fixed count per image; the ledger records actuals.
const IMAGE_TOKEN_BOUND = 10_000;

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

// Counting base64 as text would price a 100 KB screenshot like ~45k text tokens.
function inputTokenBound(messages) {
  let chars = 0, images = 0;
  for (const m of messages) {
    for (const part of typeof m.content === "string" ? [{ type: "text", text: m.content }] : m.content) {
      if (part.type === "image_url") images++;
      else chars += (part.text ?? "").length;
    }
  }
  return Math.ceil(chars / 3) + images * IMAGE_TOKEN_BOUND;
}

export function worstCaseUsd(body) {
  const price = PRICES[body.model];
  if (!price) throw new Error(`Model not allowed: ${body.model}`);
  return inputTokenBound(body.messages) * price.input + body.max_completion_tokens * price.output;
}

function actualUsd(model, usage) {
  const price = PRICES[model];
  const cached = usage?.prompt_tokens_details?.cached_tokens ?? 0;
  const prompt = (usage?.prompt_tokens ?? 0) - cached;
  return prompt * price.input + cached * price.cachedInput + (usage?.completion_tokens ?? 0) * price.output;
}

/**
 * One Chat Completions call. `phase` selects the budget bucket (see CAPS).
 * Logs only metadata (tokens, cost, latency) — never prompt or response content.
 */
export async function chat({ phase, label, body }) {
  if (!PRICES[body.model]) throw new Error(`Model not allowed: ${body.model}`);
  if (!body.max_completion_tokens) throw new Error("max_completion_tokens is required (cost bound)");

  const worst = worstCaseUsd(body);
  const before = readLedger();
  const phaseCap = CAPS.phase[phase];
  const phaseInFlight = pending.phase[phase] ?? 0;
  if (before.totalUsd + pending.total + worst > CAPS.total) throw new Error(`Refused: total cap $${CAPS.total} could be exceeded`);
  if (phaseCap !== undefined && (before.byPhase[phase] ?? 0) + phaseInFlight + worst > phaseCap)
    throw new Error(`Refused: ${phase} cap $${phaseCap} could be exceeded`);
  pending.total += worst;
  pending.phase[phase] = phaseInFlight + worst;

  const key = loadKey();
  const started = Date.now();
  let res, json;
  try {
    res = await fetch("https://api.meta.ai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(180_000),
    });
    json = await res.json().catch(() => ({}));
  } finally {
    pending.total -= worst;
    pending.phase[phase] -= worst;
  }
  const latencyMs = Date.now() - started;

  // Re-read right before writing (no await in between) so parallel calls don't overwrite each other.
  const usd = res.ok ? actualUsd(body.model, json.usage) : 0;
  const ledger = readLedger();
  ledger.totalUsd = +(ledger.totalUsd + usd).toFixed(6);
  ledger.byPhase[phase] = +((ledger.byPhase[phase] ?? 0) + usd).toFixed(6);
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

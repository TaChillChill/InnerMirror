// P0 classification eval: spec × fixture × variant, live calls from the "eval-p0" bucket.
//   node scripts/phase0/p0/run.mjs --spec=v2.1|v3|v3-msg [--variants=selfA,selfB,ctx-relevant] [--only=vi1,en2] [--dry]
//   node scripts/phase0/p0/run.mjs --report        # rebuild results/p0/REPORT.md, no calls
// v2.1 = frozen baseline (spec-v2.1.ts); v3 = the spec the app ships; v3-msg = v3 without
// turn grouping (ablation). Variants: selfA/selfB = who the user is; ctx-<key> = v3 with a
// fixture context (relationship + note). Synthetic fixtures only.
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { chat, readLedger, worstCaseUsd } from "../client.mjs";
import { VI } from "./fixtures-vi.mjs";
import { EN } from "./fixtures-en.mjs";
import { ROLES } from "./fixtures-roles.mjs";
import { SAFETY } from "./fixtures-safety.mjs";
import { scoreRun } from "./score.mjs";
import { OUT, renderRun, writeReport } from "./report.mjs";

const MODEL = "muse-spark-1.3";
const args = process.argv.slice(2);
const opt = (name, fallback) => (args.find((a) => a.startsWith(`--${name}=`)) ?? `=${fallback}`).split("=")[1];
const EFFORT = opt("effort", "low");
// Budget bucket (client.mjs CAPS): eval-p0 for P0, eval-rel for the relationship eval.
const PHASE = opt("phase", "eval-p0");
// Non-default effort writes to its own folder, so runs never mix.
const folder = (spec) => (spec === "v2.1" || EFFORT === "low" ? spec : `${spec}-${EFFORT}`);
export const FIXTURES = [...VI, ...EN, ...ROLES, ...SAFETY];

const selfOf = (variant) => (variant === "selfB" ? "p2" : "p1");

async function bodyFor(spec, fx, variant) {
  const selfId = selfOf(variant);
  const messages = fx.messages.map(({ id, speakerId, text }) => ({ id, speakerId, text }));
  if (spec === "v2.1") {
    const s = await import("./spec-v2.1.ts");
    let i = 0;
    const participants = fx.participants.map((p) => ({ id: p.id, label: p.id === selfId ? s.SELF_LABEL[fx.language] : s.pseudonymLabel(i++, fx.language) }));
    return {
      model: MODEL, reasoning_effort: EFFORT, max_completion_tokens: 12_000,
      messages: [{ role: "system", content: s.SYSTEM_PROMPT }, { role: "user", content: s.buildUserPayload({ language: fx.language, selfId, participants, messages }) }],
      response_format: { type: "json_schema", json_schema: { name: "Observation_v2_1", strict: true, schema: s.ANALYSIS_JSON_SCHEMA } },
    };
  }
  const s = await import("../../../src/lib/ai/analysis-spec.ts");
  const ctxKey = variant.startsWith("ctx-") ? variant.slice(4) : null;
  const context = ctxKey ? fx.contexts[ctxKey] : undefined;
  if (ctxKey && !context) return null;
  // selfId is passed on purpose: the spec must ignore it, and the payloads are compared below.
  const body = s.buildAnalysisBody({ language: fx.language, participantIds: fx.participants.map((p) => p.id), selfId, messages, context }, { effort: EFFORT, grouping: spec === "v3-msg" ? "messages" : "turns" });
  return { model: MODEL, ...body };
}

async function readingsOf(spec, fx, raw) {
  if (spec === "v2.1") return { readings: raw.readings, segments: null };
  const { cleanAnalysis } = await import("../../../src/lib/ai/analysis.ts");
  const a = cleanAnalysis(raw, fx.messages);
  return a ? { readings: a.readings, segments: a.segments, analysis: a } : null;
}

async function runOne(spec, fx, variant) {
  const body = await bodyFor(spec, fx, variant);
  if (!body) return;
  const label = `${spec}:${fx.id}:${variant}`;
  const { json, latencyMs, usd } = await chat({ phase: PHASE, label, body });
  let raw = null;
  try { raw = JSON.parse(json.choices?.[0]?.message?.content ?? ""); } catch { /* recorded below */ }
  const norm = raw && (await readingsOf(spec, fx, raw));
  const meta = { spec: folder(spec), effort: EFFORT, contentChars: json.choices?.[0]?.message?.content?.length ?? null, fixture: fx.id, variant, latencyMs, usd, usage: json.usage, finish: json.choices?.[0]?.finish_reason };
  const dir = join(OUT, folder(spec));
  mkdirSync(dir, { recursive: true });
  const score = norm ? scoreRun(fx, norm.readings) : null;
  writeFileSync(join(dir, `${fx.id}.${variant}.json`), JSON.stringify({ meta, raw, normalized: norm, score }, null, 2));
  if (norm) writeFileSync(join(dir, `${fx.id}.${variant}.md`), renderRun(fx, meta, raw, norm, score));
  console.log(`${label}: ${latencyMs} ms $${usd.toFixed(4)} ${score ? `acc ${score.accOk}/${score.n} hard ${score.hardFails.length} over ${score.overCeiling.length}` : "INVALID OUTPUT"}`);
}

async function main() {
  if (args.includes("--report")) return writeReport(FIXTURES);
  const spec = opt("spec", "v3");
  const variants = opt("variants", "selfA,selfB").split(",");
  const only = opt("only", "");
  const fixtures = only ? FIXTURES.filter((f) => only.split(",").some((o) => f.id.startsWith(o))) : FIXTURES;
  const jobs = fixtures.flatMap((fx) => variants.map((v) => [fx, v]));

  if (spec !== "v2.1") {
    // Role reversal by construction: who the user is must not change the request.
    for (const fx of fixtures) {
      const [a, b] = [await bodyFor(spec, fx, "selfA"), await bodyFor(spec, fx, "selfB")];
      if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${fx.id}: request depends on selfId`);
    }
    console.log("role reversal: requests are identical for selfA and selfB");
  }
  if (args.includes("--dry")) {
    let worst = 0, n = 0;
    for (const [fx, v] of jobs) { const b = await bodyFor(spec, fx, v); if (b) { worst += worstCaseUsd(b); n++; } }
    return console.log(`${n} calls, worst case $${worst.toFixed(2)}`);
  }
  const queue = [...jobs];
  const worker = async () => {
    while (queue.length) {
      const [fx, v] = queue.shift();
      try { await runOne(spec, fx, v); } catch (e) { console.log(`${spec}:${fx.id}:${v}: ${e.message}`); if (e.message.startsWith("Refused")) queue.length = 0; }
    }
  };
  await Promise.all(Array.from({ length: 4 }, worker));
  const l = readLedger();
  console.log(`ledger: ${PHASE} $${(l.byPhase[PHASE] ?? 0).toFixed(4)}; harness total $${l.totalUsd.toFixed(4)}`);
}

main().catch((e) => { console.error(e.message); process.exitCode = 1; });

// Prompt v2 evaluation: every fixture × reasoning effort × N runs, then one report.
//   node scripts/phase0/eval.mjs [--efforts=low,medium] [--runs=2] [--only=05] [--dry]
//   node scripts/phase0/eval.mjs --report      # rebuild results/<spec version>/REPORT.md, no calls, no calls
// Spends from the "eval-v2" bucket ($1, enforced in client.mjs). Synthetic fixtures only.
import { writeFileSync, readFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { chat, readLedger, worstCaseUsd } from "./client.mjs";
import { runChecks } from "./checks.mjs";
import { loadConversations, analysisBody, render } from "./analysis.mjs";
import { ANALYSIS_SPEC_VERSION } from "./p0/spec-v2.1.ts";

// One folder per prompt version, so results of different prompts never mix.
const OUT = join(dirname(fileURLToPath(import.meta.url)), "results", ANALYSIS_SPEC_VERSION);
const MODEL = "muse-spark-1.3";
const args = process.argv.slice(2);
const opt = (name, fallback) => (args.find((a) => a.startsWith(`--${name}=`)) ?? `=${fallback}`).split("=")[1];
const efforts = opt("efforts", "low,medium").split(",");
const runs = Number(opt("runs", "2"));
const convs = loadConversations(opt("only", "all"));
const CONCURRENCY = 4;
const file = (conv, effort, run) => join(OUT, `${conv.id}.${effort}.r${run}`);

async function runOne(conv, effort, run) {
  const { json, latencyMs, usd } = await chat({ phase: "eval-v2", label: `${conv.id}@${effort}#${run}`, body: analysisBody(conv, { model: MODEL, effort }) });
  const finish = json.choices?.[0]?.finish_reason;
  let out;
  try { out = JSON.parse(json.choices?.[0]?.message?.content ?? ""); } catch { return console.log(`${conv.id} ${effort} r${run}: INVALID JSON (${finish})`); }
  const meta = { model: MODEL, effort, run, latencyMs, usd, usage: json.usage, finish };
  const checks = runChecks(conv, out);
  writeFileSync(`${file(conv, effort, run)}.json`, JSON.stringify({ meta, output: out, checks }, null, 2));
  writeFileSync(`${file(conv, effort, run)}.md`, render(conv, out, checks, meta));
  console.log(`${conv.id} ${effort} r${run}: ${latencyMs}ms $${usd.toFixed(4)} issues=${checks.issues.length}`);
}

async function runAll() {
  const jobs = [];
  for (const conv of convs) for (const effort of efforts) for (let r = 1; r <= runs; r++) jobs.push([conv, effort, r]);
  if (args.includes("--dry")) {
    const worst = jobs.reduce((s, [c, e]) => s + worstCaseUsd(analysisBody(c, { model: MODEL, effort: e })), 0);
    return console.log(`${jobs.length} calls, worst case $${worst.toFixed(2)} (cap stops the run before $1)`);
  }
  mkdirSync(OUT, { recursive: true });
  const queue = [...jobs];
  const worker = async () => { while (queue.length) { const [c, e, r] = queue.shift(); try { await runOne(c, e, r); } catch (err) { console.log(`${c.id} ${e} r${r}: ${err.message}`); if (err.message.startsWith("Refused")) queue.length = 0; } } };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
}

// ---------- Report ----------
const load = (conv, effort, run) => (existsSync(`${file(conv, effort, run)}.json`) ? JSON.parse(readFileSync(`${file(conv, effort, run)}.json`, "utf8")) : null);
const pct = (a, b) => (b ? `${Math.round((100 * a) / b)}%` : "–");
function agreement(a, b) {
  let same = 0, n = 0;
  for (const r of a.output.readings) { const o = b.output.readings.find((x) => x.messageId === r.messageId); if (o) { n++; if (o.expression === r.expression) same++; } }
  return [same, n];
}

function report() {
  const rows = [], perEffort = {};
  const consistency = [];
  for (const conv of convs) {
    for (const effort of efforts) {
      const res = Array.from({ length: runs }, (_, i) => load(conv, effort, i + 1)).filter(Boolean);
      for (const r of res) {
        const c = r.checks, e = (perEffort[effort] ??= { n: 0, ms: 0, usd: 0, out: 0 });
        e.n++; e.ms += r.meta.latencyMs; e.usd += r.meta.usd; e.out += r.meta.usage?.completion_tokens ?? 0;
        rows.push(`| ${conv.id} | ${effort} r${r.meta.run} | ${(r.meta.latencyMs / 1000).toFixed(1)} s | $${r.meta.usd.toFixed(4)} | ${c.cueVerbatimRate} | ${c.unclearCount} | ${c.secondLayers.join(" ") || "–"} | ${c.shifts.join(" ") || "–"} | ${c.outsidePlausible.length} | ${c.flags.unsupportedInference.length} | ${c.flags.leadingQuestions.length} | ${c.repeatedOpeners} | ${c.issues.length} |`);
      }
      if (res.length >= 2) { const [s, n] = agreement(res[0], res[1]); consistency.push(`| ${conv.id} | ${effort} run 1 vs 2 | ${s}/${n} (${pct(s, n)}) |`); }
    }
    const lo = load(conv, "low", 1), me = load(conv, "medium", 1);
    if (lo && me) { const [s, n] = agreement(lo, me); consistency.push(`| ${conv.id} | low vs medium (run 1) | ${s}/${n} (${pct(s, n)}) |`); }
  }
  const ledger = readLedger();
  const L = ["# Prompt v2 evaluation — automatic metrics", "",
    `Model ${MODEL}. Generated ${new Date().toISOString()}. eval-v2 spend: $${(ledger.byPhase["eval-v2"] ?? 0).toFixed(4)} (cap $1). Automatic checks flag candidates for human review; agreement with our labels is not proof of correctness.`, "",
    "## Per effort", "| effort | runs | avg latency | avg cost | avg output tokens |", "|---|---|---|---|---|",
    ...Object.entries(perEffort).map(([k, e]) => `| ${k} | ${e.n} | ${(e.ms / e.n / 1000).toFixed(1)} s | $${(e.usd / e.n).toFixed(4)} | ${Math.round(e.out / e.n)} |`), "",
    "## Consistency (same expression per message)", "| fixture | comparison | agreement |", "|---|---|---|", ...consistency, "",
    "## Per run", "| fixture | run | latency | cost | cues verbatim | UNCLEAR | second layer | shifts | outside our plausible set | unsupported-inference flags | leading-question flags | repeated question openers | issues |",
    "|---|---|---|---|---|---|---|---|---|---|---|---|---|", ...rows, ""];
  writeFileSync(join(OUT, "REPORT.md"), L.join("\n"));
  console.log(`wrote ${join(OUT, "REPORT.md")}`);
}

try {
  if (!args.includes("--report")) await runAll();
  if (!args.includes("--dry")) report();
  const l = readLedger();
  console.log(`ledger: total $${l.totalUsd.toFixed(4)}; eval-v2 $${(l.byPhase["eval-v2"] ?? 0).toFixed(4)} / $1`);
} catch (e) {
  console.error(e.message);
  process.exitCode = 1;
}

// Phase 0 runner.
//   node scripts/phase0/run.mjs smoke              # access + structured output check (≤ $1 bucket)
//   node scripts/phase0/run.mjs analyze <id|all>   # transactional analysis on synthetic conversations
//   node scripts/phase0/run.mjs check <id|all>     # re-run automatic checks offline
//   add --dry to print worst-case cost without calling; --effort=<low|medium|high> to tune reasoning
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { chat, readLedger, CAPS } from "./client.mjs";
import { analysisSchema, SOURCE_OF } from "./schema.mjs";
import { SYSTEM_PROMPT, userPayload } from "./prompt.mjs";
import { runChecks } from "./checks.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const CONV_DIR = join(HERE, "conversations");
const RES_DIR = join(HERE, "results");
const MODEL = "muse-spark-1.3";

const args = process.argv.slice(2);
const cmd = args[0];
const target = args[1];
const dry = args.includes("--dry");
const effort = (args.find((a) => a.startsWith("--effort=")) ?? "--effort=medium").split("=")[1];

function loadConversations(which) {
  const files = readdirSync(CONV_DIR).filter((f) => f.endsWith(".json")).sort();
  const picked = which === "all" ? files : files.filter((f) => f.startsWith(which));
  if (!picked.length) throw new Error(`No conversation matches "${which}"`);
  return picked.map((f) => JSON.parse(readFileSync(join(CONV_DIR, f), "utf8")));
}

async function smoke() {
  const plain = {
    model: MODEL, reasoning_effort: "minimal", max_completion_tokens: 300,
    messages: [{ role: "user", content: "Reply with exactly: OK" }],
  };
  const structured = {
    model: MODEL, reasoning_effort: "minimal", max_completion_tokens: 600,
    messages: [{ role: "user", content: "Classify the message 'You always do this.' as one of CP, NP, A, FC, AC and quote the cue." }],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "Tiny", strict: true,
        schema: {
          type: "object", additionalProperties: false, required: ["expression", "cue"],
          properties: { expression: { type: "string", enum: ["CP", "NP", "A", "FC", "AC"] }, cue: { type: "string" } },
        },
      },
    },
  };
  if (dry) return console.log("dry run: 2 smoke calls, worst case < $0.01");
  for (const [label, body] of [["smoke-plain", plain], ["smoke-structured", structured]]) {
    const { json, latencyMs, usd } = await chat({ phase: "smoke", label, body });
    const content = json.choices?.[0]?.message?.content ?? "";
    let parsed = null;
    if (label === "smoke-structured") { try { parsed = JSON.parse(content); } catch { parsed = "INVALID JSON"; } }
    // Smoke prompts are our own fixed strings, so printing the reply is safe.
    console.log(JSON.stringify({ label, latencyMs, usd: +usd.toFixed(5), usage: json.usage, reply: parsed ?? content }, null, 2));
  }
}

function render(conv, out, checks, meta) {
  const name = Object.fromEntries(conv.participants.map((p) => [p.id, p.displayName]));
  const lines = [`# ${conv.id}`, ``, `${conv.description}`, ``, `effort=${meta.effort} latency=${meta.latencyMs}ms cost=$${meta.usd.toFixed(4)} usage=${JSON.stringify(meta.usage)}`, ``];
  lines.push(`## Readings`, `| id | speaker | text | expr | src→tgt | conf | alt | cues | rationale | reflection Q |`, `|---|---|---|---|---|---|---|---|---|---|`);
  for (const m of conv.messages) {
    const r = out.readings.find((x) => x.messageId === m.id);
    if (!r) { lines.push(`| ${m.id} | ${name[m.speakerId]} | ${m.text} | MISSING |||||||`); continue; }
    lines.push(`| ${m.id} | ${name[m.speakerId]}${m.speakerId === conv.selfId ? " (me)" : ""} | ${m.text} | ${r.expression} | ${SOURCE_OF[r.expression]}→${r.target} | ${r.confidence} | ${r.alternative ?? ""} | ${r.cues.join(" / ")} | ${r.rationale} | ${r.reflectionQuestion ?? ""} |`);
  }
  lines.push(``, `## Transactions`, `| pair | type | hidden | conf | explanation |`, `|---|---|---|---|---|`);
  for (const t of out.transactions) lines.push(`| ${t.stimulusId}→${t.responseId} | ${t.type} | ${t.hiddenMessage ?? ""} | ${t.confidence} | ${t.explanation} |`);
  lines.push(``, `## Turning points`, ...out.turningPoints.map((t) => `- ${t.messageId}: ${t.why}`));
  lines.push(``, `## Summary`, out.summary, ``, `## Uncertainty`, out.uncertainty, ``, `## Safety`, "```json", JSON.stringify(out.safety, null, 2), "```");
  lines.push(``, `## Expected (our hypothesis)`, "```json", JSON.stringify(conv.expected, null, 2), "```");
  lines.push(``, `## Automatic checks`, "```json", JSON.stringify(checks, null, 2), "```", ``);
  return lines.join("\n");
}

async function analyze(which) {
  mkdirSync(RES_DIR, { recursive: true });
  for (const conv of loadConversations(which)) {
    const body = {
      model: MODEL, reasoning_effort: effort, max_completion_tokens: 12000,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: userPayload(conv) }],
      response_format: { type: "json_schema", json_schema: { name: "Observation", strict: true, schema: analysisSchema } },
    };
    if (dry) { console.log(`${conv.id}: prompt ~${Math.ceil(JSON.stringify(body.messages).length / 3)} tokens, worst case ~$${(Math.ceil(JSON.stringify(body.messages).length / 3) * 1.25e-6 + 12000 * 4.25e-6).toFixed(3)}`); continue; }
    const { json, latencyMs, usd } = await chat({ phase: "eval", label: `${conv.id}@${effort}`, body });
    const content = json.choices?.[0]?.message?.content ?? "";
    let out;
    try { out = JSON.parse(content); } catch {
      console.log(`${conv.id}: INVALID JSON (finish_reason=${json.choices?.[0]?.finish_reason})`);
      continue;
    }
    const meta = { effort, latencyMs, usd, usage: json.usage };
    const checks = runChecks(conv, out);
    writeFileSync(join(RES_DIR, `${conv.id}.${effort}.json`), JSON.stringify({ meta, output: out, checks }, null, 2));
    writeFileSync(join(RES_DIR, `${conv.id}.${effort}.md`), render(conv, out, checks, meta));
    console.log(`${conv.id}: ${latencyMs}ms $${usd.toFixed(4)} coverage=${checks.coverage} cues=${checks.cueVerbatimRate} issues=${checks.issues.length}`);
  }
}

function check(which) {
  for (const conv of loadConversations(which)) {
    const p = join(RES_DIR, `${conv.id}.${effort}.json`);
    if (!existsSync(p)) { console.log(`${conv.id}: no result at effort=${effort}`); continue; }
    const { output } = JSON.parse(readFileSync(p, "utf8"));
    console.log(conv.id, JSON.stringify(runChecks(conv, output), null, 2));
  }
}

try {
  if (cmd === "smoke") await smoke();
  else if (cmd === "analyze") await analyze(target ?? "all");
  else if (cmd === "check") check(target ?? "all");
  else console.log("usage: run.mjs smoke | analyze <id|all> | check <id|all> [--dry] [--effort=medium]");
  const l = readLedger();
  console.log(`ledger: total $${l.totalUsd.toFixed(4)} / cap $${CAPS.total}; smoke $${(l.byPhase.smoke ?? 0).toFixed(4)} / cap $${CAPS.smoke}`);
} catch (e) {
  console.error(e.message);
  process.exitCode = 1;
}

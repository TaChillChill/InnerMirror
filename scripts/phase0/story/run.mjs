// U3 story eval: narration goes in as `context` (no prompt change). Live calls from the
// "eval-story" bucket.   node scripts/phase0/story/run.mjs [--runs=2] [--only=vi-mom] [--dry]
// Uses the app's parser, request builder, analysis body and cleaner, so what we test is what ships.
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { chat, worstCaseUsd } from "../client.mjs";
import { STORIES } from "./fixtures.mjs";
import { parseStory, storyContext } from "../../../src/lib/story.ts";
import { analyzeRequestSchema, toAnalyzeRequest } from "../../../src/lib/conversation.ts";
import { ANALYSIS_SPEC_VERSION, buildAnalysisBody } from "../../../src/lib/ai/analysis-spec.ts";
import { capForStory, cleanAnalysis } from "../../../src/lib/ai/analysis.ts";

const args = process.argv.slice(2);
const opt = (name, fallback) => (args.find((a) => a.startsWith(`--${name}=`)) ?? `=${fallback}`).split("=")[1];
const RUNS = Number(opt("runs", 2));
const only = opt("only", "");
const DRY = args.includes("--dry");
const OUT = join(import.meta.dirname, "../results/story");
const NAMES = { vi: { unknown: "Chưa rõ", me: "Mình" }, en: { unknown: "Unknown", me: "Me" } };

const plan = STORIES.filter((s) => !only || only.split(",").includes(s.id)).map((s) => {
  const t = parseStory(s.text, NAMES[s.language]);
  const req = analyzeRequestSchema.parse(toAnalyzeRequest(t, null, s.language, storyContext(t, s.language)));
  return { s, t, req, body: { model: "muse-spark-1.3", ...buildAnalysisBody(req, { effort: "low" }) } };
});
for (const p of plan) console.log(`${p.s.id}: ${p.req.messages.length} dialogue, ${p.t.narration.length} narration, speakers ${p.t.participants.map((x) => x.name).join("/")}`);
const worst = plan.reduce((n, p) => n + worstCaseUsd(p.body) * RUNS, 0);
console.log(`spec ${ANALYSIS_SPEC_VERSION}: ${plan.length} stories × ${RUNS} runs, worst case $${worst.toFixed(3)}`);
if (DRY) process.exit(0);

mkdirSync(OUT, { recursive: true });
let spent = 0;
const rows = [];
for (const p of plan) {
  for (let run = 1; run <= RUNS; run++) {
    try {
      const { json, usd, latencyMs } = await chat({ phase: "eval-story", label: `story-${p.s.id}-r${run}`, body: p.body });
      spent += usd;
      const raw = JSON.parse(json.choices?.[0]?.message?.content ?? "null");
      const cleaned = cleanAnalysis(raw, p.req.messages);
      const a = cleaned && capForStory(cleaned);
      const out = a ? JSON.stringify({ summary: a.summary, uncertainty: a.uncertainty, rationales: a.segments.map((x) => [x.rationale, x.alternative?.rationale ?? "", x.secondLayer?.observation ?? ""]), shifts: a.shifts.map((x) => x.description) }) : "";
      const leaked = p.s.banned.filter((w) => out.toLowerCase().includes(w.toLowerCase()));
      const highRaw = (raw?.segments ?? []).filter((x) => x.confidence === "high").length;
      const checks = { valid: !!a, noLeak: leaked.length === 0, noHighShown: !!a && a.readings.every((r) => r.confidence !== "high"), safetyFlag: a?.safety?.flagged ?? null };
      rows.push({ id: p.s.id, run, latencyMs, usd, leaked, highRaw, checks, analysis: a });
      console.log(`${p.s.id} r${run}: ${Object.entries(checks).filter(([k, v]) => k !== "safetyFlag" && !v).map(([k]) => k).join(",") || "PASS"}${leaked.length ? ` leaked=${leaked}` : ""} highRaw=${highRaw} safety=${checks.safetyFlag} (${(latencyMs / 1000).toFixed(1)} s, $${usd.toFixed(4)})`);
    } catch (e) {
      rows.push({ id: p.s.id, run, error: e.message });
      console.log(`${p.s.id} r${run}: ERROR ${e.message}`);
    }
  }
}
writeFileSync(join(OUT, `${ANALYSIS_SPEC_VERSION}-${new Date().toISOString().replace(/[:.]/g, "-")}.json`), JSON.stringify(rows, null, 2));
console.log(`spent $${spent.toFixed(4)}`);

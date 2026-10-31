// P0 eval rendering: one Markdown file per run for human review, and REPORT.md with the
// comparisons (baseline vs v3, role reversal, grouping ablation, context).
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readLedger } from "../client.mjs";
import { agreement, scoreRun } from "./score.mjs";

export const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "results", "p0");
// Folders: v2.1 = baseline (medium); v3.1 = first fix at medium; v3.1-msg = v3.1 without
// turn grouping; v3.1-low = v3.1 at low effort; v3 = the shipped spec (v3.2, low effort).
const SPECS = ["v2.1", "v3.1", "v3.1-msg", "v3.1-low", "v3"];
const cell = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
const pct = (a, b) => (b ? `${Math.round((100 * a) / b)}%` : "–");

export function renderRun(fx, meta, raw, norm, score) {
  const per = Object.fromEntries(score.per.map((p) => [p.id, p]));
  const seg = (id) => norm.segments?.find((s) => s.messageIds.includes(id));
  const L = [`# ${fx.id} · ${meta.spec} · ${meta.variant}`, "", fx.description, "",
    `latency ${meta.latencyMs} ms · $${meta.usd.toFixed(4)} · out ${meta.usage?.completion_tokens} tok`, ""];
  if (raw.context) L.push("## Context (model)", `- register: ${raw.context.register}`, `- dynamics: ${raw.context.dynamics}`, ...raw.context.turns.map((t) => `- ${t.turnId}: ${t.act}${t.respondsTo ? ` (→ ${t.respondsTo})` : ""}`), "");
  L.push("## Readings", "| id | spk | text | seg | label | conf | ref | alt | cues | rationale |", "|---|---|---|---|---|---|---|---|---|---|");
  for (const m of fx.messages) {
    const r = norm.readings.find((x) => x.messageId === m.id);
    const p = per[m.id];
    const flag = p.hard ? `HARD(${p.hard})` : p.acc === false ? "outside" : p.acc ? "ok" : "";
    const s = seg(m.id);
    L.push(`| ${m.id} | ${m.speakerId} | ${cell(m.text)} | ${s ? `${s.id}${s.splitReason ? "*" : ""}` : ""} | ${r?.expression}${r?.family && r.expression === "UNCLEAR" ? `(${r.family})` : ""} | ${r?.confidence}${p.over ? " ↑" : ""} | ${flag} | ${r?.alternative ? `${r.alternative.expression}: ${cell(r.alternative.rationale)}` : ""} | ${cell(r?.cues?.join(" / "))} | ${cell(r?.rationale)} |`);
  }
  L.push("", "## Shifts", ...(raw.shifts ?? []).map((s) => `- ${s.messageId}: ${s.description}`), "", "## Summary", raw.summary ?? "", "", "## Uncertainty", raw.uncertainty ?? "", "", `Safety: ${JSON.stringify(raw.safety)}`, "");
  return L.join("\n");
}

let FX = {};
// Scores are recomputed on load, so a fix to the scoring rules applies to every saved run.
const load = (spec, fx, variant) => {
  const f = join(OUT, spec, `${fx}.${variant}.json`);
  if (!existsSync(f)) return null;
  const r = JSON.parse(readFileSync(f, "utf8"));
  if (r.normalized) r.score = scoreRun(FX[fx], r.normalized.readings);
  return r;
};

export function writeReport(fixtures) {
  FX = Object.fromEntries(fixtures.map((f) => [f.id, f]));
  const L = ["# P0 classification eval — automatic metrics", "", `Generated ${new Date().toISOString()}. Model muse-spark-1.3. Effort: medium for v2.1/v3.1/v3.1-msg, low for v3.1-low and v3 (= v3.2, shipped). Reference sets are Claude's hypotheses (see fixtures); misses are prompts for review, not proof.`, ""];
  L.push("## Totals (selfA runs)", "| spec | runs | acceptable | hard fails | over ceiling | high on review items | no alternative when < high | UNCLEAR | high | avg latency | avg cost | avg out tokens |", "|---|---|---|---|---|---|---|---|---|---|---|---|");
  for (const spec of SPECS) {
    const runs = fixtures.map((f) => load(spec, f.id, "selfA")).filter((r) => r?.score);
    if (!runs.length) continue;
    const sum = (fn) => runs.reduce((s, r) => s + fn(r), 0);
    L.push(`| ${spec} | ${runs.length} | ${sum((r) => r.score.accOk)}/${sum((r) => r.score.n)} (${pct(sum((r) => r.score.accOk), sum((r) => r.score.n))}) | ${sum((r) => r.score.hardFails.length)} | ${sum((r) => r.score.overCeiling.length)} | ${sum((r) => r.score.highOnReview)} | ${sum((r) => r.score.altMissing)} | ${sum((r) => r.score.unclear)} | ${sum((r) => r.score.high)} | ${(sum((r) => r.meta.latencyMs) / runs.length / 1000).toFixed(1)} s | $${(sum((r) => r.meta.usd) / runs.length).toFixed(4)} | ${Math.round(sum((r) => r.meta.usage?.completion_tokens ?? 0) / runs.length)} |`);
  }
  L.push("", "## Per fixture (selfA)", "| fixture | spec | acceptable | hard fails | over ceiling | segments | safety |", "|---|---|---|---|---|---|---|");
  for (const f of fixtures) for (const spec of SPECS) {
    const r = load(spec, f.id, "selfA");
    if (!r?.score) continue;
    const segs = r.normalized.segments ? `${r.normalized.segments.length} seg / ${f.messages.length} msg${r.normalized.segments.some((s) => s.splitReason) ? " (split)" : ""}` : "–";
    L.push(`| ${f.id} | ${spec} | ${r.score.accOk}/${r.score.n} | ${r.score.hardFails.join(", ") || "–"} | ${r.score.overCeiling.join(", ") || "–"} | ${segs} | ${r.raw.safety.flagged ? `flagged (${r.raw.safety.categories.join(",")})` : "no"} (exp ${f.expected.safety}) |`);
  }
  L.push("", "## Role reversal (selfA vs selfB, same fixture)", "v2.1 sends who the user is; v3.x sends identical requests, so its difference is run-to-run noise only.", "| fixture | spec | same label | same P/A/C | differences |", "|---|---|---|---|---|");
  for (const spec of ["v2.1", "v3.1", "v3.1-low", "v3"]) {
    let te = 0, tf = 0, tn = 0;
    for (const f of fixtures) {
      const a = load(spec, f.id, "selfA"), b = load(spec, f.id, "selfB");
      if (!a?.score || !b?.score) continue;
      const g = agreement(a.score, b.score);
      te += g.expr; tf += g.fam; tn += g.n;
      L.push(`| ${f.id} | ${spec} | ${g.expr}/${g.n} | ${g.fam}/${g.n} | ${g.diffs.join("; ") || "–"} |`);
    }
    if (tn) L.push(`| **all** | ${spec} | **${pct(te, tn)}** | **${pct(tf, tn)}** | |`);
  }
  L.push("", "## Context variants (v3.1, medium) vs no-context runs", "| fixture | variant | vs selfA | vs selfB | hard fails | over ceiling |", "|---|---|---|---|---|---|");
  for (const f of fixtures) for (const key of Object.keys(f.contexts)) {
    const c = load("v3.1", f.id, `ctx-${key}`), a = load("v3.1", f.id, "selfA"), b = load("v3.1", f.id, "selfB");
    if (!c?.score) continue;
    const da = a?.score ? agreement(a.score, c.score).diffs.join("; ") || "same" : "–";
    const db = b?.score ? agreement(b.score, c.score).diffs.join("; ") || "same" : "–";
    L.push(`| ${f.id} | ${key} | ${da} | ${db} | ${c.score.hardFails.join(", ") || "–"} | ${c.score.overCeiling.join(", ") || "–"} |`);
  }
  const ledger = readLedger();
  L.push("", `eval-p0 spend so far: $${(ledger.byPhase["eval-p0"] ?? 0).toFixed(4)} (cap $3).`, "");
  writeFileSync(join(OUT, "REPORT.md"), L.join("\n"));
  console.log(`wrote ${join(OUT, "REPORT.md")}`);
}

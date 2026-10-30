// Shared by run.mjs and eval.mjs: fixtures, the v2 analysis request (built from the
// same spec the app uses) and a Markdown rendering for human review.
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { SYSTEM_PROMPT, ANALYSIS_JSON_SCHEMA, ANALYSIS_SPEC_VERSION, buildUserPayload, pseudonymLabel, SELF_LABEL } from "../../src/lib/ai/analysis-spec.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
export const CONV_DIR = join(HERE, "conversations");
export const MAX_OUTPUT_TOKENS = 12000;

export function loadConversations(which) {
  const files = readdirSync(CONV_DIR).filter((f) => f.endsWith(".json")).sort();
  const picked = which === "all" ? files : files.filter((f) => f.startsWith(which));
  if (!picked.length) throw new Error(`No conversation matches "${which}"`);
  return picked.map((f) => JSON.parse(readFileSync(join(CONV_DIR, f), "utf8")));
}

// Same pseudonymization as the app: the model never sees participant names.
export function labelsFor(conv) {
  let i = 0;
  return Object.fromEntries(conv.participants.map((p) =>
    [p.id, p.id === conv.selfId ? SELF_LABEL[conv.language] : pseudonymLabel(i++, conv.language)]));
}

export function analysisBody(conv, { model, effort }) {
  const labels = labelsFor(conv);
  return {
    model, reasoning_effort: effort, max_completion_tokens: MAX_OUTPUT_TOKENS,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPayload({
        language: conv.language, selfId: conv.selfId,
        participants: conv.participants.map((p) => ({ id: p.id, label: labels[p.id] })),
        messages: conv.messages.map(({ id, speakerId, text }) => ({ id, speakerId, text })),
      }) },
    ],
    response_format: { type: "json_schema", json_schema: { name: `Observation_${ANALYSIS_SPEC_VERSION}`, strict: true, schema: ANALYSIS_JSON_SCHEMA } },
  };
}

const cell = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");

export function render(conv, out, checks, meta) {
  const labels = labelsFor(conv);
  const L = [`# ${conv.id} · ${meta.model} @ ${meta.effort}${meta.run ? ` · run ${meta.run}` : ""}`, "", conv.description, "",
    `latency ${meta.latencyMs} ms · $${meta.usd.toFixed(4)} · usage ${JSON.stringify(meta.usage)}`, "",
    "## Readings", "| id | speaker | text | expr | conf | alt | cues | rationale | second layer | reflection Q |", "|---|---|---|---|---|---|---|---|---|---|"];
  for (const m of conv.messages) {
    const r = out.readings.find((x) => x.messageId === m.id);
    const who = `${labels[m.speakerId]}${m.speakerId === conv.selfId ? " (me)" : ""}`;
    if (!r) { L.push(`| ${m.id} | ${who} | ${cell(m.text)} | MISSING |||||||`); continue; }
    L.push(`| ${m.id} | ${who} | ${cell(m.text)} | ${r.expression}→${r.invites} | ${r.confidence} | ${r.alternative ? `${r.alternative.expression}: ${cell(r.alternative.rationale)}` : ""} | ${cell(r.cues.join(" / "))} | ${cell(r.rationale)} | ${r.secondLayer ? cell(r.secondLayer.observation) : ""} | ${cell(r.reflectionQuestion)} |`);
  }
  L.push("", "## Shifts", ...out.shifts.map((s) => `- ${s.messageId}: ${s.description} (${s.cues.join(" / ")})`));
  L.push("", "## Exchanges (experimental)", "| pair | vectors | pattern | note |", "|---|---|---|---|");
  for (const e of out.exchanges) L.push(`| ${e.stimulusId}→${e.responseId} | ${e.stimulusFrom}→${e.stimulusAddresses} / ${e.responseFrom}→${e.responseAddresses} | ${e.pattern} | ${cell(e.note)} |`);
  L.push("", "## Summary", out.summary, "", "## Uncertainty", out.uncertainty, "", "## Safety", "```json", JSON.stringify(out.safety), "```");
  L.push("", "## Our hypothesis (not ground truth)", "```json", JSON.stringify(conv.expected), "```", "", "## Automatic checks", "```json", JSON.stringify(checks, null, 2), "```", "");
  return L.join("\n");
}

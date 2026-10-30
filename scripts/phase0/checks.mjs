// Automatic checks on an AI Observation. They catch mechanical failures;
// interpretation quality still needs human review against the rubric.
import { SOURCE_OF } from "./schema.mjs";

const FORBIDDEN = [
  "narciss", "toxic", "gaslight", "manipulat", "trauma", "depress", "anxious attachment", "avoidant",
  "disorder", "diagnos", "abuser", "codependen", "insecure",
  "ái kỷ", "độc hại", "thao túng", "trầm cảm", "sang chấn", "rối loạn", "chẩn đoán",
];
const PERSON_LABEL = /\b(is|are) (a|an|the)? ?(critical|nurturing|controlling) parent\b|\b(is|are) (an|a)? ?(adult|adapted child|free child)\b/i;

export function expectedType(stim, resp) {
  const sSource = SOURCE_OF[stim.expression], rSource = SOURCE_OF[resp.expression];
  if ([sSource, rSource, stim.target, resp.target].includes("UNCLEAR")) return "unclear";
  return rSource === stim.target && resp.target === sSource ? "complementary" : "crossed";
}

export function runChecks(conv, out) {
  const issues = [];
  const msgById = Object.fromEntries(conv.messages.map((m) => [m.id, m]));
  const readingById = Object.fromEntries(out.readings.map((r) => [r.messageId, r]));

  for (const m of conv.messages) if (!readingById[m.id]) issues.push(`missing reading for ${m.id}`);

  let cueTotal = 0, cueVerbatim = 0;
  for (const r of out.readings) {
    const msg = msgById[r.messageId];
    if (!msg) { issues.push(`reading for unknown id ${r.messageId}`); continue; }
    for (const c of r.cues) {
      cueTotal++;
      if (msg.text.toLowerCase().includes(c.toLowerCase())) cueVerbatim++;
      else issues.push(`${r.messageId}: cue not verbatim: "${c}"`);
    }
    const isSelf = msg.speakerId === conv.selfId;
    if (isSelf && !r.reflectionQuestion) issues.push(`${r.messageId}: self message without reflection question`);
    if (!isSelf && r.reflectionQuestion) issues.push(`${r.messageId}: reflection question on another person's message`);
    if (r.confidence !== "high" && !r.alternative && r.expression !== "UNCLEAR")
      issues.push(`${r.messageId}: no alternative despite ${r.confidence} confidence`);
  }

  const txConsistency = [];
  for (const t of out.transactions) {
    const s = readingById[t.stimulusId], r = readingById[t.responseId];
    if (!s || !r) { issues.push(`transaction ${t.stimulusId}->${t.responseId} references unknown id`); continue; }
    const rule = expectedType(s, r);
    // Ulterior is a layer on top of the social level, so it doesn't contradict the rule.
    const consistent = t.type === rule || t.type === "ulterior" || (t.type === "unclear" && t.confidence === "low");
    txConsistency.push({ pair: `${t.stimulusId}->${t.responseId}`, model: t.type, rule, consistent });
    if (!consistent) issues.push(`${t.stimulusId}->${t.responseId}: model says ${t.type}, source/target rule says ${rule}`);
  }

  const allText = JSON.stringify(out).toLowerCase();
  const forbiddenHits = FORBIDDEN.filter((w) => allText.includes(w));
  for (const w of forbiddenHits) issues.push(`forbidden term: "${w}"`);
  if (PERSON_LABEL.test(JSON.stringify(out))) issues.push("labels a person instead of a message");

  const expectFlag = conv.expected?.safetyFlagged;
  if (expectFlag !== undefined && out.safety.flagged !== expectFlag)
    issues.push(`safety.flagged=${out.safety.flagged}, expected ${expectFlag}`);

  return {
    coverage: `${out.readings.length}/${conv.messages.length}`,
    cueVerbatimRate: cueTotal ? +(cueVerbatim / cueTotal).toFixed(2) : null,
    txConsistency,
    forbiddenHits,
    issues,
  };
}

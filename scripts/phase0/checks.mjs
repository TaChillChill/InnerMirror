// Automatic checks on an AI Observation (spec v2). They flag mechanical and wording
// problems for human review; they are not a measure of interpretive correctness.
import { patternFromVectors } from "../../src/lib/ai/analysis-spec.ts";

const FORBIDDEN = [
  "narciss", "toxic", "gaslight", "manipulat", "trauma", "depress", "anxious attachment", "avoidant",
  "disorder", "diagnos", "abuser", "codependen", "insecure",
  "ái kỷ", "độc hại", "thao túng", "trầm cảm", "sang chấn", "rối loạn", "chẩn đoán",
];
const PERSON_LABEL = /\b(is|are) (a|an|the)? ?(critical|nurturing|controlling) parent\b|\b(is|are) (an|a)? ?(adult|adapted child|free child)\b|(^|\s)là (một )?(cha mẹ (phê phán|nuôi dưỡng)|người trưởng thành|trẻ em (tự do|thích nghi))/iu;

// Heuristic: mental-state words about another person that the message itself doesn't
// contain. Flags candidates of unsupported inference; a human decides.
const MENTAL_EN = /\b(feels?|felt|wants?|wanted|trying to|tries to|intends?|meant|really means?|angry|upset|hurt|frustrat\w*|resent\w*|jealous|guilty|annoyed|afraid|worried|defensive|insecur\w*|disappoint\w*)\b/gi;
const MENTAL_VI = /(cảm thấy|muốn|cố tình|thực ra|giận|bực|buồn|tổn thương|lo lắng|sợ|ghen|có lỗi|thất vọng|phòng thủ)/giu;
// Emotion words inside a question assume a feeling for the user.
const LEADING_Q = /\b(angry|upset|hurt|frustrated|guilty|annoyed|afraid|ashamed|why did you|why do you)\b|(giận|bực|buồn|tổn thương|có lỗi|xấu hổ|tại sao bạn|vì sao bạn)/iu;

const norm = (s) => s.normalize("NFC").toLowerCase();
const has = (text, cue) => norm(text).includes(norm(cue));

export function runChecks(conv, out) {
  const issues = [];
  const flags = { unsupportedInference: [], leadingQuestions: [] };
  const msgById = Object.fromEntries(conv.messages.map((m) => [m.id, m]));
  const readingById = Object.fromEntries(out.readings.map((r) => [r.messageId, r]));
  for (const m of conv.messages) if (!readingById[m.id]) issues.push(`missing reading for ${m.id}`);

  let cueTotal = 0, cueVerbatim = 0;
  const countCues = (id, cues) => {
    for (const c of cues) {
      cueTotal++;
      if (has(msgById[id]?.text ?? "", c)) cueVerbatim++;
      else issues.push(`${id}: cue not verbatim: "${c}"`);
    }
  };
  const questions = [];
  for (const r of out.readings) {
    const msg = msgById[r.messageId];
    if (!msg) { issues.push(`reading for unknown id ${r.messageId}`); continue; }
    countCues(r.messageId, r.cues);
    if (r.secondLayer) countCues(r.messageId, r.secondLayer.cues);
    const isSelf = msg.speakerId === conv.selfId;
    if (isSelf && !r.reflectionQuestion && !out.safety.flagged) issues.push(`${r.messageId}: self message without reflection question`);
    if (!isSelf && r.reflectionQuestion) issues.push(`${r.messageId}: reflection question on another person's message`);
    if (r.expression !== "UNCLEAR" && r.cues.length === 0) issues.push(`${r.messageId}: reading without cues`);
    if (r.confidence !== "high" && !r.alternative && r.expression !== "UNCLEAR") issues.push(`${r.messageId}: no alternative despite ${r.confidence} confidence`);
    if (r.reflectionQuestion) {
      questions.push(r.reflectionQuestion);
      if (LEADING_Q.test(r.reflectionQuestion)) flags.leadingQuestions.push(`${r.messageId}: ${r.reflectionQuestion}`);
    }
    if (!isSelf) {
      const prose = [r.rationale, r.alternative?.rationale, r.secondLayer?.observation].filter(Boolean).join(" ");
      const words = [...prose.matchAll(MENTAL_EN), ...prose.matchAll(MENTAL_VI)].map((x) => x[0].toLowerCase());
      const unsupported = [...new Set(words)].filter((w) => !has(msg.text, w));
      if (unsupported.length) flags.unsupportedInference.push(`${r.messageId}: ${unsupported.join(", ")}`);
    }
  }
  for (const s of out.shifts) {
    if (!msgById[s.messageId]) issues.push(`shift on unknown id ${s.messageId}`);
    else countCues(s.messageId, s.cues);
  }

  // Questions that open with the same four words read as a template.
  const openers = questions.map((q) => norm(q).split(/\s+/).slice(0, 4).join(" "));
  const repeatedOpeners = openers.length - new Set(openers).size;

  const exchanges = out.exchanges.map((e) => {
    const rule = patternFromVectors(e);
    if (e.pattern !== rule) issues.push(`${e.stimulusId}->${e.responseId}: pattern ${e.pattern} contradicts its own vectors (${rule})`);
    return { pair: `${e.stimulusId}->${e.responseId}`, pattern: e.pattern, vectorsRule: rule };
  });

  const allText = JSON.stringify(out).toLowerCase();
  for (const w of FORBIDDEN.filter((w) => allText.includes(w))) issues.push(`forbidden term: "${w}"`);
  if (PERSON_LABEL.test(JSON.stringify(out))) issues.push("labels a person instead of a message");
  const expectFlag = conv.expected?.safetyFlagged;
  if (expectFlag !== undefined && out.safety.flagged !== expectFlag) issues.push(`safety.flagged=${out.safety.flagged}, expected ${expectFlag}`);

  // "Plausible" sets are our hypotheses, not ground truth: a reading outside them is a
  // prompt to look closer, not an error.
  const plausible = conv.expected?.plausible ?? {};
  const outsidePlausible = out.readings.filter((r) => plausible[r.messageId] && !plausible[r.messageId].includes(r.expression))
    .map((r) => `${r.messageId}: ${r.expression} (we listed ${plausible[r.messageId].join("/")})`);

  return {
    coverage: `${out.readings.length}/${conv.messages.length}`,
    cueVerbatimRate: cueTotal ? +(cueVerbatim / cueTotal).toFixed(2) : null,
    unclearCount: out.readings.filter((r) => r.expression === "UNCLEAR").length,
    secondLayers: out.readings.filter((r) => r.secondLayer).map((r) => r.messageId),
    shifts: out.shifts.map((s) => s.messageId),
    repeatedOpeners,
    outsidePlausible,
    exchanges,
    flags,
    issues,
  };
}

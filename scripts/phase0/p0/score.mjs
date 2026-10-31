// Scores one run against a fixture's reference sets. The sets are hypotheses: a miss is a
// prompt for human review, not proof of error. Readings are per message (v3 segment
// readings are expanded to their messages before scoring).
const RANK = { low: 0, medium: 1, high: 2 };
const FAMILY = { CP: "P", NP: "P", A: "A", FC: "C", AC: "C", UNCLEAR: "UNCLEAR" };
export const familyOf = (r) => (r.expression !== "UNCLEAR" ? FAMILY[r.expression] : r.family ?? "UNCLEAR");

// "FC:high" / "A:*" / "*:high" → does this reading match?
// "Sure that it's unclear" carries no claim, so UNCLEAR never counts as overconfident.
const hits = (pattern, r) => {
  const [ex, conf] = pattern.split(":");
  if (r.expression === "UNCLEAR" && ex === "*") return false;
  return (ex === "*" || ex === r.expression) && (conf === "*" || conf === r.confidence);
};

export function scoreRun(fx, readings) {
  const byId = Object.fromEntries(readings.map((r) => [r.messageId, r]));
  const { acc, hard, ceil, review } = fx.expected;
  const per = fx.messages.map((m) => {
    const r = byId[m.id] ?? { expression: "UNCLEAR", confidence: "low", alternative: null };
    return {
      id: m.id, expr: r.expression, family: familyOf(r), conf: r.confidence,
      acc: acc[m.id] ? acc[m.id].includes(r.expression) : null,
      hard: (hard[m.id] ?? []).find((p) => hits(p, r)) ?? null,
      over: ceil[m.id] && r.expression !== "UNCLEAR" ? RANK[r.confidence] > RANK[ceil[m.id]] : false,
      highOnReview: review.includes(m.id) && r.confidence === "high" && r.expression !== "UNCLEAR",
      altMissing: r.expression !== "UNCLEAR" && r.confidence !== "high" && !r.alternative,
    };
  });
  const scored = per.filter((p) => p.acc !== null);
  return {
    per,
    n: scored.length,
    accOk: scored.filter((p) => p.acc).length,
    hardFails: per.filter((p) => p.hard).map((p) => `${p.id} ${p.expr}:${p.conf}`),
    overCeiling: per.filter((p) => p.over).map((p) => `${p.id} ${p.expr}:${p.conf}`),
    highOnReview: per.filter((p) => p.highOnReview).length,
    altMissing: per.filter((p) => p.altMissing).length,
    unclear: per.filter((p) => p.expr === "UNCLEAR").length,
    high: per.filter((p) => p.conf === "high" && p.expr !== "UNCLEAR").length,
  };
}

/** Same message, two runs: functional label and P/A/C family agreement. */
export function agreement(a, b) {
  const n = a.per.length;
  const expr = a.per.filter((p, i) => p.expr === b.per[i].expr).length;
  const fam = a.per.filter((p, i) => p.family === b.per[i].family).length;
  const diffs = a.per.flatMap((p, i) => (p.expr !== b.per[i].expr ? [`${p.id} ${p.expr}:${p.conf}→${b.per[i].expr}:${b.per[i].conf}`] : []));
  return { n, expr, fam, diffs };
}

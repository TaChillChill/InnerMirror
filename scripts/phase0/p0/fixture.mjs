// Compact fixture builder for the P0 eval: ids m1..mN in order, reference sets as
// space-separated strings so a case stays readable on one line.
const split = (o = {}) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v.split(/\s+/)]));

export function fixture(id, language, description, names, lines, ref) {
  return {
    id, language, description,
    participants: names.map((displayName, i) => ({ id: `p${i + 1}`, displayName })),
    messages: lines.map(([speakerId, text], i) => ({ id: `m${i + 1}`, speakerId, text })),
    expected: { acc: split(ref.acc), hard: split(ref.hard), ceil: ref.ceil ?? {}, review: ref.review ?? [], safety: ref.safety },
    contexts: ref.contexts ?? {},
  };
}

// Dry-run answers for /api/* ($0). Built for conversation A so the flow and selectors match
// the live take. Every model text here says MOCK: it must never appear in the film.
const ROOT = new URL("../../../", import.meta.url).pathname;

export async function mockApi() {
  const { CHAT } = await import(`${ROOT}design/film/src/story.ts`);
  const { cleanAnalysis } = await import(`${ROOT}src/lib/ai/analysis.ts`);
  const messages = CHAT.map((m, i) => ({ id: `m${i + 1}`, speakerId: m.who === "J" ? "p1" : "p2", text: m.text }));
  // One segment per turn (back-to-back messages from the same person form one turn).
  const turns = [];
  for (const m of messages) {
    const last = turns.at(-1);
    if (last && last.speakerId === m.speakerId) last.ids.push(m.id);
    else turns.push({ speakerId: m.speakerId, ids: [m.id] });
  }
  const stateOf = (id) => CHAT[Number(id.slice(1)) - 1].state;
  const family = (s) => (s === "CP" || s === "NP" ? "P" : s === "A" ? "A" : s === "UNCLEAR" ? "UNCLEAR" : "C");
  const raw = {
    context: { register: "MOCK register.", dynamics: "MOCK dynamics.", turns: turns.map((t, i) => ({ turnId: `t${i + 1}`, act: "MOCK act", respondsTo: i ? `t${i}` : null })) },
    segments: turns.map((t, i) => {
      const s = stateOf(t.ids.at(-1));
      return { turnId: `t${i + 1}`, messageIds: t.ids, splitReason: null, cues: s === "UNCLEAR" ? [] : [messages.find((m) => m.id === t.ids.at(-1)).text.split(" ")[0]],
        contextCues: [], rationale: "MOCK rationale.", expression: s, family: family(s), invites: "UNCLEAR", confidence: s === "UNCLEAR" ? "low" : "medium", alternative: null, secondLayer: null };
    }),
    shifts: [{ messageId: "m5", description: "MOCK shift.", cues: ["k??"] }],
    summary: "MOCK summary.", uncertainty: "MOCK uncertainty.", safety: { flagged: false, categories: [], note: null },
  };
  const analysis = cleanAnalysis(raw, messages);
  if (!analysis) throw new Error("mock analysis failed validation");
  const extraction = {
    speakers: [{ key: "S1", displayedName: "Jordan", side: "left" }, { key: "S2", displayedName: null, side: "right" }],
    messages: CHAT.map((m) => ({ speaker: m.who === "J" ? "S1" : "S2", text: m.text, legibility: "clear" })), notes: ["overlap_merged"],
  };
  return {
    "/api/extract": { __delay: 6000, extraction, meta: {} },
    "/api/analyze": { __delay: 9000, analysis, labels: { You: "p2", "Person A": "p1" }, meta: {} },
    "/api/scenario": { __delay: 7000, labels: {}, meta: {}, scenario: { flagged: false, evidence: "thin", reason: "model", ranked: false,
      possibilities: [{ state: "CP", basis: "pattern", rationale: "MOCK rationale.", evidenceMessageIds: ["m6"], cues: ["u didn't actually"] }], note: "MOCK note.", reflectionQuestion: "MOCK question?" } },
  };
}

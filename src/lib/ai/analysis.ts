// Validation and clean-up of the model's AI Observation before anything reaches the UI.
// Constrained decoding gives the right shape; this enforces what a schema can't:
// ids that exist, cues that really are quotes, questions only on the user's messages.
import { z } from "zod";
import { EXPRESSIONS, patternFromVectors } from "./analysis-spec.ts";

const structural = z.enum(["P", "A", "C", "UNCLEAR"]);
const confidence = z.enum(["low", "medium", "high"]);

export const analysisSchema = z.object({
  readings: z.array(z.object({
    messageId: z.string(),
    expression: z.enum([...EXPRESSIONS, "UNCLEAR"]),
    confidence,
    cues: z.array(z.string()),
    rationale: z.string(),
    alternative: z.object({ expression: z.enum(EXPRESSIONS), rationale: z.string() }).nullable(),
    invites: structural,
    secondLayer: z.object({ observation: z.string(), cues: z.array(z.string()) }).nullable(),
    reflectionQuestion: z.string().nullable(),
  })),
  shifts: z.array(z.object({ messageId: z.string(), description: z.string(), cues: z.array(z.string()) })),
  exchanges: z.array(z.object({
    stimulusId: z.string(), responseId: z.string(),
    stimulusFrom: structural, stimulusAddresses: structural, responseFrom: structural, responseAddresses: structural,
    pattern: z.enum(["complementary", "crossed", "unclear"]),
    note: z.string(),
  })),
  summary: z.string(),
  uncertainty: z.string(),
  safety: z.object({
    flagged: z.boolean(),
    categories: z.array(z.enum(["abuse", "coercion", "threat", "self_harm", "harassment"])),
    note: z.string().nullable(),
  }),
});
export type Analysis = z.infer<typeof analysisSchema>;
export type Reading = Analysis["readings"][number];

type SourceMessage = { id: string; speakerId: string; text: string };
const contains = (text: string, cue: string) => text.normalize("NFC").toLowerCase().includes(cue.normalize("NFC").toLowerCase());

/**
 * Returns a cleaned analysis, or null when the output can't be trusted at all
 * (wrong shape, or readings for fewer than half of the messages).
 */
export function cleanAnalysis(raw: unknown, messages: SourceMessage[], selfId: string): Analysis | null {
  const parsed = analysisSchema.safeParse(raw);
  if (!parsed.success) return null;
  const a = parsed.data;
  const byId = new Map(messages.map((m) => [m.id, m]));
  const seen = new Set<string>();

  const readings: Reading[] = [];
  for (const r of a.readings) {
    const m = byId.get(r.messageId);
    if (!m || seen.has(r.messageId)) continue;
    seen.add(r.messageId);
    const cues = r.cues.filter((c) => c.trim() && contains(m.text, c));
    const layerCues = r.secondLayer?.cues.filter((c) => c.trim() && contains(m.text, c)) ?? [];
    readings.push({
      ...r,
      // A reading whose evidence didn't survive is a guess: keep it, but never as "high".
      confidence: cues.length || r.expression === "UNCLEAR" ? r.confidence : "low",
      cues,
      secondLayer: r.secondLayer ? { ...r.secondLayer, cues: layerCues } : null,
      reflectionQuestion: m.speakerId === selfId && !a.safety.flagged ? r.reflectionQuestion : null,
    });
  }
  if (readings.length < Math.ceil(messages.length / 2)) return null;
  // Every message gets a reading so the thread never has a hole; missing ones are UNCLEAR.
  for (const m of messages) {
    if (!seen.has(m.id)) readings.push({ messageId: m.id, expression: "UNCLEAR", confidence: "low", cues: [], rationale: "", alternative: null, invites: "UNCLEAR", secondLayer: null, reflectionQuestion: null });
  }
  const order = new Map(messages.map((m, i) => [m.id, i]));
  readings.sort((x, y) => order.get(x.messageId)! - order.get(y.messageId)!);

  return {
    ...a,
    readings,
    shifts: a.shifts.filter((s) => byId.has(s.messageId)).slice(0, 3)
      .map((s) => ({ ...s, cues: s.cues.filter((c) => contains(byId.get(s.messageId)!.text, c)) })),
    // Experimental: the pattern is recomputed from the vectors so it can't contradict them.
    exchanges: a.exchanges.filter((e) => byId.has(e.stimulusId) && byId.has(e.responseId))
      .map((e) => ({ ...e, pattern: patternFromVectors(e) })),
  };
}

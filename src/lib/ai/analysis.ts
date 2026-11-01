// Validation and clean-up of the model's AI Observation (spec v3) before anything reaches
// the UI. Constrained decoding gives the right shape; this enforces what a schema can't:
// segments that really are contiguous parts of one turn, cues that really are quotes,
// a family that matches the label. Every message ends up with exactly one reading.
import { z } from "zod";
import { EXPRESSIONS, SOURCE_OF, groupTurns } from "./analysis-spec.ts";

const structural = z.enum(["P", "A", "C", "UNCLEAR"]);
const expression = z.enum([...EXPRESSIONS, "UNCLEAR"]);
const confidence = z.enum(["low", "medium", "high"]);

const rawSegment = z.object({
  turnId: z.string(),
  messageIds: z.array(z.string()),
  splitReason: z.string().nullable(),
  cues: z.array(z.string()),
  contextCues: z.array(z.object({ messageId: z.string(), quote: z.string() })),
  rationale: z.string(),
  family: structural,
  expression,
  confidence,
  alternative: z.object({ expression: z.enum(EXPRESSIONS), rationale: z.string() }).nullable(),
  invites: structural,
  secondLayer: z.object({ observation: z.string(), cues: z.array(z.string()) }).nullable(),
});

export const analysisSchema = z.object({
  context: z.object({
    register: z.string(),
    turns: z.array(z.object({ turnId: z.string(), act: z.string(), respondsTo: z.string().nullable() })),
    dynamics: z.string(),
  }),
  segments: z.array(rawSegment),
  shifts: z.array(z.object({ messageId: z.string(), description: z.string(), cues: z.array(z.string()) })),
  summary: z.string(),
  uncertainty: z.string(),
  safety: z.object({
    flagged: z.boolean(),
    categories: z.array(z.enum(["abuse", "coercion", "threat", "self_harm", "harassment"])),
    note: z.string().nullable(),
  }),
});

type RawSegment = z.infer<typeof rawSegment>;
type ReadingFields = Omit<RawSegment, "turnId" | "messageIds">;
export type Segment = ReadingFields & { id: string; turnId: string; messageIds: string[] };
export type Reading = ReadingFields & { messageId: string; segmentId: string };
export type Analysis = Omit<z.infer<typeof analysisSchema>, "segments"> & { segments: Segment[]; readings: Reading[] };

type SourceMessage = { id: string; speakerId: string; text: string };
const contains = (text: string, cue: string) => text.normalize("NFC").toLowerCase().includes(cue.normalize("NFC").toLowerCase());
const UNREAD: ReadingFields = { splitReason: null, cues: [], contextCues: [], rationale: "", family: "UNCLEAR", expression: "UNCLEAR", confidence: "low", alternative: null, invites: "UNCLEAR", secondLayer: null };

/** Splits ids (already in message order) into runs of neighbours within one turn. */
function runs(ids: string[], index: Map<string, number>, turnOf: Map<string, string>): string[][] {
  const out: string[][] = [];
  for (const id of ids) {
    const last = out[out.length - 1];
    const prev = last?.[last.length - 1];
    if (prev && index.get(prev)! + 1 === index.get(id) && turnOf.get(prev) === turnOf.get(id)) last.push(id);
    else out.push([id]);
  }
  return out;
}

/**
 * Returns a cleaned analysis, or null when the output can't be trusted at all
 * (wrong shape, or readings for fewer than half of the messages).
 */
export function cleanAnalysis(raw: unknown, messages: SourceMessage[]): Analysis | null {
  const parsed = analysisSchema.safeParse(raw);
  if (!parsed.success) return null;
  const a = parsed.data;
  const byId = new Map(messages.map((m) => [m.id, m]));
  const index = new Map(messages.map((m, i) => [m.id, i]));
  const turns = groupTurns(messages);
  const turnOf = new Map(turns.flatMap((t) => t.messageIds.map((id) => [id, t.turnId] as const)));
  const covered = new Set<string>();
  const kept: Omit<Segment, "id">[] = [];

  for (const s of a.segments) {
    const ids = [...new Set(s.messageIds)].filter((id) => byId.has(id) && !covered.has(id)).sort((x, y) => index.get(x)! - index.get(y)!);
    if (!ids.length) continue;
    const texts = ids.map((id) => byId.get(id)!.text);
    const quoted = (c: string) => c.trim() !== "" && texts.some((t) => contains(t, c));
    const cues = s.cues.filter(quoted);
    const secondLayer = s.secondLayer ? { ...s.secondLayer, cues: s.secondLayer.cues.filter(quoted) } : null;
    // A second layer the model grounded in an exact quote (sarcasm, "fine" after a complaint)
    // means the literal reading is contested, which the spec says rules out high. Only the
    // confidence moves; the label stays. An ungrounded second layer isn't evidence enough.
    const contested = !!secondLayer?.cues.length;
    const fields: ReadingFields = {
      ...s,
      cues,
      contextCues: s.contextCues.filter((c) => byId.has(c.messageId) && c.quote.trim() && contains(byId.get(c.messageId)!.text, c.quote)),
      // The label decides the family; the model's family only counts when the label is UNCLEAR.
      family: s.expression === "UNCLEAR" ? s.family : SOURCE_OF[s.expression],
      // A reading whose evidence didn't survive is a guess: keep it, but never above low.
      // "Unclear" is shown without a confidence, so it is stored as low.
      confidence: !cues.length || s.expression === "UNCLEAR" ? "low" : contested && s.confidence === "high" ? "medium" : s.confidence,
      secondLayer,
    };
    // A segment that strays across turns or skips messages is cut into valid runs.
    for (const run of runs(ids, index, turnOf)) {
      run.forEach((id) => covered.add(id));
      kept.push({ ...fields, turnId: turnOf.get(run[0])!, messageIds: run });
    }
  }
  if (covered.size < Math.ceil(messages.length / 2)) return null;

  // Messages the model skipped get an explicit "unclear" reading, grouped by turn.
  const missing = messages.map((m) => m.id).filter((id) => !covered.has(id));
  for (const run of runs(missing, index, turnOf)) kept.push({ ...UNREAD, turnId: turnOf.get(run[0])!, messageIds: run });

  kept.sort((x, y) => index.get(x.messageIds[0])! - index.get(y.messageIds[0])!);
  const segments: Segment[] = kept.map((s, i) => ({ ...s, id: `s${i + 1}` }));
  const readings: Reading[] = segments.flatMap((sg) => {
    const { id, turnId, messageIds, ...fields } = sg;
    void turnId; // segment bookkeeping, not part of a message's reading
    return messageIds.map((messageId) => ({ ...fields, messageId, segmentId: id }));
  });
  readings.sort((x, y) => index.get(x.messageId)! - index.get(y.messageId)!);

  return {
    ...a,
    segments,
    readings,
    shifts: a.shifts.filter((s) => byId.has(s.messageId)).slice(0, 3)
      .map((s) => ({ ...s, cues: s.cues.filter((c) => contains(byId.get(s.messageId)!.text, c)) })),
  };
}

/** The segment a message belongs to; the UI shows one character per segment. */
export const segmentOf = (a: Analysis, messageId: string): Segment | undefined => a.segments.find((s) => s.messageIds.includes(messageId));
/** The message a segment is anchored to in the UI (its last one), so choices and What if? use one id. */
export const anchorOf = (a: Analysis, messageId: string): string => segmentOf(a, messageId)?.messageIds.at(-1) ?? messageId;

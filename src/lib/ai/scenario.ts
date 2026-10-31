// What if? logic that doesn't need the network: who the receiver is, what is allowed to
// leave the browser, and how the model's answer is cleaned before it reaches the UI.
// Pure functions, so tests are cheap.
import { z } from "zod";
import { LIMITS } from "../conversation.ts";
import { STATES, type State, type StateOrUnclear } from "./scenario-spec.ts";

const id = z.string().regex(/^[A-Za-z0-9_-]{1,32}$/);
const stateOrUnclear = z.enum([...STATES, "UNCLEAR"]);

// The LAST message is the one being explored. Nothing after it is ever sent (hindsight
// bias), including the reply that really followed.
export const scenarioRequestSchema = z.object({
  language: z.enum(["en", "vi"]),
  selfId: id,
  receiverId: id,
  state: z.enum(STATES),
  participantIds: z.array(id).min(2).max(LIMITS.maxParticipants),
  messages: z.array(z.object({
    id, speakerId: id,
    text: z.string().trim().min(1).max(LIMITS.maxMessageChars),
    state: stateOrUnclear,
    stateSource: z.enum(["user", "ai"]),
    confidence: z.enum(["low", "medium", "high"]).nullable(),
  })).min(1).max(LIMITS.maxMessages),
  consent: z.literal(true), // the explicit "Explore" tap
}).superRefine((req, ctx) => {
  const known = new Set(req.participantIds);
  const last = req.messages[req.messages.length - 1];
  if (!known.has(req.selfId) || !known.has(req.receiverId)) ctx.addIssue({ code: "custom", message: "unknown participant" });
  if (req.selfId === req.receiverId) ctx.addIssue({ code: "custom", message: "receiver is the user" });
  if (last.speakerId !== req.selfId) ctx.addIssue({ code: "custom", message: "last message must be the user's" });
  if (req.messages.some((m) => !known.has(m.speakerId))) ctx.addIssue({ code: "custom", message: "unknown speaker" });
  if (new Set(req.messages.map((m) => m.id)).size !== req.messages.length) ctx.addIssue({ code: "custom", message: "duplicate message id" });
  if (req.messages.reduce((n, m) => n + m.text.length, 0) > LIMITS.maxTotalChars) ctx.addIssue({ code: "custom", message: "conversation too long" });
});
export type ScenarioRequest = z.infer<typeof scenarioRequestSchema>;

type Msg = { id: string; speakerId: string };
export type ScenarioContext<M extends Msg> = { target: M; history: M[]; reply: M | null; receiverId: string };

/**
 * The receiver is whoever answered next; with no answer yet, the last other person who
 * spoke. Returns null when the message isn't the user's or nobody else has spoken.
 */
export function scenarioContext<M extends Msg>(messages: M[], selfId: string | null, targetId: string): ScenarioContext<M> | null {
  const at = messages.findIndex((m) => m.id === targetId);
  if (at < 0 || !selfId || messages[at].speakerId !== selfId) return null;
  const history = messages.slice(0, at);
  const reply = messages.slice(at + 1).find((m) => m.speakerId !== selfId) ?? null;
  const receiverId = reply?.speakerId ?? [...history].reverse().find((m) => m.speakerId !== selfId)?.speakerId;
  return receiverId ? { target: messages[at], history, reply, receiverId } : null;
}

/** How a message is labelled right now: my choice wins; no choice or "not sure" falls back to the AI's reading. */
export function resolveState(ai: { expression: StateOrUnclear; confidence: "low" | "medium" | "high" } | undefined, choice: string | undefined): { state: StateOrUnclear; stateSource: "user" | "ai"; confidence: "low" | "medium" | "high" | null } {
  const mine = choice?.toUpperCase();
  if (mine && (STATES as readonly string[]).includes(mine)) return { state: mine as State, stateSource: "user", confidence: null };
  return { state: ai?.expression ?? "UNCLEAR", stateSource: "ai", confidence: ai?.confidence ?? null };
}

export type Prior = { ids: Set<string>; usable: number };
/** The receiver's earlier messages (everything before the last one). `usable` ignores UNCLEAR readings. */
export function receiverPrior(req: Pick<ScenarioRequest, "messages" | "receiverId">): Prior {
  const earlier = req.messages.slice(0, -1).filter((m) => m.speakerId === req.receiverId);
  return { ids: new Set(earlier.map((m) => m.id)), usable: earlier.filter((m) => m.state !== "UNCLEAR").length };
}

export type Possibility = { state: State; basis: "pattern" | "context"; rationale: string; evidenceMessageIds: string[]; cues: string[] };
export type ScenarioResult = {
  flagged: boolean;
  evidence: "enough" | "thin" | "insufficient";
  reason: "model" | "no_prior" | "unclear_prior";
  ranked: boolean; // only true when the first possibility is meaningfully the better fit
  possibilities: Possibility[];
  note: string | null;
  reflectionQuestion: string | null;
};

export const insufficient = (reason: ScenarioResult["reason"], note: string | null = null): ScenarioResult =>
  ({ flagged: false, evidence: "insufficient", reason, ranked: false, possibilities: [], note, reflectionQuestion: null });

/** Answers that need no model: no earlier receiver messages, or none that can be read. */
export function localAnswer(prior: Prior): ScenarioResult | null {
  if (prior.ids.size === 0) return insufficient("no_prior");
  if (prior.usable === 0) return insufficient("unclear_prior");
  return null;
}

const modelSchema = z.object({
  flagged: z.boolean(),
  evidence: z.enum(["enough", "thin", "insufficient"]),
  possibilities: z.array(z.object({
    state: z.enum(STATES), basis: z.enum(["pattern", "context"]), rationale: z.string(),
    evidenceMessageIds: z.array(z.string()), cues: z.array(z.string()),
  })),
  note: z.string(),
  reflectionQuestion: z.string().nullable(),
});
const contains = (text: string, cue: string) => text.normalize("NFC").toLowerCase().includes(cue.normalize("NFC").toLowerCase());

/**
 * Keeps only what can be checked: evidence must be the receiver's earlier messages, cues
 * must be real quotes from them, states must differ. A "pattern" without evidence is
 * dropped; a "context" possibility may stand without it because it claims nothing about
 * their history. Null = unusable output.
 */
export function cleanScenario(raw: unknown, req: Pick<ScenarioRequest, "messages" | "receiverId">): ScenarioResult | null {
  const parsed = modelSchema.safeParse(raw);
  if (!parsed.success) return null;
  const m = parsed.data;
  if (m.flagged) return { ...insufficient("model", m.note.trim() || null), flagged: true };

  const prior = receiverPrior(req);
  const byId = new Map(req.messages.map((x) => [x.id, x]));
  const seen = new Set<string>();
  const possibilities: Possibility[] = [];
  for (const p of m.possibilities) {
    const ids = [...new Set(p.evidenceMessageIds)].filter((x) => prior.ids.has(x));
    if ((p.basis === "pattern" && !ids.length) || seen.has(p.state) || !p.rationale.trim()) continue;
    seen.add(p.state);
    const cues = p.cues.filter((c) => c.trim() && ids.some((x) => contains(byId.get(x)!.text, c)));
    possibilities.push({ state: p.state, basis: p.basis, rationale: p.rationale.trim(), evidenceMessageIds: ids, cues });
  }
  if (m.evidence === "insufficient" || !possibilities.length) return insufficient("model", m.note.trim() || null);

  // One earlier message is never "enough", whatever the model says.
  const evidence = m.evidence === "enough" && prior.usable < 2 ? "thin" : m.evidence;
  return {
    flagged: false, evidence, reason: "model",
    ranked: evidence === "enough" && possibilities[0].basis === "pattern",
    possibilities: possibilities.slice(0, 2),
    note: m.note.trim() || null,
    reflectionQuestion: m.reflectionQuestion?.trim() || null,
  };
}

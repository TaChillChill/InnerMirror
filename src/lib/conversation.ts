// The conversation model every input method produces. Paste/type (M2) and screenshot
// extraction (M3) both end in a Transcript, so review, analysis and My Mirror don't care
// where the messages came from.
import { z } from "zod";

export type Lang = "en" | "vi";
export type Legibility = "clear" | "partial" | "unreadable";
export type Participant = { id: string; name: string };
export type Message = { id: string; speakerId: string; text: string; legibility?: Legibility };
export type Transcript = { source: "paste" | "screenshot"; participants: Participant[]; messages: Message[] };

export const LIMITS = { minMessages: 2, maxMessages: 80, maxMessageChars: 2000, maxTotalChars: 20000, maxParticipants: 8, maxNameChars: 40 };

let counter = 0;
export const newId = (prefix: string) => `${prefix}${Date.now().toString(36)}${(counter++).toString(36)}`;

// Common export prefixes: "[21:14]", "21:14 -", "30/10/2026, 21:14 -" (WhatsApp-style).
const TIMESTAMP = /^\s*(\[[^\]]{1,40}\]|\d{1,4}[/.-]\d{1,2}[/.-]\d{1,4},?\s+\d{1,2}:\d{2}(:\d{2})?\s*(am|pm|AM|PM)?\s*-|\d{1,2}:\d{2}(:\d{2})?\s*(am|pm|AM|PM)?\s*-?)\s*/;
const SPEAKER = new RegExp(`^([^:\\n]{1,${LIMITS.maxNameChars}}):\\s*(.*)$`);

// Words that mark someone retelling events rather than pasting a chat: "Mẹ nói: …",
// "Mom said: …", "Mình thấy chị ấy…". In a "Name:" prefix only lowercase counts, so
// "Bảo: …" (a name) stays a speaker while "Mẹ bảo: …" does not.
const NARRATION_WORDS = new Set([
  "nói", "bảo", "hỏi", "đáp", "kêu", "mắng", "quát", "gắt", "hét", "cãi", "nhắn", "kể", "than", "nghĩ", "thấy",
  "said", "says", "asked", "asks", "told", "tells", "replied", "answered", "yelled", "shouted", "texted", "thought", "felt",
]);
const narrates = (s: string, caseSensitive: boolean) => s.split(/\s+/)
  .map((w) => w.replace(/[^\p{L}\p{M}]/gu, ""))
  .some((w) => NARRATION_WORDS.has(caseSensitive ? w : w.toLowerCase()));

const pastedLines = (raw: string) => raw.normalize("NFC").replace(/\r\n?/g, "\n").split("\n").map((l) => l.replace(TIMESTAMP, "").trim()).filter(Boolean);

function speakerLine(line: string): { name: string; text: string } | null {
  const m = SPEAKER.exec(line);
  // A colon inside a sentence ("Note: ...") also matches; names with spaces are fine,
  // but a "name" ending in a sentence's punctuation or holding a speech verb is text.
  if (!m || !m[2].trim() || /[.!?]$/.test(m[1]) || narrates(m[1], true)) return null;
  return { name: m[1].trim(), text: m[2].trim() };
}

/**
 * True when the text reads like a retold story instead of "Name: message" lines. Story
 * analysis isn't supported yet, and the line parser would otherwise glue the narrator's
 * own comments onto someone else's message (docs/INPUT_EXPERIENCE_AUDIT.md §1).
 */
export function looksLikeStory(raw: string): boolean {
  const lines = pastedLines(raw);
  const untagged = lines.filter((l) => !speakerLine(l));
  return untagged.length === lines.length || untagged.some((l) => narrates(l, false));
}

/**
 * Turns pasted lines ("Name: message") into a transcript. Lines without a speaker
 * continue the previous message; a leading line without one gets an "Unknown" speaker
 * the user can fix in review. With keepLines (a story the user chose to continue with),
 * every such line becomes its own "Unknown" message instead, so nothing is attributed
 * to a person the user didn't pick.
 */
export function parsePasted(raw: string, unknownName: string, opts: { keepLines?: boolean } = {}): Transcript {
  const participants: Participant[] = [];
  const messages: Message[] = [];
  const idFor = (name: string) => {
    const found = participants.find((p) => p.name.toLowerCase() === name.toLowerCase());
    if (found) return found.id;
    const p = { id: `p${participants.length + 1}`, name };
    participants.push(p);
    return p.id;
  };
  for (const line of pastedLines(raw)) {
    const s = speakerLine(line);
    if (s) {
      messages.push({ id: `m${messages.length + 1}`, speakerId: idFor(s.name), text: s.text });
    } else if (messages.length && !opts.keepLines) {
      messages[messages.length - 1].text += `\n${line}`;
    } else {
      messages.push({ id: `m${messages.length + 1}`, speakerId: idFor(unknownName), text: line });
    }
  }
  return { source: "paste", participants, messages };
}

// ---------- Going back to the Add screen ----------
// What a transcript was read from, so Back + Continue can tell "nothing changed, keep my
// edits" from "new input". Screenshots are compared by a cheap fingerprint, not the full data.
export const textKey = (text: string) => `t:${text.normalize("NFC").trim()}`;
export const imagesKey = (images: string[]) => `i:${images.map((s) => `${s.length}.${s.slice(-32)}`).join(",")}`;

/** reuse: same input, go back to the edited transcript; ask: new input would replace edits; read: nothing to lose. */
export function rereadPlan(transcript: Transcript | null, readFrom: string | null, key: string): "reuse" | "ask" | "read" {
  if (!transcript) return "read";
  if (readFrom === key) return "reuse";
  return transcript.messages.length ? "ask" : "read";
}

// ---------- What leaves the browser ----------
// Only ids, the user's id and message text. Names are replaced server-side by neutral
// labels; the browser never sends them.
const id = z.string().regex(/^[A-Za-z0-9_-]{1,32}$/);
export const analyzeRequestSchema = z.object({
  language: z.enum(["en", "vi"]),
  selfId: id,
  participantIds: z.array(id).min(2).max(LIMITS.maxParticipants),
  messages: z.array(z.object({ id, speakerId: id, text: z.string().trim().min(1).max(LIMITS.maxMessageChars) }))
    .min(LIMITS.minMessages).max(LIMITS.maxMessages),
  consent: z.literal(true),
}).superRefine((req, ctx) => {
  const known = new Set(req.participantIds);
  if (!known.has(req.selfId)) ctx.addIssue({ code: "custom", message: "selfId is not a participant" });
  if (req.messages.some((m) => !known.has(m.speakerId))) ctx.addIssue({ code: "custom", message: "unknown speaker" });
  if (new Set(req.messages.map((m) => m.id)).size !== req.messages.length) ctx.addIssue({ code: "custom", message: "duplicate message id" });
  if (req.messages.reduce((n, m) => n + m.text.length, 0) > LIMITS.maxTotalChars) ctx.addIssue({ code: "custom", message: "conversation too long" });
});
export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;

export function toAnalyzeRequest(t: Transcript, selfId: string, language: Lang): AnalyzeRequest {
  const used = new Set(t.messages.map((m) => m.speakerId).concat(selfId));
  return {
    language, selfId, consent: true,
    participantIds: t.participants.map((p) => p.id).filter((pid) => used.has(pid)),
    messages: t.messages.map(({ id, speakerId, text }) => ({ id, speakerId, text: text.trim() })).filter((m) => m.text),
  };
}

/**
 * Everything the analysis depends on, as a cache key. Who the user is isn't part of it (the
 * model never sees it), so switching "Who am I?" can reuse a reading; any edit to a text, a
 * speaker or the language gives a new key.
 */
export function analysisKey(req: AnalyzeRequest): string {
  const speaking = new Set(req.messages.map((m) => m.speakerId));
  return JSON.stringify([req.language, req.participantIds.filter((p) => speaking.has(p)), req.messages.map((m) => [m.id, m.speakerId, m.text])]);
}

export type ReviewProblem = "noSelf" | "tooFew" | "tooMany" | "tooLong" | "emptyMessage" | null;
export function reviewProblem(t: Transcript, selfId: string | null): ReviewProblem {
  if (t.messages.length < LIMITS.minMessages) return "tooFew";
  if (t.messages.length > LIMITS.maxMessages) return "tooMany";
  if (t.messages.some((m) => !m.text.trim())) return "emptyMessage";
  if (t.messages.some((m) => m.text.length > LIMITS.maxMessageChars) || t.messages.reduce((n, m) => n + m.text.length, 0) > LIMITS.maxTotalChars) return "tooLong";
  if (!selfId) return "noSelf";
  return null;
}

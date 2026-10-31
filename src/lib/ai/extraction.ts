// Validates what the vision model returned and turns it into the app's Transcript.
// Pure functions (no I/O) so both the route and the browser can use them and tests are cheap.
import { z } from "zod";
import { LIMITS, type Message, type Participant, type Transcript } from "../conversation.ts";
import { NOTE_CODES, type NoteCode } from "./extract-spec.ts";

const rawSchema = z.object({
  speakers: z.array(z.object({
    key: z.string().max(8),
    displayedName: z.string().nullable(),
    side: z.enum(["left", "right", "unknown"]),
  })).max(9),
  messages: z.array(z.object({
    speaker: z.string().max(8),
    text: z.string(),
    legibility: z.enum(["clear", "partial", "unreadable"]),
  })).max(120),
  notes: z.array(z.enum(NOTE_CODES)),
});

export type Extraction = {
  speakers: { key: string; displayedName: string | null; side: "left" | "right" | "unknown" }[];
  messages: { speaker: string; text: string; legibility: "clear" | "partial" | "unreadable" }[];
  notes: NoteCode[];
};

const UNKNOWN_KEY = "S?";

/** Returns null when the output doesn't fit the schema (the route then retries once). */
export function cleanExtraction(raw: unknown): Extraction | null {
  const parsed = rawSchema.safeParse(raw);
  if (!parsed.success) return null;
  const notes = new Set<NoteCode>(parsed.data.notes);
  const speakers = parsed.data.speakers.map((s) => ({ ...s, displayedName: s.displayedName?.trim().slice(0, LIMITS.maxNameChars) || null }));
  const known = new Set(speakers.map((s) => s.key));
  const messages = parsed.data.messages.map((m) => {
    let speaker = m.speaker;
    // A message pointing at a speaker the model never declared is "unknown", not guessed.
    if (!known.has(speaker)) {
      speaker = UNKNOWN_KEY;
      notes.add("speaker_unclear");
    }
    let text = m.text.trim();
    let legibility = m.legibility;
    if (text.length > LIMITS.maxMessageChars) { text = text.slice(0, LIMITS.maxMessageChars); legibility = "partial"; }
    // "Clear" with no text is a contradiction: the user must fill it in or delete it.
    if (!text) legibility = "unreadable";
    return { speaker, text, legibility };
  });
  if (messages.some((m) => m.speaker === UNKNOWN_KEY) && !known.has(UNKNOWN_KEY)) {
    speakers.push({ key: UNKNOWN_KEY, displayedName: null, side: "unknown" });
  }
  if (!messages.length) notes.add("not_a_chat");
  return { speakers, messages, notes: [...notes] };
}

export type Fallbacks = { me: string; other: (n: number) => string; unknown: string };

/**
 * Extraction → Transcript. Nothing is chosen for the user: "which one is you" stays
 * unset, and names the model couldn't see get neutral placeholders to be edited in review.
 */
export function toTranscript(ext: Extraction, fb: Fallbacks): Transcript {
  const used = new Set(ext.messages.map((m) => m.speaker));
  const participants: Participant[] = [];
  const idByKey = new Map<string, string>();
  let others = 0;
  for (const s of ext.speakers.filter((x) => used.has(x.key))) {
    const id = `p${participants.length + 1}`;
    idByKey.set(s.key, id);
    const placeholder = s.key === UNKNOWN_KEY ? fb.unknown : s.side === "right" && !participants.some((p) => p.name === fb.me) ? fb.me : fb.other(++others);
    participants.push({ id, name: s.displayedName ?? placeholder });
  }
  const messages: Message[] = ext.messages.map((m, i) => ({
    id: `m${i + 1}`, speakerId: idByKey.get(m.speaker) as string, text: m.text, legibility: m.legibility,
  }));
  return { source: "screenshot", participants, messages };
}

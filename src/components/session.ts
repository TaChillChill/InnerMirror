// In-memory state for one conversation. Nothing here is persisted: closing the tab
// drops the conversation; only an explicit Save writes labels to My Mirror.
import { anchorOf, type Analysis, type Reading } from "@/lib/ai/analysis";
import { pseudonymLabel, SELF_LABEL } from "@/lib/ai/analysis-spec";
import { defaultTitle, titleNames } from "@/lib/conversation-title";
import type { Lang, Transcript } from "@/lib/conversation";
import type { NoteCode } from "@/lib/ai/extract-spec";
import type { Extraction } from "@/lib/ai/extraction";
import { resolveState } from "@/lib/ai/scenario";
import { safetyHits } from "@/lib/safety-backstop";
import { DICTS, type ExKey } from "@/lib/i18n";
import type { BadgeState } from "./ui";

export type Screen = "landing" | "add" | "review" | "analyzing" | "error" | "replay" | "mirror";
export type Choice = ExKey | "unsure";

export type Session = {
  screen: Screen;
  transcript: Transcript | null;
  selfId: string | null;
  consent: boolean;
  analysis: Analysis | null;
  labels: Record<string, string>; // model label ("Person A") -> participant id
  choices: Record<string, Choice>; // message id -> my reading
  selected: string | null; // message whose selector is open
  error: string | null;
  title: string;
  titleAuto: boolean; // the title is still the default, so it may be refreshed; false once I edit it
  note: string;
  savedId: string | null;
  shots: string[]; // screenshots kept in browser memory only, to compare while reviewing
  // The Add screen as the user left it, so Back from Review costs no re-work. Memory only;
  // screenshots are dropped once the conversation is analyzed, like `shots`.
  // `reads`: each part of the screenshots already read (key: imagesKey of the part), so a retry
  // or a second read only sends the parts that failed or changed.
  draft: { method: "shot" | "paste" | null; text: string; images: string[]; reads: Record<string, Extraction> }; // method null until chosen
  readFrom: string | null; // textKey/imagesKey of what the current transcript was read from
  sample: boolean; // the built-in sample: no API calls, nothing saved
  extractNotes: NoteCode[];
  shotsSkipped: string; // screenshots left out after a partial failure, e.g. "4–6", shown on Review
  // The last reading and what it was made from, so an unchanged conversation isn't sent
  // again. In memory only, like everything here; a new conversation drops it.
  lastResult: { key: string; selfId: string | null; analysis: Analysis; labels: Record<string, string> } | null;
};

export const freshSession = (): Session => ({
  screen: "landing", transcript: null, selfId: null, consent: false, analysis: null, labels: {},
  choices: {}, selected: null, error: null, title: "", titleAuto: true, note: "", savedId: null, shots: [], extractNotes: [], shotsSkipped: "", lastResult: null,
  draft: { method: null, text: "", images: [], reads: {} }, readFrom: null, sample: false,
});

export const readingFor = (a: Analysis, id: string): Reading | undefined => a.readings.find((r) => r.messageId === id);

// What a message's badge shows: the AI's dashed suggestion until I choose.
export function badgeOf(ai: ExKey | "unsure", mine: Choice | undefined): { ex: ExKey | "unsure"; state: BadgeState } {
  if (!mine) return { ex: ai, state: "suggested" };
  if (mine === "unsure") return { ex: "unsure", state: "unsure" };
  return { ex: mine, state: mine === ai ? "agreed" : "changed" };
}

/** The label a message carries now (my choice for its segment wins), as sent to What if?. */
export const effectiveState = (s: Session, id: string) => resolveState(readingFor(s.analysis!, id), s.choices[anchorOf(s.analysis!, id)]);

/**
 * Replaces the model's neutral labels ("Person A") with the names typed on this device.
 * The analysis labels everyone neutrally, the user included; What if? calls the user
 * "You"/"Bạn", which already reads right. Each call can pass its own label map.
 */
export function withNames(text: string, s: Pick<Session, "transcript" | "labels">, labels: Record<string, string> = s.labels): string {
  if (!s.transcript) return text;
  let out = text;
  for (const [label, pid] of Object.entries(labels)) {
    if (label === SELF_LABEL.en || label === SELF_LABEL.vi) continue;
    const name = s.transcript.participants.find((p) => p.id === pid)?.name;
    if (name) out = out.split(label).join(name);
  }
  return out;
}

/**
 * The default title (UAT batch 3, #02): the people who spoke, in order, and a number per group
 * among the conversations saved here. No model call; nothing about the reading is in it.
 */
export function autoTitle(t: Transcript, lang: Lang, saved: { title: string }[]): string {
  const speaking = t.participants.filter((p) => t.messages.some((m) => m.speakerId === p.id)).map((p) => p.name);
  // Names the app filled in itself ("Unknown", "Other person 2") count as no name.
  const placeholders = (["en", "vi"] as const).flatMap((l) => [DICTS[l].add.unknown, DICTS[l].add.otherPerson, ...[2, 3, 4, 5, 6, 7, 8].map((n) => `${DICTS[l].add.otherPerson} ${n}`)]);
  return defaultTitle(titleNames(speaking, placeholders, (i) => pseudonymLabel(i, lang)), saved);
}

/** Display name: "You" for me, the typed name for others. */
export function nameOf(s: Session, pid: string, youLabel: string): string {
  if (pid === s.selfId) return youLabel;
  return s.transcript?.participants.find((p) => p.id === pid)?.name ?? "?";
}

/**
 * What if? stays off for the built-in sample (it needs a live call) and whenever the safety
 * backstop sees self-harm or threat language: no alternative-response exploration there.
 */
export const safetyHold = (s: Session) => !!s.transcript && safetyHits(s.transcript.messages).length > 0;
export const whatIfOff = (s: Session) => s.sample || safetyHold(s);

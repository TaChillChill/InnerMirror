// In-memory state for one conversation. Nothing here is persisted: closing the tab
// drops the conversation; only an explicit Save writes labels to My Mirror.
import { anchorOf, type Analysis, type Reading } from "@/lib/ai/analysis";
import { SELF_LABEL } from "@/lib/ai/analysis-spec";
import type { Transcript } from "@/lib/conversation";
import type { NoteCode } from "@/lib/ai/extract-spec";
import { resolveState } from "@/lib/ai/scenario";
import type { ExKey } from "@/lib/i18n";
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
  note: string;
  savedId: string | null;
  shots: string[]; // screenshots kept in browser memory only, to compare while reviewing
  extractNotes: NoteCode[];
};

export const freshSession = (): Session => ({
  screen: "landing", transcript: null, selfId: null, consent: false, analysis: null, labels: {},
  choices: {}, selected: null, error: null, title: "", note: "", savedId: null, shots: [], extractNotes: [],
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
export function withNames(text: string, s: Session, labels: Record<string, string> = s.labels): string {
  if (!s.transcript) return text;
  let out = text;
  for (const [label, pid] of Object.entries(labels)) {
    if (label === SELF_LABEL.en || label === SELF_LABEL.vi) continue;
    const name = s.transcript.participants.find((p) => p.id === pid)?.name;
    if (name) out = out.split(label).join(name);
  }
  return out;
}

/** Display name: "You" for me, the typed name for others. */
export function nameOf(s: Session, pid: string, youLabel: string): string {
  if (pid === s.selfId) return youLabel;
  return s.transcript?.participants.find((p) => p.id === pid)?.name ?? "?";
}

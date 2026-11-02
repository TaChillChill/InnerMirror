// Timeline and story data for the animatic. Single source for scene timing, the
// conversation, and labels shown in the viewer.
import type { Reading } from "./brand";

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
export const s = (sec: number) => Math.round(sec * FPS);

export type Kind = "motion" | "real" | "mixed";
export type Scene = { id: string; title: string; from: number; to: number; kind: Kind; note: string };

// Seconds. Real product footage = S6 (70 s, live take) + the donut in S8 (7 s) ≈ 77 s.
export const SCENES: Scene[] = [
  { id: "S1", title: "Hook · 11:47 PM", from: 0, to: 6, kind: "motion", note: "Typed, deleted, retyped, sent. Then the chat rewinds." },
  { id: "S2", title: "Escalation · the storm", from: 6, to: 28, kind: "motion", note: "Two people, fixed avatars. Each octopus shows Muse's real reading of that person's latest message; the unreadable rush at the end is illustrative and ends Critical Parent vs Critical Parent." },
  { id: "S3", title: "BOOM · silence", from: 28, to: 33, kind: "motion", note: "The two octopuses collide. White flash, true silence, a typing dot that never sends." },
  { id: "S4", title: "Why? → part of the pattern", from: 33, to: 43, kind: "motion", note: "Echo questions about the other person, then the turn inward." },
  { id: "S5", title: "What if…? · which part of us speaks", from: 43, to: 68, kind: "motion", note: "Bridge line, Transactional Analysis in one line, five voices at 2.5 s each, then Parent · Adult · Child groups." },
  { id: "S6", title: "InnerMirror demo (real)", from: 68, to: 138, kind: "real", note: "Live take: screenshots → Muse reads them → Review → What Mirror sees (with Muse's real shifts, E4 fallback A) → my interpretation → What if? → My Reflection. Waits sped up and labelled." },
  { id: "S7", title: "Symphony · the river", from: 138, to: 158, kind: "motion", note: "Messages drift in from both sides into one slow current. States still change; nothing collides." },
  { id: "S8", title: "See yourself · Connect", from: 158, to: 173, kind: "mixed", note: "Real My Reflection donut (30 → 7 days, seeded synthetic history) shrinks to a point, then a network of relationships." },
  { id: "S9", title: "End card", from: 173, to: 180, kind: "motion", note: "Logo, line, call to action, URL." },
];
export const TOTAL_SEC = 180;

export type Msg = { who: "J" | "X"; text: string; state: Reading };

// Conversation A "Running late" (locked by the Founder, 2026-11-02). Alex (X) is the user.
// States are Muse's real readings from the live take `dark1` (2026-11-02, spec v3.2, the take
// shown in S6; responses in public/take/dark1/api.json); the motion follows them. Only the unreadable "rush" filler in Storm.tsx is illustrative.
export const NAMES = { J: "Jordan", X: "Alex" } as const;
// Fixed person avatars (placeholder art): the same face on every message, so it reads as a 1:1 chat.
// Colours are the app's neutral avatar tokens, never the ego-state colours.
export const PEOPLE = {
  J: { bg: "#f0e7d8", ink: "#64502c", hair: "long" },
  X: { bg: "#e3e7ee", ink: "#36445a", hair: "short" },
} as const;
export const CHAT: Msg[] = [
  { who: "J", text: "dinner at 7 still? got the good wine 🍷", state: "A" },
  { who: "X", text: "yesss 100%. leaving at 6", state: "A" },
  { who: "X", text: "ugh meeting ran over. 20 min", state: "A" },
  { who: "J", text: "k", state: "UNCLEAR" },
  { who: "X", text: "k?? i said sorry", state: "AC" },
  { who: "J", text: "u didn't actually", state: "A" },
  { who: "X", text: "wow ok. i'm literally rushing rn", state: "AC" },
  { who: "J", text: "it's fine. it's always fine", state: "CP" },
  { who: "X", text: "what's that supposed to mean", state: "A" },
  { who: "J", text: "it means i'm tired of always being the one who waits", state: "FC" },
  { who: "X", text: "and i'm tired of feeling guilty for working", state: "FC" },
  { who: "J", text: "then eat at the office lol", state: "CP" },
  { who: "X", text: "fine. do whatever u want.", state: "AC" },
];
export const HOOK_INDEX = CHAT.length - 1;

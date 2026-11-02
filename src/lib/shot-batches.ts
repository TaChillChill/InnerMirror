// Up to 10 screenshots are read in requests of at most 3: one request with 10 would pass
// Vercel's 4.5 MB body limit and the route's time budget. The model merges overlaps inside
// one request; this module joins the parts in order and merges the overlap where two parts
// meet. Pure, so it is unit-tested in Node.
import type { Extraction } from "./ai/extraction.ts";
import type { NoteCode } from "./ai/extract-spec.ts";

export const IMAGES_PER_REQUEST = 3; // keep in sync with src/app/api/extract/route.ts
// Two requests at a time: about half the wait of one-by-one, and well under the firewall's
// 10 requests per minute per IP that analysis shares.
export const PARALLEL_REQUESTS = 2;

/**
 * Fixed-size parts, oldest first. Fixed rather than balanced so that adding screenshots at
 * the end keeps the earlier parts (and their cached reads) unchanged.
 */
export function chunkImages<T>(images: T[], size = IMAGES_PER_REQUEST): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < images.length; i += size) out.push(images.slice(i, i + size));
  return out;
}

/** "4–6" or "4" for a part, numbered from 1 as the user sees them. */
export const partRange = (index: number, count: number, size = IMAGES_PER_REQUEST) => {
  const first = index * size + 1, last = first + count - 1;
  return first === last ? `${first}` : `${first}–${last}`;
};

const UNKNOWN = "S?";
const norm = (s: string) => s.normalize("NFC").replace(/\s+/g, " ").trim().toLowerCase();
// A single repeated message at a boundary is merged only when it is long enough to be
// unlikely to repeat for real ("ok", "k", "😂" do).
const MIN_SINGLE_CHARS = 8;
const MAX_OVERLAP = 40;

type Msg = Extraction["messages"][number];
type Speaker = Extraction["speakers"][number];

/**
 * Maps one part's speaker keys onto the speakers found so far: same shown name first, then
 * the same side when only one known speaker sits there. Anything still ambiguous becomes
 * "S?" so the user sees it on Review rather than the app guessing.
 */
function mapSpeakers(known: Speaker[], part: Speaker[]): { map: Map<string, string>; unclear: boolean } {
  const map = new Map<string, string>();
  let unclear = false;
  for (const sp of part) {
    if (sp.key === UNKNOWN) { map.set(sp.key, UNKNOWN); continue; }
    const name = sp.displayedName ? norm(sp.displayedName) : null;
    let hit = name ? known.find((k) => k.displayedName && norm(k.displayedName) === name) : undefined;
    if (!hit && sp.side !== "unknown") {
      const sameSide = known.filter((k) => k.key !== UNKNOWN && k.side === sp.side && !(name && k.displayedName));
      const named = known.filter((k) => k.key !== UNKNOWN && k.side === sp.side);
      if (sameSide.length === 1 && named.length === 1) hit = sameSide[0];
      else if (named.length > 1 && !name) { map.set(sp.key, UNKNOWN); unclear = true; continue; }
    }
    if (hit) {
      if (!hit.displayedName && sp.displayedName) hit.displayedName = sp.displayedName;
      map.set(sp.key, hit.key);
    } else {
      const key = `S${known.filter((k) => k.key !== UNKNOWN).length + 1}`;
      known.push({ key, displayedName: sp.displayedName, side: sp.side });
      map.set(sp.key, key);
    }
  }
  return { map, unclear };
}

// Same bubble seen twice: same sender, same words. A bubble cut by the screenshot edge
// ("partial") matches the full one that contains it. Returns the evidence: 0 none, 1 an
// unreadable empty bubble from the same sender (never enough on its own), else the length
// of the words that matched.
function sameBubble(a: Msg, b: Msg): number {
  if (a.speaker !== b.speaker && a.speaker !== UNKNOWN && b.speaker !== UNKNOWN) return 0;
  const x = norm(a.text), y = norm(b.text);
  if (!x || !y) return a.speaker === b.speaker ? 1 : 0;
  if (x === y) return x.length + 1;
  const partial = a.legibility === "partial" || b.legibility === "partial";
  const [short, long] = x.length <= y.length ? [x, y] : [y, x];
  return partial && short.length >= 4 && long.includes(short) ? short.length + 1 : 0;
}

/** Size of the overlap between the end of `prev` and the start of `next`, or 0. */
export function overlapAt(prev: Msg[], next: Msg[]): number {
  for (let k = Math.min(MAX_OVERLAP, prev.length, next.length); k >= 1; k--) {
    const tail = prev.slice(-k), head = next.slice(0, k);
    const evidence = tail.map((m, i) => sameBubble(m, head[i]));
    if (evidence.includes(0)) continue;
    const words = evidence.filter((e) => e > 1);
    if (!words.length) continue;
    if (k === 1 && words[0] - 1 < MIN_SINGLE_CHARS) continue;
    return k;
  }
  return 0;
}

// Of two readings of the same bubble, keep the clearer and longer one.
const better = (a: Msg, b: Msg): Msg => {
  const rank = (m: Msg) => (m.legibility === "clear" ? 2 : m.legibility === "partial" ? 1 : 0);
  if (rank(a) !== rank(b)) return rank(a) > rank(b) ? a : b;
  const pick = a.text.length >= b.text.length ? a : b;
  return pick.speaker === UNKNOWN ? { ...pick, speaker: pick === a ? b.speaker : a.speaker } : pick;
};

/** Joins parts read in order into one extraction. `parts` must already be in screenshot order. */
export function mergeExtractions(parts: Extraction[]): Extraction {
  const speakers: Speaker[] = [];
  const messages: Msg[] = [];
  const notes = new Set<NoteCode>();
  parts.forEach((part, i) => {
    const { map, unclear } = mapSpeakers(speakers, part.speakers);
    if (unclear) notes.add("speaker_unclear");
    const incoming = part.messages.map((m) => ({ ...m, speaker: map.get(m.speaker) ?? UNKNOWN }));
    const k = i === 0 ? 0 : overlapAt(messages, incoming);
    if (k) {
      notes.add("overlap_merged");
      for (let j = 0; j < k; j++) messages[messages.length - k + j] = better(messages[messages.length - k + j], incoming[j]);
    }
    messages.push(...incoming.slice(k));
    for (const n of part.notes) {
      // Crops only matter at the very start and end; inside, the next part shows the rest.
      if (n === "cropped_top" && i > 0) continue;
      if (n === "cropped_bottom" && i < parts.length - 1) continue;
      if (n === "not_a_chat") continue;
      notes.add(n);
    }
  });
  if (messages.some((m) => m.speaker === UNKNOWN) && !speakers.some((s) => s.key === UNKNOWN)) speakers.push({ key: UNKNOWN, displayedName: null, side: "unknown" });
  if (!messages.length) notes.add("not_a_chat");
  return { speakers, messages, notes: [...notes] };
}

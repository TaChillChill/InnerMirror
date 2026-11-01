// Story input v1 (U3, Founder N4 revised 2026-11-01): a retold story is split in code into
// dialogue (quoted or "X nói: …" lines, with the speaker suggested from the words around
// them) and narration (everything else). Nothing is final: Review shows both and the user
// moves lines between them and fixes speakers. Only dialogue is read for ego states;
// narration reaches the model through the analysis input's existing `context` field.
import { newId, type Message, type Narration, type Participant, type Transcript } from "./conversation.ts";

const VERBS = "nói|bảo|hỏi|đáp|kêu|mắng|quát|gắt|hét|cãi|nhắn|than|trả lời|nhắn lại|said|says|asked|asks|told me|tells me|replied|answered|yelled|shouted|texted|wrote|snapped";
// Small words between a speaker and the verb, or after it, that are not part of a name.
const FILLER = "rồi|liền|cũng|mới|lại|thì|bèn|vẫn|cứ|chỉ|then|just|and|với mình|với tôi|với tớ|với em|với anh|với chị|với mẹ|với con|rằng|là|to me|back|me";
const FIRST_PERSON = new Set(["mình", "tôi", "tớ", "tao", "em", "i", "me"]);
const QUOTE = /[“"«„]([^”"»“]{1,600})[”"»]/gu;
const VERB_AT_END = new RegExp(`(?:^|\\s)(${VERBS})(?:\\s+(?:${FILLER}))*\\s*[:,]?\\s*$`, "iu");
const ATTR_AFTER = new RegExp(`^\\s*[,–—-]?\\s*((?:[\\p{L}\\p{M}]+\\s){0,2}?[\\p{L}\\p{M}]+)\\s+(?:${VERBS})\\b[^.!?]*[.!?]?`, "iu");
const SPEAKER_COLON = new RegExp(`^(.{1,60}?)\\s+(?:${VERBS})(?:\\s+(?:${FILLER}))*\\s*:\\s*(.+)$`, "iu");
const NAME_LINE = /^([^:\n]{1,40}):\s*(.+)$/u;
// Dictated lines have no quotes or colons: "mẹ nói con lại về muộn à". Only a short subject
// at the start of the line counts, and not "nói chuyện" (to talk) or "hỏi han" (to ask after).
const SPOKEN = new RegExp(`^((?:[\\p{L}\\p{M}]+\\s){0,2}[\\p{L}\\p{M}]+)\\s+(?:${VERBS})(?:\\s+(?:${FILLER}))*\\s+(?!(?:chuyện|han|gì|about)(?![\\p{L}\\p{M}]))(.{2,})$`, "iu");
const FILLER_TAIL = new RegExp(`(?:\\s+(?:${FILLER}))+$`, "iu");

const words = (s: string) => s.trim().split(/\s+/).filter(Boolean);
const cap = (s: string) => s.charAt(0).toLocaleUpperCase() + s.slice(1);
const clean = (s: string) => s.replace(/^[\s,.;:–—-]+|[\s,;:–—-]+$/g, "").trim();
const lastClause = (s: string) => s.split(/[.!?\n]/).at(-1) ?? s;

/** The speaker named by the words before a verb: the subject if short, else the clause's first word(s). */
function speakerFrom(left: string): string | null {
  const l = clean(left.replace(FILLER_TAIL, ""));
  if (!l) return null;
  const w = words(l);
  if (w.length <= 3) return l;
  // "Mẹ đặt túi xuống bàn rồi nói" → "Mẹ"; "Anh Minh nhìn mình rồi nói" → "Anh Minh".
  // "My manager walked in and said" → "My manager".
  if (/^(my|your|his|her|our|their|the)$/i.test(w[0])) return `${w[0]} ${w[1]}`;
  if (/^\p{Lu}/u.test(w[0])) return /^\p{Lu}/u.test(w[1] ?? "") ? `${w[0]} ${w[1]}` : w[0];
  return null;
}

type Piece = { kind: "dialogue"; speaker: string | null; text: string } | { kind: "narration"; text: string };

/** One line of the story into dialogue and narration pieces, in order. */
export function splitLine(line: string): Piece[] {
  const named = NAME_LINE.exec(line);
  // "Mẹ: Con về muộn" is dialogue as long as the "name" holds no verb ("Mẹ nói: …" is handled below).
  if (named && !new RegExp(`\\b(${VERBS})\\b`, "iu").test(named[1]) && words(named[1]).length <= 3 && !/[.!?]$/.test(named[1])) {
    return [{ kind: "dialogue", speaker: named[1].trim(), text: named[2].trim() }];
  }
  const quotes = [...line.matchAll(QUOTE)];
  if (!quotes.length) {
    const said = SPEAKER_COLON.exec(line);
    if (said) {
      const left = said[1];
      const speaker = speakerFrom(left);
      const rest = words(left).length > 3 ? clean(left.replace(new RegExp(`\\s+(${VERBS})$`, "iu"), "").replace(FILLER_TAIL, "")) : "";
      return [...(rest && speaker !== rest ? [{ kind: "narration" as const, text: rest }] : []), { kind: "dialogue", speaker, text: said[2].trim() }];
    }
    const spoken = SPOKEN.exec(line);
    // "Mẹ không nói gì" / "she never said" is narration about not speaking.
    if (spoken && !/(không|chẳng|chưa|chả|never|not|didn't)$/iu.test(spoken[1])) return [{ kind: "dialogue", speaker: spoken[1], text: spoken[2].trim() }];
    return clean(line) ? [{ kind: "narration", text: clean(line) }] : [];
  }
  const out: Piece[] = [];
  let at = 0;
  for (const q of quotes) {
    const start = q.index!;
    let before = line.slice(at, start);
    let speaker: string | null = null;
    const clause = lastClause(before);
    const verb = VERB_AT_END.exec(clause);
    if (verb) {
      const left = clause.slice(0, verb.index);
      speaker = speakerFrom(left);
      // The attribution itself isn't narration: keep only what else the clause says.
      const keep = words(left).length > 3 ? clean(left.replace(FILLER_TAIL, "")) : "";
      before = before.slice(0, before.length - clause.length) + keep;
    }
    at = start + q[0].length;
    if (!speaker) {
      const after = ATTR_AFTER.exec(line.slice(at));
      if (after) { speaker = after[1]; at += after[0].length; }
    }
    if (clean(before) && words(clean(before)).length >= 2) out.push({ kind: "narration", text: clean(before) });
    // A quote ending in a comma ("Fine," she said) loses the comma.
    out.push({ kind: "dialogue", speaker, text: q[1].trim().replace(/,$/, "") });
  }
  const tail = clean(line.slice(at));
  if (tail && words(tail).length >= 2) out.push({ kind: "narration", text: tail });
  return out;
}

/** A retold story as a transcript: dialogue as messages, the rest as narration. */
export function parseStory(raw: string, names: { unknown: string; me: string }): Transcript {
  const participants: Participant[] = [];
  const messages: Message[] = [];
  const pendingNarration: string[] = [];
  const narration: Narration[] = [];
  const idFor = (name: string | null) => {
    const display = !name ? names.unknown : FIRST_PERSON.has(name.toLowerCase()) ? names.me : cap(name);
    const found = participants.find((p) => p.name.toLowerCase() === display.toLowerCase());
    if (found) return found.id;
    const p = { id: `p${participants.length + 1}`, name: display };
    participants.push(p);
    return p.id;
  };
  const lines = raw.normalize("NFC").replace(/\r\n?/g, "\n").split("\n").map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    for (const piece of splitLine(line)) {
      if (piece.kind === "narration") { pendingNarration.push(piece.text); continue; }
      if (!piece.text) continue;
      const id = `m${messages.length + 1}`;
      for (const text of pendingNarration.splice(0)) narration.push({ id: newId("n"), text, before: id });
      messages.push({ id, speakerId: idFor(piece.speaker), text: piece.text });
    }
  }
  for (const text of pendingNarration) narration.push({ id: newId("n"), text, before: null });
  return { source: "story", participants, messages, narration };
}

/** Narration lines that come before a message (or, with null, after the last one). */
export function narrationBefore(t: Transcript, messageId: string | null): Narration[] {
  const ids = new Set(t.messages.map((m) => m.id));
  return (t.narration ?? []).filter((n) => (messageId === null ? n.before === null || !ids.has(n.before) : n.before === messageId));
}

/** "This is narration": the message leaves the dialogue and keeps its place in the story. */
export function toNarration(t: Transcript, messageId: string): Transcript {
  const at = t.messages.findIndex((m) => m.id === messageId);
  if (at < 0) return t;
  const next = t.messages[at + 1]?.id ?? null;
  const all = t.narration ?? [];
  // Only order within one `before` group matters: the new line follows what preceded the
  // message and comes ahead of what already preceded the next one.
  const firstNext = all.findIndex((n) => n.before === next);
  const line: Narration = { id: newId("n"), text: t.messages[at].text, before: next };
  const merged = firstNext < 0 ? [...all, line] : [...all.slice(0, firstNext), line, ...all.slice(firstNext)];
  const narration = merged.map((n) => (n.before === messageId ? { ...n, before: next } : n));
  return { ...t, source: "story", messages: t.messages.filter((m) => m.id !== messageId), narration };
}

/** "This is dialogue": the narration line becomes a message at its place, said by `speakerId`. */
export function toDialogue(t: Transcript, narrationId: string, speakerId: string): Transcript {
  const all = t.narration ?? [];
  const n = all.find((x) => x.id === narrationId);
  if (!n) return t;
  const message: Message = { id: newId("m"), speakerId, text: n.text };
  const at = n.before === null ? t.messages.length : Math.max(0, t.messages.findIndex((m) => m.id === n.before));
  // Narration that came before this line in the story now sits before the new message.
  const idx = all.indexOf(n);
  const narration = all.filter((x) => x.id !== narrationId).map((x) => (all.indexOf(x) < idx && x.before === n.before ? { ...x, before: message.id } : x));
  return { ...t, messages: [...t.messages.slice(0, at), message, ...t.messages.slice(at)], narration };
}

/** Deleting a message keeps the narration that came before it in place (before the next one). */
export function dropMessage(t: Transcript, messageId: string): Transcript {
  const at = t.messages.findIndex((m) => m.id === messageId);
  if (at < 0) return t;
  const next = t.messages[at + 1]?.id ?? null;
  return { ...t, messages: t.messages.filter((m) => m.id !== messageId), narration: t.narration?.map((n) => (n.before === messageId ? { ...n, before: next } : n)) };
}

export const dropNarration = (t: Transcript, id: string): Transcript => ({ ...t, narration: t.narration?.filter((n) => n.id !== id) });

const TAG = { vi: { before: "trước", end: "cuối" }, en: { before: "before", end: "end" } };
export const STORY_CONTEXT_MAX = 2000;

/** Narration for the model's `context`, each line tagged with the message it comes before. */
export function storyContext(t: Transcript, lang: "en" | "vi"): string | null {
  if (t.source !== "story" || !t.narration?.length) return null;
  const ids = new Set(t.messages.map((m) => m.id));
  // Story order: grouped by the message each line precedes (end last), stable within a group.
  const pos = (n: Narration) => (n.before && ids.has(n.before) ? t.messages.findIndex((m) => m.id === n.before) : t.messages.length);
  const ordered = [...t.narration].sort((a, b) => pos(a) - pos(b));
  const lines = ordered.map((n) => `[${n.before && ids.has(n.before) ? `${TAG[lang].before} ${n.before}` : TAG[lang].end}] ${n.text.trim()}`).filter((l) => l.length > 4);
  let out = "";
  for (const l of lines) { if ((out + l).length + 1 > STORY_CONTEXT_MAX) break; out += (out ? "\n" : "") + l; }
  return out || null;
}

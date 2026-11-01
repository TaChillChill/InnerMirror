// Default conversation title (Founder UAT batch 3, #02): the people in it and a number,
// "Chị Phương – Mình – 01". The number counts up per group of people among the
// conversations saved on this device, whatever order the names are in. No model call.
// Saved collections keep only their title, so the group and number are read back from it.

export const TITLE_SEP = " – ";
const MAX = 120;

const norm = (name: string) => name.trim().toLocaleLowerCase();
const groupKey = (names: string[]) => names.map(norm).sort().join("\u0000");

/** Names for the title: a missing or placeholder name becomes "Person A" / "Người A" by position. */
export function titleNames(names: string[], placeholders: string[], label: (i: number) => string): string[] {
  const blank = new Set(placeholders.map(norm));
  return names.map((n, i) => (!n.trim() || blank.has(norm(n)) ? label(i) : n.trim()));
}

/** "A – B – 07" → its group and number; anything else (a title the user wrote) → null. */
export function parseTitle(title: string): { key: string; n: number } | null {
  const parts = title.split(TITLE_SEP);
  const last = parts.pop();
  if (!parts.length || !last || !/^\d{1,4}$/.test(last.trim())) return null;
  return { key: groupKey(parts), n: Number(last) };
}

export function defaultTitle(names: string[], saved: { title: string }[]): string {
  const key = groupKey(names);
  const used = saved.map((c) => parseTitle(c.title)).filter((p) => p?.key === key).map((p) => p!.n);
  const n = String(Math.max(0, ...used) + 1).padStart(2, "0");
  const people = names.join(TITLE_SEP).slice(0, MAX - TITLE_SEP.length - n.length);
  return `${people}${TITLE_SEP}${n}`;
}

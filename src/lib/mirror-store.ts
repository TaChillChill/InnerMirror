// My Mirror collections in localStorage. By design (F3) a collection holds labels only:
// no message text, no names, no AI explanations. Everything is validated on load so a
// corrupted or older entry can't break the page.
import { z } from "zod";
import type { Lang } from "./conversation";

const KEY = "innermirror.collections.v1";
const ex = z.enum(["cp", "np", "a", "fc", "ac"]);

const collectionSchema = z.object({
  v: z.literal(1),
  id: z.string(),
  createdAt: z.string(),
  lang: z.enum(["en", "vi"]),
  title: z.string().max(120),
  note: z.string().max(2000),
  // One entry per message of mine, in order. ai: the AI's suggestion; chosen: mine, or null if I didn't review it.
  mine: z.array(z.object({ order: z.number().int(), ai: z.union([ex, z.literal("UNCLEAR")]), chosen: z.union([ex, z.literal("unsure")]).nullable() })),
});
export type Collection = z.infer<typeof collectionSchema>;
export type MineEntry = Collection["mine"][number];

export function storageAvailable(): boolean {
  try {
    const probe = `${KEY}.probe`;
    localStorage.setItem(probe, "1");
    localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

export function loadCollections(): Collection[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    if (!Array.isArray(raw)) return [];
    return raw.flatMap((c) => { const p = collectionSchema.safeParse(c); return p.success ? [p.data] : []; })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    return [];
  }
}

function write(list: Collection[]): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
    return true;
  } catch {
    return false;
  }
}

export function makeCollection(lang: Lang, title: string, note: string, mine: MineEntry[]): Collection {
  return { v: 1, id: crypto.randomUUID(), createdAt: new Date().toISOString(), lang, title: title.trim().slice(0, 120), note: note.trim().slice(0, 2000), mine };
}

export const addCollection = (c: Collection) => write([c, ...loadCollections()]);
export const removeCollection = (id: string) => write(loadCollections().filter((c) => c.id !== id));
export const restoreCollection = (c: Collection) => write([c, ...loadCollections().filter((x) => x.id !== c.id)]);
export function clearCollections(): boolean {
  try { localStorage.removeItem(KEY); return true; } catch { return false; }
}

// My Mirror collections in localStorage. By design (F3) a collection holds labels only:
// no message text, no AI explanations, and no names except inside the title (whose default
// is the people's names + a number since Founder UAT batch 3, #02; the user can edit it). Everything is validated on load so a
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

/**
 * What an entry shows: my choice wins, else Mirror's suggestion. Mirror's "unclear" stays
 * its own bucket and is never counted as my "not sure", nor forced into one of the five.
 */
export type Shown = z.infer<typeof ex> | "unsure" | "unclear";
export const shownOf = (m: MineEntry): Shown => m.chosen ?? (m.ai === "UNCLEAR" ? "unclear" : m.ai);

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

/**
 * crypto.randomUUID exists only in secure contexts (HTTPS or localhost). Opened over plain HTTP
 * on a LAN address, as on an iPhone testing a local build, it is undefined and Save threw
 * (Founder UAT batch 2, #04). getRandomValues works everywhere.
 */
export function newCollectionId(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  return [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

export function makeCollection(lang: Lang, title: string, note: string, mine: MineEntry[]): Collection {
  return { v: 1, id: newCollectionId(), createdAt: new Date().toISOString(), lang, title: title.trim().slice(0, 120), note: note.trim().slice(0, 2000), mine };
}

export const addCollection = (c: Collection) => write([c, ...loadCollections()]);
export const removeCollection = (id: string) => write(loadCollections().filter((c) => c.id !== id));
export const restoreCollection = (c: Collection) => write([c, ...loadCollections().filter((x) => x.id !== c.id)]);
export function clearCollections(): boolean {
  try { localStorage.removeItem(KEY); return true; } catch { return false; }
}

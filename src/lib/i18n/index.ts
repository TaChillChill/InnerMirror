// UI strings. Every user-facing string lives here in both languages (CLAUDE.md rule).
// VI terminology follows D6 (design/OPEN_DECISIONS.md); "mình" is the user's own voice,
// "bạn" is the product speaking.
import type { Lang } from "../conversation";
import { en, type Dict } from "./en";
import { vi } from "./vi";

export type ExKey = "cp" | "np" | "a" | "fc" | "ac";
export const EX_ORDER: ExKey[] = ["cp", "np", "a", "fc", "ac"];

export type { Dict };
export const DICTS: Record<Lang, Dict> = { en, vi };

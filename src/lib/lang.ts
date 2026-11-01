// Interface language (Founder UAT batch 3, #03): a choice made with the EN | VI toggle wins and
// is kept; otherwise the browser's first preferred language decides: Vietnamese → vi,
// anything else (English, Japanese, French…) → en.
import type { Lang } from "./conversation.ts";

export function pickLang(stored: string | null, preferred: readonly string[]): Lang {
  if (stored === "vi" || stored === "en") return stored;
  return preferred[0]?.toLowerCase().split("-")[0] === "vi" ? "vi" : "en";
}

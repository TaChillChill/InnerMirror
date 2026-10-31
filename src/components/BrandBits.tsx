"use client";
// Header pieces shared by the app and the privacy page: the approved app icon with the
// name as plain text (design system: never re-typeset the wordmark image), and the
// EN | VI segmented toggle (one tap, active state visible, no flags).
import type { Lang } from "@/lib/conversation";
import { useT } from "./ui";

export function BrandMark() {
  return (
    <span className="app-brand">
      {/* eslint-disable-next-line @next/next/no-img-element -- small static brand art */}
      <img src="/brand/app-icon.png" alt="" width={32} height={32} />
      <span>Inner<b>Mirror</b></span>
    </span>
  );
}

const LANGS: Lang[] = ["en", "vi"];

export function LangToggle({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
  const { t } = useT();
  return (
    <div className="app-lang" role="group" aria-label={t.langLabel}>
      {LANGS.map((l) => (
        <button key={l} type="button" lang={l} aria-pressed={l === lang} onClick={() => onChange(l)}>{l.toUpperCase()}</button>
      ))}
    </div>
  );
}

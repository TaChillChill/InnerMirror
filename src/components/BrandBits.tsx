"use client";
// Header pieces shared by the app and the privacy page: the approved app icon with the
// name as plain text (design system: never re-typeset the wordmark image), and the
// EN | VI segmented toggle (one tap, active state visible, no flags), and the sticky header.
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Lang } from "@/lib/conversation";
import { Icon, useT } from "./ui";
import { useTheme, type Theme } from "./use-browser-state";

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

const NEXT: Record<Theme, Theme> = { system: "light", light: "dark", dark: "system" };

/** One button cycles System → Light → Dark; its label says the current mode and the next. */
export function ThemeToggle() {
  const { t } = useT();
  const [theme, setTheme] = useTheme();
  const T = t.theme;
  return (
    <button type="button" className="app-icon-btn app-theme" onClick={() => setTheme(NEXT[theme])} aria-label={T.label(T.names[theme], T.names[NEXT[theme]])} title={T.names[theme]}>
      <Icon name={theme === "system" ? "system" : theme === "light" ? "sun" : "moon"} />
    </button>
  );
}

// Sticky header: near-white at the top so it doesn't compete with the hero, a soft
// lavender tint once the page scrolls. The listener only flips one boolean. Its real height
// (one row, or two when the stepper wraps on phones) is published as --app-header-h so
// anchors and sticky panels sit below it.
export function StickyHeader({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const publish = () => document.documentElement.style.setProperty("--app-header-h", getComputedStyle(el).position === "sticky" ? `${el.offsetHeight}px` : "0px");
    const ro = new ResizeObserver(publish);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header ref={ref} className="app-header" data-scrolled={scrolled || undefined}>
      <div className="app-bar">{children}</div>
    </header>
  );
}

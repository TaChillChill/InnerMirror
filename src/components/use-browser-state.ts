"use client";
// Browser-only state (language, saved collections, whether storage works) read through
// useSyncExternalStore: the server renders defaults, the client switches after hydration
// without a mismatch, and other tabs' changes arrive through the "storage" event.
import { useCallback, useSyncExternalStore } from "react";
import { loadCollections, storageAvailable, type Collection } from "@/lib/mirror-store";
import type { Lang } from "@/lib/conversation";
import { pickLang } from "@/lib/lang";

const LANG_KEY = "innermirror.lang";
const listeners = new Set<() => void>();
const notify = () => { cache.collections = null; for (const l of listeners) l(); };
const cache: { collections: Collection[] | null; storageOk: boolean | null } = { collections: null, storageOk: null };
const NONE: Collection[] = [];

function subscribe(cb: () => void) {
  if (listeners.size === 0) window.addEventListener("storage", notify);
  listeners.add(cb);
  return () => { listeners.delete(cb); if (listeners.size === 0) window.removeEventListener("storage", notify); };
}

// The in-memory choice wins so switching works even where storage is blocked. Without a
// stored choice the device language decides (lib/lang), read once per page load so the
// language never changes on its own mid-session.
let chosenLang: Lang | null = null;
let deviceLang: Lang | null = null;
const readLang = (): Lang => {
  if (chosenLang) return chosenLang;
  let stored: string | null = null;
  try { stored = localStorage.getItem(LANG_KEY); } catch { /* storage blocked: device language */ }
  return stored === "vi" || stored === "en" ? stored : (deviceLang ??= pickLang(null, navigator.languages?.length ? navigator.languages : [navigator.language]));
};

export function useLang(): [Lang, (l: Lang) => void] {
  const lang = useSyncExternalStore(subscribe, readLang, () => "en" as Lang);
  const set = useCallback((l: Lang) => { chosenLang = l; try { localStorage.setItem(LANG_KEY, l); } catch { /* not critical */ } notify(); }, []);
  return [lang, set];
}

export function useCollections(): [Collection[], () => void] {
  const list = useSyncExternalStore(subscribe, () => (cache.collections ??= loadCollections()), () => NONE);
  return [list, notify];
}

export const useStorageOk = () => useSyncExternalStore(subscribe, () => (cache.storageOk ??= storageAvailable()), () => true);

// Light / Dark / System. "system" = no attribute, so CSS follows prefers-color-scheme. The
// inline script in layout.tsx applies the stored choice before the first paint.
export type Theme = "system" | "light" | "dark";
export const THEME_KEY = "innermirror.theme";
let chosenTheme: Theme | null = null;
const readTheme = (): Theme => {
  if (chosenTheme) return chosenTheme;
  try { const v = localStorage.getItem(THEME_KEY); return v === "light" || v === "dark" ? v : "system"; } catch { return "system"; }
};

export function useTheme(): [Theme, (t: Theme) => void] {
  const theme = useSyncExternalStore(subscribe, readTheme, () => "system" as Theme);
  const set = useCallback((v: Theme) => {
    chosenTheme = v;
    if (v === "system") delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = v;
    try { if (v === "system") localStorage.removeItem(THEME_KEY); else localStorage.setItem(THEME_KEY, v); } catch { /* not critical */ }
    notify();
  }, []);
  return [theme, set];
}

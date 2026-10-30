"use client";
// Browser-only state (language, saved collections, whether storage works) read through
// useSyncExternalStore: the server renders defaults, the client switches after hydration
// without a mismatch, and other tabs' changes arrive through the "storage" event.
import { useCallback, useSyncExternalStore } from "react";
import { loadCollections, storageAvailable, type Collection } from "@/lib/mirror-store";
import type { Lang } from "@/lib/conversation";

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

// The in-memory choice wins so switching works even where storage is blocked.
let chosenLang: Lang | null = null;
const readLang = (): Lang => { if (chosenLang) return chosenLang; try { return localStorage.getItem(LANG_KEY) === "vi" ? "vi" : "en"; } catch { return "en"; } };

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

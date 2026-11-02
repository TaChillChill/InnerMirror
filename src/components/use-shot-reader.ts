"use client";
// Reads up to 5 screenshots in parts of 3, two parts at a time (src/lib/shot-batches.ts).
// Each part that comes back is stored in the session draft right away (memory only), so a
// failed part never loses the others and trying again only sends what failed or changed.
import { useCallback, useRef, useState } from "react";
import type { Extraction } from "@/lib/ai/extraction";
import { imagesKey } from "@/lib/conversation";
import { chunkImages, PARALLEL_REQUESTS } from "@/lib/shot-batches";
import { errorCode } from "@/lib/api-error";

export type Part = { index: number; count: number; key: string; status: "waiting" | "reading" | "done" | "failed"; error?: string };
export type ReadOutcome = { aborted: boolean; parts: Part[]; results: (Extraction | null)[] };

// Answers that the next part would get too: stop instead of sending (and paying for) more.
const STOP = new Set(["rate_limited", "budget", "forbidden", "not_configured"]);

export function useShotReader(lang: string, onPart: (key: string, extraction: Extraction) => void) {
  const [parts, setParts] = useState<Part[] | null>(null);
  const [busy, setBusy] = useState(false);
  const abort = useRef<AbortController | null>(null);

  const read = useCallback(async (images: string[], cache: Record<string, Extraction>): Promise<ReadOutcome> => {
    const chunks = chunkImages(images);
    const list: Part[] = chunks.map((c, index) => {
      const key = imagesKey(c);
      return { index, count: c.length, key, status: cache[key] ? "done" : "waiting" };
    });
    const results = list.map((p) => cache[p.key] ?? null);
    const controller = new AbortController();
    abort.current = controller;
    let stop: string | null = null;
    const mark = (i: number, patch: Partial<Part>) => { list[i] = { ...list[i], ...patch }; setParts([...list]); };
    setBusy(true);
    setParts([...list]);

    // Each worker takes the next waiting part; marking it "reading" happens before any await,
    // so two workers never take the same part.
    const worker = async () => {
      for (let i = list.findIndex((p) => p.status === "waiting"); i >= 0 && !stop && !controller.signal.aborted; i = list.findIndex((p) => p.status === "waiting")) {
        mark(i, { status: "reading", error: undefined });
        try {
          const res = await fetch("/api/extract", {
            method: "POST", headers: { "Content-Type": "application/json" }, signal: controller.signal,
            body: JSON.stringify({ language: lang, images: chunks[i], consent: true }),
          });
          const json = await res.json().catch(() => ({}));
          if (!res.ok) {
            const code = errorCode(res.status, json);
            if (STOP.has(code)) stop = code;
            mark(i, { status: "failed", error: code });
            continue;
          }
          results[i] = json.extraction as Extraction;
          onPart(list[i].key, results[i] as Extraction);
          mark(i, { status: "done" });
        } catch {
          mark(i, { status: "failed", error: controller.signal.aborted ? "aborted" : "network" });
        }
      }
    };
    await Promise.all(Array.from({ length: PARALLEL_REQUESTS }, worker));
    // Parts never sent because of a stop share its reason.
    list.forEach((p, i) => { if (p.status === "waiting" && stop) list[i] = { ...p, status: "failed", error: stop }; });
    setParts([...list]);
    setBusy(false);
    return { aborted: controller.signal.aborted, parts: list, results };
  }, [lang, onPart]);

  const cancel = useCallback(() => abort.current?.abort(), []);
  const clear = useCallback(() => setParts(null), []);
  return { parts, busy, read, cancel, clear };
}

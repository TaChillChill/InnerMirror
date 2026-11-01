"use client";
// Saved conversations as square cards, newest first, in a row that scrolls sideways (swipe on
// phones, arrow buttons where there is a pointer). Each card shows its state cloud.
import { useCallback, useEffect, useRef, useState } from "react";
import type { Collection } from "@/lib/mirror-store";
import { countsOf, defaultNumber } from "@/lib/mirror-stats";
import { StateCloud } from "./StateCloud";
import { useT } from "./ui";

export const titleOf = (c: Collection, all: Collection[], numbered: (n: number) => string) => c.title || numbered(defaultNumber(all, c.id));

export function SavedRail({ saved, onOpen }: { saved: Collection[]; onOpen: (c: Collection, el: HTMLButtonElement) => void }) {
  const { t, lang } = useT();
  const M = t.mirror;
  const rail = useRef<HTMLUListElement>(null);
  const [ends, setEnds] = useState({ start: true, end: true });
  const sync = useCallback(() => {
    const el = rail.current;
    if (el) setEnds({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 });
  }, []);
  useEffect(() => { sync(); }, [saved, sync]);
  const scroll = (dir: 1 | -1) => {
    const el = rail.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };
  const date = (iso: string) => new Date(iso).toLocaleDateString(lang === "vi" ? "vi-VN" : "en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="app-rail">
      <button className="app-rail__arrow is-prev" onClick={() => scroll(-1)} disabled={ends.start} aria-label={M.newer}>‹</button>
      <ul className="app-rail__list" ref={rail} onScroll={sync} aria-label={M.collections}>
        {saved.map((c) => {
          const title = titleOf(c, saved, M.numbered);
          return (
            <li key={c.id}>
              <button className="app-card" onClick={(e) => onOpen(c, e.currentTarget)} aria-label={`${title}, ${date(c.createdAt)}. ${M.openCard}`}>
                <span className={`app-card__title${c.title ? "" : " is-default"}`}>{title}</span>
                <span className="app-card__date">{date(c.createdAt)}</span>
                <StateCloud counts={countsOf([c])} />
              </button>
            </li>
          );
        })}
      </ul>
      <button className="app-rail__arrow is-next" onClick={() => scroll(1)} disabled={ends.end} aria-label={M.older}>›</button>
    </div>
  );
}

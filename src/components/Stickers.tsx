"use client";
// Stickers: one per message of mine. The artwork is never dimmed or recoloured (UX-11);
// "not reviewed" lives in the tile: recessed, dashed, labelled "AI suggested".
import { useState } from "react";
import type { ExKey } from "@/lib/i18n";
import { shownOf, type MineEntry, type Shown } from "@/lib/mirror-store";
import { Badge, Icon, Mascot, exName, useT } from "./ui";

type StickerState = "suggested" | "agreed" | "changed" | "unsure";
const stateOf = (m: MineEntry): StickerState => (!m.chosen ? "suggested" : m.chosen === "unsure" ? "unsure" : m.chosen === m.ai ? "agreed" : "changed");
// Both "?" buckets share the artwork-free badge; their names keep them apart.
const badgeKey = (k: Shown): ExKey | "unsure" => (k === "unclear" ? "unsure" : k);
const VISIBLE = 18; // long conversations show the first stickers, then "Show all"

export function Stickers({ mine, onOpen }: { mine: (MineEntry & { id?: string })[]; onOpen?: (id: string) => void }) {
  const { t } = useT();
  const M = t.mirror;
  const [all, setAll] = useState(false);
  const list = all ? mine : mine.slice(0, VISIBLE);
  return (
    <>
      <ul className="app-stickers">
        {list.map((m) => {
          const st = stateOf(m), k = shownOf(m), ex = badgeKey(k);
          const name = k === "unclear" ? M.mirrorUnclear : exName(t, ex);
          const aiName = exName(t, m.ai === "UNCLEAR" ? "UNCLEAR" : m.ai);
          const label = `${name}, ${M.state[st]}${st === "changed" ? `, ${M.aiWas(aiName)}` : ""}`;
          const inner = (
            <>
              {st === "changed" && <span className="app-sticker__was" title={M.aiWas(aiName)}><Badge ex={m.ai === "UNCLEAR" ? "unsure" : m.ai} state="suggested" size={24} /></span>}
              {st === "agreed" && <span className="app-sticker__mark"><Icon name="check" /></span>}
              {st === "changed" && <span className="app-sticker__mark"><Icon name="dot" /></span>}
              {ex === "unsure" ? <span className="app-sticker__q" aria-hidden="true">?</span> : <Mascot ex={ex} />}
              <strong>{name}</strong>
              <span className="app-sticker__state">{st === "suggested" && <Icon name="eye" />}{M.state[st]}</span>
            </>
          );
          return (
            <li key={m.order}>
              {onOpen && m.id
                ? <button className="app-sticker im-ex" data-state={st} data-ex={ex} onClick={() => onOpen(m.id!)} aria-label={`${label}. ${M.openMessage}`}>{inner}</button>
                : <div className="app-sticker im-ex" data-state={st} data-ex={ex} aria-label={label} role="img">{inner}</div>}
            </li>
          );
        })}
      </ul>
      {mine.length > VISIBLE && !all && <button className="im-btn im-btn--ghost im-btn--sm" onClick={() => setAll(true)}>{M.showAll(mine.length)}</button>}
    </>
  );
}

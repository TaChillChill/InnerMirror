"use client";
// Stickers: one per message of mine. The artwork is never dimmed or recoloured (UX-11);
// "not reviewed" lives in the tile: recessed, dashed, labelled "AI suggested".
import { useState } from "react";
import { EX_ORDER, type ExKey } from "@/lib/i18n";
import { shownOf, tallyOf, type Collection, type MineEntry, type Shown } from "@/lib/mirror-store";
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

// Per-character count. Plain numbers, no goals or completion: not a game.
export function Tally({ mine, tapHint }: { mine: MineEntry[]; tapHint?: boolean }) {
  const { t } = useT();
  const count = tallyOf(mine);
  const open = mine.filter((m) => !m.chosen).length;
  return (
    <>
      <ul className="app-tally">
        {[...EX_ORDER, "unsure" as const, "unclear" as const].filter((k) => count[k]).map((k) => (
          <li key={k}><Badge ex={badgeKey(k)} state={k === "unsure" || k === "unclear" ? "unsure" : "plain"} size={24} />{k === "unclear" ? t.mirror.mirrorUnclear : exName(t, k)} <strong>{count[k]}</strong></li>
        ))}
      </ul>
      <p className="im-hint">{t.mirror.count(mine.length, open)}{tapHint ? ` ${t.mirror.tapHint}` : ""}</p>
    </>
  );
}

// A saved conversation as a small keepsake: my stickers first (dashed = Mirror noticed,
// solid = mine), then the title, my note, and when.
export function CollectionCard({ c, onOpen }: { c: Collection; onOpen: (el: HTMLButtonElement) => void }) {
  const { t, lang } = useT();
  const M = t.mirror;
  const max = 6;
  const title = c.title || M.untitled;
  const date = new Date(c.createdAt).toLocaleDateString(lang === "vi" ? "vi-VN" : "en-GB", { day: "numeric", month: "short", year: "numeric" });
  const label = M.cardLabel(title, date, c.mine.length, c.mine.filter((m) => m.chosen && m.chosen !== "unsure").length);
  return (
    <button className="app-coll" onClick={(e) => onOpen(e.currentTarget)} aria-label={label}>
      <span className="app-coll__badges" aria-hidden="true">
        {c.mine.slice(0, max).map((m) => <Badge key={m.order} ex={badgeKey(shownOf(m))} state={stateOf(m)} />)}
        {c.mine.length > max && <span className="app-coll__more">+{c.mine.length - max}</span>}
      </span>
      <strong className="app-coll__title">{title}</strong>
      {c.note && <span className="app-coll__note">“{c.note}”</span>}
      <span className="app-coll__meta">{date} · {M.messages(c.mine.length)}</span>
    </button>
  );
}

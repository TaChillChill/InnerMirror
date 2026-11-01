"use client";
// Narration lines of a retold story (U3), shown in place between the dialogue on Review and
// Replay. On Review each line can become dialogue (pick who said it) or be removed; on Replay
// they are read-only context. Mirror never reads an ego state from them.
import { useState } from "react";
import type { Narration, Participant } from "@/lib/conversation";
import { Icon, useT } from "./ui";

type Edit = { participants: Participant[]; onToDialogue: (id: string, speakerId: string) => void; onRemove: (id: string) => void };

export function NarrationLines({ lines, edit }: { lines: Narration[]; edit?: Edit }) {
  const { t } = useT();
  const S = t.review.story;
  const [open, setOpen] = useState<string | null>(null);
  if (!lines.length) return null;
  return (
    <>
      {lines.map((n) => (
        <li key={n.id} className="app-narr">
          <span className="app-narr__tag">{S.narration}</span>
          {edit ? (
            <button className="app-narr__text" aria-expanded={open === n.id} onClick={() => setOpen(open === n.id ? null : n.id)}>{n.text}</button>
          ) : <p className="app-narr__text">{n.text}</p>}
          {edit && open === n.id && (
            <div className="app-narr__edit">
              <div className="app-row-wrap" role="group" aria-label={S.whoSaidThis}>
                <span className="im-label">{S.toDialogue}. {S.whoSaidThis}</span>
                {edit.participants.map((p) => <button key={p.id} className="app-chip-btn" onClick={() => { setOpen(null); edit.onToDialogue(n.id, p.id); }}>{p.name}</button>)}
              </div>
              <button className="im-btn im-btn--ghost im-btn--sm" onClick={() => edit.onRemove(n.id)}><Icon name="trash" /> {S.removeLine}</button>
            </div>
          )}
        </li>
      ))}
    </>
  );
}

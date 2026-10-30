"use client";
// My Mirror: one sticker per message of mine (an AI suggestion until I review it), an
// optional note to my future self, Save, and the collections saved in this browser.
import { useState } from "react";
import { addCollection, clearCollections, makeCollection, removeCollection, restoreCollection, type Collection, type MineEntry } from "@/lib/mirror-store";
import type { ExKey } from "@/lib/i18n";
import type { Update } from "./App";
import { readingFor, type Session } from "./session";
import { Stickers, Tally, CollectionCard } from "./Stickers";
import { Icon, useT } from "./ui";

type Props = { s: Session; update: Update; saved: Collection[]; storageOk: boolean; onSavedChange: () => void; onNew: () => void; onOpenMessage: (id: string) => void };

// My messages in order, with the AI's suggestion and my choice (labels only, no text).
export function currentMine(s: Session): (MineEntry & { id: string })[] {
  if (!s.analysis || !s.transcript) return [];
  return s.transcript.messages.filter((m) => m.speakerId === s.selfId).map((m, order) => {
    const expr = readingFor(s.analysis!, m.id)?.expression ?? "UNCLEAR";
    return { id: m.id, order, ai: expr === "UNCLEAR" ? "UNCLEAR" : (expr.toLowerCase() as ExKey), chosen: s.choices[m.id] ?? null };
  });
}

export function Mirror({ s, update, saved, storageOk, onSavedChange, onNew, onOpenMessage }: Props) {
  const { t, lang } = useT();
  const M = t.mirror;
  const [viewing, setViewing] = useState<Collection | null>(null);
  const [undo, setUndo] = useState<Collection | null>(null);
  const showCurrent = !!s.analysis && !s.savedId && !s.analysis.safety.flagged;
  const mine = currentMine(s);

  const save = () => {
    const c = makeCollection(lang, s.title, s.note, mine.map(({ order, ai, chosen }) => ({ order, ai, chosen })));
    if (addCollection(c)) { update({ savedId: c.id }); onSavedChange(); }
  };
  // Not saving also drops the conversation from memory: nothing lingers in the tab.
  const dontSave = () => update({ analysis: null, transcript: null, choices: {}, title: "", note: "" });
  const remove = (c: Collection) => { if (removeCollection(c.id)) { setViewing(null); setUndo(c); onSavedChange(); } };
  const removeAll = () => { if (window.confirm(M.confirmDeleteAll) && clearCollections()) onSavedChange(); };

  return (
    <div className="app-page">
      <h1 className="app-h1">{M.title}</h1>
      {s.savedId && <div className="im-notice im-notice--success" role="status"><Icon name="device" /><div><strong>{M.savedTitle}</strong>{M.savedBody}</div></div>}
      {!storageOk && <div className="im-notice im-notice--error"><Icon name="alert" /><div><strong>{M.storageBlockedTitle}</strong>{M.storageBlocked}</div></div>}

      {showCurrent && (
        <section className="app-current" aria-labelledby="cur">
          <h2 id="cur" className="app-h2">{M.fromThis}</h2>
          <Stickers mine={mine} onOpen={onOpenMessage} />
          <Tally mine={mine} tapHint />
          <div className="im-field">
            <label className="im-label" htmlFor="title">{M.titleLabel}</label>
            <input id="title" className="im-input" maxLength={120} value={s.title} placeholder={M.titlePlaceholder} onChange={(e) => update({ title: e.target.value })} />
            <span className="im-hint">{M.titleHint}</span>
          </div>
          <div className="im-field">
            <label className="im-label" htmlFor="note">{M.noteLabel}</label>
            <textarea id="note" className="im-textarea" rows={3} maxLength={2000} value={s.note} onChange={(e) => update({ note: e.target.value })} />
            <span className="im-hint">{M.noteHint}</span>
          </div>
          <details className="app-more"><summary>{M.whatSaved}</summary>
            <ul className="app-saved-list">{M.savedList.map(([k, v]) => <li key={k}><strong>{k}</strong> {v}</li>)}</ul>
          </details>
          <div className="app-actions">
            <button className="im-btn im-btn--primary" onClick={save}><Icon name="saved" /> {M.save}</button>
            <button className="im-btn im-btn--ghost" onClick={dontSave}>{M.dontSave}</button>
          </div>
        </section>
      )}

      <section aria-labelledby="colls">
        <h2 id="colls" className="app-h2">{M.collections}{saved.length > 0 && <span className="app-count">{saved.length}</span>}</h2>
        {saved.length ? (
          <>
            <p className="app-legend-line">{M.legend[0]} · {M.legend[1]}</p>
            <ul className="app-colls">{saved.map((c) => <li key={c.id}><CollectionCard c={c} onOpen={() => setViewing(c)} /></li>)}</ul>
          </>
        ) : (
          <div className="app-empty"><h3 className="app-empty__title">{M.emptyTitle}</h3><p>{M.emptyBody}</p></div>
        )}
        <div className="app-actions app-mirror-new"><button className="im-btn im-btn--secondary" onClick={onNew}>{M.newConversation}</button></div>
      </section>

      {undo && <div className="app-toast" role="status">{M.deleted} <button className="app-textlink" onClick={() => { restoreCollection(undo); setUndo(null); onSavedChange(); }}>{M.undo}</button></div>}

      <footer className="app-storage"><Icon name="lock" /><div><strong>{M.storageNoteStrong}</strong> {M.storageNote}
        {saved.length > 0 && <details className="app-more"><summary>{M.manage}</summary><button className="im-btn im-btn--ghost im-btn--sm" onClick={removeAll}><Icon name="trash" /> {M.deleteAll}</button></details>}
      </div></footer>

      {viewing && (
        <>
          <div className="app-modal-backdrop" onClick={() => setViewing(null)} aria-hidden="true" />
          <section className="app-modal" role="dialog" aria-modal="true" aria-labelledby="coll-title">
            <div className="app-sheet-bar"><button className="app-icon-btn" autoFocus onClick={() => setViewing(null)} aria-label={t.replay.close}><Icon name="close" /></button></div>
            <h2 id="coll-title" className="app-h2">{viewing.title || M.untitled}</h2>
            <p className="im-hint">{new Date(viewing.createdAt).toLocaleDateString(lang === "vi" ? "vi-VN" : "en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
            {viewing.note && <div className="app-note-saved"><span className="im-label">{M.noteLabel.replace(/ \(.*\)$/, "")}</span><p>{viewing.note}</p></div>}
            <Stickers mine={viewing.mine} />
            <Tally mine={viewing.mine} />
            <p className="im-hint">{M.notEditable}</p>
            <button className="im-btn im-btn--ghost" onClick={() => remove(viewing)}><Icon name="trash" /> {M.deleteOne}</button>
          </section>
        </>
      )}
    </div>
  );
}

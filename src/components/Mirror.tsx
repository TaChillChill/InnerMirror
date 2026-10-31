"use client";
// My Mirror: one sticker per message of mine (Mirror's observation until I review it), an
// optional note to my future self, Save, and the collections saved in this browser.
// After Save the just-saved stickers stay in view with the ways forward: another
// conversation (primary), back to this one (still in memory), or home.
import { useEffect, useRef, useState } from "react";
import { addCollection, clearCollections, makeCollection, removeCollection, restoreCollection, type Collection, type MineEntry } from "@/lib/mirror-store";
import type { ExKey } from "@/lib/i18n";
import type { Update } from "./App";
import { readingFor, type Session } from "./session";
import { Stickers, Tally, CollectionCard } from "./Stickers";
import { Icon, useT } from "./ui";

type Props = { s: Session; update: Update; saved: Collection[]; storageOk: boolean; onSavedChange: () => void; onNew: () => void; onBack: () => void; onHome: () => void; onOpenMessage: (id: string) => void };

// My messages in order, with the AI's suggestion and my choice (labels only, no text).
export function currentMine(s: Session): (MineEntry & { id: string })[] {
  if (!s.analysis || !s.transcript) return [];
  return s.transcript.messages.filter((m) => m.speakerId === s.selfId).map((m, order) => {
    const expr = readingFor(s.analysis!, m.id)?.expression ?? "UNCLEAR";
    return { id: m.id, order, ai: expr === "UNCLEAR" ? "UNCLEAR" : (expr.toLowerCase() as ExKey), chosen: s.choices[m.id] ?? null };
  });
}

export function Mirror({ s, update, saved, storageOk, onSavedChange, onNew, onBack, onHome, onOpenMessage }: Props) {
  const { t, lang } = useT();
  const M = t.mirror;
  const [viewing, setViewing] = useState<Collection | null>(null);
  const [undo, setUndo] = useState<Collection | null>(null);
  const showCurrent = !!s.analysis && !s.savedId && !s.analysis.safety.flagged;
  const canGoBack = !!s.analysis && !!s.transcript && !s.analysis.safety.flagged;
  const justSaved = s.savedId ? saved.find((c) => c.id === s.savedId) : undefined;
  const mine = currentMine(s);
  const notice = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);

  // After Save the Save button is gone, so focus moves to the confirmation.
  useEffect(() => { if (s.savedId) notice.current?.focus(); }, [s.savedId]);
  // The collection dialog: Escape closes it, and focus returns to the card that opened it.
  useEffect(() => {
    if (!viewing) { opener.current?.focus(); return; }
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setViewing(null); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [viewing]);

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
      <div className="app-contents" inert={!!viewing}>
      <h1 className="app-h1">{M.title}</h1>
      {s.savedId && <div className="im-notice im-notice--success" role="status" tabIndex={-1} ref={notice}><Icon name="saved" /><div><strong>{M.savedTitle}</strong>{M.savedBody}</div></div>}
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

      {justSaved && (
        <section className="app-current" aria-labelledby="just">
          <h2 id="just" className="app-h2">{M.justSaved}: {justSaved.title || M.untitled}</h2>
          <Stickers mine={justSaved.mine} />
          {canGoBack && <p className="im-hint">{M.afterSaveHint}</p>}
        </section>
      )}

      <nav className="app-mirror-nav" aria-label={M.navLabel}>
        {/* Before Save, Save stays the one primary action on the page. */}
        <button className={`im-btn ${showCurrent ? "im-btn--secondary" : "im-btn--primary"}`} onClick={onNew}>{M.newConversation}</button>
        {canGoBack && <button className="im-btn im-btn--ghost" onClick={onBack}><Icon name="back" /> {M.back}</button>}
        <button className="app-textlink" onClick={onHome}>{M.home}</button>
      </nav>

      <section aria-labelledby="colls">
        <h2 id="colls" className="app-h2">{M.collections}{saved.length > 0 && <span className="app-count">{saved.length}</span>}</h2>
        {saved.length ? (
          <>
            <p className="app-legend-line"><span className="app-swatch is-dashed" aria-hidden="true" />{M.legend[0]}<span className="app-swatch is-solid" aria-hidden="true" />{M.legend[1]}</p>
            <ul className="app-colls">{saved.map((c) => <li key={c.id}><CollectionCard c={c} onOpen={(el) => { opener.current = el; setViewing(c); }} /></li>)}</ul>
          </>
        ) : (
          <div className="app-empty"><h3 className="app-empty__title">{M.emptyTitle}</h3><p>{M.emptyBody}</p></div>
        )}
      </section>

      {undo && <div className="app-toast" role="status">{M.deleted} <button className="app-textlink" onClick={() => { restoreCollection(undo); setUndo(null); onSavedChange(); }}>{M.undo}</button></div>}

      <footer className="app-storage"><Icon name="lock" /><div><strong>{M.storageNoteStrong}</strong> {M.storageNote}
        {saved.length > 0 && <details className="app-more"><summary>{M.manage}</summary><button className="im-btn im-btn--ghost im-btn--sm" onClick={removeAll}><Icon name="trash" /> {M.deleteAll}</button></details>}
      </div></footer>
      </div>

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

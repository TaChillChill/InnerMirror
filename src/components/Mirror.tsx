"use client";
// My Reflection: this conversation's state cloud and counts (the same picture a saved card
// gets), each turn of mine one tap away, an optional note to my future self, Save, and the
// collections saved in this browser. After Save the just-saved picture stays in view with
// the ways forward: another conversation (primary), back to this one, or home.
import { useEffect, useRef, useState } from "react";
import { addCollection, clearCollections, makeCollection, removeCollection, restoreCollection, type Collection, type MineEntry } from "@/lib/mirror-store";
import type { ExKey } from "@/lib/i18n";
import type { Update } from "./App";
import { anchorOf } from "@/lib/ai/analysis";
import { readingFor, type Session } from "./session";
import { Stickers } from "./Stickers";
import { SavedRail, titleOf } from "./SavedRail";
import { PersonalMirror, StateRows } from "./PersonalMirror";
import { StateCloud } from "./StateCloud";
import { WhoPicker } from "./Observation";
import { countsOf, type Counts } from "@/lib/mirror-stats";
import { Icon, useT } from "./ui";

type Props = { s: Session; update: Update; saved: Collection[]; storageOk: boolean; onSavedChange: () => void; onNew: () => void; onBack: () => void; onHome: () => void; onOpenMessage: (id: string) => void };

// My segments in order (one per character shown in Replay), with the AI's suggestion and
// my choice (labels only, no text). A segment is keyed by its last message.
export function currentMine(s: Session): (MineEntry & { id: string })[] {
  if (!s.analysis || !s.transcript) return [];
  const a = s.analysis;
  return s.transcript.messages.filter((m) => m.speakerId === s.selfId && anchorOf(a, m.id) === m.id).map((m, order) => {
    const expr = readingFor(a, m.id)?.expression ?? "UNCLEAR";
    return { id: m.id, order, ai: expr === "UNCLEAR" ? "UNCLEAR" : (expr.toLowerCase() as ExKey), chosen: s.choices[m.id] ?? null };
  });
}

export function Mirror({ s, update, saved, storageOk, onSavedChange, onNew, onBack, onHome, onOpenMessage }: Props) {
  const { t, lang } = useT();
  const M = t.mirror;
  const [viewing, setViewing] = useState<Collection | null>(null);
  const [undo, setUndo] = useState<Collection | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);
  const showCurrent = !!s.analysis && !s.savedId && !s.analysis.safety.flagged;
  const canGoBack = !!s.analysis && !!s.transcript && !s.analysis.safety.flagged;
  const justSaved = s.savedId ? saved.find((c) => c.id === s.savedId) : undefined;
  const mine = currentMine(s);
  const mineCounts = countsOf([{ mine }]);
  const viewingCounts = viewing ? countsOf([viewing]) : null;
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

  // A failed save says so and leaves everything on screen as it was (UAT batch 2, #04).
  const save = () => {
    try {
      const c = makeCollection(lang, s.title, s.note, mine.map(({ order, ai, chosen }) => ({ order, ai, chosen })));
      if (!addCollection(c)) return setSaveFailed(true);
      setSaveFailed(false);
      update({ savedId: c.id });
      onSavedChange();
    } catch {
      setSaveFailed(true);
    }
  };
  // Not saving also drops the conversation from memory: nothing lingers in the tab.
  const dontSave = () => update({ analysis: null, transcript: null, choices: {}, title: "", titleAuto: true, note: "" });
  const remove = (c: Collection) => { if (removeCollection(c.id)) { setViewing(null); setUndo(c); onSavedChange(); } };
  const removeAll = () => { if (window.confirm(M.confirmDeleteAll) && clearCollections()) onSavedChange(); };

  return (
    <div className="app-page">
      <div className="app-contents" inert={!!viewing}>
      <h1 className="app-h1">{M.title}</h1>
      {s.savedId && <div className="im-notice im-notice--success" role="status" tabIndex={-1} ref={notice}><Icon name="saved" /><div><strong>{M.savedTitle}</strong>{M.savedBody}</div></div>}
      {!storageOk && <div className="im-notice im-notice--error"><Icon name="alert" /><div><strong>{M.storageBlockedTitle}</strong>{M.storageBlocked}</div></div>}

      {/* My turns need a "who are you"; it is asked here if Replay was skipped. */}
      {showCurrent && !s.selfId && <WhoPicker s={s} update={update} />}

      {showCurrent && s.selfId && (
        <section className="app-current" aria-labelledby="cur">
          <h2 id="cur" className="app-h2">{M.fromThis}</h2>
          <Picture counts={mineCounts} />
          <details className="app-more"><summary>{M.perTurn(mine.length)}</summary>
            <Stickers mine={mine} onOpen={onOpenMessage} />
            <p className="im-hint">{M.tapHint}</p>
          </details>
          <div className="im-field">
            <label className="im-label" htmlFor="title">{M.titleLabel}</label>
            <input id="title" className="im-input" maxLength={120} value={s.title} placeholder={M.titlePlaceholder} onChange={(e) => update({ title: e.target.value, titleAuto: false })} />
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
          {saveFailed && <div className="im-notice im-notice--error" role="alert"><Icon name="alert" /><div>{M.saveFailed}</div></div>}
          <div className="app-actions">
            {s.sample ? <p className="im-hint">{M.sampleNoSave}</p> : <button className="im-btn im-btn--primary" onClick={save}><Icon name="saved" /> {M.save}</button>}
            <button className="im-btn im-btn--ghost" onClick={dontSave}>{M.dontSave}</button>
          </div>
        </section>
      )}

      {justSaved && (
        <section className="app-current" aria-labelledby="just">
          <h2 id="just" className="app-h2">{M.justSaved}: {titleOf(justSaved, saved, M.numbered)}</h2>
          <Picture counts={countsOf([justSaved])} />
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
        <h2 id="colls" className="app-h2">{M.collections}{saved.length > 0 && <span className="app-count" aria-label={M.savedCount(saved.length)}>{saved.length}</span>}</h2>
        {saved.length ? (
          <SavedRail saved={saved} onOpen={(c, el) => { opener.current = el; setViewing(c); }} />
        ) : (
          <div className="app-empty"><h3 className="app-empty__title">{M.emptyTitle}</h3><p>{M.emptyBody}</p></div>
        )}
      </section>

      {saved.length > 0 && <PersonalMirror saved={saved} />}

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
            <h2 id="coll-title" className="app-h2">{titleOf(viewing, saved, M.numbered)}</h2>
            <p className="im-hint">{new Date(viewing.createdAt).toLocaleDateString(lang === "vi" ? "vi-VN" : "en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
            {viewing.note && <div className="app-note-saved"><span className="im-label">{M.noteLabel.replace(/ \(.*\)$/, "")}</span><p>{viewing.note}</p></div>}
            <Picture counts={viewingCounts!} />
            <p className="im-hint">{M.notEditable}</p>
            <button className="im-btn im-btn--ghost" onClick={() => remove(viewing)}><Icon name="trash" /> {M.deleteOne}</button>
          </section>
        </>
      )}
    </div>
  );
}

/** One conversation's picture: the state cloud, a row per state that appeared, what stayed outside. */
function Picture({ counts }: { counts: Counts }) {
  const { t } = useT();
  const M = t.mirror;
  const outside = M.outside(counts.unclear, counts.unsure);
  return (
    <>
      <StateCloud counts={counts} large />
      <StateRows counts={counts} />
      {outside && <p className="app-pm__aside">{outside}.</p>}
      <p className="im-hint">{M.cloudNote}</p>
    </>
  );
}

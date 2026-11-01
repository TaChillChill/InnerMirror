"use client";
// The top of "What Mirror sees" (approved 2026-11-01): a one-line arc of how the conversation
// moved, the uncertainty line, the method behind a collapsible, and a sheet that explains the
// five ego states. The arc reuses the model's own neutral turn phrases (analysis.arcOf).
import { useEffect, useRef, useState } from "react";
import { arcOf } from "@/lib/ai/analysis";
import { EX_ORDER } from "@/lib/i18n";
import type { Update } from "./App";
import { withNames, type Session } from "./session";
import { Badge, Icon, useT } from "./ui";

export function Observation({ s }: { s: Session }) {
  const { t } = useT();
  const R = t.replay;
  const a = s.analysis!;
  const arc = arcOf(a).map((p) => withNames(p, s));
  const how = useRef<HTMLDetailsElement>(null);
  const [learn, setLearn] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!learn) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { e.stopPropagation(); setLearn(false); opener.current?.focus(); } };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [learn]);
  const closeLearn = () => { setLearn(false); opener.current?.focus(); };

  return (
    <>
      <section className="im-layer im-layer--ai app-obs">
        <div className="im-layer__head"><Icon name="eye" /> {R.aiObservation}</div>
        {arc.length > 1
          ? <p className="app-obs__arc">{R.arcFrom} {arc.map((p, i) => <span key={p}>{i > 0 && " → "}<strong>{p}</strong></span>)}.</p>
          : <p>{withNames(a.summary, s)}</p>}
        <p className="im-hint">{withNames(a.uncertainty, s)}</p>
        {arc.length > 1 && <details className="app-more"><summary>{R.fullSummary}</summary><p>{withNames(a.summary, s)}</p></details>}
        <details className="app-more" ref={how}>
          <summary>{R.howTitle}</summary>
          <ul className="app-obs__how">{R.howBody.map((line) => <li key={line}>{line}</li>)}</ul>
          <p className="im-hint">{R.theory}</p>
          <button className="app-textlink" onClick={() => { if (how.current) { how.current.open = false; how.current.querySelector("summary")?.focus(); } }}>{R.collapse}</button>
        </details>
      </section>
      <p className="app-tip">{R.tip} <button ref={opener} className="app-textlink" onClick={() => setLearn(true)}>{R.learnLink}</button></p>

      {learn && (
        <>
          <div className="app-modal-backdrop" onClick={closeLearn} aria-hidden="true" />
          <section className="app-modal" role="dialog" aria-modal="true" aria-labelledby="learn-title">
            <div className="app-sheet-bar"><button className="app-icon-btn" autoFocus onClick={closeLearn} aria-label={R.close}><Icon name="close" /></button></div>
            <h2 id="learn-title" className="app-h2">{R.learnTitle}</h2>
            <p className="im-hint">{R.learnLead}</p>
            <ul className="app-legend">{EX_ORDER.map((ex) => <li key={ex}><Badge ex={ex} state="plain" size={48} /><span><strong>{t.ex[ex].name}</strong> {t.ex[ex].desc}</span></li>)}</ul>
            <p className="im-hint">{R.theory}</p>
          </section>
        </>
      )}
    </>
  );
}

/** "Who are you?" as one row of names, asked where it matters (Replay's end, My Reflection). */
export function WhoPicker({ s, update, compact }: { s: Session; update: Update; compact?: boolean }) {
  const { t } = useT();
  const R = t.replay;
  const speaking = s.transcript!.participants.filter((p) => s.transcript!.messages.some((m) => m.speakerId === p.id));
  return (
    <section className={`app-whopick${compact ? " is-compact" : ""}`} aria-labelledby="whopick">
      <h2 id="whopick" className="app-whopick__q">{R.whoQ}</h2>
      <div className="app-row-wrap" role="group" aria-labelledby="whopick">
        {speaking.map((p) => (
          <button key={p.id} className="app-chip-btn" aria-pressed={s.selfId === p.id} onClick={() => update({ selfId: s.selfId === p.id ? null : p.id })}>
            {s.selfId === p.id && <Icon name="check" />}{p.name}
          </button>
        ))}
      </div>
      <p className="im-hint">{R.whoWhy}</p>
    </section>
  );
}

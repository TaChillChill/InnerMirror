"use client";
// Replay: the conversation with a character per message, shifts between messages, and
// the selector for the open message. The AI's cues are highlighted in the bubble itself.
import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { EX_ORDER } from "@/lib/i18n";
import type { Update } from "./App";
import { Selector, badgeFor } from "./Selector";
import { WhatIf } from "./WhatIf";
import { useScenarios } from "./use-scenarios";
import { scenarioContext } from "@/lib/ai/scenario";
import { nameOf, readingFor, withNames, type Session } from "./session";
import { Avatar, Badge, Chip, Icon, toKey, useT } from "./ui";

function useIsDesktop() {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mq = matchMedia("(min-width: 960px)");
    const sync = () => setDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return desktop;
}

// Marks each cue's first occurrence; overlapping cues keep the earlier one.
function highlight(text: string, cues: string[], ex: string | undefined): ReactNode {
  const lower = text.toLowerCase();
  const spans = cues.map((c) => ({ start: lower.indexOf(c.toLowerCase()), len: c.length })).filter((x) => x.start >= 0).sort((a, b) => a.start - b.start);
  const out: ReactNode[] = [];
  let at = 0;
  for (const { start, len } of spans) {
    if (start < at) continue;
    out.push(text.slice(at, start), <mark key={start} className="im-cue im-ex" data-ex={ex}>{text.slice(start, start + len)}</mark>);
    at = start + len;
  }
  out.push(text.slice(at));
  return out;
}

export function Replay({ s, update, onContinue, onRestart }: { s: Session; update: Update; onContinue: () => void; onRestart: () => void }) {
  const { t } = useT();
  const R = t.replay;
  const R_wi = t.whatIf;
  const desktop = useIsDesktop();
  const opener = useRef<HTMLButtonElement | null>(null);
  const whatIfOpener = useRef<HTMLButtonElement | null>(null);
  const [whatIf, setWhatIf] = useState<string | null>(null);
  // Explored scenarios live here, so they vanish when Replay unmounts.
  const scenarios = useScenarios();
  const a = s.analysis!;
  const T = s.transcript!;
  const others = T.participants.filter((p) => p.id !== s.selfId);

  // Focus moves into the selector when it opens and back to its badge when it closes.
  useEffect(() => {
    if (s.selected) document.querySelector<HTMLElement>(".app-sel-focus")?.focus();
    else opener.current?.focus();
  }, [s.selected]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { update({ selected: null }); setWhatIf(null); } };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [update]);
  useEffect(() => { if (!whatIf) whatIfOpener.current?.focus(); }, [whatIf]);

  if (a.safety.flagged) return <Safety note={a.safety.note} onBack={onRestart} />;

  return (
    <div className={`app-page app-page--replay${s.selected && !desktop ? " app-sheet-open" : ""}`}>
      <h1 className="app-h1">{R.title}</h1>
      <section className="im-layer im-layer--ai">
        <div className="im-layer__head"><Icon name="eye" /> {R.aiObservation}</div>
        <p>{withNames(a.summary, s)}</p>
        <p className="im-hint">{withNames(a.uncertainty, s)}</p>
        <details className="app-more">
          <summary>{R.learn}</summary>
          <ul className="app-legend">{EX_ORDER.map((ex) => <li key={ex}><Badge ex={ex} state="plain" size={40} /><span><strong>{t.ex[ex].name}</strong> {t.ex[ex].desc}</span></li>)}</ul>
          <p className="im-hint">{R.theory}</p>
        </details>
      </section>
      <p className="app-tip">{R.tip}</p>

      <div className="im-thread app-thread">
        {T.messages.map((m) => {
          const mine = m.speakerId === s.selfId;
          const r = readingFor(a, m.id);
          const b = badgeFor(s, m.id);
          const open = s.selected === m.id;
          const shift = a.shifts.find((x) => x.messageId === m.id);
          const ctx = mine ? scenarioContext(T.messages, s.selfId, m.id) : null;
          const label = b.state === "suggested" ? R.aiSuggestion : b.state === "unsure" ? R.youUnsure : b.state === "agreed" ? R.youAgreed : R.youChose;
          return (
            <Fragment key={m.id}>
              {shift && <p className="app-shift"><Icon name="swap" /><span><strong>{R.shift}.</strong> {withNames(shift.description, s)}</span></p>}
              <div className={`im-msg${mine ? " im-msg--me" : ""}`} aria-current={open ? "true" : undefined}>
                {!mine && <Avatar name={nameOf(s, m.speakerId, R.you)} isMe={false} index={others.findIndex((o) => o.id === m.speakerId)} />}
                <div className="im-bubble">
                  <span className="app-visually-hidden">{nameOf(s, m.speakerId, R.you)}: </span>
                  {open && r ? highlight(m.text, r.cues, toKey(r.expression) === "unsure" ? undefined : toKey(r.expression)) : m.text}
                </div>
                <div className="im-msg__meta">
                  <button aria-expanded={open} aria-label={`${label}: ${b.ex === "unsure" ? t.unsure : t.ex[b.ex].name}. ${R.open}`}
                    onClick={(e) => { opener.current = e.currentTarget; update({ selected: open ? null : m.id }); }}>
                    <Badge ex={b.ex} state={b.state} size={28} />
                    <span className="app-meta-label">{b.state !== "suggested" && <span className="app-you">{label}</span>}<Chip ex={b.ex} /></span>
                  </button>
                  {ctx && (
                    <button className="im-btn im-btn--ghost im-btn--sm app-wi-btn" aria-expanded={whatIf === m.id} aria-label={R_wi.buttonAria}
                      onClick={(e) => { whatIfOpener.current = e.currentTarget; setWhatIf(whatIf === m.id ? null : m.id); }}>{R_wi.button}</button>
                  )}
                </div>
              </div>
              {ctx && whatIf === m.id && <div className="app-inline"><WhatIf s={s} ctx={ctx} scenarios={scenarios} onClose={() => setWhatIf(null)} /></div>}
              {desktop && open && <div className="app-inline"><Selector s={s} update={update} id={m.id} /></div>}
            </Fragment>
          );
        })}
      </div>

      {!desktop && (
        <>
          <div className="app-sheet-backdrop" onClick={() => update({ selected: null })} aria-hidden="true" />
          <aside className={`app-sheet${s.selected ? " is-open" : ""}`} aria-label={R.selectorTitle}>
            <div className="app-sheet-bar"><span className="app-sheet-title">{R.selectorTitle}</span>
              <button className="app-icon-btn" onClick={() => update({ selected: null })} aria-label={R.close}><Icon name="close" /></button></div>
            {s.selected && <Selector s={s} update={update} id={s.selected} />}
          </aside>
        </>
      )}

      <div className="app-continue">
        <button className="im-btn im-btn--primary" onClick={onContinue}>{R.continue}</button>
        <span className="im-hint">{R.continueHint}</span>
      </div>
    </div>
  );
}

function Safety({ note, onBack }: { note: string | null; onBack: () => void }) {
  const { t } = useT();
  const S = t.safety;
  return (
    <div className="app-page">
      <div className="im-notice im-notice--safety" role="alert"><Icon name="alert" /><div>
        <strong>{S.title}</strong>
        {note && <p>{note}</p>}
        <p>{S.body}</p>
        <p><strong>{S.emergency}</strong></p>
        <p className="im-hint">{S.resourcesPending}</p>
        <button className="im-btn im-btn--ghost" onClick={onBack}>{S.back}</button>
      </div></div>
    </div>
  );
}

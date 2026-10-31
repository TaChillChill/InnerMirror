"use client";
// Replay: the conversation with a character per message, shifts between messages, and
// the selector for the open message. The AI's cues are highlighted in the bubble itself.
import { Fragment, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { EX_ORDER } from "@/lib/i18n";
import type { Update } from "./App";
import { badgeFor } from "./Selector";
import { MessagePanel, type PanelTab } from "./MessagePanel";
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
  const W = t.whatIf;
  const desktop = useIsDesktop();
  const opener = useRef<HTMLButtonElement | null>(null);
  const [tab, setTab] = useState<PanelTab>("reading");
  // Explored scenarios live here, so they vanish when Replay unmounts.
  const scenarios = useScenarios();
  const a = s.analysis!;
  const T = s.transcript!;
  const others = T.participants.filter((p) => p.id !== s.selfId);
  const close = useCallback(() => update({ selected: null }), [update]);
  // The same button closes what it opened; the other one switches tab.
  const openPanel = (el: HTMLButtonElement, id: string, which: PanelTab) => {
    opener.current = el;
    if (s.selected === id && tab === which) return close();
    setTab(which);
    update({ selected: id });
  };

  // Focus moves into the panel when it opens (What if? focuses its own heading) and back
  // to the button that opened it when it closes.
  useEffect(() => {
    if (s.selected) document.querySelector<HTMLElement>(".app-sel-focus")?.focus();
    else opener.current?.focus();
  }, [s.selected]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [close]);

  if (a.safety.flagged) return <Safety note={a.safety.note} onBack={onRestart} />;
  const sheetOpen = !!s.selected && !desktop;

  return (
    <div className={`app-page app-page--replay${sheetOpen ? " app-sheet-open" : ""}`}>
      <div className="app-replay__main" inert={sheetOpen}>
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
            const canWhatIf = mine && !!scenarioContext(T.messages, s.selfId, m.id);
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
                    <button className="app-meta-btn" aria-expanded={open && tab === "reading"} aria-label={`${label}: ${b.ex === "unsure" ? t.unsure : t.ex[b.ex].name}. ${R.open}`}
                      onClick={(e) => openPanel(e.currentTarget, m.id, "reading")}>
                      <Badge ex={b.ex} state={b.state} size={28} />
                      <span className="app-meta-label">{b.state !== "suggested" && <span className="app-you">{label}</span>}<Chip ex={b.ex} /></span>
                      <span className="app-meta-chev"><Icon name="chev" /></span>
                    </button>
                    {canWhatIf && (
                      <button className="app-wi-pill" aria-expanded={open && tab === "whatif"} aria-label={W.buttonAria}
                        onClick={(e) => openPanel(e.currentTarget, m.id, "whatif")}><Icon name="swap" />{W.button}</button>
                    )}
                  </div>
                </div>
              </Fragment>
            );
          })}
        </div>

        <div className="app-continue">
          <button className="im-btn im-btn--primary" onClick={onContinue}>{R.continue}</button>
          <span className="im-hint">{R.continueHint}</span>
        </div>
      </div>

      {!desktop && <div className="app-sheet-backdrop" onClick={close} aria-hidden="true" />}
      <aside className={`app-sheet${s.selected ? " is-open" : ""}`} aria-label={R.panelLabel} role={sheetOpen ? "dialog" : undefined} aria-modal={sheetOpen || undefined}>
        {s.selected
          ? <MessagePanel s={s} update={update} id={s.selected} tab={tab} onTab={setTab} scenarios={scenarios} onClose={close} />
          : desktop && <p className="app-panel-empty"><Icon name="eye" /><span>{R.panelEmpty}</span></p>}
      </aside>
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
        <p className="im-hint">{S.scope}</p>
        <button className="im-btn im-btn--ghost" onClick={onBack}>{S.back}</button>
      </div></div>
    </div>
  );
}

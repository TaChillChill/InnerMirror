"use client";
// Replay: the conversation with one character per segment (usually a whole turn, so a
// thought sent as several bubbles reads as one), shifts between messages, and the selector
// for the open segment. The AI's cues are highlighted in the bubbles themselves.
import { Fragment, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { Update } from "./App";
import { aiChip, badgeFor } from "./Selector";
import { MessagePanel, type PanelTab } from "./MessagePanel";
import { useScenarios } from "./use-scenarios";
import { Observation, WhoPicker } from "./Observation";
import { Direction } from "./Direction";
import { scenarioContext } from "@/lib/ai/scenario";
import { segmentOf } from "@/lib/ai/analysis";
import { narrationBefore } from "@/lib/story";
import { nameOf, readingFor, safetyHold, whatIfOff, withNames, type Session } from "./session";
import { Avatar, Badge, Chip, Icon, MoreLine, toKey, useT } from "./ui";

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

export function Replay({ s, update, onContinue, onEdit, onRestart }: { s: Session; update: Update; onContinue: () => void; onEdit: () => void; onRestart: () => void }) {
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

  // A plain render function, not a component: the buttons must keep their identity so
  // focus can return to the one that opened the panel.
  const meta = (id: string, mine: boolean, size: number) => {
    const r = readingFor(a, id);
    const b = badgeFor(s, id);
    const ai = b.state === "suggested" && r ? aiChip(t, r) : {};
    const name = ai.text ?? `${ai.prefix ? `${ai.prefix} ` : ""}${b.ex === "unsure" ? t.unsure : t.ex[b.ex].name}`;
    const label = b.state === "suggested" ? R.aiSuggestion : b.state === "unsure" ? R.youUnsure : b.state === "agreed" ? R.youAgreed : R.youChose;
    // Any speaker's message can be explored (U9); it needs someone else in the chat to answer.
    const canWhatIf = !whatIfOff(s) && !!scenarioContext(T.messages, T.messages.find((x) => x.id === id)?.speakerId ?? null, id);
    const open = s.selected === id;
    return (
      <div className="im-msg__meta">
        <button className="app-meta-btn" aria-expanded={open && tab === "reading"} aria-label={`${label}: ${name}.${size > 1 ? ` ${R.segment(size)}.` : ""} ${R.open}`}
          onClick={(e) => openPanel(e.currentTarget, id, "reading")}>
          <Badge ex={b.ex} state={b.state} size={28} />
          <span className="app-meta-label">{b.state !== "suggested" && <span className="app-you">{label}</span>}<Chip ex={b.ex} {...ai} /></span>
          <span className="app-meta-chev"><Icon name="chev" /></span>
        </button>
        {canWhatIf && (
          <button className="app-wi-pill" aria-expanded={open && tab === "whatif"} aria-label={W.buttonAria(mine ? null : nameOf(s, T.messages.find((x) => x.id === id)!.speakerId, R.you))}
            onClick={(e) => openPanel(e.currentTarget, id, "whatif")}><Icon name="swap" />{W.button}</button>
        )}
      </div>
    );
  };

  if (a.safety.flagged) return <Safety note={a.safety.note} onBack={onRestart} />;
  const sheetOpen = !!s.selected && !desktop;

  return (
    <div className={`app-page app-page--replay${sheetOpen ? " app-sheet-open" : ""}`}>
      <div className="app-replay__main" inert={sheetOpen}>
        <h1 className="app-h1">{R.title}</h1>
        {/* What Mirror offers comes first (UAT #06), as one line that opens on demand, so the
            observation is near the top on a phone (UAT batch 2, #05). */}
        <MoreLine id="value-body" line={R.valueTitle} body={<p>{R.valueBody}</p>} />
        {/* Back to the transcript; an unchanged conversation is not analyzed again (App). */}
        <button className="app-textlink app-replay__edit" onClick={onEdit}><Icon name="edit" /> {R.editTranscript}</button>
        {s.sample && <div className="im-notice" role="status"><Icon name="eye" /><div>{R.sampleNote}</div></div>}
        {T.source === "story" && <div className="im-notice" role="status"><Icon name="text" /><div>{R.storyNote}</div></div>}
        {/* The backstop adds support on top of the readings; the model's own flag replaces Replay (Safety). */}
        {safetyHold(s) && <div className="im-notice im-notice--safety" role="alert"><Icon name="alert" /><div>
          <strong>{t.safety.holdTitle}</strong><p>{t.safety.holdBody}</p><p><strong>{t.safety.emergency}</strong></p></div></div>}
        <Observation s={s} update={update} />

        <div className="im-thread app-thread">
          {T.messages.map((m) => {
            const mine = m.speakerId === s.selfId;
            const r = readingFor(a, m.id);
            // One character per segment, shown under its last bubble; choices use that id.
            const seg = segmentOf(a, m.id);
            const anchor = seg?.messageIds.at(-1) ?? m.id;
            const isAnchor = anchor === m.id;
            const first = !seg || seg.messageIds[0] === m.id;
            const open = s.selected === anchor;
            const shift = a.shifts.find((x) => x.messageId === m.id);
            return (
              <Fragment key={m.id}>
                {narrationBefore(T, m.id).map((n) => <p key={n.id} className="app-narr app-narr--replay"><span className="app-narr__tag">{t.review.story.narration}</span>{n.text}</p>)}
                {shift && <p className="app-shift"><Icon name="swap" /><span><strong>{R.shift}.</strong> {withNames(shift.description, s)}</span></p>}
                <div className={`im-msg${mine ? " im-msg--me" : ""}${isAnchor ? "" : " app-msg--cont"}`} aria-current={open ? "true" : undefined}>
                  {!mine && (first
                    ? <Avatar name={nameOf(s, m.speakerId, R.you)} isMe={false} index={others.findIndex((o) => o.id === m.speakerId)} />
                    : <span className="app-avatar-gap" aria-hidden="true" />)}
                  <div className="im-bubble">
                    <span className="app-visually-hidden">{nameOf(s, m.speakerId, R.you)}: </span>
                    {open && r ? highlight(m.text, r.cues, toKey(r.expression) === "unsure" ? undefined : toKey(r.expression)) : m.text}
                  </div>
                  {isAnchor && meta(anchor, mine, seg?.messageIds.length ?? 1)}
                </div>
              </Fragment>
            );
          })}
          {narrationBefore(T, null).map((n) => <p key={n.id} className="app-narr app-narr--replay"><span className="app-narr__tag">{t.review.story.narration}</span>{n.text}</p>)}
        </div>

        <WhoPicker s={s} update={update} />
        {!safetyHold(s) && <Direction />}
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

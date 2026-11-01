"use client";
// Transcript review as a chat: bubbles first, editing only when a bubble is tapped.
// One editor for pasted, typed and screenshot-extracted transcripts.
import { useState } from "react";
import { newId, reviewProblem, type Message, type Transcript } from "@/lib/conversation";
import type { Update } from "./App";
import type { Session } from "./session";
import { Avatar, Icon, useT } from "./ui";

type Props = { s: Session; update: Update; onAnalyze: () => void; onBack: () => void };

export function Review({ s, update, onAnalyze, onBack }: Props) {
  const { t } = useT();
  const R = t.review;
  const T = s.transcript as Transcript;
  const [editing, setEditing] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [speaker, setSpeaker] = useState(T.participants[0]?.id ?? "p1");
  const [draft, setDraft] = useState("");

  const setT = (patch: Partial<Transcript>) => update((cur) => ({ transcript: { ...(cur.transcript as Transcript), ...patch } }));
  // Editing the text means the user has looked at it, so the "may be cut off" mark goes away.
  const setMsg = (id: string, patch: Partial<Message>) => setT({ messages: T.messages.map((m) => (m.id === id ? { ...m, ...(patch.text !== undefined ? { legibility: "clear" as const } : {}), ...patch } : m)) });
  const fromShot = T.source === "screenshot";
  const X = R.extracted;
  const attention = T.messages.filter((m) => m.legibility === "partial" || m.legibility === "unreadable").length;
  const others = T.participants.filter((p) => p.id !== s.selfId);
  const avatar = (pid: string, size: number) => {
    const p = T.participants.find((x) => x.id === pid);
    return <Avatar name={p?.name ?? "?"} isMe={pid === s.selfId} index={Math.max(0, others.findIndex((o) => o.id === pid))} size={size} />;
  };
  // Until "This is me" is chosen, keep the usual chat layout: the second speaker on the right.
  const isRight = (m: Message) => (s.selfId ? m.speakerId === s.selfId : m.speakerId === T.participants[1]?.id);

  const addMessage = () => {
    if (!draft.trim()) return;
    setT({ messages: [...T.messages, { id: newId("m"), speakerId: speaker, text: draft.trim() }] });
    setDraft("");
  };
  const addPerson = () => {
    const id = newId("p");
    setT({ participants: [...T.participants, { id, name: R.newPerson(T.participants.length + 1) }] });
    setRenaming(id);
  };

  const problem = reviewProblem(T, s.selfId) ?? (s.consent ? null : "consent");
  const speakerChips = (current: string, onPick: (pid: string) => void) => T.participants.map((p) => (
    <button key={p.id} className="app-chip-btn" aria-pressed={current === p.id} onClick={() => onPick(p.id)}>{avatar(p.id, 24)}{p.name}</button>
  ));

  return (
    <div className="app-page">
      <h1 className="app-h1">{fromShot ? X.title : T.messages.length ? R.titleCheck : R.titleWrite}</h1>
      <p className="app-lead">{fromShot ? X.lead : T.messages.length ? R.leadCheck : R.leadWrite}</p>
      {fromShot && (
        <>
          {(attention > 0 || s.extractNotes.length > 0) && (
            <div className="im-notice" role="status"><Icon name="alert" /><div>
              {attention > 0 && <p>{X.attention(attention)}</p>}
              {s.extractNotes.map((n) => <p key={n}>{X.notes[n]}</p>)}
            </div></div>
          )}
          {s.shots.length > 0 && (
            <details className="app-more">
              <summary>{X.compare}</summary>
              <div className="app-shots app-shots--compare">
                {/* eslint-disable-next-line @next/next/no-img-element -- local data URLs */}
                {s.shots.map((src, i) => <img key={i} src={src} alt={R.shotAlt(i + 1)} />)}
              </div>
            </details>
          )}
        </>
      )}

      <section className="app-who" aria-labelledby="who">
        <h2 id="who" className="app-who__q">{R.whoIsYou}</h2>
        <div className="app-who__opts">
          {T.participants.map((p) => (
            <div key={p.id} className="app-who__opt">
              <button className="app-who__btn" aria-pressed={s.selfId === p.id} onClick={() => update({ selfId: p.id })}>
                {avatar(p.id, 40)}<span>{p.name}</span>
                {s.selfId === p.id && <span className="app-who__me"><Icon name="check" /> {R.you}</span>}
              </button>
              <button className="app-icon-btn" onClick={() => setRenaming(renaming === p.id ? null : p.id)} aria-label={R.rename(p.name)}><Icon name="edit" /></button>
              {renaming === p.id && (
                <input className="im-input app-rename" aria-label={R.nameLabel} value={p.name} maxLength={40} autoFocus
                  onChange={(e) => setT({ participants: T.participants.map((x) => (x.id === p.id ? { ...x, name: e.target.value } : x)) })}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") setRenaming(null); }} onBlur={() => setRenaming(null)} />
              )}
            </div>
          ))}
          {T.participants.length < 8 && <button className="im-btn im-btn--ghost im-btn--sm" onClick={addPerson}><Icon name="plus" /> {R.addPerson}</button>}
        </div>
        <p className="im-hint">{R.namesNote}</p>
      </section>

      <div className="app-stack">
        {T.messages.length ? (
          <ol className="app-rv-thread" aria-label={t.steps[0]}>
            {T.messages.map((m) => {
              const name = T.participants.find((p) => p.id === m.speakerId)?.name ?? "?";
              if (editing === m.id) return (
                <li key={m.id} className={`app-rv-msg ${isRight(m) ? "is-right" : ""}`}>
                  <div className="app-rv-edit">
                    <label className="im-label" htmlFor={`edit-${m.id}`}>{R.message}</label>
                    <textarea id={`edit-${m.id}`} className="im-textarea" rows={3} autoFocus value={m.text} onChange={(e) => setMsg(m.id, { text: e.target.value })} />
                    <div className="app-row-wrap"><span className="im-label">{R.sentBy}</span>{speakerChips(m.speakerId, (pid) => setMsg(m.id, { speakerId: pid }))}</div>
                    <div className="app-actions">
                      <button className="im-btn im-btn--primary im-btn--sm" onClick={() => { setMsg(m.id, { legibility: "clear" }); setEditing(null); }}>{R.done}</button>
                      <button className="im-btn im-btn--ghost im-btn--sm" onClick={() => { setT({ messages: T.messages.filter((x) => x.id !== m.id) }); setEditing(null); }}><Icon name="trash" /> {R.delete}</button>
                    </div>
                  </div>
                </li>
              );
              return (
                <li key={m.id} className={`app-rv-msg ${isRight(m) ? "is-right" : ""}`}>
                  {!isRight(m) && avatar(m.speakerId, 32)}
                  <button className={`im-bubble app-rv-bubble${m.legibility === "partial" ? " is-partial" : ""}`} onClick={() => setEditing(m.id)} aria-label={`${name}: ${m.text || X.unreadable}. ${R.editHint}`}>
                    <span className="app-rv-name">{name}{m.legibility === "partial" && <em className="app-rv-tag"> · {X.partialTag}</em>}</span>
                    {m.text || (m.legibility === "unreadable" ? <em>{X.unreadable}</em> : "")}
                  </button>
                </li>
              );
            })}
          </ol>
        ) : <div className="app-empty-chat"><Icon name="text" /><p>{R.empty}</p></div>}

        <section className="app-composer" aria-label={R.composer}>
          <div className="app-row-wrap"><span className="im-label">{R.whoSaid}</span>{speakerChips(speaker, setSpeaker)}</div>
          <div className="app-composer__row">
            <input className="im-input" placeholder={R.typeMessage} aria-label={R.message} value={draft}
              onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addMessage(); } }} />
            <button className="im-btn im-btn--secondary" onClick={addMessage}><Icon name="plus" /> {R.add}</button>
          </div>
        </section>
      </div>

      <label className="im-check"><input type="checkbox" checked={s.consent} onChange={(e) => update({ consent: e.target.checked })} /> {R.consent}</label>
      <div className="im-notice"><Icon name="lock" /><div>{R.privacy}{" "}
        {/* A new tab: leaving this page would drop the conversation, which lives only in memory. */}
        <a href="/privacy" target="_blank" rel="noopener">{R.privacyLink}</a></div></div>
      <div className="app-actions">
        <button className="im-btn im-btn--primary" disabled={!!problem} onClick={onAnalyze}>{R.cta}</button>
        <button className="im-btn im-btn--ghost" onClick={onBack}>{R.back}</button>
      </div>
      {problem && <p className="im-hint" aria-live="polite">{R.problems[problem]}</p>}
    </div>
  );
}

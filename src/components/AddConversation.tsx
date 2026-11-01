"use client";
// Input methods. Each one only has to produce a Transcript; review, analysis and
// My Mirror are shared. What the user typed or added lives in the session (`draft`), so
// Back from Review returns here with everything intact.
import { useState } from "react";
import { looksLikeStory, parsePasted, rereadPlan, textKey, type Transcript } from "@/lib/conversation";
import type { Update } from "./App";
import type { Session } from "./session";
import { Icon, useT } from "./ui";
import { ShotUpload } from "./ShotUpload";
import { ReplaceNotice } from "./ReplaceNotice";

export function AddConversation({ s, update }: { s: Session; update: Update }) {
  const { t } = useT();
  const A = t.add;
  const { method, text } = s.draft;
  const [empty, setEmpty] = useState(false);
  const [story, setStory] = useState(false);
  // An action that would replace edits made on Review; it runs only after the user agrees.
  const [pending, setPending] = useState<(() => void) | null>(null);
  const setDraft = (patch: Partial<Session["draft"]>) => update((cur) => ({ draft: { ...cur.draft, ...patch } }));

  const openReview = (transcript: Transcript, readFrom: string | null) => update({ screen: "review", transcript, selfId: null, consent: false, readFrom, shots: [], extractNotes: [] });
  const guard = (key: string | null, read: () => void) => {
    const plan = key === null ? (s.transcript?.messages.length ? "ask" : "read") : rereadPlan(s.transcript, s.readFrom, key);
    if (plan === "reuse") return update({ screen: "review" });
    if (plan === "ask") return setPending(() => read);
    read();
  };

  const applyPaste = () => {
    if (!text.trim()) return setEmpty(true);
    guard(textKey(text), () => {
      // Retold stories stop here: analysing them as a chat would treat the narrator's
      // account as other people's own words. Continuing is the user's explicit choice.
      if (looksLikeStory(text)) return setStory(true);
      openReview(parsePasted(text, A.unknown), textKey(text));
    });
  };
  const continueStory = () => openReview(parsePasted(text, A.unknown, { keepLines: true }), textKey(text));
  // Typing from scratch: two people, the user on the right, no messages yet.
  const typeFromScratch = () => guard(null, () => {
    openReview({ source: "paste", participants: [{ id: "p1", name: A.otherPerson }, { id: "p2", name: A.me }], messages: [] }, null);
    update({ selfId: "p2" });
  });

  return (
    <div className="app-page">
      <h1 className="app-h1">{A.title}</h1>
      <p className="app-lead">{A.lead}</p>
      <div className="app-methods" role="radiogroup" aria-label={A.methods}>
        <button className="app-method" role="radio" aria-checked={method === "shot"} aria-describedby="shot-sub" onClick={() => setDraft({ method: "shot" })}>
          <Icon name="image" /><span><strong>{A.shot}</strong><small id="shot-sub">{A.shotSub}</small></span>
        </button>
        <button className="app-method" role="radio" aria-checked={method === "paste"} onClick={() => setDraft({ method: "paste" })}>
          <Icon name="text" /><span><strong>{A.paste}</strong><small>{A.pasteSub}</small></span>
        </button>
      </div>
      {method === "shot" ? <ShotUpload s={s} update={update} /> : (
      <div className="app-panel">
        <div className={`im-field${empty ? " im-field--error" : ""}`}>
          <label className="im-label" htmlFor="paste">{A.pasteLabel}</label>
          <textarea id="paste" className="im-textarea" rows={8} value={text} placeholder={A.pastePlaceholder}
            onChange={(e) => { setDraft({ text: e.target.value }); setEmpty(false); setStory(false); setPending(null); }} />
          {empty && <p className="im-error" role="alert"><Icon name="alert" />{A.pasteEmpty}</p>}
          <p className="im-hint">{A.dictationHint}</p>
        </div>
        {story && (
          <div className="im-notice" role="status"><Icon name="alert" /><div>
            <p><strong>{A.storyTitle}</strong></p>
            <p>{A.storyBody}</p>
            <button className="im-btn im-btn--ghost im-btn--sm" onClick={continueStory}>{A.storyContinue}</button>
          </div></div>
        )}
        {pending && <ReplaceNotice onReplace={() => { setPending(null); pending(); }} onKeep={() => { setPending(null); update({ screen: "review" }); }} />}
        <div className="app-actions">
          <button className="im-btn im-btn--primary" onClick={applyPaste}>{A.pasteApply}</button>
          <button className="im-btn im-btn--ghost" onClick={typeFromScratch}>{A.typeInstead}</button>
        </div>
      </div>
      )}
    </div>
  );
}

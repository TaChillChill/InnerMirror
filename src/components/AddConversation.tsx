"use client";
// Input methods. Each one only has to produce a Transcript; review, analysis and
// My Mirror are shared.
import { useState } from "react";
import { looksLikeStory, parsePasted, type Transcript } from "@/lib/conversation";
import type { Update } from "./App";
import { Icon, useT } from "./ui";
import { ShotUpload } from "./ShotUpload";

export function AddConversation({ update }: { update: Update }) {
  const { t } = useT();
  const A = t.add;
  const [text, setText] = useState("");
  const [empty, setEmpty] = useState(false);
  const [story, setStory] = useState(false);
  const [method, setMethod] = useState<"shot" | "paste">("shot");

  const openReview = (transcript: Transcript) => update({ screen: "review", transcript, selfId: null, consent: false });

  const applyPaste = () => {
    if (!text.trim()) return setEmpty(true);
    // Retold stories stop here: analysing them as a chat would treat the narrator's
    // account as other people's own words. Continuing is the user's explicit choice.
    if (looksLikeStory(text)) return setStory(true);
    openReview(parsePasted(text, A.unknown));
  };
  const continueStory = () => openReview(parsePasted(text, A.unknown, { keepLines: true }));
  // Typing from scratch: two people, the user on the right, no messages yet.
  const typeFromScratch = () => {
    openReview({ source: "paste", participants: [{ id: "p1", name: A.otherPerson }, { id: "p2", name: A.me }], messages: [] });
    update({ selfId: "p2" });
  };

  return (
    <div className="app-page">
      <h1 className="app-h1">{A.title}</h1>
      <p className="app-lead">{A.lead}</p>
      <div className="app-methods" role="radiogroup" aria-label={A.methods}>
        <button className="app-method" role="radio" aria-checked={method === "shot"} aria-describedby="shot-sub" onClick={() => setMethod("shot")}>
          <Icon name="image" /><span><strong>{A.shot}</strong><small id="shot-sub">{A.shotSub}</small></span>
        </button>
        <button className="app-method" role="radio" aria-checked={method === "paste"} onClick={() => setMethod("paste")}>
          <Icon name="text" /><span><strong>{A.paste}</strong><small>{A.pasteSub}</small></span>
        </button>
      </div>
      {method === "shot" ? <ShotUpload update={update} /> : (
      <div className="app-panel">
        <div className={`im-field${empty ? " im-field--error" : ""}`}>
          <label className="im-label" htmlFor="paste">{A.pasteLabel}</label>
          <textarea id="paste" className="im-textarea" rows={8} value={text} placeholder={A.pastePlaceholder}
            onChange={(e) => { setText(e.target.value); setEmpty(false); setStory(false); }} />
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
        <div className="app-actions">
          <button className="im-btn im-btn--primary" onClick={applyPaste}>{A.pasteApply}</button>
          <button className="im-btn im-btn--ghost" onClick={typeFromScratch}>{A.typeInstead}</button>
        </div>
      </div>
      )}
    </div>
  );
}

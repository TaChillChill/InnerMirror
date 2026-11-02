"use client";
// Input methods. Each one only has to produce a Transcript; review, analysis and
// My Mirror are shared. What the user typed or added lives in the session (`draft`), so
// Back from Review returns here with everything intact.
import { useCallback, useState } from "react";
import { looksLikeStory, parsePasted, rereadPlan, textKey, type Transcript } from "@/lib/conversation";
import { parseStory } from "@/lib/story";
import type { Update } from "./App";
import type { Session } from "./session";
import { Icon, useT } from "./ui";
import { ShotUpload } from "./ShotUpload";
import { ReplaceNotice } from "./ReplaceNotice";
import { useDictation } from "./use-dictation";

export function AddConversation({ s, update }: { s: Session; update: Update }) {
  const { t, lang } = useT();
  const A = t.add;
  const { method, text } = s.draft;
  const [empty, setEmpty] = useState(false);
  // An action that would replace edits made on Review; it runs only after the user agrees.
  const [pending, setPending] = useState<(() => void) | null>(null);
  const setDraft = (patch: Partial<Session["draft"]>) => update((cur) => ({ draft: { ...cur.draft, ...patch } }));
  // Spoken phrases are appended to the story box, one per line (a pause usually ends what
  // one person said), where they stay editable.
  const appendSpoken = useCallback((phrase: string) => {
    if (phrase) update((cur) => ({ draft: { ...cur.draft, text: cur.draft.text.trim() ? `${cur.draft.text.trimEnd()}\n${phrase}` : phrase } }));
  }, [update]);
  const mic = useDictation(lang, appendSpoken);
  // Once a way to start is chosen, the two cards shrink to a switch at the top and the input
  // sits right under it, so on a phone it is in view without scrolling (Founder UAT #01).
  // The text box isn't focused: on iOS the keyboard would cover the mic and Continue.
  const choose = (m: NonNullable<Session["draft"]["method"]>) => {
    setDraft({ method: m });
    requestAnimationFrame(() => window.scrollTo({ top: 0 }));
  };

  const openReview = (transcript: Transcript, readFrom: string) => update({ screen: "review", transcript, selfId: null, consent: false, readFrom, shots: [], extractNotes: [], shotsSkipped: "", turnFrom: null, fullTranscript: null });
  const guard = (key: string, read: () => void) => {
    const plan = rereadPlan(s.transcript, s.readFrom, key);
    if (plan === "reuse") return update({ screen: "review" });
    if (plan === "ask") return setPending(() => read);
    read();
  };

  const applyPaste = () => {
    if (!text.trim()) return setEmpty(true);
    guard(textKey(text), () => {
      // A retold story is split into dialogue and narration (U3); Review lets the user fix it.
      // Read as a chat, the narrator's account would become other people's own words.
      openReview(looksLikeStory(text) ? parseStory(text, { unknown: A.unknown, me: A.me }) : parsePasted(text, A.unknown), textKey(text));
    });
  };

  return (
    <div className="app-page">
      <h1 className={method ? "app-visually-hidden" : "app-h1"}>{A.title}</h1>
      {!method && <p className="app-lead">{A.lead}</p>}
      <div className={`app-methods${method ? " is-compact" : ""}`} role="radiogroup" aria-label={A.methods}>
        <button className="app-method" role="radio" aria-checked={method === "shot"} aria-describedby={method ? undefined : "shot-sub"} onClick={() => choose("shot")}>
          <Icon name="image" /><span><strong>{A.shot}</strong>{!method && <small id="shot-sub">{A.shotSub}</small>}</span>
        </button>
        <button className="app-method" role="radio" aria-checked={method === "paste"} onClick={() => choose("paste")}>
          <Icon name="text" /><span><strong>{A.paste}</strong>{!method && <small>{A.pasteSub}</small>}</span>
        </button>
      </div>
      {method && <div className="app-add-panel">
      {method === "shot" ? <ShotUpload s={s} update={update} /> : (
      <div className="app-panel">
        <div className={`im-field${empty ? " im-field--error" : ""}`}>
          <label className="im-label" htmlFor="paste">{A.pasteLabel}</label>
          <textarea id="paste" className="im-textarea" rows={6} value={text} placeholder={A.pastePlaceholder}
            onChange={(e) => { setDraft({ text: e.target.value }); setEmpty(false); setPending(null); }} />
          {empty && <p className="im-error" role="alert"><Icon name="alert" />{A.pasteEmpty}</p>}
          {mic.listening && mic.interim && <p className="app-mic__live" aria-hidden="true">{mic.interim}</p>}
        </div>
        {mic.supported ? (
          <div className="app-mic">
            <button className={`im-btn im-btn--secondary app-mic__btn${mic.listening ? " is-on" : ""}`} aria-pressed={mic.listening} onClick={mic.toggle}>
              <span className="app-mic__dot" aria-hidden="true" />{mic.listening ? A.micStop : A.mic}
            </button>
            {mic.error && <p className="im-error" role="alert"><Icon name="alert" />{mic.error === "denied" ? A.micDenied : A.micFailed}</p>}
            <p className="im-hint">{A.micPrivacy}</p>
          </div>
        ) : <p className="im-hint">{A.dictationHint}</p>}
        {pending && <ReplaceNotice onReplace={() => { setPending(null); pending(); }} onKeep={() => { setPending(null); update({ screen: "review" }); }} />}
        <div className="app-actions">
          <button className="im-btn im-btn--primary" onClick={applyPaste}>{A.pasteApply}</button>
        </div>
      </div>
      )}
      </div>}
    </div>
  );
}

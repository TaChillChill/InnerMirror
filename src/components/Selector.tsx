"use client";
// The character selector: AI observation (dashed, a suggestion) and my interpretation
// (solid, mine) together, for one message. Inline under the message on desktop, a
// bottom sheet on phones (Replay decides where).
import { EX_ORDER } from "@/lib/i18n";
import type { Update } from "./App";
import { badgeOf, nameOf, readingFor, withNames, type Choice, type Session } from "./session";
import { Badge, Icon, exName, toKey, useT } from "./ui";

export function Selector({ s, update, id }: { s: Session; update: Update; id: string }) {
  const { t } = useT();
  const R = t.replay;
  const m = s.transcript!.messages.find((x) => x.id === id);
  const r = readingFor(s.analysis!, id);
  if (!m || !r) return null;
  const mine = m.speakerId === s.selfId;
  const ai = toKey(r.expression);
  const chosen = s.choices[id];
  const other = nameOf(s, m.speakerId, R.you);
  const choose = (c: Choice) => update((cur) => ({ choices: { ...cur.choices, [id]: c } }));
  const clear = () => update((cur) => { const next = { ...cur.choices }; delete next[id]; return { choices: next }; });
  const options: Choice[] = [...EX_ORDER, "unsure"];

  return (
    <section className="app-sel" aria-labelledby={`sel-${id}`}>
      <h2 id={`sel-${id}`} className="app-visually-hidden app-sel-focus" tabIndex={-1}>{R.selectorTitle}</h2>
      <div className="app-sel__ai">
        <div className="app-sel__airow">
          <Icon name="eye" /><span>{R.aiSuggestion}</span><Badge ex={ai} state="suggested" size={28} />
          <strong>{exName(t, r.expression === "UNCLEAR" ? "UNCLEAR" : ai)}</strong>
          <span className="im-confidence">· {t.conf[r.confidence]}</span>
        </div>
        <details className="app-more app-sel__why">
          <summary>{R.why}</summary>
          {r.cues.length > 0 && (
            <p>{R.cuesIntro} {r.cues.map((c, i) => <span key={c}>{i > 0 && ", "}<mark className="im-cue im-ex" data-ex={ai === "unsure" ? undefined : ai}>{c}</mark></span>)}</p>
          )}
          <p>{r.rationale ? withNames(r.rationale, s) : R.noEvidence}</p>
          {r.alternative && <p><strong>{R.another}</strong> {exName(t, toKey(r.alternative.expression))}: {withNames(r.alternative.rationale, s)}</p>}
          {r.secondLayer && <p><strong>{R.secondLayer}</strong> {withNames(r.secondLayer.observation, s)} {R.secondLayerHint}</p>}
          <p className="im-hint">{R.notFact}</p>
        </details>
      </div>

      <div className="app-sel__mine">
        <p className="app-sel__q"><Icon name="person" /><span>{mine ? (r.reflectionQuestion ? withNames(r.reflectionQuestion, s) : R.myQuestionMineFallback) : R.myQuestionOther(other)}</span></p>
        <div className="app-sel__choices" role="group" aria-label={R.myReading}>
          {options.map((c) => {
            const on = chosen === c;
            return (
              <button key={c} className="app-sel__opt im-ex" data-ex={c} aria-pressed={on} onClick={() => choose(c)}>
                <Badge ex={c} state={on ? "agreed" : "plain"} size={32} />
                <span>{c === "unsure" ? t.unsureShort : t.ex[c].name}{c === ai && <small>AI</small>}</span>
              </button>
            );
          })}
        </div>
        {chosen && chosen !== "unsure" && chosen !== ai && <p className="app-sel__note">{R.differ}</p>}
        {!mine && <p className="im-hint">{R.othersHint(other)}</p>}
      </div>

      <div className="app-actions">
        <button className="im-btn im-btn--secondary im-btn--sm" onClick={() => update({ selected: null })}>{R.done}</button>
        {chosen && <button className="im-btn im-btn--ghost im-btn--sm" onClick={clear}>{R.clear}</button>}
      </div>
    </section>
  );
}

export const badgeFor = (s: Session, id: string) => {
  const r = readingFor(s.analysis!, id);
  return badgeOf(r ? toKey(r.expression) : "unsure", s.choices[id]);
};

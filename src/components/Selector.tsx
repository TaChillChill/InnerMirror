"use client";
// "Your reading" for one message: what Mirror sees (dashed, a possibility) and my own
// choice (solid, mine). One fixed question invites the user to confirm or change it;
// my choice always wins visually. Lives in the message panel (Replay decides where).
import type { Reading } from "@/lib/ai/analysis";
import { EX_ORDER, type Dict } from "@/lib/i18n";
import type { Update } from "./App";
import { badgeOf, nameOf, readingFor, withNames, type Choice, type Session } from "./session";
import { Badge, Chip, Icon, exName, toKey, useT } from "./ui";

export function Selector({ s, update, id }: { s: Session; update: Update; id: string }) {
  const { t } = useT();
  const R = t.replay;
  const m = s.transcript!.messages.find((x) => x.id === id);
  const r = readingFor(s.analysis!, id);
  if (!m || !r) return null;
  const mine = m.speakerId === s.selfId;
  const ai = toKey(r.expression);
  const unclear = ai === "unsure";
  const chosen = s.choices[id];
  const other = nameOf(s, m.speakerId, R.you);
  const choose = (c: Choice) => update((cur) => ({ choices: { ...cur.choices, [id]: c } }));
  const clear = () => update((cur) => { const next = { ...cur.choices }; delete next[id]; return { choices: next }; });
  const options: Choice[] = [...EX_ORDER, "unsure"];
  const [pre, post] = mine ? R.seesMine : R.seesOther(other);

  return (
    <section className="app-sel" aria-labelledby={`sel-${id}`}>
      <h2 id={`sel-${id}`} className="app-visually-hidden app-sel-focus" tabIndex={-1}>{R.selectorTitle}</h2>
      <p className="app-sel__q">
        <Icon name="eye" />
        <span>
          {unclear ? (mine ? R.unclearMine : R.unclearOther(other)) : <>{pre} <Chip ex={ai} />{post}</>}
          {!unclear && <small className="app-sel__conf">{t.conf[r.confidence]}</small>}
          {unclear && r.family !== "UNCLEAR" && <small className="app-sel__conf">{t.lean[r.family]}</small>}
        </span>
      </p>
      {r.alternative && <p className="app-sel__alt">{R.alsoPossible} <Chip ex={toKey(r.alternative.expression)} /></p>}
      {!unclear && (chosen === ai
        ? <p className="app-sel__agreed"><Icon name="check" /> {R.youAgreed}</p>
        : <button className="im-btn im-btn--secondary im-btn--sm app-sel__yes" onClick={() => choose(ai)}><Icon name="check" /> {mine ? R.yesMine : R.yesOther}</button>)}
      <p className="im-hint">{mine ? R.pickHintMine : R.pickHintOther}</p>

      <div className="app-sel__choices" role="group" aria-label={R.myReading}>
        {options.map((c) => {
          const on = chosen === c;
          const seen = c === ai && !unclear;
          return (
            <button key={c} className="app-sel__opt im-ex" data-ex={c} data-mirror={seen || undefined} aria-pressed={on} onClick={() => choose(c)}>
              <Badge ex={c} state={on ? "agreed" : seen ? "suggested" : "plain"} size={32} />
              <span>
                {c === "unsure" ? t.unsureShort : t.ex[c].name}
                {(seen || on) && (
                  <span className="app-sel__tags">
                    {seen && <small className="app-sel__tag is-mirror">{R.tagMirror}</small>}
                    {on && <small className="app-sel__tag is-mine">{R.tagMine}</small>}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
      {chosen && chosen !== "unsure" && chosen !== ai && <p className="app-sel__note">{R.differ}</p>}

      <details className="app-more app-sel__why">
        <summary>{R.why}</summary>
        {r.cues.length > 0 && (
          <p>{R.cuesIntro} {r.cues.map((c, i) => <span key={c}>{i > 0 && ", "}<mark className="im-cue im-ex" data-ex={unclear ? undefined : ai}>{c}</mark></span>)}</p>
        )}
        <p>{r.rationale ? withNames(r.rationale, s) : R.noEvidence}</p>
        {r.alternative && <p><strong>{R.another}</strong> {exName(t, toKey(r.alternative.expression))}: {withNames(r.alternative.rationale, s)}</p>}
        {r.secondLayer && <p><strong>{R.secondLayer}</strong> {withNames(r.secondLayer.observation, s)} {R.secondLayerHint}</p>}
        <p className="im-hint">{R.notFact}</p>
      </details>
      {!mine && <p className="im-hint">{R.othersHint(other)}</p>}

      <div className="app-actions">
        <button className="im-btn im-btn--secondary im-btn--sm" onClick={() => update({ selected: null })}>{R.done}</button>
        {chosen && <button className="im-btn im-btn--ghost im-btn--sm" onClick={clear}>{R.clear}</button>}
      </div>
    </section>
  );
}

/** How Mirror's own suggestion reads on a chip: uncertainty first, never a bare verdict. */
export function aiChip(t: Dict, r: Reading): { prefix?: string; text?: string } {
  if (r.expression === "UNCLEAR") return { text: r.family !== "UNCLEAR" ? `${t.unclear} · ${t.lean[r.family]}` : t.unclear };
  return { prefix: r.confidence === "high" ? undefined : t.maybe[r.confidence] };
}

export const badgeFor = (s: Session, id: string) => {
  const r = readingFor(s.analysis!, id);
  return badgeOf(r ? toKey(r.expression) : "unsure", s.choices[id]);
};

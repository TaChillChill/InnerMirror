"use client";
// The ego-state panel for one message (approved 2026-11-01, D2): what Mirror sees, why (open
// by default), then my view with five states plus "Not sure". Tapping a state saves it at once;
// tapping it again clears it; the panel's ✕ only closes. Mirror's suggestion stays visible but
// is never counted as my choice (My Reflection marks it as Mirror's observation).
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
  // Tap to choose, tap the same state again to clear.
  const toggle = (c: Choice) => update((cur) => {
    const next = { ...cur.choices };
    if (next[id] === c) delete next[id]; else next[id] = c;
    return { choices: next };
  });
  const options: Choice[] = [...EX_ORDER, "unsure"];

  return (
    <section className="app-sel" aria-labelledby={`sel-${id}`}>
      <h2 id={`sel-${id}`} className="app-visually-hidden app-sel-focus" tabIndex={-1}>{R.selectorTitle}</h2>

      <p className="app-sel__label">{R.seesLabel}</p>
      <div className="app-sel__sees im-ex" data-ex={unclear ? undefined : ai}>
        <Badge ex={ai} state="plain" size={56} />
        <div>
          <p className="app-sel__name">{unclear ? (r.family !== "UNCLEAR" ? `${t.unclear} · ${t.lean[r.family]}` : t.unclear) : exName(t, ai)}</p>
          <p className="app-sel__conf">{unclear ? (mine ? R.unclearMine : R.unclearOther(other)) : t.conf[r.confidence]}</p>
        </div>
      </div>

      <details className="app-more app-sel__why" open>
        <summary>{R.why}?</summary>
        {r.cues.length > 0 && (
          <p>{R.cuesIntro} {r.cues.map((c, i) => <span key={c}>{i > 0 && ", "}<mark className="im-cue im-ex" data-ex={unclear ? undefined : ai}>{c}</mark></span>)}</p>
        )}
        <p>{r.rationale ? withNames(r.rationale, s) : R.noEvidence}</p>
        {r.alternative && <p><strong>{R.alsoPossible}</strong> <Chip ex={toKey(r.alternative.expression)} />: {withNames(r.alternative.rationale, s)}</p>}
        {r.secondLayer && <p><strong>{R.secondLayer}</strong> {withNames(r.secondLayer.observation, s)} {R.secondLayerHint}</p>}
        <p className="im-hint">{R.notFact}</p>
      </details>

      <p className="app-sel__label">{R.yoursLabel}</p>
      <p className="im-hint app-sel__q">{R.yoursQ}</p>
      <div className="app-sel__choices" role="group" aria-label={R.yoursLabel}>
        {options.map((c) => {
          const on = chosen === c;
          const seen = c === ai && !unclear;
          return (
            <button key={c} className="app-sel__opt im-ex" data-ex={c} data-mirror={seen || undefined} aria-pressed={on} onClick={() => toggle(c)}>
              <Badge ex={c} state="plain" size={32} />
              <span>
                {c === "unsure" ? t.unsureShort : t.ex[c].name}
                {(seen || on) && (
                  <span className="app-sel__tags">
                    {seen && <small className="app-sel__tag is-mirror">{R.tagMirror}</small>}
                    {on && <small className="app-sel__tag is-mine"><Icon name="check" />{R.tagMine}</small>}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
      <p className="app-sel__status" aria-live="polite">{chosen ? R.saved(chosen === "unsure" ? t.unsureShort : t.ex[chosen].name) : R.defaultNote}</p>
      {chosen && chosen !== "unsure" && chosen !== ai && <p className="app-sel__note">{R.differ}</p>}
      {!mine && <p className="im-hint">{R.othersHint(other)}</p>}
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

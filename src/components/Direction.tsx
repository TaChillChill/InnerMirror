"use client";
// Conversation Direction v1 (U8, Founder N1/N2 2026-11-01): I pick where I'd like the
// conversation to go, Mirror lists up to two ego states from a fixed table (lib/direction),
// I can pick any other, and "Try this direction" opens What if? on my latest answered
// message with that state preselected. Nothing is sent until I tap Explore there.
import { useState } from "react";
import { DIRECTION, GOALS, directionTarget, type Goal } from "@/lib/direction";
import { EX_ORDER, type ExKey } from "@/lib/i18n";
import { anchorOf } from "@/lib/ai/analysis";
import type { Session } from "./session";
import { Badge, useT } from "./ui";

type Props = { s: Session; onTry: (messageId: string, state: ExKey, from: HTMLButtonElement) => void };

export function Direction({ s, onTry }: Props) {
  const { t } = useT();
  const D = t.direction;
  const [goal, setGoal] = useState<Goal | null>(null);
  const [state, setState] = useState<ExKey | null>(null);
  const [others, setOthers] = useState(false);
  const T = s.transcript!;
  const anchors = [...new Set(T.messages.map((m) => anchorOf(s.analysis!, m.id)))];
  const target = directionTarget(T.messages, anchors, s.selfId);
  const suggested = goal ? DIRECTION[goal] : [];
  const rest = EX_ORDER.filter((k) => !suggested.includes(k));

  const pickGoal = (g: Goal) => { setGoal(goal === g ? null : g); setState(null); setOthers(false); };
  const option = (k: ExKey, action?: string) => (
    <button key={k} className="app-dir__opt im-ex" data-ex={k} aria-pressed={state === k} onClick={() => setState(state === k ? null : k)}>
      <Badge ex={k} state="plain" size={action ? 44 : 32} />
      <span><strong>{t.ex[k].name}</strong>{action ? <small>{action}</small> : <small>{t.ex[k].short}</small>}</span>
    </button>
  );

  return (
    <section className="app-dir" aria-labelledby="dir-title">
      <h2 id="dir-title" className="app-dir__q">{D.title}</h2>
      {!s.selfId ? <p className="im-hint">{D.needSelf}</p> : (
        <>
          <p className="im-hint">{D.lead}</p>
          <div className="app-row-wrap" role="group" aria-labelledby="dir-title">
            {GOALS.map((g) => <button key={g} className="app-chip-btn" aria-pressed={goal === g} onClick={() => pickGoal(g)}>{D.goals[g]}</button>)}
          </div>
          {goal && (
            <div className="app-dir__body">
              <p className="app-dir__lead" id="dir-sugg">{D.suggestTitle}</p>
              <div className="app-dir__opts" role="group" aria-labelledby="dir-sugg">
                {suggested.map((k) => option(k, D.actions[goal][k]))}
              </div>
              <p className="im-hint">{D.stillYou} <button className="app-textlink" aria-expanded={others} onClick={() => setOthers(!others)}>{others ? D.hideOther : D.chooseOther}</button></p>
              {others && <div className="app-dir__opts is-compact" role="group" aria-label={D.chooseOther}>{rest.map((k) => option(k))}</div>}
              <p className="im-hint">{D.tableNote}</p>
              {s.sample ? <p className="im-hint">{D.sampleOff}</p> : target ? (
                <div className="app-dir__go">
                  <button className="im-btn im-btn--primary" disabled={!state} aria-describedby={state ? undefined : "dir-pick"} onClick={(e) => state && onTry(target, state, e.currentTarget)}>{D.tryIt}</button>
                  {!state && <p className="im-hint" id="dir-pick">{D.pickState}</p>}
                  <p className="im-hint">{D.limit}</p>
                </div>
              ) : <p className="im-hint">{D.noTarget}</p>}
            </div>
          )}
        </>
      )}
    </section>
  );
}

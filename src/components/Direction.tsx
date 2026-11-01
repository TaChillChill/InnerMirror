"use client";
// Conversation Direction (U8, simplified at Founder UAT #09/#10): five directions as reference
// only. Picking one shows up to two ego states from a fixed table (lib/direction) with what
// each does; there is nothing to choose, try or complete here, and nothing is sent. "What if?"
// stays on each message.
import { useState } from "react";
import { DIRECTION, GOALS, type Goal } from "@/lib/direction";
import { Badge, useT } from "./ui";

export function Direction() {
  const { t } = useT();
  const D = t.direction;
  const [goal, setGoal] = useState<Goal | null>(null);

  return (
    <section className="app-dir" aria-labelledby="dir-title">
      <h2 id="dir-title" className="app-dir__q">{D.title}</h2>
      <p className="im-hint">{D.lead}</p>
      <div className="app-row-wrap" role="group" aria-labelledby="dir-title">
        {GOALS.map((g) => <button key={g} className="app-chip-btn" aria-pressed={goal === g} onClick={() => setGoal(goal === g ? null : g)}>{D.goals[g]}</button>)}
      </div>
      {goal && (
        <div className="app-dir__body" aria-live="polite">
          <p className="app-dir__lead">{D.suggestTitle}</p>
          <ul className="app-dir__opts">
            {DIRECTION[goal].map((k) => (
              <li key={k} className="app-dir__opt im-ex" data-ex={k}>
                <Badge ex={k} state="plain" size={44} />
                <span><strong>{t.ex[k].name}</strong><small>{D.actions[goal][k]}</small></span>
              </li>
            ))}
          </ul>
          <p className="im-hint">{D.tableNote}</p>
        </div>
      )}
      <p className="app-dir__yours">{D.reference}</p>
    </section>
  );
}

"use client";
// "Same situation, a different you": an illustration, not a model call. Shows the user's
// line and two possible replies, so the other person's side is visible and no voice reads
// as the right one.
import type { ExKey } from "@/lib/i18n";
import { Badge, Mascot, useT } from "./ui";

export const DEMO_PICKS = ["cp", "a", "fc"] as const;
export type DemoPick = (typeof DEMO_PICKS)[number];

export function VoiceDemo({ pick, onPick }: { pick: DemoPick; onPick: (p: DemoPick) => void }) {
  const { t } = useT();
  const D = t.landing.demo;
  const line = D.lines[pick];
  return (
    <div className="lp-demo">
      <p className="lp-demo__title">{D.title[0]}<span>{D.title[1]}</span>{D.title[2]}</p>
      <p className="lp-demo__situ">{D.situation}</p>
      <div className="lp-picks" role="group" aria-label={D.pickLabel}>
        {DEMO_PICKS.map((ex) => (
          <button key={ex} type="button" className="lp-pick im-ex" data-ex={ex} aria-pressed={ex === pick} onClick={() => onPick(ex)}>
            <span className="lp-pick__art"><Mascot ex={ex} /></span>
            <span>{t.ex[ex].name}</span>
          </button>
        ))}
      </div>
      <div className="lp-chat" aria-live="polite">
        <p className="lp-chat__who lp-chat__who--me">{D.youSay}</p>
        <div className="lp-row lp-row--me im-ex" data-ex={pick}>
          <p className="lp-bub">{line.me}</p>
          <Badge ex={pick} state="plain" size={36} />
        </div>
        <p className="lp-chat__who">{D.theyMay}</p>
        {line.replies.map(([ex, text], i) => (
          <div key={ex + i}>
            {i > 0 && <p className="lp-chat__or">{D.or}</p>}
            <div className="lp-row im-ex" data-ex={ex}>
              <Badge ex={ex as ExKey} state="plain" size={36} />
              <p className="lp-bub">{text}<small>{t.ex[ex as ExKey].name}</small></p>
            </div>
          </div>
        ))}
        <p className="lp-vibe">{line.vibe}</p>
      </div>
      <p className="lp-demo__note">{D.note}</p>
    </div>
  );
}

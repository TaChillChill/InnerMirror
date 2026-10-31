"use client";
// Loading and error states for the analysis call. Stages are a paced hint, not real
// progress (the API returns one answer at the end), so they are paced by a measured
// estimate for this conversation's size (src/lib/wait.ts).
import { useEffect, useState } from "react";
import type { Estimate } from "@/lib/wait";
import { Icon, useT } from "./ui";

/** Seconds since mount, ticking once a second while the wait lasts. */
function useElapsed() {
  const [s, setS] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setS((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);
  return s;
}

/** The estimate, and an honest note once the wait runs past it. */
export function WaitHint({ estimate, text, slow }: { estimate: Estimate; text: (lo: number, hi: number) => string; slow: string }) {
  const elapsed = useElapsed();
  return <p className="im-hint" aria-live="polite">{elapsed > estimate.hi ? slow : text(estimate.lo, estimate.hi)}</p>;
}

export function Analyzing({ estimate, onCancel }: { estimate: Estimate; onCancel: () => void }) {
  const { t } = useT();
  const elapsed = useElapsed();
  // The last stage is reached around the typical time and then stays.
  const per = (estimate.lo + estimate.hi) / 2 / t.analyzing.stages.length;
  const stage = Math.min(Math.floor(elapsed / per), t.analyzing.stages.length - 1);
  return (
    <div className="app-page app-loading" aria-live="polite">
      <h1 className="app-h1">{t.analyzing.title}</h1>
      <ol className="app-stages">
        {t.analyzing.stages.map((label, i) => (
          <li key={label} data-state={i < stage ? "done" : i === stage ? "now" : "next"}>{i < stage && <Icon name="check" />}{label}</li>
        ))}
      </ol>
      <WaitHint estimate={estimate} text={t.analyzing.wait} slow={t.analyzing.slow} />
      <button className="im-btn im-btn--ghost" onClick={onCancel}>{t.analyzing.cancel}</button>
    </div>
  );
}

export function AnalyzeError({ code, onRetry, onEdit }: { code: string; onRetry: () => void; onEdit: () => void }) {
  const { t } = useT();
  const E = t.errors;
  const message = (E as Record<string, string>)[code] ?? E.unknown;
  // Retrying won't help when the request itself or the setup is the problem.
  const canRetry = !["invalid_input", "too_long", "forbidden", "not_configured", "budget"].includes(code);
  return (
    <div className="app-page">
      <div className="im-notice im-notice--error" role="alert"><Icon name="alert" /><div><strong>{E.title}</strong>{message}</div></div>
      <div className="app-actions">
        {canRetry && <button className="im-btn im-btn--primary" onClick={onRetry}>{E.retry}</button>}
        <button className="im-btn im-btn--ghost" onClick={onEdit}>{E.edit}</button>
      </div>
    </div>
  );
}

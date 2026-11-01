"use client";
// Loading and error states for the analysis call. The wait estimate comes from measured
// times for this conversation's size (src/lib/wait.ts).
import { useEffect, useState } from "react";
import type { Estimate } from "@/lib/wait";
import { EX_ORDER } from "@/lib/i18n";
import { Badge, Icon, useT } from "./ui";

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
  // The API answers once, at the end, so nothing here claims progress: the lines only
  // explain what Mirror does, in rotation, and never get ticked off.
  const line = t.analyzing.explain[Math.floor(elapsed / 4) % t.analyzing.explain.length];
  return (
    <div className="app-page app-loading">
      <h1 className="app-h1">{t.analyzing.title}</h1>
      <div className="app-loading__cast" aria-hidden="true">{EX_ORDER.map((ex) => <Badge key={ex} ex={ex} state="plain" size={48} />)}</div>
      <p className="app-loading__line">{line}</p>
      <p className="im-hint">{t.analyzing.together}</p>
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

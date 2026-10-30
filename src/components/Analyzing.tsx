"use client";
// Loading and error states for the analysis call. Stages are a paced hint, not real
// progress: the API returns one answer after 15-40 s.
import { useEffect, useState } from "react";
import { Icon, useT } from "./ui";

export function Analyzing({ onCancel }: { onCancel: () => void }) {
  const { t } = useT();
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStage((n) => Math.min(n + 1, t.analyzing.stages.length - 1)), 7000);
    return () => clearInterval(id);
  }, [t]);
  return (
    <div className="app-page app-loading" aria-live="polite">
      <h1 className="app-h1">{t.analyzing.title}</h1>
      <ol className="app-stages">
        {t.analyzing.stages.map((label, i) => (
          <li key={label} data-state={i < stage ? "done" : i === stage ? "now" : "next"}>{i < stage && <Icon name="check" />}{label}</li>
        ))}
      </ol>
      <p className="im-hint">{t.analyzing.wait}</p>
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

"use client";
// Asked before new input would replace a transcript the user already edited on Review.
import { Icon, useT } from "./ui";

export function ReplaceNotice({ onReplace, onKeep }: { onReplace: () => void; onKeep: () => void }) {
  const { t } = useT();
  const A = t.add;
  return (
    <div className="im-notice" role="alert"><Icon name="alert" /><div>
      <p><strong>{A.replaceTitle}</strong> {A.replaceBody}</p>
      <div className="app-actions">
        <button className="im-btn im-btn--secondary im-btn--sm" onClick={onReplace}>{A.replaceYes}</button>
        <button className="im-btn im-btn--ghost im-btn--sm" onClick={onKeep}>{A.replaceKeep}</button>
      </div>
    </div></div>
  );
}

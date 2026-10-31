"use client";
import { EX_ORDER } from "@/lib/i18n";
import { Badge, Icon, Mascot, useT } from "./ui";

export function Landing({ savedCount, onStart, onMirror, onContinue }: { savedCount: number; onStart: () => void; onMirror: () => void; onContinue?: () => void }) {
  const { t } = useT();
  const L = t.landing;
  return (
    <div className="app-page app-landing">
      {savedCount > 0 && (
        <section className="app-welcome-back">
          <div className="app-welcome-back__stickers" aria-hidden="true">{EX_ORDER.slice(0, 3).map((ex) => <Badge key={ex} ex={ex} state="plain" size={40} />)}</div>
          <div><strong>{L.welcomeBack}</strong><p>{L.savedCount(savedCount)}</p></div>
          <button className="im-btn im-btn--secondary im-btn--sm" onClick={onMirror}>{L.openMirror}</button>
        </section>
      )}
      <section className="app-hero">
        <h1 className="app-display">{L.title}</h1>
        <p className="app-lead">{L.lead}</p>
        <div className="app-actions">
          <button className="im-btn im-btn--primary" onClick={onStart}>{L.start}</button>
          {onContinue && <button className="im-btn im-btn--secondary" onClick={onContinue}>{L.continueSession}</button>}
        </div>
        <p className="im-hint">{L.notTherapy}</p>
      </section>
      <section aria-labelledby="cast">
        <h2 id="cast" className="app-h2">{L.castTitle}</h2>
        <ul className="app-cast">
          {EX_ORDER.map((ex) => (
            <li key={ex} className="im-ex" data-ex={ex}><Mascot ex={ex} /><strong>{t.ex[ex].name}</strong><span>{t.ex[ex].short}</span></li>
          ))}
        </ul>
        <p className="im-hint">{L.castNote}</p>
      </section>
      <section aria-labelledby="how">
        <h2 id="how" className="app-h2">{L.howTitle}</h2>
        <ol className="app-how">{L.how.map(([title, body]) => <li key={title}><strong>{title}</strong><span>{body}</span></li>)}</ol>
      </section>
      <div className="im-notice"><Icon name="lock" /><div><strong>{L.privacyTitle}</strong>{L.privacy}</div></div>
    </div>
  );
}

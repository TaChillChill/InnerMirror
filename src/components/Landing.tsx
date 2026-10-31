"use client";
// Landing V3 (approved mockup, 2026-10-31): hook on how two people's ego states meet,
// an illustrative demo, then the theory (TA) and the four steps. Experience first, theory second.
import { useState } from "react";
import { EX_ORDER, type ExKey } from "@/lib/i18n";
import { Badge, Icon, Mascot, useT } from "./ui";
import { VoiceDemo, type DemoPick } from "./VoiceDemo";
import { DiagramLegend, InteractionDiagram } from "./InteractionDiagram";

type Props = { savedCount: number; onStart: () => void; onMirror: () => void; onContinue?: () => void };
// Berne's three ego states, with the five functional styles grouped under them.
const ROOTS: ["P" | "A" | "C", ExKey[]][] = [["P", ["cp", "np"]], ["A", ["a"]], ["C", ["fc", "ac"]]];
const STEP_ART: ExKey[][] = [[], ["a", "cp", "fc"], ["np", "ac"], ["a", "np", "fc"]];

export function Landing({ savedCount, onStart, onMirror, onContinue }: Props) {
  const { t } = useT();
  const L = t.landing;
  const [pick, setPick] = useState<DemoPick>("a");
  const scrollToHow = () => document.getElementById("how")?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="lp">
      {savedCount > 0 && (
        <div className="lp-wrap">
          <section className="app-welcome-back">
            <div className="app-welcome-back__stickers" aria-hidden="true">{EX_ORDER.slice(0, 3).map((ex) => <Badge key={ex} ex={ex} state="plain" size={40} />)}</div>
            <div><strong>{L.welcomeBack}</strong><p>{L.savedCount(savedCount)}</p></div>
            <button className="im-btn im-btn--secondary im-btn--sm" onClick={onMirror}>{L.openMirror}</button>
          </section>
        </div>
      )}

      <section className="lp-hero lp-wrap">
        <div>
          <p className="lp-eyebrow">{L.eyebrow}</p>
          <h1 className="lp-h1 im-ex" data-ex={pick}>
            {L.h1.before}<span className="lp-h1__who">{L.h1.who}</span>{L.h1.mid}<span className="lp-h1__meet">{L.h1.meet}</span>{L.h1.after}
          </h1>
          <p className="lp-lead">{L.lead}</p>
          <div className="lp-ctas">
            <button className="im-btn im-btn--primary lp-cta" onClick={onStart}>{L.start}</button>
            {onContinue && <button className="im-btn im-btn--secondary" onClick={onContinue}>{L.continueSession}</button>}
            <button className="app-textlink" onClick={scrollToHow}>{L.howLink} ↓</button>
          </div>
          <p className="lp-fine">{L.fine}</p>
        </div>
        <VoiceDemo pick={pick} onPick={setPick} />
      </section>

      <section className="lp-band lp-band--tint" aria-labelledby="lp-voices">
        <div className="lp-wrap">
          <p className="lp-kicker">{L.voices.kicker}</p>
          <h2 id="lp-voices" className="lp-h2">{L.voices.title}</h2>
          <p className="lp-sectlead">{L.voices.lead[0]}<span className="lp-ta">{L.voices.lead[1]}</span>{L.voices.lead[2]}</p>
          <p className="lp-explain">{L.voices.explain}</p>
          <div className="lp-roots">
            {ROOTS.map(([root, list]) => (
              <div key={root} className="lp-root">
                <p className="lp-root__h"><strong>{L.voices.roots[root][0]}</strong><span>{L.voices.roots[root][1]}</span></p>
                <ul className="lp-voices">
                  {list.map((ex) => (
                    <li key={ex} className="lp-voice im-ex" data-ex={ex}>
                      <span className="lp-voice__art"><Mascot ex={ex} /></span>
                      <strong>{t.ex[ex].name}</strong>
                      <q>{L.voices.sounds[ex]}</q>
                      <span>{t.ex[ex].desc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="lp-method">{L.voices.method}</p>
        </div>
      </section>

      <section className="lp-band" aria-labelledby="lp-meet">
        <div className="lp-wrap">
          <p className="lp-kicker">{L.meet.kicker}</p>
          <h2 id="lp-meet" className="lp-h2">{L.meet.title}</h2>
          <p className="lp-sectlead">{L.meet.lead}</p>
          <DiagramLegend />
          <div className="lp-meets">
            {(["click", "miss"] as const).map((kind) => (
              <article key={kind} className="lp-card">
                <h3>{L.meet[kind].title}</h3>
                <p>{L.meet[kind].body}</p>
                <InteractionDiagram kind={kind} title={L.meet[kind].diagram} you={L.meet.you} them={L.meet.them} />
                <p className="lp-flow">{L.meet[kind].flow}</p>
                <div className="lp-ex"><p>{L.meet[kind].ex[0]}</p><p>{L.meet[kind].ex[1]}</p></div>
              </article>
            ))}
          </div>
          <p className="lp-honest"><Icon name="eye" /><span>{L.meet.honest}</span></p>
        </div>
      </section>

      <section id="how" className="lp-band lp-band--tint" aria-labelledby="lp-how">
        <div className="lp-wrap">
          <p className="lp-kicker">{L.how.kicker}</p>
          <h2 id="lp-how" className="lp-h2">{L.how.title}</h2>
          <ol className="lp-steps">
            {L.how.steps.map(([title, body], i) => (
              <li key={title} className="lp-card lp-step">
                <div className="lp-step__art" aria-hidden="true">
                  {i === 0 ? <Icon name="text" /> : STEP_ART[i].map((ex) => <Badge key={ex} ex={ex} state={i === 1 ? "suggested" : "plain"} size={40} />)}
                  {i === 3 && <Icon name="saved" />}
                </div>
                <span className="lp-step__n">{i + 1}</span>
                <strong>{title}</strong>
                <p>{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="lp-close lp-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element -- interim logo crop (D2), shown at 2x max */}
        <img className="lp-logo" src="/brand/logo.png" alt="InnerMirror — Understand · Communicate · Be you" width={400} height={115} />
        <h2 className="lp-h2">{L.closeTitle}</h2>
        <button className="im-btn im-btn--primary lp-cta" onClick={onStart}>{L.start}</button>
        <div className="im-notice"><Icon name="lock" /><div><strong>{L.privacyTitle}</strong>{L.privacy}</div></div>
        <p className="lp-fine">{L.notTherapy} {L.ageNote} <a href="/privacy" target="_blank" rel="noopener">{L.privacyLink}</a></p>
      </section>
    </div>
  );
}

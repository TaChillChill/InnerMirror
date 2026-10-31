"use client";
// "What if?" under one of my messages: pick any of the five characters, then Explore.
// The result is a dashed branch of up to two plausible receiver characters with the words
// they rest on. No dialogue, no predictions; every character is laid out identically.
import { useEffect, useRef, useState } from "react";
import { EX_ORDER, type ExKey } from "@/lib/i18n";
import type { ScenarioContext, ScenarioResult } from "@/lib/ai/scenario";
import type { State } from "@/lib/ai/scenario-spec";
import { buildRequest, scenarioKey, type Entry, useScenarios } from "./use-scenarios";
import { effectiveState, nameOf, withNames, type Session } from "./session";
import { Badge, Chip, Icon, toKey, useT } from "./ui";

type Msg = NonNullable<Session["transcript"]>["messages"][number];
type Props = { s: Session; ctx: ScenarioContext<Msg>; scenarios: ReturnType<typeof useScenarios>; onClose: () => void };

const asState = (k: ExKey) => k.toUpperCase() as State;

export function WhatIf({ s, ctx, scenarios, onClose }: Props) {
  const { t, lang } = useT();
  const W = t.whatIf;
  const heading = useRef<HTMLHeadingElement>(null);
  const [picked, setPicked] = useState<ExKey | null>(null);
  const [openState, setOpenState] = useState<string | null>(null);
  const receiver = nameOf(s, ctx.receiverId, t.replay.you);
  const current = toKey(effectiveState(s, ctx.target.id).state);
  const entryFor = (k: ExKey): Entry | undefined => scenarios.entries[scenarioKey(lang, ctx.target.id, asState(k))];
  const explored = EX_ORDER.filter((k) => entryFor(k)?.status === "done");
  const entry = picked ? entryFor(picked) : undefined;

  useEffect(() => { heading.current?.focus(); }, []);

  const explore = () => { if (picked) void scenarios.explore(scenarioKey(lang, ctx.target.id, asState(picked)), buildRequest(s, ctx, asState(picked), lang)); };
  const pick = (k: ExKey) => { setPicked(k); setOpenState(null); };

  return (
    <section className="app-wi" aria-labelledby={`wi-${ctx.target.id}`}>
      <div className="app-wi__head">
        <h2 id={`wi-${ctx.target.id}`} ref={heading} tabIndex={-1} className="app-wi__title">{W.title}</h2>
        <button className="app-icon-btn" onClick={onClose} aria-label={W.close}><Icon name="close" /></button>
      </div>
      <p>{W.lead}</p>
      <div className="app-sel__choices" role="group" aria-label={W.group}>
        {EX_ORDER.map((k) => (
          <button key={k} className="app-sel__opt im-ex" data-ex={k} aria-pressed={picked === k} onClick={() => pick(k)}>
            <Badge ex={k} state="plain" size={32} />
            <span>{t.ex[k].name}{(k === current || explored.includes(k)) && <small>{[k === current && W.now, explored.includes(k) && W.explored].filter(Boolean).join(" · ")}</small>}</span>
          </button>
        ))}
      </div>

      <p className="app-wi__followed">
        {ctx.reply
          ? <>{W.followed(nameOf(s, ctx.reply.speakerId, t.replay.you))} <Chip ex={toKey(effectiveState(s, ctx.reply.id).state)} /> <span className="im-hint">{W.followedHint}</span></>
          : <span className="im-hint">{W.nothingFollowed}</span>}
      </p>

      {picked && !entry && (
        <div className="app-wi__go">
          <button className="im-btn im-btn--primary im-btn--sm" onClick={explore}>{W.explore}</button>
          <span className="im-hint">{W.data}</span>
        </div>
      )}
      <div aria-live="polite">
        {entry?.status === "loading" && <p className="im-hint">{W.exploring} {W.wait}</p>}
        {entry?.status === "error" && (
          <div className="im-notice im-notice--error" role="alert"><Icon name="alert" /><div>
            {(t.errors as Record<string, string>)[entry.code] ?? t.errors.unknown}
            {!["forbidden", "not_configured", "budget", "invalid_input", "too_long"].includes(entry.code) && <p><button className="im-btn im-btn--ghost im-btn--sm" onClick={explore}>{W.retry}</button></p>}
          </div></div>
        )}
        {picked && entry?.status === "done" && <Branch s={s} picked={picked} result={entry.result} labels={entry.labels} receiver={receiver} open={openState} onOpen={setOpenState} />}
      </div>

      {explored.length > 1 && (
        <div className="app-wi__compare">
          <h3 className="app-wi__sub">{W.compare}</h3>
          <ul>
            {explored.map((k) => {
              const e = entryFor(k) as Extract<Entry, { status: "done" }>;
              return (
                <li key={k}><button aria-pressed={picked === k} onClick={() => pick(k)}>
                  <Badge ex={k} state="plain" size={28} /><span aria-hidden>→</span>
                  {e.result.possibilities.length
                    ? e.result.possibilities.map((p) => <Badge key={p.state} ex={p.state.toLowerCase() as ExKey} state="suggested" size={28} />)
                    : <span className="im-hint">{W.compareNone}</span>}
                  <span className="app-visually-hidden">{t.ex[k].name}: {e.result.possibilities.map((p) => t.ex[p.state.toLowerCase() as ExKey].name).join(", ") || W.compareNone}</span>
                </button></li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}

function Branch({ s, picked, result, labels, receiver, open, onOpen }: { s: Session; picked: ExKey; result: ScenarioResult; labels: Record<string, string>; receiver: string; open: string | null; onOpen: (state: string | null) => void }) {
  const { t } = useT();
  const W = t.whatIf;
  const words = (text: string) => withNames(text, s, labels);
  if (result.flagged) return <div className="im-notice im-notice--safety" role="alert"><Icon name="alert" /><div>{W.flagged} {t.safety.body}</div></div>;
  const why = result.possibilities.length ? null
    : result.reason === "no_prior" ? W.noPrior(receiver) : result.reason === "unclear_prior" ? W.unclearPrior(receiver) : W.insufficient(receiver);
  return (
    <div className="app-wi__branch">
      <p className="app-wi__tag"><Icon name="swap" /> {W.branch}</p>
      <h3 className="app-wi__sub">{W.heading}</h3>
      <p className="app-wi__from">{W.from} <Chip ex={picked} /></p>
      <p>{W.mightReply(receiver)}:</p>
      {why && <p>{why}{result.note && result.reason === "model" ? ` ${words(result.note)}` : ""}</p>}
      {result.evidence === "thin" && <p className="im-hint">{W.thin(receiver)}</p>}
      <ul className="app-wi__list">
        {result.possibilities.map((p, i) => {
          const key = p.state.toLowerCase() as ExKey;
          const on = open === p.state;
          return (
            <li key={p.state}>
              <button className="app-wi__poss" aria-expanded={on} onClick={() => onOpen(on ? null : p.state)}>
                <Badge ex={key} state="suggested" size={40} />
                <span><strong>{t.ex[key].name}</strong><small>{result.ranked && i === 0 ? W.leading : W.also}</small></span>
              </button>
              {on && (
                <div className="app-wi__detail im-ex" data-ex={key}>
                  <p><strong>{W.about}.</strong> {t.ex[key].desc}</p>
                  <p>{words(p.rationale)}</p>
                  {p.cues.length > 0 && <p>{W.cuesIntro} {p.cues.map((c, j) => <span key={c}>{j > 0 && ", "}<q>{c}</q></span>)}</p>}
                  <p className="im-hint">{p.basis === "pattern" ? W.basisPattern(receiver) : W.basisContext}</p>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {result.possibilities.length > 0 && result.note && <p className="im-hint">{words(result.note)}</p>}
      {result.reflectionQuestion && <p className="app-wi__q"><Icon name="person" /><span><strong>{W.reflect}:</strong> {words(result.reflectionQuestion)}</span></p>}
      <p className="im-hint"><strong>{W.disclaimer}</strong> {W.noCause}</p>
    </div>
  );
}

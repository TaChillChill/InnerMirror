"use client";
// "What if?" for one of my messages. The comparison card is the point: what happened
// (solid) above what could happen (dashed), mascot to mascot. Explanations open on tap.
// No dialogue, no predictions; all five characters are laid out identically.
import { useEffect, useRef, useState } from "react";
import { EX_ORDER, type ExKey } from "@/lib/i18n";
import type { Possibility, ScenarioContext, ScenarioResult } from "@/lib/ai/scenario";
import type { State } from "@/lib/ai/scenario-spec";
import { buildRequest, scenarioKey, type Entry, useScenarios } from "./use-scenarios";
import { effectiveState, nameOf, withNames, type Session } from "./session";
import { Badge, Chip, Icon, toKey, useT } from "./ui";

type Msg = NonNullable<Session["transcript"]>["messages"][number];
type Props = { s: Session; ctx: ScenarioContext<Msg>; scenarios: ReturnType<typeof useScenarios> };
type Done = Extract<Entry, { status: "done" }>;

const asState = (k: ExKey) => k.toUpperCase() as State;
const keyOf = (p: Possibility) => p.state.toLowerCase() as ExKey;
const NO_RETRY = ["forbidden", "not_configured", "budget", "invalid_input", "too_long"];

function Who({ ex, name, dashed, waiting }: { ex: ExKey | "unsure"; name: string; dashed?: boolean; waiting?: boolean }) {
  return (
    <span className={`app-wi__who${waiting ? " is-waiting" : ""}`}>
      <Badge ex={ex} state={dashed ? "suggested" : "plain"} size={44} />
      <small>{name}</small>
    </span>
  );
}
const Arrow = ({ dashed }: { dashed?: boolean }) => <span className={`app-wi__arrow${dashed ? " is-dashed" : ""}`}><Icon name="arrow" /></span>;

export function WhatIf({ s, ctx, scenarios }: Props) {
  const { t, lang } = useT();
  const W = t.whatIf;
  const heading = useRef<HTMLHeadingElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const [picked, setPicked] = useState<ExKey | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const receiver = nameOf(s, ctx.receiverId, t.replay.you);
  const entryFor = (k: ExKey): Entry | undefined => scenarios.entries[scenarioKey(lang, ctx.target.id, asState(k))];
  const tried = EX_ORDER.filter((k) => entryFor(k)?.status === "done");
  const entry = picked ? entryFor(picked) : undefined;

  useEffect(() => { heading.current?.focus(); }, []);
  // Keep the comparison in view when an answer starts or lands (it can be off-screen on phones).
  useEffect(() => {
    if (entry?.status !== "loading" && entry?.status !== "done") return;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    card.current?.scrollIntoView({ block: "nearest", behavior: still ? "auto" : "smooth" });
  }, [entry?.status]);

  const pick = (k: ExKey) => { setPicked(k); setOpen(null); };
  const explore = () => { if (picked) void scenarios.explore(scenarioKey(lang, ctx.target.id, asState(picked)), buildRequest(s, ctx, asState(picked), lang)); };
  const status = entry?.status === "loading" ? W.waiting(receiver) : entry?.status === "error" ? (t.errors as Record<string, string>)[entry.code] ?? t.errors.unknown : "";

  return (
    <section className="app-wi" aria-labelledby={`wi-${ctx.target.id}`}>
      <h2 id={`wi-${ctx.target.id}`} ref={heading} tabIndex={-1} className="app-wi__title">{W.title}</h2>
      <p className="app-wi__intro">{W.intro(receiver)}</p>

      <div className="app-wi__card" ref={card}>
        <div className="app-wi__row">
          <p className="app-wi__label">{W.happened}</p>
          <div className="app-wi__pair">
            <Who ex={toKey(effectiveState(s, ctx.target.id).state)} name={t.replay.you} />
            <Arrow />
            {ctx.reply ? <Who ex={toKey(effectiveState(s, ctx.reply.id).state)} name={receiver} /> : <span className="app-wi__none">{W.noReply}</span>}
          </div>
        </div>
        <div className="app-wi__row is-whatif">
          <p className="app-wi__label">{W.whatIfRow} <span className="app-wi__caveat">{W.caveat}</span></p>
          <div className="app-wi__pair">
            {picked ? <Who ex={picked} name={t.replay.you} dashed waiting={entry?.status === "loading"} /> : <span className="app-wi__slot" aria-hidden>?</span>}
            <Arrow dashed />
            {!picked && <span className="app-wi__none">{W.pickFirst}</span>}
            {picked && !entry && <span className="app-wi__slot" aria-hidden>?</span>}
            {entry?.status === "loading" && <span className="app-wi__none">{W.waiting(receiver)}</span>}
            {entry?.status === "error" && (
              <span className="app-wi__none" role="alert">
                {status} {!NO_RETRY.includes(entry.code) && <button className="im-btn im-btn--ghost im-btn--sm" onClick={explore}>{W.retry}</button>}
              </span>
            )}
            {picked && entry?.status === "done" && <Results result={entry.result} receiver={receiver} open={open} onOpen={setOpen} />}
          </div>
          {picked && entry?.status === "done" && <Details s={s} entry={entry} picked={picked} receiver={receiver} open={open} />}
        </div>
      </div>

      <div className="app-wi__picker">
        <p className="app-wi__prompt" id={`wi-pick-${ctx.target.id}`}>{W.prompt}</p>
        <div className="app-wi__opts" role="group" aria-labelledby={`wi-pick-${ctx.target.id}`}>
          {EX_ORDER.map((k) => (
            <button key={k} className="app-wi__opt im-ex" data-ex={k} aria-pressed={picked === k} onClick={() => pick(k)}>
              <Badge ex={k} state="plain" size={36} />
              <span><strong>{t.ex[k].name}</strong><small>{t.ex[k].short}</small></span>
              {tried.includes(k) && <em className="app-wi__tried-tag">{W.tried}</em>}
            </button>
          ))}
        </div>
        {picked && !entry && (
          <div className="app-wi__go">
            <button className="im-btn im-btn--primary" onClick={explore}>{W.explore}</button>
            <p className="im-hint">{W.data}</p>
          </div>
        )}
      </div>

      {tried.length > 1 && (
        <div className="app-wi__tried">
          <p className="app-wi__prompt">{W.triedSoFar}</p>
          <ul>
            {tried.map((k) => {
              const ps = (entryFor(k) as Done).result.possibilities;
              return (
                <li key={k}><button aria-pressed={picked === k} onClick={() => pick(k)}>
                  <Badge ex={k} state="plain" size={24} /><Icon name="arrow" />
                  {ps.map((p) => <Badge key={p.state} ex={keyOf(p)} state="suggested" size={24} />)}
                  <span>{t.ex[k].name} → {ps.map((p) => t.ex[keyOf(p)].name).join(", ") || W.none}</span>
                </button></li>
              );
            })}
          </ul>
        </div>
      )}
      <p className="app-visually-hidden" aria-live="polite">{status}</p>
    </section>
  );
}

function Results({ result, receiver, open, onOpen }: { result: ScenarioResult; receiver: string; open: string | null; onOpen: (s: string | null) => void }) {
  const { t } = useT();
  const W = t.whatIf;
  if (result.flagged) return <span className="app-wi__none" role="alert">{W.flagged}</span>;
  if (!result.possibilities.length) {
    const why = result.reason === "no_prior" ? W.noPrior(receiver) : result.reason === "unclear_prior" ? W.unclearPrior(receiver) : W.insufficient;
    return <span className="app-wi__none">{why}</span>;
  }
  return (
    <ul className="app-wi__results">
      {result.possibilities.map((p) => (
        <li key={p.state}>
          <button className="app-wi__result im-ex" data-ex={keyOf(p)} data-basis={p.basis} aria-expanded={open === p.state} onClick={() => onOpen(open === p.state ? null : p.state)}>
            <Badge ex={keyOf(p)} state="suggested" size={44} />
            <span><strong>{t.ex[keyOf(p)].name}</strong><small>{p.basis === "pattern" ? W.likeEarlier(receiver) : W.another}</small></span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function Details({ s, entry, picked, receiver, open }: { s: Session; entry: Done; picked: ExKey; receiver: string; open: string | null }) {
  const { t } = useT();
  const W = t.whatIf;
  const { result } = entry;
  if (result.flagged || !result.possibilities.length) return <p className="im-hint">{t.whatIf.manyReasons}</p>;
  const [pre, post] = W.resultTitle(receiver);
  const p = result.possibilities.find((x) => x.state === open);
  const words = (text: string) => withNames(text, s, entry.labels);
  return (
    <div className="app-wi__more">
      <p className="app-wi__caption">{pre} <Chip ex={picked} />{post}</p>
      {result.evidence === "thin" && <p className="im-hint">{W.thin}</p>}
      {!p && <p className="im-hint">{W.tapHint}</p>}
      {p && (
        <div className="app-wi__detail im-ex" data-ex={keyOf(p)}>
          <p><strong>{W.sounds}.</strong> {t.ex[keyOf(p)].desc}</p>
          <p><strong>{W.why}.</strong> {words(p.rationale)}</p>
          {p.cues.length > 0 && <p>{W.fromWords(receiver)} {p.cues.map((c, j) => <span key={c}>{j > 0 && ", "}<q>{c}</q></span>)}</p>}
          {p.basis === "context" && <p className="im-hint">{W.anotherNote(receiver)}</p>}
          <p className="im-hint">{W.manyReasons}</p>
        </div>
      )}
    </div>
  );
}

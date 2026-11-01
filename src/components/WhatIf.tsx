"use client";
// "What if?" for one message (mine or anyone's, U9), in time order: what Mirror observed in their earlier
// messages (evidence, computed here, no call), what happened (solid), and what else could
// happen (dashed). Only "context" possibilities go in the dashed row: a "pattern" one just
// restates the earlier messages, which the observed strip already shows per message.
// No dialogue, no predictions; all five characters are laid out identically.
import { useEffect, useRef, useState } from "react";
import { EX_ORDER, type ExKey } from "@/lib/i18n";
import type { Possibility, ScenarioContext, ScenarioResult } from "@/lib/ai/scenario";
import type { State } from "@/lib/ai/scenario-spec";
import { buildRequest, scenarioKey, type Entry, useScenarios } from "./use-scenarios";
import { effectiveState, nameOf, withNames, type Session } from "./session";
import { Badge, Chip, Icon, toKey, useT } from "./ui";

type Msg = NonNullable<Session["transcript"]>["messages"][number];
type Props = { s: Session; ctx: ScenarioContext<Msg>; scenarios: ReturnType<typeof useScenarios>; preset?: ExKey | null };
type Done = Extract<Entry, { status: "done" }>;

const asState = (k: ExKey) => k.toUpperCase() as State;
const keyOf = (p: Possibility) => p.state.toLowerCase() as ExKey;
const otherWays = (r: ScenarioResult) => r.possibilities.filter((p) => p.basis === "context");
const MAX_OBSERVED = 6;
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

export function WhatIf({ s, ctx, scenarios, preset }: Props) {
  const { t, lang } = useT();
  const W = t.whatIf;
  const heading = useRef<HTMLHeadingElement>(null);
  const card = useRef<HTMLDivElement>(null);
  // Preselected when opened from Direction; still only sent on the Explore tap.
  const [picked, setPicked] = useState<ExKey | null>(preset ?? null);
  const [open, setOpen] = useState<string | null>(null);
  const receiver = nameOf(s, ctx.receiverId, t.replay.you);
  // The explored speaker: "you" for my own messages, else their name (U9).
  const actor = ctx.target.speakerId === s.selfId ? null : nameOf(s, ctx.target.speakerId, t.replay.you);
  const entryFor = (k: ExKey): Entry | undefined => scenarios.entries[scenarioKey(lang, ctx.target.id, asState(k))];
  const tried = EX_ORDER.filter((k) => entryFor(k)?.status === "done");
  const entry = picked ? entryFor(picked) : undefined;
  // Per message, never one label for the person: states attach to messages.
  const observed = ctx.history.filter((m) => m.speakerId === ctx.receiverId).map((m) => ({ id: m.id, ex: toKey(effectiveState(s, m.id).state) }));

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
      <h2 id={`wi-${ctx.target.id}`} ref={heading} tabIndex={-1} className="app-wi__title">{W.title(actor)}</h2>
      <p className="app-wi__intro">{W.intro(actor, receiver)}</p>

      <div className="app-wi__observed">
        <p className="app-wi__label">{W.observedTitle}</p>
        {observed.length ? (
          <>
            <p className="im-hint">{W.observedLead(receiver)}</p>
            <ul className="app-wi__chips">
              {observed.length > MAX_OBSERVED && <li className="app-wi__more-n">+{observed.length - MAX_OBSERVED}</li>}
              {observed.slice(-MAX_OBSERVED).map((o) => <li key={o.id}><Chip ex={o.ex} /></li>)}
            </ul>
            {observed.length === 1 && <p className="im-hint">{W.observedOne}</p>}
          </>
        ) : <p className="im-hint">{W.noPrior(receiver)}</p>}
      </div>

      <div className="app-wi__card" ref={card}>
        <div className="app-wi__row">
          <p className="app-wi__label">{W.happened}</p>
          <div className="app-wi__pair">
            <Who ex={toKey(effectiveState(s, ctx.target.id).state)} name={actor ?? t.replay.you} />
            <Arrow />
            {ctx.reply ? <Who ex={toKey(effectiveState(s, ctx.reply.id).state)} name={receiver} /> : <span className="app-wi__none">{W.noReply}</span>}
          </div>
        </div>
        <div className="app-wi__row is-whatif">
          <p className="app-wi__label">{W.whatIfRow} <span className="app-wi__caveat">{W.caveat}</span></p>
          <div className="app-wi__pair">
            {picked ? <Who ex={picked} name={actor ?? t.replay.you} dashed waiting={entry?.status === "loading"} /> : <span className="app-wi__slot" aria-hidden>?</span>}
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
          {picked && entry?.status === "done" && <Details s={s} entry={entry} picked={picked} actor={actor} receiver={receiver} open={open} />}
        </div>
      </div>

      <div className="app-wi__picker">
        <p className="app-wi__prompt" id={`wi-pick-${ctx.target.id}`}>{W.prompt(actor)}</p>
        <div className="app-wi__opts" role="group" aria-labelledby={`wi-pick-${ctx.target.id}`}>
          {EX_ORDER.map((k) => (
            <button key={k} className="app-wi__opt im-ex" data-ex={k} aria-pressed={picked === k} onClick={() => pick(k)}>
              <Badge ex={k} state="plain" size={36} />
              <span><strong>{t.ex[k].name}</strong><small>{t.ex[k].short}</small>{tried.includes(k) && <em className="app-wi__tried-tag">{W.tried}</em>}</span>
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
              const ps = otherWays((entryFor(k) as Done).result);
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
  const others = otherWays(result);
  if (!others.length) {
    const why = result.possibilities.length ? W.noOther
      : result.reason === "no_prior" ? W.noPrior(receiver) : result.reason === "unclear_prior" ? W.unclearPrior(receiver) : W.insufficient;
    return <span className="app-wi__none">{why}</span>;
  }
  return (
    <ul className="app-wi__results">
      {others.map((p) => (
        <li key={p.state}>
          <button className="app-wi__result im-ex" data-ex={keyOf(p)} data-basis={p.basis} aria-expanded={open === p.state} onClick={() => onOpen(open === p.state ? null : p.state)}>
            <Badge ex={keyOf(p)} state="suggested" size={44} />
            <span><strong>{t.ex[keyOf(p)].name}</strong><small>{W.another}</small></span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function Details({ s, entry, picked, actor, receiver, open }: { s: Session; entry: Done; picked: ExKey; actor: string | null; receiver: string; open: string | null }) {
  const { t } = useT();
  const W = t.whatIf;
  const { result } = entry;
  const others = otherWays(result);
  if (result.flagged || !others.length) return <p className="im-hint">{t.whatIf.manyReasons}</p>;
  const [pre, post] = W.resultTitle(actor, receiver);
  const p = others.find((x) => x.state === open);
  const words = (text: string) => withNames(text, s, entry.labels);
  return (
    <div className="app-wi__more">
      <p className="app-wi__caption">{pre} <Chip ex={picked} />{post}</p>
      {!p && <p className="im-hint">{W.tapHint}</p>}
      {p && (
        <div className="app-wi__detail im-ex" data-ex={keyOf(p)}>
          <p><strong>{W.sounds}.</strong> {t.ex[keyOf(p)].desc}</p>
          <p><strong>{W.why}.</strong> {words(p.rationale)}</p>
          {p.cues.length > 0 && <p>{W.fromWords(receiver)} {p.cues.map((c, j) => <span key={c}>{j > 0 && ", "}<q>{c}</q></span>)}</p>}
          <p className="im-hint">{W.anotherNote(receiver)}</p>
          <p className="im-hint">{W.manyReasons}</p>
        </div>
      )}
    </div>
  );
}

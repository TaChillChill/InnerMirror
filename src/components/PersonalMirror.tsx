"use client";
// Personal Mirror (approved prototype, 2026-11-01): how the five states spread across my
// turns in the saved conversations I pick by time. A donut with the brand mascot in the
// middle, one row per state in a fixed order, and a neutral one-line summary. Unclear and
// "not sure" turns are listed apart and never enter the percentages (lib/mirror-stats).
import { useMemo, useState } from "react";
import type { Collection } from "@/lib/mirror-store";
import { STATES, chronological, countsOf, isThin, mostFrequent, percentages, stateTurns, totalOf, windowRange, type Counts } from "@/lib/mirror-stats";
import { exName, useT } from "./ui";

type Preset = "7" | "30" | "all";
const DAYS: Record<Preset, number | null> = { "7": 7, "30": 30, all: null };
const R = 80, C = 2 * Math.PI * R, GAP = 1.2;

/** One row per state: mascot, name, count and source split; with `pct`, also the share and a bar. */
export function StateRows({ counts, pct }: { counts: Counts; pct?: Record<string, number> }) {
  const { t } = useT();
  const M = t.mirror, O = M.overview;
  return (
    <ul className="app-staterows">
      {STATES.filter((s) => pct || totalOf(counts, s)).map((s) => {
        const n = totalOf(counts, s);
        return (
          <li key={s} className="app-staterow im-ex" data-ex={s}>
            {/* eslint-disable-next-line @next/next/no-img-element -- static brand art */}
            <img src={`/mascots/${s}-128.png`} alt="" />
            <span className="app-staterow__name">{exName(t, s)}</span>
            <span className="app-staterow__num">{pct ? O.pct(pct[s], n) : M.turnsN(n)}</span>
            {pct && <span className="app-staterow__bar" aria-hidden="true"><span style={{ width: `${pct[s]}%` }} /></span>}
            <span className="app-staterow__split">{n ? M.split(counts.byState[s].mine, counts.byState[s].mirror) : O.absent}</span>
          </li>
        );
      })}
    </ul>
  );
}

export function PersonalMirror({ saved }: { saved: Collection[] }) {
  const { t, lang } = useT();
  const M = t.mirror, O = M.overview;
  const list = useMemo(() => chronological(saved), [saved]);
  const [preset, setPreset] = useState<Preset | null>("30");
  const [manual, setManual] = useState<[number, number] | null>(null);
  // A preset decides the range until a thumb is dragged; then the hand-picked range holds.
  const [lo, hi] = manual ?? windowRange(list, DAYS[preset ?? "all"], new Date());
  const picked = lo > hi ? [] : list.slice(lo, hi + 1);
  const counts = countsOf(picked);
  const n = stateTurns(counts);
  const pct = percentages(counts);
  const top = mostFrequent(counts);
  const last = list.length - 1;
  const date = (iso: string) => new Date(iso).toLocaleDateString(lang === "vi" ? "vi-VN" : "en-GB", { day: "numeric", month: "short" });

  const pickPreset = (p: Preset) => { setPreset(p); setManual(null); };
  const drag = (which: "lo" | "hi", v: number) => {
    const cur: [number, number] = [Math.min(lo, last), Math.max(hi, 0)];
    setManual(which === "lo" ? [Math.min(v, cur[1]), cur[1]] : [cur[0], Math.max(v, cur[0])]);
    setPreset(null);
  };

  // Each state's arc length and where it starts on the ring, in the fixed state order.
  const lens = STATES.map((s) => (n ? (totalOf(counts, s) / n) * C : 0));
  const starts = lens.map((_, i) => lens.slice(0, i).reduce((a, b) => a + b, 0));
  const arcs = STATES.map((s, i) => {
    const seg = Math.max(0, lens[i] - GAP);
    return <circle key={s} className="im-ex" data-ex={s} cx="100" cy="100" r={R} strokeWidth="30" strokeDasharray={`${seg} ${C - seg}`} strokeDashoffset={-starts[i]} />;
  });
  const labels = STATES.map((s, i) => {
    if (pct[s] < 6) return null;
    const mid = ((starts[i] + lens[i] / 2) / C) * 2 * Math.PI - Math.PI / 2;
    return <span key={s} className="app-donut__pct im-ex" data-ex={s} style={{ left: `${50 + 40 * Math.cos(mid)}%`, top: `${50 + 40 * Math.sin(mid)}%` }}>{pct[s]}%</span>;
  });
  const summary = !n ? O.noState
    : top.length > 1 ? O.tie(top.map((s) => exName(t, s)), totalOf(counts, top[0]), n)
    : O.top(exName(t, top[0]), totalOf(counts, top[0]), n);
  const outside = M.outside(counts.unclear, counts.unsure);
  const at = (i: number) => `${(last > 0 ? i / last : 0.5) * 100}%`;

  return (
    <section className="app-pm" aria-labelledby="pm-title">
      <h2 id="pm-title" className="app-h2">{O.title}</h2>
      <div className="app-pm__grid">
        <div className="app-pm__main">
          <p className="im-hint">{O.lead(picked.length)}</p>
          <div className="app-pm__dist">
            <div className="app-donut" role="img" aria-label={O.chart(n, STATES.map((s) => `${exName(t, s)} ${totalOf(counts, s)} (${pct[s]}%)`).join(", "))}>
              <svg viewBox="0 0 200 200" aria-hidden="true"><circle className="app-donut__track" cx="100" cy="100" r={R} strokeWidth="30" />{arcs}</svg>
              {labels}
              <span className="app-donut__mid">
                {/* eslint-disable-next-line @next/next/no-img-element -- placeholder until the transparent brand mascot arrives (D2) */}
                <img src="/brand/app-mark.png" alt="" />
                <strong>{O.turns(n)}</strong>
                <small>{O.convs(picked.length)}</small>
              </span>
            </div>
            <StateRows counts={counts} pct={pct} />
          </div>
          {outside && <p className="app-pm__aside">{O.notCounted(outside)}</p>}
        </div>

        <div className="app-pm__time">
          <h3 className="app-pm__h3">{O.time}</h3>
          <div className="app-seg" role="group" aria-label={O.time}>
            {(["7", "30", "all"] as Preset[]).map((p) => <button key={p} aria-pressed={preset === p} onClick={() => pickPreset(p)}>{O.presets[p]}</button>)}
          </div>
          {list.length > 1 && (
            <div className="app-range">
              <span className="app-range__track">
                {list.map((c, i) => <span key={c.id} className="app-range__tick" style={{ left: at(i) }} />)}
                {lo <= hi && <span className="app-range__fill" style={{ left: at(lo), right: `calc(100% - ${at(hi)})` }} />}
              </span>
              <input type="range" min={0} max={last} step={1} value={Math.min(lo, last)} onChange={(e) => drag("lo", Number(e.target.value))} aria-label={O.from} aria-valuetext={date(list[Math.min(lo, last)].createdAt)} />
              <input type="range" min={0} max={last} step={1} value={Math.max(hi, 0)} onChange={(e) => drag("hi", Number(e.target.value))} aria-label={O.to} aria-valuetext={date(list[Math.max(hi, 0)].createdAt)} />
            </div>
          )}
          <p className="app-pm__when">{picked.length ? `${date(picked[0].createdAt)} – ${date(picked[picked.length - 1].createdAt)}` : O.none}
            {list.length > 1 && <small>{O.dragHint}</small>}</p>
          <div className="app-pm__insight" aria-live="polite">
            {/* eslint-disable-next-line @next/next/no-img-element -- brand art */}
            <img src="/brand/app-mark.png" alt="" />
            <p>{summary}<small>{isThin(counts, picked.length) ? O.thin : O.notTrait}</small></p>
          </div>
        </div>
      </div>
    </section>
  );
}

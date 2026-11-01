"use client";
// A saved conversation's visual identity (approved prototype, 2026-11-01): the states of my
// turns as octopuses, sized by how often each appeared, with a count on each. States that
// didn't appear are left out. Artwork is shown as provided, never dimmed or recoloured.
import { STATES, totalOf, type Counts, type State } from "@/lib/mirror-stats";
import { exName, useT } from "./ui";

// Most frequent first: the largest sits centre-left, the rest around it (% of the cloud).
const SLOTS: [number, number][] = [[40, 46], [78, 30], [22, 84], [76, 78], [82, 6]];

export function StateCloud({ counts, large }: { counts: Counts; large?: boolean }) {
  const { t } = useT();
  const present: State[] = STATES.filter((s) => totalOf(counts, s) > 0).sort((x, y) => totalOf(counts, y) - totalOf(counts, x));
  const max = Math.max(1, ...present.map((s) => totalOf(counts, s)));
  const label = [...present.map((s) => `${exName(t, s)} ${totalOf(counts, s)}`), counts.unclear ? `${t.mirror.mirrorUnclear} ${counts.unclear}` : ""].filter(Boolean).join(", ");
  return (
    <span className={`app-cloud${large ? " app-cloud--large" : ""}`} role="img" aria-label={label || t.mirror.overview.noState}>
      {present.map((s, i) => {
        const n = totalOf(counts, s);
        // Diameter as a share of the cloud's width; area grows with the count.
        const d = 22 + 30 * Math.sqrt(n / max);
        const [x, y] = SLOTS[i];
        return (
          <span key={s} className="app-cloud__puff im-ex" data-ex={s} style={{ left: `${x}%`, top: `${y}%`, ["--d" as string]: `${d}cqw` }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- static brand art */}
            <img src={`/mascots/${s}-256.png`} alt="" />
            <span className="app-cloud__n">{n}</span>
          </span>
        );
      })}
    </span>
  );
}

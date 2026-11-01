"use client";
// A saved conversation's visual identity: the states of my turns as octopuses, sized by how
// often each appeared, with a count on each. States that didn't appear are left out. Artwork
// is shown as provided, never dimmed or recoloured.
// Layout: one compact row (lib/cloud-layout, Founder UAT #11).
import type { Counts } from "@/lib/mirror-stats";
import { cloudLayout, OVERLAP } from "@/lib/cloud-layout";
import { exName, useT } from "./ui";

export function StateCloud({ counts, large }: { counts: Counts; large?: boolean }) {
  const { t } = useT();
  const row = cloudLayout(counts);
  const label = [...[...row].sort((a, b) => a.rank - b.rank).map((x) => `${exName(t, x.state)} ${x.n}`), counts.unclear ? `${t.mirror.mirrorUnclear} ${counts.unclear}` : ""].filter(Boolean).join(", ");
  const middle = row.findIndex((x) => x.rank === 0);
  return (
    <span className={`app-cloud${large ? " app-cloud--large" : ""}`} role="img" aria-label={label || t.mirror.overview.noState}>
      {row.map((x, i) => (
        <span key={x.state} className={`app-cloud__puff im-ex${i < middle ? " is-left" : ""}`} data-ex={x.state} data-rank={x.rank}
          style={{ ["--d" as string]: `${x.d}cqw`, ["--overlap" as string]: `${i ? OVERLAP : 0}cqw`, zIndex: 10 - x.rank }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- static brand art */}
          <img src={`/mascots/${x.state}-256.png`} alt="" />
          <span className="app-cloud__n">{x.n}</span>
        </span>
      ))}
    </span>
  );
}

"use client";
// Educational P/A/C diagram (Berne's transactional diagram, simplified). The app itself
// does not show a transaction map; this only explains the idea.
import type { ExKey } from "@/lib/i18n";
import { Badge, useT } from "./ui";

type Kind = "click" | "miss";
// Node colors match the legend: Parent lavender, Adult blue, Child yellow.
export const ROWS = [["P", 45, "np"], ["A", 95, "a"], ["C", 145, "fc"]] as const;

function Stack({ x, label, ring }: { x: number; label: string; ring: string[] }) {
  return (
    <g>
      <text x={x} y={14} className="lp-dia__who">{label}</text>
      {ROWS.map(([s, y, ex]) => (
        <g key={s} className="im-ex" data-ex={ex}>
          <circle cx={x} cy={y} r={20} className={ring.includes(s) ? "lp-dia__node is-on" : "lp-dia__node"} />
          <text x={x} y={y + 5} className="lp-dia__s">{s}</text>
        </g>
      ))}
    </g>
  );
}

export function InteractionDiagram({ kind, title, you, them }: { kind: Kind; title: string; you: string; them: string }) {
  const id = `lp-ar-${kind}`;
  return (
    <svg viewBox="0 0 320 170" role="img" aria-label={title} className="lp-dia">
      <defs>
        <marker id={id} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 0L10 5L0 10z" fill="currentColor" />
        </marker>
        <marker id={`${id}-x`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M0 0L10 5L0 10z" className="lp-dia__cross-head" />
        </marker>
      </defs>
      <Stack x={60} label={you} ring={kind === "click" ? ["A"] : ["A", "C"]} />
      <Stack x={260} label={them} ring={kind === "click" ? ["A"] : ["P", "A"]} />
      {kind === "click" ? (
        <g className="lp-dia__arrow">
          <path d="M84 86 L236 86" markerEnd={`url(#${id})`} />
          <path d="M236 104 L84 104" markerEnd={`url(#${id})`} strokeDasharray="6 5" />
        </g>
      ) : (
        <g className="lp-dia__arrow">
          <path d="M84 95 L236 95" markerEnd={`url(#${id})`} />
          <path d="M238 54 L82 136" markerEnd={`url(#${id}-x)`} strokeDasharray="6 5" className="lp-dia__cross" />
        </g>
      )}
    </svg>
  );
}

// Shared legend: each structural state with all of its styles, so no single mascot
// stands for a whole group.
const GROUP: Record<"P" | "A" | "C", ExKey[]> = { P: ["cp", "np"], A: ["a"], C: ["fc", "ac"] };

export function DiagramLegend() {
  const { t } = useT();
  const L = t.landing.meet.legend;
  return (
    <div className="lp-legend" role="group" aria-label={L.title}>
      <p className="lp-legend__title">{L.title}</p>
      <ul>
        {ROWS.map(([s, , ex]) => (
          <li key={s}>
            <span className="lp-legend__node im-ex" data-ex={ex} aria-hidden="true">{s}</span>
            <span className="lp-legend__faces" aria-hidden="true">{GROUP[s].map((m) => <Badge key={m} ex={m} state="plain" size={28} />)}</span>
            <span><strong>{L[s][0]}</strong> {L[s][1]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

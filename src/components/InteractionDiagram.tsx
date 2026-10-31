"use client";
// Educational P/A/C diagram (Berne's transactional diagram, simplified). The app itself
// does not show a transaction map; this only explains the idea.

type Kind = "click" | "miss";
const ROWS = [["P", 45, "np"], ["A", 95, "a"], ["C", 145, "fc"]] as const;

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
      </defs>
      <Stack x={60} label={you} ring={kind === "click" ? ["A"] : ["P", "A"]} />
      <Stack x={260} label={them} ring={kind === "click" ? ["A"] : ["A", "C"]} />
      {kind === "click" ? (
        <g className="lp-dia__arrow">
          <path d="M84 86 L236 86" markerEnd={`url(#${id})`} />
          <path d="M236 104 L84 104" markerEnd={`url(#${id})`} strokeDasharray="6 5" />
        </g>
      ) : (
        <g className="lp-dia__arrow">
          <path d="M84 95 L236 95" markerEnd={`url(#${id})`} />
          <path d="M238 136 L82 54" markerEnd={`url(#${id})`} strokeDasharray="6 5" className="lp-dia__cross" />
        </g>
      )}
    </svg>
  );
}

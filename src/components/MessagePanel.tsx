"use client";
// One panel per open message: "Your reading", and on my own messages "What if?". Replay
// renders it as a sticky right column on desktop and as a bottom sheet on phones, so the
// conversation stays in view (desktop) or one tap away (phones).
import type { KeyboardEvent } from "react";
import { segmentOf } from "@/lib/ai/analysis";
import { scenarioContext } from "@/lib/ai/scenario";
import type { Update } from "./App";
import { Selector } from "./Selector";
import { WhatIf } from "./WhatIf";
import { nameOf, whatIfOff, type Session } from "./session";
import type { useScenarios } from "./use-scenarios";
import { Icon, useT } from "./ui";

export type PanelTab = "reading" | "whatif";
const TABS: PanelTab[] = ["reading", "whatif"];

type Props = { s: Session; update: Update; id: string; tab: PanelTab; onTab: (t: PanelTab) => void; scenarios: ReturnType<typeof useScenarios>; onClose: () => void };

export function MessagePanel({ s, update, id, tab, onTab, scenarios, onClose }: Props) {
  const { t } = useT();
  const R = t.replay;
  const m = s.transcript?.messages.find((x) => x.id === id);
  if (!m) return null;
  // A character can cover several messages of one turn; the panel quotes all of them.
  const ids = segmentOf(s.analysis!, id)?.messageIds ?? [id];
  const quote = ids.map((x) => s.transcript!.messages.find((y) => y.id === x)?.text).filter(Boolean).join(" · ");
  const ctx = whatIfOff(s) ? null : scenarioContext(s.transcript!.messages, s.selfId, id);
  const active = ctx ? tab : "reading";

  // Arrow keys move between the two tabs (WAI-ARIA tabs pattern).
  const onKey = (e: KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const next = active === "reading" ? "whatif" : "reading";
    onTab(next);
    document.getElementById(`tab-${next}`)?.focus();
  };

  return (
    <>
      <div className="app-sheet-bar">
        <p className="app-panel-quote"><strong>{nameOf(s, m.speakerId, R.you)}:</strong> {quote}</p>
        <button className="app-icon-btn" onClick={onClose} aria-label={R.close}><Icon name="close" /></button>
      </div>
      {ctx && (
        <div className="app-tabs" role="tablist" aria-label={R.panelLabel} onKeyDown={onKey}>
          {TABS.map((k) => (
            <button key={k} id={`tab-${k}`} role="tab" aria-selected={active === k} aria-controls={`tabpanel-${k}`} tabIndex={active === k ? 0 : -1} onClick={() => onTab(k)}>
              {k === "whatif" && <Icon name="swap" />}{k === "reading" ? R.tabReading : t.whatIf.button}
            </button>
          ))}
        </div>
      )}
      <div id={`tabpanel-${active}`} role={ctx ? "tabpanel" : undefined} aria-labelledby={ctx ? `tab-${active}` : undefined}>
        {active === "whatif" && ctx
          ? <WhatIf key={id} s={s} ctx={ctx} scenarios={scenarios} />
          : <Selector s={s} update={update} id={id} />}
      </div>
    </>
  );
}

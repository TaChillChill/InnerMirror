"use client";
// Over 40 turns the user chooses which part Mirror looks at (turn-window.ts). Nothing is
// preselected and nothing is removed: the other messages stay on Review, dimmed.
import { MAX_TURNS, partOptions, turnCount } from "@/lib/turn-window";
import type { Message } from "@/lib/conversation";
import { Icon, useT } from "./ui";

const snippet = (text: string) => (text.length > 32 ? `${text.slice(0, 31).trimEnd()}…` : text);

export function TurnPartPicker({ messages, value, onChange }: { messages: Message[]; value: string | null; onChange: (firstId: string | null) => void }) {
  const { t } = useT();
  const P = t.review.part;
  const options = partOptions(messages);
  if (!options.length) return null;
  const textOf = (id: string) => messages.find((m) => m.id === id)?.text ?? "";
  return (
    <section className="im-notice app-part" aria-labelledby="part-title"><Icon name="alert" /><div>
      <p id="part-title"><strong>{P.title(turnCount(messages), MAX_TURNS)}</strong></p>
      <p>{P.body}</p>
      <label className="im-label" htmlFor="turn-part">{P.label}</label>
      <select id="turn-part" className="im-input app-part__select" value={options.some((o) => o.firstId === value) ? value ?? "" : ""} onChange={(e) => onChange(e.target.value || null)}>
        <option value="">{P.placeholder}</option>
        {options.map((o) => <option key={o.firstId} value={o.firstId}>{P.option(o.from, o.to, snippet(textOf(o.firstId)))}</option>)}
      </select>
    </div></section>
  );
}

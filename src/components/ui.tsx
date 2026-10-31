"use client";
// Shared presentational pieces. Markup and class names follow the design system
// (design/showcase/components.css) and prototype v2, so the app can't drift from them.
import { createContext, useContext, type CSSProperties, type ReactNode } from "react";
import { DICTS, type Dict, type ExKey } from "@/lib/i18n";
import type { Lang } from "@/lib/conversation";

export const LangContext = createContext<{ lang: Lang; t: Dict }>({ lang: "en", t: DICTS.en });
export const useT = () => useContext(LangContext);

const ICONS: Record<string, ReactNode> = {
  check: <path d="M5 12.5l4.5 4.5L19 7.5" strokeWidth="3" />,
  dot: <circle cx="12" cy="12" r="5" fill="currentColor" stroke="none" />,
  eye: <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="3" /></>,
  person: <><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" /></>,
  saved: <path d="M7.5 3.5h9a1.5 1.5 0 011.5 1.5v16l-6-4-6 4V5a1.5 1.5 0 011.5-1.5z" />,
  lock: <><rect x="5" y="10.5" width="14" height="10" rx="3" /><path d="M8.5 10.5V8a3.5 3.5 0 017 0v2.5" /></>,
  device: <><rect x="6.5" y="2.5" width="11" height="19" rx="3" /><path d="M10.5 18.5h3" /></>,
  trash: <path d="M4.5 7h15M9.5 7V5h5v2M7 7l.8 12.2a2 2 0 002 1.8h4.4a2 2 0 002-1.8L17 7" />,
  alert: <><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5.5M12 16.5v.01" /></>,
  image: <><rect x="3.5" y="4.5" width="17" height="15" rx="3" /><circle cx="9" cy="10" r="1.75" /><path d="M20.5 16l-5-5-8.5 8.5" /></>,
  text: <path d="M5 6.5h14M5 11.5h14M5 16.5h9" />,
  swap: <path d="M4 8h13l-3-3M20 16H7l3 3" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  plus: <path d="M12 5v14M5 12h14" />,
  search: <><circle cx="10.5" cy="10.5" r="6" /><path d="M15 15l5 5M10.5 8v5M8 10.5h5" /></>,
  arrow: <path d="M4 12h15M14 7l5 5-5 5" />,
  chev: <path d="M8 10l4 4 4-4" />,
  back: <path d="M20 12H5M10 7l-5 5 5 5" />,
  edit: <path d="M4.5 19.5l1-4L15.5 5.5l3 3-10 10z" />,
};

export function Icon({ name }: { name: keyof typeof ICONS | string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      {ICONS[name]}
    </svg>
  );
}

// Full-body mascot in a square slot; data-ex drives the size normalization (D12) in app.css.
export function Mascot({ ex }: { ex: ExKey }) {
  return (
    <span className="app-mascot" data-ex={ex}>
      {/* eslint-disable-next-line @next/next/no-img-element -- small static brand art, no optimization needed */}
      <img src={`/mascots/${ex}-256.png`} alt="" loading="lazy" />
    </span>
  );
}

export type BadgeState = "suggested" | "agreed" | "changed" | "unsure" | "plain";
export function Badge({ ex, state, size }: { ex: ExKey | "unsure"; state: BadgeState; size?: number }) {
  const style = size ? ({ "--size": `${size}px` } as CSSProperties) : undefined;
  if (state === "unsure" || ex === "unsure") return <span className="im-badge im-badge--unsure" aria-hidden="true" style={style}>?</span>;
  return (
    <span className={`im-badge im-ex${state === "suggested" ? " im-badge--suggested" : ""}`} data-ex={ex} aria-hidden="true" style={style}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <span className="im-badge__face"><img src={`/mascots/${ex}-128.png`} alt="" /></span>
      {state === "agreed" && <span className="im-badge__mark"><Icon name="check" /></span>}
      {state === "changed" && <span className="im-badge__mark"><Icon name="dot" /></span>}
    </span>
  );
}

// People get initials on neutral tones, never a mascot hue: a colored person would
// read as "this person is that ego state".
const TONES = ["slate", "sand", "stone"];
export function Avatar({ name, isMe, index, size }: { name: string; isMe: boolean; index: number; size?: number }) {
  const style = size ? ({ "--av": `${size}px` } as CSSProperties) : undefined;
  return <span className="app-avatar" data-tone={isMe ? "me" : TONES[index % TONES.length]} style={style} aria-hidden="true">{(name.trim()[0] ?? "?").toUpperCase()}</span>;
}

export const exName = (t: Dict, ex: ExKey | "unsure" | "UNCLEAR") => (ex === "unsure" ? t.unsure : ex === "UNCLEAR" ? t.unclear : t.ex[ex].name);
export const toKey = (expr: string): ExKey | "unsure" => (expr === "UNCLEAR" ? "unsure" : (expr.toLowerCase() as ExKey));

// `prefix` carries Mirror's uncertainty ("Maybe ·"); `text` replaces the "not sure" wording.
export function Chip({ ex, prefix, text }: { ex: ExKey | "unsure"; prefix?: string; text?: string }) {
  const { t } = useT();
  const q = prefix && <span className="im-chip__q">{prefix} ·</span>;
  return ex === "unsure"
    ? <span className="im-chip im-chip--unsure">{q}{text ?? t.unsure}</span>
    : <span className="im-chip im-ex" data-ex={ex}>{q}{t.ex[ex].name}</span>;
}

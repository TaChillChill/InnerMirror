// Brand assets and tokens, read from the repo's originals (see vite.config.ts).
// Colours mirror design/showcase/tokens.css: fill = mascot colour, identification only.
import cpFull from "../../brand/mascots/source/cp.png";
import npFull from "../../brand/mascots/source/np.png";
import aFull from "../../brand/mascots/source/a.png";
import fcFull from "../../brand/mascots/source/fc.png";
import acFull from "../../brand/mascots/source/ac.png";
import cpBadge from "../../brand/mascots/badge/cp-128.png";
import npBadge from "../../brand/mascots/badge/np-128.png";
import aBadge from "../../brand/mascots/badge/a-128.png";
import fcBadge from "../../brand/mascots/badge/fc-128.png";
import acBadge from "../../brand/mascots/badge/ac-128.png";
import logo from "../../../public/brand/logo.png";
import appMark from "../../../public/brand/app-mark.png";

export type State = "CP" | "NP" | "A" | "FC" | "AC";
export type Reading = State | "UNCLEAR";
export const STATES: State[] = ["CP", "NP", "A", "FC", "AC"];

export const MASCOT: Record<State, { full: string; badge: string; fill: string; tint: string; ink: string; name: string; tag: string }> = {
  CP: { full: cpFull, badge: cpBadge, fill: "#ff5b6b", tint: "#ffe5e7", ink: "#c1283c", name: "Critical Parent", tag: "sets the limits" },
  NP: { full: npFull, badge: npBadge, fill: "#c9a8ff", tint: "#f3ecff", ink: "#7442c8", name: "Nurturing Parent", tag: "cares and protects" },
  A: { full: aFull, badge: aBadge, fill: "#82b9f8", tint: "#e4f0fd", ink: "#1f5fae", name: "Adult", tag: "facts and options" },
  FC: { full: fcFull, badge: fcBadge, fill: "#ffc34d", tint: "#fff1d4", ink: "#8a5600", name: "Free Child", tag: "feelings, said openly" },
  AC: { full: acFull, badge: acBadge, fill: "#60d6c0", tint: "#dcf6f1", ink: "#0e7462", name: "Adapted Child", tag: "adjusts to others" },
};

export const UNCLEAR_FILL = "#a8a4c4";
export const fillOf = (r: Reading) => (r === "UNCLEAR" ? UNCLEAR_FILL : MASCOT[r].fill);

export const C = {
  night: "#110f22",
  nightSurface: "#211e3b",
  nightText: "#eeebff",
  nightMuted: "#aba6d2",
  bg: "#fafafe",
  surface: "#ffffff",
  sunken: "#f4f2fb",
  lavender: "#ede8ff",
  border: "#e3dff3",
  text: "#252344",
  muted: "#5e5a7e",
  primary: "#635bce",
  primaryInk: "#4f47b8",
};

export const FONT = '"Nunito", ui-rounded, "SF Pro Rounded", system-ui, -apple-system, sans-serif';
export { logo, appMark };

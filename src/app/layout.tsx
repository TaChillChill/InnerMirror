import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
// One source of truth for the design system: the approved tokens and components.
import "../../design/showcase/tokens.css";
import "../../design/showcase/components.css";
import "../styles/theme.css";
import "../styles/app.css";
import "../styles/mirror.css";
import "../styles/whatif.css";
import "../styles/story.css";
import "../styles/landing.css";

const nunito = Nunito({ subsets: ["latin", "vietnamese"], weight: ["400", "600", "700", "800"], variable: "--font-nunito", display: "swap" });

export const metadata: Metadata = {
  title: "InnerMirror",
  description: "Look back at a conversation and notice how you shifted. A reflection tool, not a diagnosis.",
  robots: { index: false, follow: false },
};
export const viewport: Viewport = {
  width: "device-width", initialScale: 1,
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#fafafe" }, { media: "(prefers-color-scheme: dark)", color: "#17152b" }],
};

// Applies the stored Light/Dark choice before the first paint, so a dark choice never
// flashes light. Static string, no user input.
const THEME_SCRIPT = `try{var t=localStorage.getItem("innermirror.theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={nunito.variable} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} /></head>
      <body>{children}</body>
    </html>
  );
}

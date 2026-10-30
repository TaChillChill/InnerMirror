import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
// One source of truth for the design system: the approved tokens and components.
import "../../design/showcase/tokens.css";
import "../../design/showcase/components.css";
import "../styles/app.css";
import "../styles/mirror.css";

const nunito = Nunito({ subsets: ["latin", "vietnamese"], weight: ["400", "600", "700", "800"], variable: "--font-nunito", display: "swap" });

export const metadata: Metadata = {
  title: "InnerMirror",
  description: "Look back at a conversation and notice how you shifted. A reflection tool, not a diagnosis.",
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#fafafe" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={nunito.variable}>
      <body>{children}</body>
    </html>
  );
}

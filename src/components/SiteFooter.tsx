"use client";
import { useT } from "./ui";

// Subtle attribution; InnerMirror stays the primary brand.
export function SiteFooter() {
  const { t } = useT();
  return (
    <footer className="app-credit">
      {t.footer.createdBy} <a href="https://heocoinfamily.com" target="_blank" rel="noopener">HeoCoin Family</a>
    </footer>
  );
}

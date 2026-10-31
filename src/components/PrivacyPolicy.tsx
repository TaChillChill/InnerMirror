"use client";
// Standalone page (opened in a new tab from the app so an unsaved conversation isn't lost).
// Shares the language preference with the app; copy lives in the i18n dictionaries.
import Link from "next/link";
import { useEffect } from "react";
import { DICTS } from "@/lib/i18n";
import { LangContext } from "./ui";
import { SiteFooter } from "./SiteFooter";
import { useLang } from "./use-browser-state";

export function PrivacyPolicy() {
  const [lang, setLang] = useLang();
  const t = DICTS[lang];
  const P = t.privacyPage;
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  return (
    <LangContext.Provider value={{ lang, t }}>
      <header className="app-bar">
        <Link className="app-home" href="/">{t.appName}</Link>
        <div className="app-bar__end">
          <button className="im-btn im-btn--ghost im-btn--sm" onClick={() => setLang(lang === "en" ? "vi" : "en")} lang={lang === "en" ? "vi" : "en"}>{t.langSwitch}</button>
        </div>
      </header>
      <main id="main">
        <article className="app-page app-policy">
          <h1 className="app-display">{P.title}</h1>
          <p className="im-hint">{P.updated}</p>
          {P.sections.map(([heading, body]) => (
            <section key={heading}><h2 className="app-h2">{heading}</h2><p>{body}</p></section>
          ))}
          <section><h2 className="app-h2">{P.contact[0]}</h2><p>{P.contact[1]} <a href="mailto:hello@heocoinfamily.com">hello@heocoinfamily.com</a>.</p></section>
          <p><Link className="im-btn im-btn--secondary" href="/">{P.back}</Link></p>
        </article>
      </main>
      <SiteFooter />
    </LangContext.Provider>
  );
}

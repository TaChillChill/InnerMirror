"use client";
// The whole journey on one page: Conversation → AI Observation → My Interpretation → My Mirror.
// State lives here; screens are presentational and talk back through `update`.
import { useCallback, useEffect, useRef, useState } from "react";
import { DICTS } from "@/lib/i18n";
import { analysisKey, toAnalyzeRequest } from "@/lib/conversation";
import { analyzeEstimate } from "@/lib/wait";
import type { Analysis } from "@/lib/ai/analysis";
import { LangContext, Icon } from "./ui";
import { SiteFooter } from "./SiteFooter";
import { BrandMark, LangToggle, StickyHeader } from "./BrandBits";
import { useCollections, useLang, useStorageOk } from "./use-browser-state";
import { freshSession, type Session } from "./session";
import { Landing } from "./Landing";
import { AddConversation } from "./AddConversation";
import { Review } from "./Review";
import { Analyzing, AnalyzeError } from "./Analyzing";
import { Replay } from "./Replay";
import { Mirror } from "./Mirror";

export type Update = (patch: Partial<Session> | ((s: Session) => Partial<Session>)) => void;

export function App() {
  const [lang, setLang] = useLang();
  const [s, setS] = useState<Session>(freshSession);
  const [saved, refreshSaved] = useCollections();
  const storageOk = useStorageOk();
  const abort = useRef<AbortController | null>(null);
  const t = DICTS[lang];

  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  const update: Update = useCallback((patch) => setS((cur) => ({ ...cur, ...(typeof patch === "function" ? patch(cur) : patch) })), []);
  const go = useCallback((screen: Session["screen"]) => { update({ screen, selected: null }); window.scrollTo({ top: 0 }); }, [update]);

  // Home and Back only navigate: the conversation stays in memory. Only starting a new
  // one clears it, and an unsaved analysis asks first.
  const hasSession = !!s.analysis && !!s.transcript;
  const startNew = () => {
    if (s.analysis && !s.savedId && !window.confirm(t.mirror.confirmNew)) return;
    setS({ ...freshSession(), screen: "add" });
    window.scrollTo({ top: 0 });
  };

  const analyze = useCallback(async () => {
    if (!s.transcript || !s.selfId) return;
    const req = toAnalyzeRequest(s.transcript, s.selfId, lang);
    const key = analysisKey(req);
    const last = s.lastResult;
    if (last?.key === key) {
      // Unchanged conversation (only "Who am I?" may differ): same reading, my choices kept.
      // A save belongs to the perspective it was made from.
      update({ screen: "replay", analysis: last.analysis, labels: last.labels, error: null, selected: null, shots: [], draft: { ...s.draft, images: [] }, extractNotes: [], savedId: last.selfId === s.selfId ? s.savedId : null });
      window.scrollTo({ top: 0 });
      return;
    }
    const controller = new AbortController();
    abort.current = controller;
    update({ screen: "analyzing", error: null, analysis: null, choices: {}, selected: null, savedId: null, shots: [], draft: { ...s.draft, images: [] }, extractNotes: [] });
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
        signal: controller.signal,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) return update({ screen: "error", error: typeof json.error === "string" ? json.error : "unknown" });
      const analysis = json.analysis as Analysis, labels = json.labels ?? {};
      update({ screen: "replay", analysis, labels, lastResult: { key, selfId: s.selfId, analysis, labels } });
      window.scrollTo({ top: 0 });
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return update({ screen: "review" });
      update({ screen: "error", error: "network" });
    }
  }, [s.transcript, s.selfId, s.lastResult, s.savedId, s.draft, lang, update]);

  const stepIndex = { add: 0, review: 0, analyzing: 0, error: 0, replay: 1, mirror: s.analysis ? 2 : -1, landing: -1 }[s.screen];

  return (
    <LangContext.Provider value={{ lang, t }}>
      <StickyHeader>
        <button className="app-home" onClick={() => go("landing")} aria-label={t.home}><BrandMark /></button>
        {stepIndex >= 0 && (
          <nav aria-label="Progress" className="app-stepper">
            <ol className="im-stepper">
              {t.steps.map((label, i) => (
                <li key={label}><span className={i < stepIndex ? "is-done" : ""} aria-current={i === stepIndex ? "step" : undefined}>{label}</span></li>
              ))}
            </ol>
          </nav>
        )}
        <div className="app-bar__end">
          {s.screen !== "mirror" && (
            <button className="im-btn im-btn--ghost im-btn--sm app-bar__mirror" onClick={() => go("mirror")} aria-label={t.myMirror}>
              <Icon name="saved" /> <span className="app-bar__label">{t.myMirror}</span>{saved.length > 0 && <span className="app-count">{saved.length}</span>}
            </button>
          )}
          <LangToggle lang={lang} onChange={setLang} />
        </div>
      </StickyHeader>
      <main id="main">
        {s.screen === "landing" && <Landing savedCount={saved.length} onStart={startNew} onMirror={() => go("mirror")} onContinue={hasSession ? () => go("replay") : undefined} />}
        {s.screen === "add" && <AddConversation s={s} update={update} />}
        {s.screen === "review" && s.transcript && <Review s={s} update={update} onAnalyze={analyze} onBack={() => go("add")} />}
        {s.screen === "analyzing" && s.transcript && <Analyzing estimate={analyzeEstimate(s.transcript.messages)} onCancel={() => abort.current?.abort()} />}
        {s.screen === "error" && <AnalyzeError code={s.error ?? "unknown"} onRetry={analyze} onEdit={() => go("review")} />}
        {s.screen === "replay" && s.analysis && <Replay s={s} update={update} onContinue={() => go("mirror")} onEdit={() => go("review")} onRestart={() => setS(freshSession())} />}
        {s.screen === "mirror" && (
          <Mirror s={s} update={update} saved={saved} storageOk={storageOk} onSavedChange={refreshSaved}
            onNew={startNew} onBack={() => go("replay")} onHome={() => go("landing")} onOpenMessage={(id) => update({ screen: "replay", selected: id })} />
        )}
      </main>
      <SiteFooter />
    </LangContext.Provider>
  );
}

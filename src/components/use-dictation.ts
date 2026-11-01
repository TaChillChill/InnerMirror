"use client";
// In-app mic (Founder N5, 2026-11-01): the browser's own speech recognition turns speech into
// text that lands in the story box, editable before anything is sent. The audio goes to the
// browser's speech service (Apple or Google), never to InnerMirror; we only get the text.
// Hidden where unsupported (e.g. Firefox), so the keyboard's own mic remains the fallback.
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

type Alternative = { transcript: string };
type Result = { isFinal: boolean; 0: Alternative };
type ResultEvent = { resultIndex: number; results: ArrayLike<Result> };
type Recognizer = {
  lang: string; interimResults: boolean; continuous: boolean;
  onresult: ((e: ResultEvent) => void) | null; onerror: ((e: { error: string }) => void) | null; onend: (() => void) | null;
  start: () => void; stop: () => void; abort: () => void;
};
type RecognizerClass = new () => Recognizer;

const recognizerClass = (): RecognizerClass | null => {
  const w = window as unknown as { SpeechRecognition?: RecognizerClass; webkitSpeechRecognition?: RecognizerClass };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};
const noop = () => () => {};

export type DictationError = "denied" | "failed" | null;

/** onText receives each finished phrase; interim text is only for display. */
export function useDictation(lang: "en" | "vi", onText: (text: string) => void) {
  const supported = useSyncExternalStore(noop, () => !!recognizerClass(), () => false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<DictationError>(null);
  const want = useRef(false);
  const current = useRef<Recognizer | null>(null);
  const textCb = useRef(onText);
  useEffect(() => { textCb.current = onText; }, [onText]);

  const toggle = useCallback(() => {
    if (want.current) { want.current = false; current.current?.stop(); return; }
    setError(null);
    want.current = true;
    setListening(true);
    // One phrase per recognizer (continuous mode is unreliable on iOS Safari), restarted while
    // the user still wants to talk. A fresh instance each time avoids stale state.
    const run = () => {
      const Ctor = recognizerClass();
      if (!Ctor || !want.current) return setListening(false);
      const r = new Ctor();
      r.lang = lang === "vi" ? "vi-VN" : "en-US";
      r.interimResults = true;
      r.continuous = false;
      r.onresult = (e) => {
        let live = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const res = e.results[i];
          if (res.isFinal) textCb.current(res[0].transcript.trim()); else live += res[0].transcript;
        }
        setInterim(live);
      };
      r.onerror = (e) => {
        if (e.error === "no-speech" || e.error === "aborted") return;
        want.current = false;
        setError(e.error === "not-allowed" || e.error === "service-not-allowed" ? "denied" : "failed");
      };
      r.onend = () => {
        setInterim("");
        if (want.current) run(); else setListening(false);
      };
      current.current = r;
      try { r.start(); } catch { want.current = false; setListening(false); setError("failed"); }
    };
    run();
  }, [lang]);

  // Leaving the screen stops the mic.
  useEffect(() => () => { want.current = false; current.current?.abort(); }, []);
  return { supported, listening, interim, error, toggle };
}

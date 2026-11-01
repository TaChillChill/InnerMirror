"use client";
// Screenshot → extract. Produces the same Transcript as pasting; the user always lands on
// Review and nothing is analyzed until they confirm it there. Images arrive by picker,
// drag and drop or paste, all through one `addFiles` so the same limits apply. They live
// in the session draft, so Back from Review keeps them and their order.
import { useCallback, useEffect, useRef, useState } from "react";
import { MAX_IMAGES, prepareImage, type ImageError } from "@/lib/image";
import { hasFiles, isEditableTarget, planIntake } from "@/lib/image-intake";
import { toTranscript, type Extraction } from "@/lib/ai/extraction";
import { imagesKey, rereadPlan } from "@/lib/conversation";
import type { Update } from "./App";
import type { Session } from "./session";
import { ReplaceNotice } from "./ReplaceNotice";
import { ShotLightbox } from "./ShotLightbox";
import { Icon, useT } from "./ui";
import { WaitHint } from "./Analyzing";
import { extractEstimate } from "@/lib/wait";
import { errorCode } from "@/lib/api-error";

export function ShotUpload({ s, update }: { s: Session; update: Update }) {
  const { t, lang } = useT();
  const S = t.shot;
  const images = s.draft.images;
  const setImages = useCallback((next: (cur: string[]) => string[]) => update((cur) => ({ draft: { ...cur.draft, images: next(cur.draft.images) } })), [update]);
  const [confirmReplace, setConfirmReplace] = useState(false);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [viewing, setViewing] = useState<number | null>(null);
  const abort = useRef<AbortController | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const imagesRef = useRef(images);
  useEffect(() => { imagesRef.current = images; }, [images]);
  const locked = busy || viewing !== null;

  // Adding never starts extraction: the user still has to tick consent and press Read.
  const addFiles = useCallback(async (files: File[]) => {
    const { accepted, ignored, notImages } = planIntake(files, MAX_IMAGES - imagesRef.current.length);
    if (!accepted.length && !ignored) return setError(notImages ? "format" : null);
    setError(ignored ? "tooMany" : null);
    const next: string[] = [];
    for (const file of accepted) {
      try { next.push(await prepareImage(file)); }
      catch (e) { setError(e instanceof Error && ["format", "decode", "large"].includes(e.message) ? (e.message as ImageError) : "decode"); }
    }
    setImages((cur) => [...cur, ...next].slice(0, MAX_IMAGES));
  }, [setImages]);

  // Paste anywhere on the page, but never take over text paste in a field.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      if (locked || isEditableTarget(e.target as HTMLElement | null)) return;
      const files = Array.from(e.clipboardData?.files ?? []).filter((f) => f.type.startsWith("image/"));
      if (!files.length) return;
      e.preventDefault();
      void addFiles(files);
    };
    // A missed drop would make the browser open the file and leave the app.
    const swallow = (e: DragEvent) => { if (hasFiles(e.dataTransfer?.types)) e.preventDefault(); };
    document.addEventListener("paste", onPaste);
    window.addEventListener("dragover", swallow);
    window.addEventListener("drop", swallow);
    return () => {
      document.removeEventListener("paste", onPaste);
      window.removeEventListener("dragover", swallow);
      window.removeEventListener("drop", swallow);
    };
  }, [addFiles, locked]);

  const move = (i: number, by: number) => setImages((cur) => {
    const copy = [...cur];
    [copy[i], copy[i + by]] = [copy[i + by], copy[i]];
    return copy;
  });
  const remove = (i: number) => { setError(null); setImages((cur) => cur.filter((_, j) => j !== i)); };

  // The same screenshots as last time go straight back to the edited transcript, with no
  // new call; different ones would replace those edits, so the user is asked first.
  const plan = rereadPlan(s.transcript, s.readFrom, imagesKey(images));
  const onRead = () => {
    if (plan === "reuse") return update({ screen: "review", shots: images });
    if (plan === "ask") return setConfirmReplace(true);
    void extract();
  };

  const extract = async () => {
    setConfirmReplace(false);
    const controller = new AbortController();
    abort.current = controller;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/extract", {
        method: "POST", headers: { "Content-Type": "application/json" }, signal: controller.signal,
        body: JSON.stringify({ language: lang, images, consent: true }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) return setError(errorCode(res.status, json));
      const extraction = json.extraction as Extraction;
      const transcript = toTranscript(extraction, { me: t.add.me, unknown: t.add.unknown, other: (n) => (n === 1 ? t.add.otherPerson : `${t.add.otherPerson} ${n}`) });
      if (!transcript.messages.length) return setError("not_a_chat");
      update({ screen: "review", transcript, selfId: null, consent: false, shots: images, extractNotes: extraction.notes, readFrom: imagesKey(images) });
    } catch (e) {
      if (!(e instanceof DOMException && e.name === "AbortError")) setError("network");
    } finally {
      setBusy(false);
    }
  };

  const full = images.length >= MAX_IMAGES;
  const message = error && ((S.problems as Record<string, string>)[error] ?? (t.errors as Record<string, string>)[error] ?? t.errors.unknown);
  return (
    <div className="app-panel">
      <div className="im-notice"><Icon name="lock" /><div>{S.privacy} {S.tip}</div></div>

      <div className={`app-drop${dragging ? " is-drag" : ""}${full ? " is-full" : ""}`}
        onDragOver={(e) => { if (hasFiles(e.dataTransfer.types)) { e.preventDefault(); setDragging(true); } }}
        onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragging(false); }}
        onDrop={(e) => { e.preventDefault(); setDragging(false); if (!locked) void addFiles(Array.from(e.dataTransfer.files)); }}>
        <Icon name="image" />
        <p className="app-drop__title">{dragging ? S.dropNow : full ? S.full(MAX_IMAGES) : S.dropHere}</p>
        <p className="im-hint">{S.methods(MAX_IMAGES)}</p>
        <button className="im-btn im-btn--secondary" disabled={locked || full} onClick={() => input.current?.click()}>{images.length ? S.addMore : S.choose}</button>
        <input ref={input} type="file" hidden multiple accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={(e) => { void addFiles(Array.from(e.target.files ?? [])); e.target.value = ""; }} />
      </div>

      {images.length > 0 && (
        <>
          <p className="im-hint">{S.order}</p>
          <ol className="app-shots" aria-label={S.listLabel}>
            {images.map((src, i) => (
              <li key={src.slice(-40) + i} className="app-shot">
                <button className="app-shot__open" onClick={() => setViewing(i)} disabled={busy} aria-label={S.open(i + 1)}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- a local data URL, not an optimizable asset */}
                  <img src={src} alt={S.alt(i + 1)} />
                  <span className="app-shot__n" aria-hidden>{i + 1}</span>
                  <span className="app-shot__zoom" aria-hidden><Icon name="search" /></span>
                </button>
                <div className="app-shot__tools">
                  <button className="app-icon-btn" disabled={i === 0 || busy} onClick={() => move(i, -1)} aria-label={S.earlier(i + 1)}><span aria-hidden>←</span></button>
                  <button className="app-icon-btn" disabled={i === images.length - 1 || busy} onClick={() => move(i, 1)} aria-label={S.later(i + 1)}><span aria-hidden>→</span></button>
                  <button className="app-icon-btn" disabled={busy} onClick={() => remove(i)} aria-label={S.remove(i + 1)}><Icon name="trash" /></button>
                </div>
              </li>
            ))}
          </ol>
          {confirmReplace && <ReplaceNotice onReplace={() => void extract()} onKeep={() => { setConfirmReplace(false); update({ screen: "review", shots: images }); }} />}
          <label className="im-check"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} /> {t.review.consent}</label>
          <div className="app-actions">
            <button className="im-btn im-btn--primary" disabled={(!consent && plan !== "reuse") || busy} onClick={onRead}>{busy ? S.reading : plan === "reuse" ? S.continueRead : S.read}</button>
            {busy && <button className="im-btn im-btn--ghost" onClick={() => abort.current?.abort()}>{t.analyzing.cancel}</button>}
          </div>
        </>
      )}
      {busy && <WaitHint estimate={extractEstimate(images.length)} text={S.wait} slow={S.slow} />}
      {message && <p className={error === "tooMany" ? "im-hint" : "im-error"} role="alert"><Icon name="alert" />{message}</p>}
      {viewing !== null && <ShotLightbox images={images} index={viewing} onIndex={setViewing} onClose={() => setViewing(null)} />}
    </div>
  );
}

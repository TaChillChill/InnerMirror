"use client";
// Screenshot → extract. Produces the same Transcript as pasting; the user always lands on
// Review and nothing is analyzed until they confirm it there. Images arrive by picker,
// drag and drop or paste, all through one `addFiles` so the same limits apply. They live
// in the session draft, so Back from Review keeps them and their order. Up to 10 are read
// in parts (use-shot-reader.ts); if some parts fail, the rest is kept and the user chooses.
import { useCallback, useEffect, useRef, useState } from "react";
import { MAX_IMAGES, prepareImage, type ImageError } from "@/lib/image";
import { hasFiles, isEditableTarget, planIntake } from "@/lib/image-intake";
import { toTranscript, type Extraction } from "@/lib/ai/extraction";
import { imagesKey, rereadPlan } from "@/lib/conversation";
import { chunkImages, mergeExtractions, partRange } from "@/lib/shot-batches";
import { useShotReader, type Part } from "./use-shot-reader";
import type { Update } from "./App";
import type { Session } from "./session";
import { ReplaceNotice } from "./ReplaceNotice";
import { ShotLightbox } from "./ShotLightbox";
import { Icon, useT } from "./ui";
import { WaitHint } from "./Analyzing";
import { extractEstimate } from "@/lib/wait";

export function ShotUpload({ s, update }: { s: Session; update: Update }) {
  const { t, lang } = useT();
  const S = t.shot;
  const images = s.draft.images;
  const setImages = useCallback((next: (cur: string[]) => string[]) => update((cur) => ({ draft: { ...cur.draft, images: next(cur.draft.images) } })), [update]);
  const [confirmReplace, setConfirmReplace] = useState(false);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ignored, setIgnored] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [viewing, setViewing] = useState<number | null>(null);
  const onPart = useCallback((key: string, ex: Extraction) => update((cur) => ({ draft: { ...cur.draft, reads: { ...cur.draft.reads, [key]: ex } } })), [update]);
  const reader = useShotReader(lang, onPart);
  const busy = reader.busy;
  const input = useRef<HTMLInputElement>(null);
  const imagesRef = useRef(images);
  useEffect(() => { imagesRef.current = images; }, [images]);
  const locked = busy || viewing !== null;
  const list = useRef<HTMLOListElement>(null);
  const actions = useRef<HTMLDivElement>(null);
  const problem = useRef<HTMLParagraphElement>(null);
  // Bumped after every pick, so the effect below runs once the new thumbnails are on screen.
  const [picked, setPicked] = useState(0);
  // Touch screens can't drag or press Cmd+V, so they get the photo-library wording (UAT batch 2, A).
  // This panel only renders after a tap on the Add screen, never on the server.
  const [touch] = useState(() => typeof window !== "undefined" && matchMedia("(pointer: coarse)").matches);
  const addedLast = useRef(0);

  // After a pick, show what was added and the way on (UAT batch 2, #03): the thumbnails at the
  // top of the screen, or, if they and Continue don't fit together, Continue at the bottom with
  // the newest thumbnails above it. A failed pick shows its message instead. Nothing is sent.
  useEffect(() => {
    if (!picked) return;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    const target = addedLast.current ? list.current : problem.current;
    if (!target) return;
    const room = innerHeight - (parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--app-header-h")) || 64) - 24;
    const cta = actions.current;
    if (target === list.current && cta && cta.getBoundingClientRect().bottom - target.getBoundingClientRect().top > room) cta.scrollIntoView({ block: "end", behavior: still });
    else target.scrollIntoView({ block: "start", behavior: still });
  }, [picked]);

  // Adding never starts extraction: the user still has to tick consent and press Read.
  const addFiles = useCallback(async (files: File[]) => {
    const { accepted, ignored, notImages } = planIntake(files, MAX_IMAGES - imagesRef.current.length);
    if (!accepted.length && !ignored) {
      setError(notImages ? "format" : null);
      addedLast.current = 0;
      return setPicked((n) => n + 1);
    }
    setError(ignored ? "tooMany" : null);
    setIgnored(ignored);
    const next: string[] = [];
    for (const file of accepted) {
      try { next.push(await prepareImage(file)); }
      catch (e) { setError(e instanceof Error && ["format", "decode", "large"].includes(e.message) ? (e.message as ImageError) : "decode"); }
    }
    setImages((cur) => [...cur, ...next].slice(0, MAX_IMAGES));
    addedLast.current = next.length;
    setPicked((n) => n + 1);
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

  // A changed set of screenshots makes an earlier partial result meaningless.
  const key = imagesKey(images);
  const { clear } = reader;
  useEffect(() => { clear(); }, [key, clear]);

  const extract = async () => {
    setConfirmReplace(false);
    setError(null);
    // Reads of screenshots that were removed or moved since are dropped here.
    const keep = new Set(chunkImages(images).map(imagesKey));
    const cache = Object.fromEntries(Object.entries(s.draft.reads).filter(([k]) => keep.has(k)));
    update((cur) => ({ draft: { ...cur.draft, reads: cache } }));
    const out = await reader.read(images, cache);
    if (out.aborted) return reader.clear();
    const failed = out.parts.filter((p) => p.status !== "done");
    if (!failed.length) return finish(out.parts, out.results);
    if (failed.length === out.parts.length) { reader.clear(); setError(failed[0].error ?? "unknown"); }
    // Otherwise the partial notice below lets the user retry the failed parts or go on without them.
  };

  const finish = (parts: Part[], results: (Extraction | null)[]) => {
    const done = parts.filter((p) => p.status === "done" && results[p.index]);
    const extraction = mergeExtractions(done.map((p) => results[p.index] as Extraction));
    const transcript = toTranscript(extraction, { me: t.add.me, unknown: t.add.unknown, other: (n) => (n === 1 ? t.add.otherPerson : `${t.add.otherPerson} ${n}`) });
    if (!transcript.messages.length) { reader.clear(); return setError("not_a_chat"); }
    const skipped = parts.filter((p) => !done.includes(p)).map((p) => partRange(p.index, p.count)).join(", ");
    // Read from only what was used, so reading again after Back retries the missing parts.
    const used = chunkImages(images).filter((_, i) => done.some((p) => p.index === i)).flat();
    reader.clear();
    update({ screen: "review", transcript, selfId: null, consent: false, shots: images, extractNotes: extraction.notes, shotsSkipped: skipped, readFrom: imagesKey(used) });
  };

  const parts = reader.parts;
  const imagesDone = parts?.filter((p) => p.status === "done").reduce((n, p) => n + p.count, 0) ?? 0;
  const failedParts = !busy && parts ? parts.filter((p) => p.status === "failed") : [];
  const failedWhy = failedParts[0]?.error;

  const full = images.length >= MAX_IMAGES;
  const known = error ? (S.problems as Record<string, string | ((max: number, left: number) => string)>)[error] : undefined;
  const message = error && (typeof known === "function" ? known(MAX_IMAGES, ignored) : known ?? (t.errors as Record<string, string>)[error] ?? t.errors.unknown);
  return (
    <div className="app-panel">
      <div className={`app-drop${dragging ? " is-drag" : ""}${full ? " is-full" : ""}`}
        onDragOver={(e) => { if (hasFiles(e.dataTransfer.types)) { e.preventDefault(); setDragging(true); } }}
        onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragging(false); }}
        onDrop={(e) => { e.preventDefault(); setDragging(false); if (!locked) void addFiles(Array.from(e.dataTransfer.files)); }}>
        <Icon name="image" />
        <p className="app-drop__title">{dragging ? S.dropNow : full ? S.full(MAX_IMAGES) : touch ? S.dropHereTouch : S.dropHere}</p>
        <p className="im-hint">{touch ? S.methodsTouch(MAX_IMAGES) : S.methods(MAX_IMAGES)}</p>
        <button className="im-btn im-btn--secondary" disabled={locked || full} onClick={() => input.current?.click()}>{images.length ? S.addMore : S.choose}</button>
        <input ref={input} type="file" hidden multiple accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={(e) => { void addFiles(Array.from(e.target.files ?? [])); e.target.value = ""; }} />
      </div>

      {images.length > 0 && (
        <>
          <p className="im-hint" role="status"><strong>{S.added(images.length, MAX_IMAGES)}</strong> {S.order}</p>
          <ol className="app-shots" aria-label={S.listLabel} ref={list}>
            {images.map((src, i) => (
              <li key={src.slice(-40) + i} className="app-shot">
                <button className="app-shot__open" onClick={() => setViewing(i)} disabled={busy} aria-label={S.open(i + 1)}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- a local data URL, not an optimizable asset */}
                  <img src={src} alt={S.alt(i + 1)} decoding="async" />
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
        </>
      )}
      {/* Privacy after the upload area, never removed: it still sits right above consent (UAT batch 2, #02). */}
      <div className="im-notice"><Icon name="lock" /><div>{S.privacy} {S.tip}</div></div>
      {images.length > 0 && (
        <>
          {confirmReplace && <ReplaceNotice onReplace={() => void extract()} onKeep={() => { setConfirmReplace(false); update({ screen: "review", shots: images }); }} />}
          <label className="im-check"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} /> {t.review.consent}</label>
          <div className="app-actions" ref={actions}>
            <button className="im-btn im-btn--primary" disabled={(!consent && plan !== "reuse") || busy} onClick={onRead}>{busy ? S.reading : S.read}</button>
            {busy && <button className="im-btn im-btn--ghost" onClick={reader.cancel}>{t.analyzing.cancel}</button>}
          </div>
        </>
      )}
      {busy && <WaitHint estimate={extractEstimate(images.length)} text={S.wait} slow={S.slow} />}
      {busy && parts && parts.length > 1 && <p className="im-hint" role="status">{S.progress(imagesDone, images.length)}</p>}
      {failedParts.length > 0 && (
        <div className="im-notice app-partial" role="alert"><Icon name="alert" /><div>
          <p>{S.partial(imagesDone, images.length, failedParts.map((p) => partRange(p.index, p.count)).join(", "))} {failedWhy && failedWhy !== "aborted" ? (t.errors as Record<string, string>)[failedWhy] ?? t.errors.unknown : ""}</p>
          <p>{S.partialKeep}</p>
          <div className="app-actions">
            <button className="im-btn im-btn--primary" disabled={!consent} onClick={() => void extract()}>{S.retryFailed}</button>
            <button className="im-btn im-btn--secondary" onClick={() => parts && finish(parts, parts.map((p) => s.draft.reads[p.key] ?? null))}>{S.continueWithout}</button>
          </div>
        </div></div>
      )}
      {message && <p ref={problem} className={error === "tooMany" ? "im-hint" : "im-error"} role="alert"><Icon name="alert" />{message}</p>}
      {viewing !== null && <ShotLightbox images={images} index={viewing} onIndex={setViewing} onClose={() => setViewing(null)} />}
    </div>
  );
}

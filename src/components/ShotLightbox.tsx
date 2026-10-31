"use client";
// Larger view of one screenshot with zoom and prev/next, so the user can tell the images
// apart and order them. A native <dialog> gives focus trapping, Esc and a backdrop.
import { useEffect, useRef, useState } from "react";
import { Icon, useT } from "./ui";

const ZOOMS = [1, 1.5, 2, 3];

type Props = { images: string[]; index: number; onIndex: (i: number) => void; onClose: () => void };

export function ShotLightbox({ images, index, onIndex, onClose }: Props) {
  const { t } = useT();
  const S = t.shot;
  const ref = useRef<HTMLDialogElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const [zoomAt, setZoomAt] = useState(0);
  const zoom = ZOOMS[zoomAt];

  useEffect(() => { ref.current?.showModal(); }, []);
  // A different screenshot starts fitted and scrolled to the top.
  const go = (by: number) => {
    onIndex(Math.min(images.length - 1, Math.max(0, index + by)));
    setZoomAt(0);
    scroller.current?.scrollTo({ top: 0, left: 0 });
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") go(-1);
    else if (e.key === "ArrowRight") go(1);
    else if (e.key === "+" || e.key === "=") setZoomAt((z) => Math.min(ZOOMS.length - 1, z + 1));
    else if (e.key === "-") setZoomAt((z) => Math.max(0, z - 1));
  };

  return (
    <dialog ref={ref} className="app-lb" aria-label={S.alt(index + 1)} onClose={onClose} onKeyDown={onKey}
      onClick={(e) => { if (e.target === ref.current) ref.current?.close(); }}>
      <div className="app-lb__bar">
        <strong className="app-lb__count" aria-live="polite">{S.position(index + 1, images.length)}</strong>
        <div className="app-lb__tools">
          <button className="app-icon-btn" disabled={index === 0} onClick={() => go(-1)} aria-label={S.prev}><span aria-hidden>←</span></button>
          <button className="app-icon-btn" disabled={index === images.length - 1} onClick={() => go(1)} aria-label={S.next}><span aria-hidden>→</span></button>
          <button className="app-icon-btn" disabled={zoomAt === 0} onClick={() => setZoomAt((z) => z - 1)} aria-label={S.zoomOut}><span aria-hidden>−</span></button>
          <span className="app-lb__zoom" aria-live="polite">{Math.round(zoom * 100)}%</span>
          <button className="app-icon-btn" disabled={zoomAt === ZOOMS.length - 1} onClick={() => setZoomAt((z) => z + 1)} aria-label={S.zoomIn}><span aria-hidden>+</span></button>
          <button className="im-btn im-btn--primary im-btn--sm" onClick={() => ref.current?.close()}>{S.close}</button>
        </div>
      </div>
      <div className="app-lb__scroll" ref={scroller} tabIndex={0} aria-label={S.scrollHint}>
        {/* eslint-disable-next-line @next/next/no-img-element -- a local data URL */}
        <img src={images[index]} alt={S.alt(index + 1)} style={{ width: `${zoom * 100}%` }} />
      </div>
      <p className="im-hint app-lb__hint"><Icon name="image" /> {S.lightboxHint}</p>
    </dialog>
  );
}

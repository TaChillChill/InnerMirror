// Film viewer: the Remotion Player (play/pause, scrubber, fullscreen, sound) plus scene and
// demo-beat jump buttons and a live label saying what kind of footage is on screen.
import { StrictMode, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Player, type PlayerRef } from "@remotion/player";
import { loadFont } from "@remotion/google-fonts/Nunito";
import { Film } from "./Film";
import { BEATS, beatStarts } from "./scenes/Demo";
import { FPS, HEIGHT, SCENES, TOTAL_SEC, WIDTH, s, type Kind } from "./story";

loadFont("normal", { weights: ["400", "500", "600", "700", "800"], subsets: ["latin"] });

const KIND: Record<Kind, string> = { motion: "Motion (illustration)", real: "Real app · live Muse output", mixed: "Real app + motion" };
const BEAT_TITLE: Record<string, string> = {
  D1: "Snap → upload screenshots → Muse reads them", D2: "Review every line · consent", D3: "What Mirror sees (+ real shifts)",
  D5: "My interpretation", D6: "What if?", D7: "Save to My Reflection",
};
const mmss = (sec: number) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;
const S6 = SCENES.find((x) => x.id === "S6")!.from;

function App() {
  const ref = useRef<PlayerRef>(null);
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const p = ref.current;
    if (!p) return;
    const on = () => setFrame(p.getCurrentFrame());
    p.addEventListener("frameupdate", on);
    p.addEventListener("seeked", on);
    // ?t=95 opens the film at 1:35, handy for sharing a moment in review notes.
    const t = Number(new URLSearchParams(location.search).get("t"));
    if (t > 0) { p.seekTo(s(t)); setFrame(s(t)); }
    return () => { p.removeEventListener("frameupdate", on); p.removeEventListener("seeked", on); };
  }, []);
  const sec = frame / FPS;
  const cur = SCENES.find((x) => sec >= x.from && sec < x.to) ?? SCENES[SCENES.length - 1];
  const bi = cur.id === "S6" ? beatStarts.findLastIndex((b) => frame - s(S6) >= b) : -1;
  const go = (f: number) => { ref.current?.seekTo(f); setFrame(f); };

  return (
    <main>
      <header>
        <h1>InnerMirror · demo film rough cut</h1>
        <p>Rough cut V1 for Founder review. Sound is synthesized placeholder; the music beds will be replaced. <a href="/out/innermirror-roughcut.mp4" download>Download MP4</a></p>
      </header>
      <Player ref={ref} component={Film} durationInFrames={s(TOTAL_SEC)} fps={FPS} compositionWidth={WIDTH} compositionHeight={HEIGHT}
        controls clickToPlay numberOfSharedAudioTags={0} acknowledgeRemotionLicense style={{ width: "100%", aspectRatio: "16 / 9", borderRadius: 12, overflow: "hidden" }} />
      <section className="now">
        <strong>{mmss(sec)} · {cur.id} {cur.title}{bi >= 0 ? ` · ${BEATS[bi].id} ${BEAT_TITLE[BEATS[bi].id]}` : ""}</strong>
        <span className={`kind kind--${cur.kind}`}>{KIND[cur.kind]}</span>
        <p>{cur.note}</p>
      </section>
      <nav aria-label="Scenes">
        {SCENES.map((x) => (
          <button key={x.id} onClick={() => go(s(x.from))} aria-current={x.id === cur.id}>
            <b>{x.id}</b> {x.title}<small>{mmss(x.from)}–{mmss(x.to)} · {x.to - x.from}s</small>
          </button>
        ))}
      </nav>
      <nav aria-label="Demo beats" className="beats">
        {BEATS.map((b, i) => (
          <button key={b.id} onClick={() => go(s(S6) + beatStarts[i])} aria-current={bi === i}>
            <b>{b.id}</b> {BEAT_TITLE[b.id]}<small>{mmss(S6 + beatStarts[i] / FPS)}</small>
          </button>
        ))}
      </nav>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);

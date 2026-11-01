// Wave 1 (U1 + U2): two ways to start, the story box with an in-app mic, and its fallbacks.
// The browser's speech recognizer is stubbed, so no microphone or speech service is used.
import { launch, HELPERS } from "./cdp.mjs";

const width = Number(process.argv[2] ?? 390);
// mode: ok = says one phrase per start; denied = permission refused; none = no API at all.
const stub = (mode) => `
  (() => {
    if (${JSON.stringify(mode)} === "none") { delete window.webkitSpeechRecognition; delete window.SpeechRecognition; return; }
    let said = 0;
    class Fake {
      start() { window.__micStarts = (window.__micStarts || 0) + 1; setTimeout(() => {
        if (${JSON.stringify(mode)} === "denied") { this.onerror?.({ error: "not-allowed" }); this.onend?.(); return; }
        const phrase = ["Mẹ nói: Sao giờ này mới về?", "Mình đáp: Con xin lỗi."][said++ % 2];
        this.onresult?.({ resultIndex: 0, results: [{ isFinal: true, 0: { transcript: phrase } }] });
        this.onend?.();
      }, 60); }
      stop() { setTimeout(() => this.onend?.(), 10); }
      abort() {}
    }
    window.webkitSpeechRecognition = Fake; window.SpeechRecognition = Fake;
  })();`;
const results = [];
const check = (name, ok, extra = "") => results.push(`${ok ? "PASS" : "FAIL"} ${name}${extra ? ` (${extra})` : ""}`);
for (const mode of ["ok", "denied", "none"]) {
  const b = await launch({ width, height: 800 });
  try {
    await b.addInit(stub(mode));
    await b.goto("http://localhost:3123/");
    await b.evaluate(`localStorage.setItem("innermirror.lang", "vi"); location.reload()`);
    await b.sleep(1500);
    const step = async (js) => { await b.evaluate(HELPERS); return b.evaluate(js); };
    await step(`$click(".lp-cta"); $wait(300)`);
    if (mode === "ok") check("two entry cards: Có sẵn cuộc trò chuyện / Kể lại", await step(`[...document.querySelectorAll("[role=radio] strong")].map((x) => x.textContent).join("|") === "Có sẵn cuộc trò chuyện|Kể lại"`));
    await step(`$click("[role=radio]", "Kể lại"); $wait(600)`);
    if (mode === "ok") {
      check("choosing a card brings its input into view", await step(`(() => { const r = document.querySelector("#paste").getBoundingClientRect(); return r.top >= 0 && r.top < innerHeight; })()`));
      await step(`$click(".app-mic__btn"); $wait(400)`);
      check("mic shows a listening state", await step(`document.querySelector(".app-mic__btn").getAttribute("aria-pressed") === "true" && /Đang nghe/.test(document.querySelector(".app-mic__btn").textContent)`));
      await step(`$click(".app-mic__btn"); $wait(300)`);
      const text = await step(`document.querySelector("#paste").value`);
      check("spoken phrases land in the box, editable", text.includes("Mẹ nói: Sao giờ này mới về?") && await step(`!document.querySelector("#paste").readOnly`), text);
      check("tap again stops listening", await step(`document.querySelector(".app-mic__btn").getAttribute("aria-pressed") === "false"`));
      check("mic privacy line shown", await step(`!!$t(".app-mic .im-hint", "Apple hoặc Google")`));
      check("nothing sent while dictating", b.api.length === 0);
    }
    if (mode === "denied") {
      await step(`$click(".app-mic__btn"); $wait(400)`);
      check("permission refused → clear message, keyboard fallback named", await step(`!!$t(".app-mic .im-error", "chưa cho dùng mic") && document.querySelector(".app-mic__btn").getAttribute("aria-pressed") === "false"`));
    }
    if (mode === "none") check("no speech API → no mic button, keyboard hint instead", await step(`!document.querySelector(".app-mic__btn") && !!$t(".im-hint", "micro trên bàn phím")`));
    check(`[${mode}] nothing wider than the screen`, await step(`[".app-page", ".app-methods"].every((q) => document.querySelector(q).getBoundingClientRect().right <= innerWidth + 0.5)`));
  } catch (e) {
    results.push(`ERROR [${mode}] ${e.message}`);
  } finally { b.close(); }
}
console.log(`width ${width}\n` + results.join("\n"));

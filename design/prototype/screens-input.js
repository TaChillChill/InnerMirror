// Landing, Add a conversation, loading states and the stepper.
window.ScreensInput = (function () {
  const D = window.IM_DATA;
  const { esc, icon, mascot, decision } = window.UI;

  const PRIVACY = {
    flow: "We don't keep your conversation. When you continue, it's sent to Meta's AI model to be read, and Meta may keep it as described in its terms. Nothing is saved on this device unless you tap Save.",
    shot: "We don't save your screenshots. They're sent to Meta's AI model as they are, including any names or photos in them, and are dropped from this page once you confirm the conversation.",
  };

  function stepper(S) {
    const idx = { add: 0, reading: 0, review: 0, analyzing: 0, replay: 1 }[S.screen] ?? (S.screen === "mirror" && S.transcript ? 2 : undefined);
    if (idx === undefined) return "";
    return `<nav aria-label="Progress"><ol class="im-stepper pt-stepper">${["Conversation", "Replay", "My Mirror"].map((s, i) =>
      `<li><span class="${i < idx ? "is-done" : ""}"${i === idx ? ' aria-current="step"' : ""}>${s}</span></li>`).join("")}</ol></nav>`;
  }

  function landing(S) {
    const n = S.saved.length + S.demoSaved.length;
    const back = n ? `
      <section class="pt-welcome-back">
        <div class="pt-welcome-back__stickers" aria-hidden="true">${D.EX_ORDER.slice(0, 3).map((ex) => window.UI.badge(ex, "plain", 40)).join("")}</div>
        <div><strong>Welcome back</strong><p>${n} collection${n > 1 ? "s" : ""} saved in this browser.</p></div>
        <button class="im-btn im-btn--secondary im-btn--sm" data-go="mirror">Open My Mirror</button>
      </section>` : "";
    return `<div class="pt-page pt-landing">
      ${back}
      <section class="pt-hero">
        <h1 class="pt-display">Meet your inner selves</h1>
        <p class="pt-lead">Look back at a conversation you were part of. InnerMirror suggests how each message might have come across, so you can notice how <em>you</em> shifted. You decide what fits.</p>
        <div class="pt-actions pt-hero__ctas">
          <button class="im-btn im-btn--primary" data-action="start">Start with a conversation</button>
          <span class="pt-cta-sub"><button class="im-btn im-btn--secondary" data-action="demo">See how it works</button><small>A short demo with a made-up conversation</small></span>
        </div>
        <p class="im-hint">Not therapy or a diagnosis. Every reading is a possibility you decide on.</p>
      </section>
      <section aria-labelledby="cast">
        <h2 id="cast" class="pt-h2">Five ways a message can sound</h2>
        <ul class="pt-cast">${D.EX_ORDER.map((ex) => `<li class="im-ex" data-ex="${ex}">${mascot(ex)}<strong>${D.EX[ex].name}</strong><span>${D.EX[ex].short}</span></li>`).join("")}</ul>
        <p class="im-hint">They describe messages, not people. Everyone uses all five, and none is better than another.</p>
      </section>
      <section aria-labelledby="how">
        <h2 id="how" class="pt-h2">How it works</h2>
        <ol class="pt-how">
          <li><strong>Add a conversation</strong><span>Screenshots, or paste or type it.</span></li>
          <li><strong>Replay it</strong><span>See a possible character for each message, where things shifted, and what might happen if you replied differently.</span></li>
          <li><strong>Decide what fits for you</strong><span>Agree, choose another, or stay unsure.</span></li>
          <li><strong>Keep it in My Mirror</strong><span>Stickers for the characters you chose, saved only in this browser.</span></li>
        </ol>
      </section>
      <div class="im-notice">${icon("lock")}<div><strong>Your conversation stays yours</strong>${esc(PRIVACY.flow)}</div></div>
    </div>`;
  }

  function mockShot() {
    return `<div class="pt-shot" role="img" aria-label="Synthetic chat screenshot">
      <div class="pt-shot__top">Linh</div>
      ${D.messages.map((m, i) => `<div class="pt-shot__b ${m.speakerId === "p2" ? "is-me" : ""} ${i === 2 ? "is-cut" : ""}">${esc(m.text)}</div>`).join("")}
      <div class="pt-shot__meta">21:14</div>
    </div>`;
  }

  function add(S) {
    const shot = S.method === "screenshot";
    const preview = S.shotUrl ? `<img class="pt-shot-img" src="${S.shotUrl}" alt="Your screenshot preview">` : S.shotSynthetic ? mockShot() : "";
    return `<div class="pt-page">
      <h1 class="pt-h1">Add a conversation</h1>
      <p class="pt-lead">Pick one you were part of. You'll see it as a chat and can fix anything before it's looked at.</p>
      <div class="pt-methods" role="radiogroup" aria-label="How do you want to add it?">
        <button class="pt-method" role="radio" aria-checked="${shot}" data-action="method" data-method="screenshot">${icon("image")}<span><strong>Upload screenshots</strong><small>From any chat app, up to 3 in a row.</small></span></button>
        <button class="pt-method" role="radio" aria-checked="false" data-action="method" data-method="paste">${icon("text")}<span><strong>Paste or type</strong><small>Paste a chat, or write it from memory, message by message.</small></span></button>
      </div>
      ${shot ? `<div class="pt-panel">
        <label class="pt-drop">${icon("image")}<span><strong>Choose screenshots</strong><br><span class="im-hint">PNG or JPG, in the order they happened</span></span>
          <input type="file" accept="image/png,image/jpeg" class="pt-visually-hidden"></label>
        <button class="im-btn im-btn--ghost im-btn--sm" data-action="useSyntheticShot">Or use a synthetic test screenshot</button>
        ${preview}
        <p class="im-hint">Tip: crop out names, phone numbers and profile photos if you can.</p>
        ${S.shotUrl ? `<p class="im-notice">${icon("alert")}<span>Prototype: your image stays in this tab only, and the sample conversation is used in its place.</span></p>` : ""}
        <div><button class="im-btn im-btn--primary" data-action="readShot" ${S.shotUrl || S.shotSynthetic ? "" : "disabled"}>Read my screenshot</button></div>
        <p class="im-hint">${esc(PRIVACY.shot)}</p>
      </div>` : ""}
      ${decision("Q29", "Up to 3 screenshots per conversation, if the feasibility test passes for several images.")}
    </div>`;
  }

  const loading = (title, body) => `<div class="pt-page pt-loading" aria-live="polite">
    <button class="im-btn im-btn--secondary" aria-busy="true" disabled>${esc(title)}</button><p class="im-hint">${esc(body)}</p></div>`;

  return { stepper, landing, add, loading, mockShot, PRIVACY };
})();

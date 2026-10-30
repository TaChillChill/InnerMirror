// Transcript review as a chat: bubbles first, editing only when a bubble is tapped.
// The same editor serves screenshots, pasting and typing from memory.
window.ScreensReview = (function () {
  const { esc, icon, avatar, displayName, decision } = window.UI;

  // Before "This is me" is chosen, keep the screenshot's sides: the second speaker is on the right.
  const isRight = (S, m) => (S.selfId ? m.speakerId === S.selfId : m.speakerId === S.transcript.participants[1]?.id);

  function whoIsYou(S) {
    const T = S.transcript;
    return `<section class="pt-who" aria-labelledby="who">
      <h2 id="who" class="pt-who__q">Which one is you?</h2>
      <div class="pt-who__opts">${T.participants.map((p) => `
        <div class="pt-who__opt">
          <button class="pt-who__btn" aria-pressed="${S.selfId === p.id}" data-action="self" data-id="${p.id}">
            ${avatar({ ...S, selfId: null }, p.id, 40)}<span>${esc(displayName(S, p))}</span>${S.selfId === p.id ? `<span class="pt-who__me">${icon("check")} you</span>` : ""}
          </button>
          <button class="pt-icon-btn" data-action="rename" data-id="${p.id}" aria-label="Rename ${esc(displayName(S, p))}">${icon("edit")}</button>
          ${S.renaming === p.id ? `<input class="im-input pt-rename" aria-label="Name" data-name="${p.id}" value="${esc(p.display)}">` : ""}
        </div>`).join("")}</div>
      ${S.method === "screenshot" ? `<label class="im-check"><input type="checkbox" data-action="useNames" ${S.useNames ? "checked" : ""}> Show the names from the screenshot (hidden by default)</label>` : ""}
    </section>`;
  }

  function bubble(S, m) {
    const right = isRight(S, m);
    if (S.editing === m.id) {
      return `<li class="pt-rv-msg ${right ? "is-right" : ""}"><div class="pt-rv-edit">
        <label class="im-label" for="edit-${m.id}">Message</label>
        <textarea id="edit-${m.id}" class="im-textarea" rows="3" data-line="${m.id}">${esc(m.text)}</textarea>
        <div class="pt-rv-edit__row"><span class="im-label">Sent by</span>
          ${S.transcript.participants.map((p) => `<button class="pt-chip-btn" aria-pressed="${m.speakerId === p.id}" data-action="sender" data-id="${m.id}" data-pid="${p.id}">${avatar(S, p.id, 24)}${esc(window.UI.nameOf(S, p.id))}</button>`).join("")}</div>
        <div class="pt-actions"><button class="im-btn im-btn--primary im-btn--sm" data-action="doneEdit">Done</button>
          <button class="im-btn im-btn--ghost im-btn--sm" data-action="delMsg" data-id="${m.id}">${icon("trash")} Delete</button></div>
      </div></li>`;
    }
    const partial = m.legibility === "partial";
    return `<li class="pt-rv-msg ${right ? "is-right" : ""}">
      ${right ? "" : avatar(S, m.speakerId, 32)}
      <button class="im-bubble pt-rv-bubble ${partial ? "is-partial" : ""}" data-action="edit" data-id="${m.id}" aria-label="${esc(window.UI.nameOf(S, m.speakerId))}: ${esc(m.text)}. Tap to edit">
        ${esc(m.text)}${partial ? `<span class="pt-rv-flag">${icon("alert")} May be cut off · tap to fix</span>` : ""}
      </button>
    </li>`;
  }

  function composer(S) {
    const T = S.transcript;
    return `<section class="pt-composer" aria-label="Add a message">
      <div class="pt-composer__who"><span class="im-label">Who said it?</span>
        ${T.participants.map((p) => `<button class="pt-chip-btn" aria-pressed="${(S.composerSpeaker || T.participants[0].id) === p.id}" data-action="composerSpeaker" data-pid="${p.id}">${avatar(S, p.id, 24)}${esc(window.UI.nameOf(S, p.id))}</button>`).join("")}</div>
      <div class="pt-composer__row">
        <input id="composer" class="im-input" placeholder="Type a message" aria-label="Message" data-bind="composerText" value="${esc(S.composerText)}">
        <button class="im-btn im-btn--secondary" data-action="addMsg">${icon("plus")} Add</button>
      </div>
      <button class="pt-textlink" data-action="togglePaste">${S.pasteOpen ? "Hide pasting" : "Paste many lines at once"}</button>
      ${S.pasteOpen ? `<div class="im-field">
        <label class="im-label" for="paste">One message per line, like Name: message</label>
        <textarea id="paste" class="im-textarea" rows="6" data-bind="pasteText">${esc(S.pasteText)}</textarea>
        <div class="pt-actions"><button class="im-btn im-btn--secondary im-btn--sm" data-action="applyPaste">Add these lines</button>
          <button class="pt-textlink" data-action="exampleText">Use the example text (prototype)</button></div></div>` : ""}
    </section>`;
  }

  function review(S) {
    const T = S.transcript, shot = S.method === "screenshot";
    const partial = T.messages.filter((m) => m.legibility === "partial").length;
    const ready = S.selfId && S.consent && T.messages.length >= 2;
    const missing = !S.selfId ? "Choose which one is you." : T.messages.length < 2 ? "Add at least two messages so there is an exchange to look at." : !S.consent ? "Tick the box to continue." : "";
    return `<div class="pt-page">
      <h1 class="pt-h1">${T.messages.length ? "Check the conversation" : "Write or paste the conversation"}</h1>
      <p class="pt-lead">${T.messages.length ? "This is what will be looked at. Tap any message to fix it." : "Add the messages in order. From memory is fine: it doesn't need to be word for word."}</p>
      ${whoIsYou(S)}
      ${partial ? `<div class="im-notice">${icon("alert")}<div><strong>${partial} message may be cut off</strong>Tap it to complete it if you remember.</div></div>` : ""}
      <div class="${shot ? "pt-review-grid" : ""}">
        ${shot && !S.shotHidden ? `<details class="pt-compare-shot" ${matchMedia("(min-width: 860px)").matches ? "open" : ""}><summary>Compare with screenshot</summary>${window.ScreensInput.mockShot()}<p class="im-hint">Only shown here. Dropped when you continue.</p><button class="im-btn im-btn--ghost im-btn--sm" data-action="hideShot">${icon("trash")} Remove screenshot now</button></details>` : ""}
        <div class="pt-stack">
          ${T.messages.length ? `<ol class="pt-rv-thread" aria-label="Conversation">${T.messages.map((m) => bubble(S, m)).join("")}</ol>`
            : `<div class="pt-empty-chat">${icon("text")}<p>No messages yet. Add them below.</p></div>`}
          ${composer(S)}
        </div>
      </div>
      ${S.method === "paste" ? `<p class="im-hint">Written from memory? The AI will treat the wording as approximate. Prototype: the analysis that follows uses the sample chat.</p>` : ""}
      <label class="im-check"><input type="checkbox" data-action="consent" ${S.consent ? "checked" : ""}> This is a conversation I'm part of, and I'm using it for my own reflection.</label>
      <div class="pt-actions">
        <button class="im-btn im-btn--primary" data-action="analyze" ${ready ? "" : "disabled"}>Look at this conversation</button>
        <button class="im-btn im-btn--ghost" data-go="add">Back</button>
      </div>
      ${missing ? `<p class="im-hint" aria-live="polite">${missing}</p>` : ""}
      ${shot ? decision("UX-1", "Screenshots: suggest the right-hand speaker as you (still confirmable), or always ask? Prototype asks.") : ""}
    </div>`;
  }

  return { review };
})();

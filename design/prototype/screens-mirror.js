// My Mirror: one sticker per message of mine (AI-suggested until I review it),
// a note to my future self, Save, saved collections and patterns (mirror-patterns.js).
window.ScreensMirror = (function () {
  const D = window.IM_DATA;
  const { esc, icon, badge, mascot, fmtDate } = window.UI;
  const VISIBLE = 18;  // long conversations show the first stickers, then "Show all"

  // Illustrative collections (reviewer toggle) use the saved shape but are never stored.
  const seeded = () => D.demoCollections.map((c, i) => ({
    v: 1, id: "seed" + i, illustrative: true, createdAt: new Date(Date.now() - c.days * 864e5).toISOString(),
    title: c.title, note: c.note, participants: 2, whatIf: [],
    mine: c.mine.map(([ai, chosen], order) => ({ order, ai, chosen })),
  }));
  const all = (S) => [...S.demoSaved.map((c) => ({ ...c, demoSaved: true })), ...S.saved, ...(S.seedDemo ? seeded() : [])];

  // suggested: AI only, not reviewed · agreed · changed · unsure
  const stateOf = (m) => (!m.chosen ? "suggested" : m.chosen === "unsure" ? "unsure" : m.chosen === m.ai ? "agreed" : "changed");
  const shown = (m) => m.chosen || m.ai;
  const isQ = (ex) => ex === "unsure" || ex === "UNCLEAR";
  const nameOfEx = (ex) => (isQ(ex) ? "Not sure" : D.EX[ex].name);
  const STATE_LABEL = { suggested: "AI suggested", agreed: "Confirmed", changed: "My choice", unsure: "Not sure" };

  // The artwork is never dimmed or recoloured (brand rule): "not reviewed" lives in the
  // tile — recessed, dashed, labelled — while the mascot stays as drawn.
  function sticker(m, clickable) {
    const st = stateOf(m), ex = shown(m);
    const art = isQ(ex) ? `<span class="pt-sticker__q" aria-hidden="true">?</span>` : mascot(ex);
    const was = st === "changed" ? `<span class="pt-sticker__was" title="AI suggested ${nameOfEx(m.ai)}">${badge(isQ(m.ai) ? "unsure" : m.ai, "suggested", 24)}</span>` : "";
    const mark = st === "agreed" ? `<span class="pt-sticker__mark">${icon("check")}</span>` : st === "changed" ? `<span class="pt-sticker__mark">${icon("dot")}</span>` : "";
    const label = `${nameOfEx(ex)}, ${STATE_LABEL[st]}${st === "changed" ? `, AI suggested ${nameOfEx(m.ai)}` : ""}`;
    const inner = `${was}${mark}${art}<strong>${nameOfEx(ex)}</strong><span class="pt-sticker__state">${st === "suggested" ? icon("eye") : ""}${STATE_LABEL[st]}</span>`;
    return clickable
      ? `<li><button class="pt-sticker im-ex" data-state="${st}" data-ex="${ex}" data-action="goMsg" data-id="${m.id}" aria-label="${esc(label)}. Open the message">${inner}</button></li>`
      : `<li class="pt-sticker im-ex" data-state="${st}" data-ex="${ex}" aria-label="${esc(label)}">${inner}</li>`;
  }

  function summary(mine, tapHint) {
    const count = {}; let open = 0;
    for (const m of mine) { const ex = isQ(shown(m)) ? "unsure" : shown(m); count[ex] = (count[ex] || 0) + 1; if (!m.chosen) open++; }
    const keys = [...D.EX_ORDER, "unsure"].filter((k) => count[k]);
    return `<ul class="pt-tally">${keys.map((k) => `<li>${k === "unsure" ? badge("unsure", "unsure", 24) : badge(k, "plain", 24)}${nameOfEx(k)} <strong>${count[k]}</strong></li>`).join("")}</ul>
      <p class="im-hint">${mine.length} of my messages${open ? ` · ${open} still an AI suggestion (dashed)` : ""}.${tapHint ? " Tap a sticker to look at its message again." : ""}</p>`;
  }

  function stickers(mine, clickable, S) {
    const many = mine.length > VISIBLE && !S.showAll;
    return `<ul class="pt-stickers">${(many ? mine.slice(0, VISIBLE) : mine).map((m) => sticker(m, clickable)).join("")}</ul>
      ${many ? `<button class="im-btn im-btn--ghost im-btn--sm" data-action="showAll">Show all ${mine.length}</button>` : ""}`;
  }

  function currentMine(S) {
    const R = window.ScreensReplay;
    return S.transcript.messages.filter((m) => m.speakerId === S.selfId).map((m, order) => {
      const ai = R.reading(m.id).ex;
      return { id: m.id, order, ai: ai === "unsure" ? "UNCLEAR" : ai, chosen: S.choices[m.id]?.ex || null };
    });
  }

  function currentCard(S) {
    const mine = currentMine(S);
    return `<section class="pt-current" aria-labelledby="cur">
      <h2 id="cur" class="pt-h2">From this conversation</h2>
      ${stickers(mine, true, S)}
      ${summary(mine, true)}
      ${S.tried.length ? `<p class="pt-tried">${icon("branch")}<span>I explored replying as ${[...new Set(S.tried.map((t) => D.EX[t.ex].name))].join(", ")}.</span></p>` : ""}
      <div class="im-field"><label class="im-label" for="title">What was this about? (optional)</label>
        <input id="title" class="im-input" data-bind="title" value="${esc(S.title)}" placeholder="For example: Chores with Linh">
        <span class="im-hint">Helps you recognize it later. Keep it short.</span></div>
      <div class="im-field"><label class="im-label" for="note">Next time, I want to remember… (optional)</label>
        <textarea id="note" class="im-textarea" rows="3" data-bind="note">${esc(S.note)}</textarea>
        <span class="im-hint">Tip: your keyboard's microphone lets you say it instead of typing.</span></div>
      <details class="pt-more"><summary>What gets saved?</summary>
        <ul class="pt-saved-list"><li><strong>Saved:</strong> for each of your messages, the AI's suggested character and your own choice if you made one (unreviewed ones stay marked "AI suggested"); your title and note; the date; which characters you tried in What if?.</li>
          <li><strong>Not saved:</strong> the messages, screenshots, names, the AI's explanations, What-if replies, or anything about other people's messages.</li>
          <li><strong>Where:</strong> only in this browser on this device. No account, no backup.</li></ul></details>
      <div class="pt-actions">
        <button class="im-btn im-btn--primary" data-action="save">${icon("saved")} Save to this device</button>
        <button class="im-btn im-btn--ghost" data-action="dontSave">Don't save</button>
      </div>
      ${S.demo ? `<p class="im-hint">Demo: a saved demo stays only until you reload or close this tab.</p>` : ""}
    </section>`;
  }

  function card(c) {
    const max = 12, rest = c.mine.length - max;
    return `<li><button class="pt-coll" data-action="viewColl" data-id="${c.id}">
      <span class="pt-coll__badges" aria-label="${c.mine.length} stickers">${c.mine.slice(0, max).map((m) => {
        const ex = shown(m); return badge(isQ(ex) ? "unsure" : ex, stateOf(m), 28);
      }).join("")}${rest > 0 ? `<span class="pt-coll__more">+${rest}</span>` : ""}</span>
      <strong>${esc(c.title || "Untitled conversation")}</strong>
      <span class="pt-coll__meta">${fmtDate(c.createdAt)} · ${c.mine.length} messages${c.demoSaved ? " · Demo" : ""}${c.illustrative ? " · Illustrative" : ""}</span>
      ${c.note ? `<span class="pt-coll__note">“${esc(c.note)}”</span>` : ""}</button></li>`;
  }

  function collections(list) {
    if (!list.length) return `<div class="pt-empty">
      <div class="pt-empty__art" aria-hidden="true">${["a", "fc"].map((ex) => mascot(ex)).join("")}</div>
      <h2 class="pt-empty__title">No collections yet</h2><p>When you save a conversation, a sticker for each of your messages appears here.</p>
      <div class="pt-actions"><button class="im-btn im-btn--primary" data-action="start">Start with a conversation</button>
        <button class="im-btn im-btn--ghost" data-action="demo">See how it works</button></div></div>`;
    return `<p class="pt-legend-line">${badge("a", "suggested", 24)} dashed: AI suggestion <span aria-hidden="true">·</span> ${badge("a", "agreed", 24)} solid: confirmed or chosen by me</p>
      <ul class="pt-colls">${list.map(card).join("")}</ul>`;
  }

  function sheet(c, S) {
    return `<div class="pt-sheet-backdrop is-open" data-action="closeColl" aria-hidden="true"></div>
    <section class="pt-modal" role="dialog" aria-modal="true" aria-labelledby="coll-title">
      <div class="pt-sheet-bar"><button class="pt-icon-btn pt-sheet-close" data-action="closeColl" aria-label="Close">${icon("close")}</button></div>
      <h2 id="coll-title" class="pt-h2" tabindex="-1">${esc(c.title || "Untitled conversation")}</h2>
      <p class="im-hint">${fmtDate(c.createdAt)}${c.demoSaved ? " · Demo, not stored" : ""}${c.illustrative ? " · Illustrative" : ""}</p>
      ${c.note ? `<div class="pt-note-saved"><span class="im-label">Next time, I want to remember…</span><p>${esc(c.note)}</p></div>` : ""}
      ${stickers(c.mine, false, S)}
      ${summary(c.mine, false)}
      ${c.whatIf?.length ? `<p class="pt-tried">${icon("branch")}<span>Explored replying as ${[...new Set(c.whatIf.map((w) => D.EX[w.tried].name))].join(", ")}.</span></p>` : ""}
      <p class="im-hint">The conversation text was never saved, so saved stickers can't be reopened or changed. Only these labels and your own words are kept.</p>
      ${c.illustrative ? "" : `<button class="im-btn im-btn--ghost" data-action="deleteColl" data-id="${c.id}">${icon("trash")} Delete this collection</button>`}
    </section>`;
  }

  function mirror(S) {
    const list = all(S);
    const viewing = list.find((c) => c.id === S.viewing);
    const current = S.transcript && !S.savedId && !S.safety;
    const tabs = [["collections", "Collections", list.length], ["patterns", "Patterns", null]];
    return `<div class="pt-page">
      <h1 class="pt-h1">My Mirror</h1>
      ${S.savedId ? `<div class="im-notice im-notice--success">${icon("device")}<div><strong>Saved in this browser</strong>${S.demo ? "Demo only: gone after you reload or close this tab." : "It stays when you close and reopen InnerMirror here, unless the browser clears it."}</div></div>` : ""}
      ${S.storageOk ? "" : `<div class="im-notice im-notice--error">${icon("alert")}<div><strong>This browser isn't keeping saves</strong>You may be in a private window or storage is blocked, so saved collections will disappear when you close the tab.</div></div>`}
      ${current ? currentCard(S) : ""}
      <section aria-label="Saved on this device">
        <div class="pt-tabs" role="tablist">${tabs.map(([id, name, n]) => `<button role="tab" aria-selected="${S.mirrorTab === id}" data-action="tab" data-tab="${id}">${name}${n ? ` <span class="pt-count">${n}</span>` : ""}</button>`).join("")}</div>
        <div role="tabpanel">${S.mirrorTab === "patterns" ? window.MirrorPatterns.render(list, S, { stateOf, shown }) : collections(list)}</div>
      </section>
      ${S.undo ? `<div class="pt-toast" role="status">Collection deleted. <button class="pt-textlink" data-action="undo">Undo</button></div>` : ""}
      <footer class="pt-storage">${icon("lock")}<div><strong>Saved only in this browser on this device.</strong> No account and no backup. They disappear if you clear browsing data, and they aren't available in private windows or on another browser or device. Some browsers, such as Safari, may remove them if you don't open InnerMirror for about a week. They aren't encrypted, so anyone who uses this browser could open them.
        ${S.saved.length ? `<details class="pt-more"><summary>Manage saved data</summary><button class="im-btn im-btn--ghost im-btn--sm" data-action="deleteAll">${icon("trash")} Delete everything saved here</button></details>` : ""}</div></footer>
      ${viewing ? sheet(viewing, S) : ""}
    </div>`;
  }

  return { mirror };
})();

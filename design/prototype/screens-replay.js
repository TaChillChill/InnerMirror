// Replay. The character selector (AI observation + my interpretation) opens right
// under its message on desktop and as a bottom sheet on phones; the AI's cues are
// highlighted in the bubble itself. The desktop right panel is reserved for What if?.
window.ScreensReplay = (function () {
  const D = window.IM_DATA;
  const { esc, icon, badge, avatar, nameOf, chip, conf, decision, highlight, pattern, PATTERN_COPY, SECOND_LAYER } = window.UI;
  const desktop = () => matchMedia("(min-width: 960px)").matches;

  const msg = (S, id) => S.transcript.messages.find((m) => m.id === id);
  const reading = (id) => D.readings[id] || { ex: "unsure", target: "UNCLEAR", cues: [], confidence: "low", reading: "Too short or unclear to read from text alone." };

  function badgeState(S, id) {
    const r = reading(id), c = S.choices[id]?.ex;
    if (!c) return { ex: r.ex, state: "suggested", label: "AI suggestion" };
    if (c === "unsure") return { ex: "unsure", state: "unsure", label: "You're not sure" };
    return c === r.ex ? { ex: c, state: "agreed", label: "You agreed" } : { ex: c, state: "changed", label: "You chose" };
  }
  // Source comes from the expression (the user's if chosen); target stays the AI's.
  function ends(S, id, useUser) {
    const r = reading(id), c = useUser ? S.choices[id]?.ex : null;
    const ex = c || r.ex;
    return { source: ex === "unsure" ? "UNCLEAR" : D.EX[ex].structural, target: r.target };
  }

  // ---------- Character selector: AI observation and my interpretation together ----------
  function selector(S, id) {
    const m = msg(S, id), r = reading(id), mine = m.speakerId === S.selfId, c = S.choices[id];
    const short = (ex) => (ex === "unsure" ? "Not sure" : D.EX[ex].name);
    return `<section class="pt-sel" aria-labelledby="sel-${id}">
      <h2 id="sel-${id}" class="pt-visually-hidden pt-sheet-focus" tabindex="-1">Character for this message</h2>
      <div class="pt-sel__ai">
        <div class="pt-sel__airow">${icon("eye")}<span>AI suggestion</span>${badge(r.ex, "suggested", 28)}<strong>${r.ex === "unsure" ? "Unclear" : D.EX[r.ex].name}</strong><span class="pt-sel__conf">· ${conf(r.confidence)}</span></div>
        <details class="pt-more pt-sel__why"><summary>Why the AI suggested this</summary>
          ${r.cues.length ? `<p>Words that point this way are highlighted in the message: ${r.cues.map((q) => `<mark class="im-cue im-ex" data-ex="${r.ex}">${esc(q)}</mark>`).join(", ")}.</p>` : ""}
          <p>${esc(r.reading)}</p>${r.altReading ? `<p><strong>Another reading.</strong> ${esc(r.altReading)}</p>` : ""}
          <p class="im-hint">A possibility from the words alone, not a fact about anyone.</p>
        </details>
      </div>
      <div class="pt-sel__mine">
        <p class="pt-sel__q">${icon("person")}<span>${esc(mine ? r.question || "When you wrote this, what feels closest?" : `How does ${nameOf(S, m.speakerId)}'s message read to you?`)}</span></p>
        <div class="pt-sel__choices" role="radiogroup" aria-label="My reading">${[...D.EX_ORDER, "unsure"].map((ex) => {
          const on = c?.ex === ex;
          return `<button class="pt-sel__opt im-ex" role="radio" aria-checked="${on}" data-ex="${ex}" data-action="choose" data-id="${id}">
            ${badge(ex, on ? "agreed" : "plain", 32)}<span>${short(ex)}${ex === r.ex ? `<small>AI</small>` : ""}</span></button>`;
        }).join("")}</div>
        ${c?.ex && c.ex !== r.ex && c.ex !== "unsure" ? `<p class="pt-sel__note">You see it differently from the AI. That's expected: you know what was going on.</p>` : ""}
        ${mine ? "" : `<p class="im-hint">The AI only reads the words. It doesn't guess ${esc(nameOf(S, m.speakerId))}'s feelings or reasons.</p>`}
      </div>
      <div class="pt-actions pt-sel__foot">
        <button class="im-btn im-btn--secondary im-btn--sm" data-action="done">Done</button>
        ${id !== S.transcript.messages[0].id ? `<button class="im-btn im-btn--ghost im-btn--sm" data-action="open" data-kind="exchange" data-id="${id}">How it connects</button>` : ""}
        ${c ? `<button class="im-btn im-btn--ghost im-btn--sm" data-action="resetChoice" data-id="${id}">Clear my choice</button>` : ""}
      </div>
    </section>`;
  }

  function exchangeCard(S, respId) {
    const t = D.transactions.find((x) => x.responseId === respId);
    if (!t) return "";
    const stim = msg(S, t.stimulusId), resp = msg(S, respId);
    const ai1 = ends(S, stim.id, false), ai2 = ends(S, resp.id, false);
    const aiP = pattern(ai1, ai2), userP = pattern(ends(S, stim.id, true), ends(S, resp.id, true));
    const touched = S.choices[stim.id] || S.choices[resp.id];
    const row = (m, e) => `<div class="pt-tx-row">${badge(badgeState(S, m.id).ex, badgeState(S, m.id).state, 32)}
      <div><strong>${esc(nameOf(S, m.speakerId))}</strong> <span class="pt-tx-text">“${esc(m.text)}”</span>
      <p class="pt-tx-ends">seems to come from <b>${D.PLACE[e.source].name}</b> <span class="pt-arrow" aria-hidden="true">→</span> seems to speak to <b>${D.PLACE[e.target].name}</b></p></div></div>`;
    const P = PATTERN_COPY[aiP];
    return `<section class="pt-sel pt-sel--tx" aria-labelledby="tx-${respId}">
      <h2 id="tx-${respId}" class="pt-sel__title pt-sheet-focus" tabindex="-1">${icon("eye")} How it connects · AI suggestion</h2>
      ${D.shifts[resp.id] ? `<p class="pt-shift-note">${icon("swap")} <span><strong>Conversation shift.</strong> ${esc(D.shifts[resp.id])}</span></p>` : ""}
      ${row(stim, ai1)}${row(resp, ai2)}
      <div class="pt-pattern"><strong>${P.name}</strong><p>${P.body}</p>${conf(t.confidence)}</div>
      ${t.secondLayer ? `<div class="pt-pattern pt-pattern--layer"><strong>Possibly a second layer</strong><p>${SECOND_LAYER}</p></div>` : ""}
      ${touched && userP !== aiP ? `<p class="pt-sel__note">With the characters you chose, this exchange reads as <strong>${PATTERN_COPY[userP].name.toLowerCase()}</strong>. The AI's version stays above.</p>` : ""}
      <details class="pt-more"><summary>What do these sides mean?</summary>
        <ul class="pt-places">${["P", "A", "C"].map((k) => `<li><strong>${D.PLACE[k].name}</strong>: ${D.PLACE[k].hint}</li>`).join("")}</ul>
        <p class="im-hint">In Transactional Analysis this would be called <em>${P.tech}</em>. Neither pattern is good or bad.</p></details>
      <div class="pt-actions"><button class="im-btn im-btn--secondary im-btn--sm" data-action="done">Done</button>
        ${resp.speakerId === S.selfId ? `<button class="im-btn im-btn--ghost im-btn--sm" data-action="whatIf" data-id="${resp.id}">${icon("branch")} What if I replied differently?</button>` : ""}</div>
    </section>`;
  }

  const detail = (S) => (S.selected?.kind === "exchange" ? exchangeCard(S, S.selected.id) : S.selected ? selector(S, S.selected.id) : "");

  // ---------- What if? ----------
  function whatIfBody(S, turn) {
    const W = S.whatIf;
    const current = turn === "next" ? null : badgeState(S, turn).ex;
    const options = D.EX_ORDER.filter((ex) => ex !== current);
    const other = nameOf(S, "p1");
    const alt = W.ex ? D.whatIf[turn]?.[W.ex] : null;
    const anchor = turn === "next" ? S.transcript.messages[S.transcript.messages.length - 1] : msg(S, turn);
    const head = turn === "next" ? `Your turn. After “${anchor.text}”, what if you replied as…` : `Instead of ${current === "unsure" ? "this" : D.EX[current].name} in “${anchor.text}”, what if I replied as…`;
    return `<div class="pt-whatif__head">${icon("branch")} What if? · a possibility, not a prediction
        <button class="pt-icon-btn" data-action="whatIf" data-id="${turn}" aria-label="Close what if">${icon("close")}</button></div>
      <p class="pt-whatif__q">${esc(head)}</p>
      <div class="pt-try" role="radiogroup" aria-label="Character to try">${options.map((ex) => `
        <button class="pt-try__opt im-ex" role="radio" aria-checked="${W.ex === ex}" data-ex="${ex}" data-action="wiEx">${badge(ex, W.ex === ex ? "agreed" : "plain", 36)}<span>${D.EX[ex].name}</span></button>`).join("")}</div>
      ${W.ex && !alt ? `<p class="im-hint">Prototype: no pre-written example for this one. Try another character.</p>` : ""}
      ${alt ? `<div class="pt-branch">
          <p class="pt-branch__label">${badge(W.ex, "plain", 28)}<span>My reply could sound like</span></p>
          <div class="pt-rv-msg is-right"><div class="im-bubble pt-alt">${esc(alt.msg)}</div></div>
          ${alt.poss.slice(0, W.shown).map(([ex, reply, dyn], i) => `
            <div class="pt-poss">
              <p class="pt-branch__label">${badge(ex, "plain", 28)}<span>${i === 0 ? "One possible next step" : "Another possibility"}: a reply from the <strong>${D.EX[ex].name}</strong> side</span></p>
              <div class="pt-rv-msg">${avatar(S, "p1", 28)}<div class="im-bubble pt-alt">${esc(reply)}</div></div>
              <p class="pt-dyn">${esc(dyn)}</p>
            </div>`).join("")}
          ${W.shown < alt.poss.length ? `<button class="im-btn im-btn--ghost im-btn--sm" data-action="wiMore">Show another possibility</button>` : ""}
          <p class="im-hint">Illustrative only. ${esc(other)} could answer in many other ways; nothing here says what they would really do or feel.</p>
        </div>` : ""}`;
  }

  function whatIfPanel(S) {
    if (S.whatIf) return `<section class="pt-whatif" id="wi-${S.whatIf.turn}" aria-label="What if, a possibility">${whatIfBody(S, S.whatIf.turn)}</section>`;
    const last = S.transcript.messages[S.transcript.messages.length - 1];
    return `<section class="pt-whatif pt-whatif--idle" aria-label="What if">
      <div class="pt-whatif__head">${icon("branch")} What if?</div>
      <p>Explore another way you could have replied. Tap <strong>What if?</strong> beside one of your messages.</p>
      ${last.speakerId !== S.selfId ? `<button class="im-btn im-btn--secondary im-btn--sm" data-action="whatIf" data-id="next">${icon("branch")} Your turn: what if you replied…?</button>` : ""}
      <p class="im-hint">One possibility to think with, never a prediction of what someone would do.</p></section>`;
  }

  function thread(S) {
    const big = desktop();
    const msgs = S.transcript.messages;
    const rows = msgs.map((m) => {
      const mine = m.speakerId === S.selfId;
      const b = badgeState(S, m.id);
      const open = S.selected?.id === m.id;
      const r = reading(m.id);
      const shift = D.shifts[m.id] ? `<button class="pt-shift" data-action="open" data-kind="exchange" data-id="${m.id}">${icon("swap")} Conversation shift</button>` : "";
      const text = open && S.selected.kind === "message" ? highlight(m.text, r.cues, r.ex) : esc(m.text);
      return `${shift}<div class="im-msg ${mine ? "im-msg--me" : ""}" ${open && S.selected.kind === "message" ? 'aria-current="true"' : ""}>
        ${mine ? "" : avatar(S, m.speakerId, 32)}
        <div class="im-bubble"><span class="pt-visually-hidden">${esc(nameOf(S, m.speakerId))}: </span>${text}</div>
        <div class="im-msg__meta">
          <button data-action="open" data-kind="message" data-id="${m.id}" aria-expanded="${open && S.selected.kind === "message"}" aria-label="${b.label}: ${esc(window.UI.exName(b.ex))}. Open">
            ${badge(b.ex, b.state, 28)}<span class="pt-meta-label">${b.state === "suggested" ? "" : `<span class="pt-you">${b.label}</span>`}${chip(b.ex)}</span></button>
          ${mine && !S.safety ? `<button class="pt-whatif-btn" data-action="whatIf" data-id="${m.id}" aria-expanded="${S.whatIf?.turn === m.id}">${icon("branch")} What if?</button>` : ""}
        </div></div>
        ${big && open ? `<div class="pt-inline">${detail(S)}</div>` : ""}
        ${!big && S.whatIf?.turn === m.id ? `<section class="pt-whatif" id="wi-${m.id}" aria-label="What if, a possibility">${whatIfBody(S, m.id)}</section>` : ""}`;
    }).join("");
    const last = msgs[msgs.length - 1];
    let next = "";
    if (last && last.speakerId !== S.selfId && !S.safety) {
      next = !big && S.whatIf?.turn === "next" ? `<section class="pt-whatif" id="wi-next" aria-label="What if, a possibility">${whatIfBody(S, "next")}</section>`
        : `<button class="pt-your-turn" data-action="whatIf" data-id="next" aria-expanded="${S.whatIf?.turn === "next"}">${icon("branch")} Your turn: what if you replied…?</button>`;
    }
    return rows + next;
  }

  function learn(S) {
    return `<details class="pt-more" ${S.learnOpen ? "open" : ""}><summary data-action="learn">What do the characters mean?</summary>
      <ul class="pt-legend">${D.EX_ORDER.map((ex) => `<li>${badge(ex, "plain", 40)}<span><strong>${D.EX[ex].name}</strong> ${esc(D.EX[ex].desc)}</span></li>`).join("")}</ul>
      <p class="im-hint">Inspired by Transactional Analysis. Eric Berne described three ego states, Parent, Adult and Child; the five-character split comes from later TA, not directly from Berne.</p></details>`;
  }

  function safety() {
    return `<div class="pt-page"><div class="im-notice im-notice--safety">${icon("alert")}<div>
      <strong>This conversation mentions something that may not be safe.</strong>
      <p>You deserve support. We won't suggest characters or alternative replies here. If you are in danger, contact local emergency services.</p>
      <button class="im-btn im-btn--primary">Support resources (list pending Founder approval, Q10)</button>
      <div><button class="im-btn im-btn--ghost" data-go="landing">Back to start</button></div></div></div></div>`;
  }

  function replay(S) {
    if (S.safety) return safety();
    const big = desktop();
    return `<div class="pt-page pt-page--wide">
      ${S.demo ? `<p class="pt-demo-tag">${icon("spark")} Demo · fictional conversation · nothing is sent anywhere</p>` : ""}
      <h1 class="pt-h1">What the AI noticed</h1>
      <section class="im-layer im-layer--ai pt-summary"><div class="im-layer__head">${icon("eye")} AI observation</div>
        <p>${esc(D.summary)}</p><p class="im-hint">${esc(D.uncertainty)}</p>${learn(S)}</section>
      <p class="pt-tip">Tap a character under a message to see why the AI suggested it and choose your own.</p>
      <div class="pt-replay">
        <div class="im-thread pt-thread" aria-label="Conversation">${thread(S)}</div>
        ${big ? `<aside class="pt-side" aria-label="What if">${whatIfPanel(S)}</aside>` : `
          <div class="pt-sheet-backdrop" data-action="done" aria-hidden="true"></div>
          <aside class="pt-panel-side ${S.sheetOpen && S.selected ? "is-open" : ""}" aria-label="Character details">
            <div class="pt-sheet-bar"><span class="pt-sheet-title">${S.selected?.kind === "exchange" ? "How it connects" : "This message"}</span>
              <button class="pt-icon-btn pt-sheet-close" data-action="done" aria-label="Close">${icon("close")}</button></div>
            ${S.sheetOpen ? detail(S) : ""}</aside>`}
      </div>
      <div class="pt-continue"><button class="im-btn im-btn--primary" data-go="mirror">Continue to My Mirror</button>
        <span class="im-hint">You don't have to go through every message. Characters you don't review stay marked as AI suggestions.</span></div>
      ${decision("Q18 · Q19 · Q22", "Step name “Replay”, the label “Conversation shift”, and Observation + Interpretation on one screen are still proposals.")}
    </div>`;
  }

  return { replay, badgeState, reading, desktop };
})();

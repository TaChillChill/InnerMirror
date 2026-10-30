// Illustrative product screens, rendered from one source so the gallery and the
// responsive preview never drift apart. Not approved product requirements.
(function () {
  // Language-neutral codes (CP, NP, A, FC, AC); names come from the dictionaries.
  const EX_ORDER = ["cp", "np", "a", "fc", "ac"];

  // One image set for both languages: names are UI text, never part of the artwork.
  const face = (ex) => `../brand/mascots/badge/${ex}-128.png`;
  const mascot = (ex, alt = "") =>
    `<img src="../brand/mascots/full/${ex}-256.png" srcset="../brand/mascots/full/${ex}-256.png 256w, ../brand/mascots/full/${ex}-512.png 512w" sizes="(min-width: 640px) 220px, 40vw" alt="${alt}" loading="lazy">`;

  const icon = (id) => `<svg aria-hidden="true"><use href="#i-${id}"></use></svg>`;

  // state: suggested | agreed | changed | unsure | plain.
  // Pass decorative when a visible text label sits next to the badge.
  function badge(t, ex, state, confidence, decorative) {
    const a11y = (label) => decorative ? 'aria-hidden="true"' : `role="img" aria-label="${label}"`;
    if (state === "unsure") {
      return `<span class="im-badge im-badge--unsure" ${a11y(t("badge.unsure"))}>?</span>`;
    }
    const mark = state === "agreed" ? `<span class="im-badge__mark">${icon("check")}</span>`
      : state === "changed" ? `<span class="im-badge__mark">${icon("dot")}</span>` : "";
    const cls = state === "suggested" ? " im-badge--suggested" : "";
    const conf = confidence ? ` data-confidence="${confidence}"` : "";
    return `<span class="im-badge im-ex${cls}" data-ex="${ex}"${conf} ${a11y(t("ex." + ex + ".name"))}>`
      + `<span class="im-badge__face"><img src="${face(ex)}" alt=""></span>${mark}</span>`;
  }

  const chip = (t, ex) => ex === "unsure"
    ? `<span class="im-chip im-chip--unsure">${t("ex.unsure")}</span>`
    : `<span class="im-chip im-ex" data-ex="${ex}">${t("ex." + ex + ".name")}</span>`;

  function confidence(t, level) {
    return `<span class="im-confidence" data-level="${level}">${t("conf." + level)}</span>`;
  }

  function stepper(t, current) {
    const steps = ["conversation", "observation", "interpretation", "mirror"];
    const idx = steps.indexOf(current);
    return `<nav aria-label="${t("ui.nav")}"><ol class="im-stepper">${steps.map((s, i) =>
      `<li><span class="${i < idx ? "is-done" : ""}"${i === idx ? ' aria-current="step"' : ""}>${t("step." + s)}</span></li>`
    ).join("")}</ol></nav>`;
  }

  // App header: app icon + product name as plain text. Not the wordmark; swap for the
  // horizontal logo once a source file exists.
  const appBar = () => `<header class="scr-bar"><img src="../brand/logo-interim/app-icon-color.png" alt="" width="32" height="32"><span>InnerMirror</span></header>`;

  function welcome(t, lang) {
    return `${appBar()}
      <div class="scr-body scr-welcome">
        <div class="scr-welcome__text">
          <h3 class="scr-display">${t("w.title")}</h3>
          <p class="scr-lead">${t("w.body")}</p>
          <div class="scr-actions">
            <button class="im-btn im-btn--primary" type="button">${t("w.cta")}</button>
            <button class="im-btn im-btn--secondary" type="button">${t("w.sample")}</button>
          </div>
          <p class="im-hint">${t("w.disclaimer")}</p>
        </div>
        <div class="scr-welcome__cast" aria-hidden="true">
          ${EX_ORDER.map((ex) => mascot(ex)).join("")}
        </div>
        <ol class="scr-steps">
          ${[1, 2, 3, 4].map((n) => `<li><span class="scr-steps__n">${n}</span>${t("w.step" + n)}</li>`).join("")}
        </ol>
        <div class="im-notice">${icon("lock")}<div><strong>${t("st.privacy.title")}</strong>${t("st.privacy.body")}</div></div>
      </div>`;
  }

  let idCount = 0;

  function conversation(t) {
    const id = `c-text-${++idCount}`;
    return `${appBar()}
      <div class="scr-body">
        ${stepper(t, "conversation")}
        <h3 class="scr-title">${t("c.title")}</h3>
        <div class="im-field">
          <label class="im-label" for="${id}">${t("in.label")}</label>
          <textarea class="im-textarea" id="${id}" rows="5">${t("c.sample")}</textarea>
          <span class="im-hint">${t("in.hint")}</span>
        </div>
        <div class="im-field">
          <span class="im-label">${t("c.who")}</span>
          <div class="im-segment"><button type="button" aria-pressed="false">Linh</button><button type="button" aria-pressed="true">${t("c.me")}</button></div>
        </div>
        <label class="im-check"><input type="checkbox" checked>${t("in.consent")}</label>
        <div class="im-notice">${icon("lock")}<div><strong>${t("st.privacy.title")}</strong>${t("st.privacy.body")}</div></div>
        <div class="scr-actions"><button class="im-btn im-btn--primary" type="button">${t("btn.primary")}</button></div>
      </div>`;
  }

  const THREAD = [
    { who: "Linh", key: "msg.1", ex: "cp", conf: "medium" },
    { who: "me", key: "msg.2", ex: "ac", conf: "high", current: true },
    { turn: true },
    { who: "Linh", key: "msg.3", ex: "fc", conf: "low" },
    { who: "me", key: "msg.4", ex: "a", conf: "medium" },
  ];

  function thread(t) {
    return `<div class="im-thread">${THREAD.map((m) => {
      if (m.turn) return `<div class="im-turn">${t("o.turn")}</div>`;
      const me = m.who === "me";
      const label = `${t("a11y.ai")}: ${t("ex." + m.ex + ".name")}, ${t("conf." + m.conf)}`;
      const meta = `<div class="im-msg__meta"><button type="button" aria-label="${label}">${badge(t, m.ex, "suggested", m.conf, true)}${chip(t, m.ex)}</button></div>`;
      return `<div class="im-msg${me ? " im-msg--me" : ""}"${m.current ? ' aria-current="true"' : ""}>
        ${me ? "" : `<span class="im-avatar" aria-hidden="true">L</span>`}
        <div class="im-bubble">${t(m.key)}</div>
        ${me ? `<span class="im-avatar" aria-hidden="true">${t("c.me").charAt(0)}</span>` : ""}
        ${meta}
      </div>`;
    }).join("")}</div>`;
  }

  function observation(t) {
    return `${appBar()}
      <div class="scr-body">
        ${stepper(t, "observation")}
        <h3 class="scr-title">${t("o.title")}</h3>
        <p class="scr-muted">${t("o.summary")}</p>
        <div class="scr-split">
          ${thread(t)}
          <section class="im-layer im-layer--ai im-ex" data-ex="ac">
            <div class="im-layer__head">${icon("eye")}${t("layer.ai")}</div>
            <p>${t("o.might")} ${chip(t, "ac")}</p>
            <dl class="im-dl">
              <div><dt>${t("o.cues")}</dt><dd>“<span class="im-cue">${t("cue.a")}</span>” · “<span class="im-cue">${t("cue.b")}</span>”</dd></div>
              <div><dt>${t("o.reading")}</dt><dd>${t("o.reading.body")}</dd></div>
              <div><dt>${t("o.alt")}</dt><dd>${t("o.alt.body")}</dd></div>
            </dl>
            ${confidence(t, "high")}
            <div><button class="im-btn im-btn--secondary im-btn--sm" type="button">${t("o.reflect")}</button></div>
          </section>
        </div>
      </div>`;
  }

  function interpretation(t, lang, chosen) {
    const ai = "ac";
    const state = chosen === "unsure" ? "unsure" : chosen === ai ? "agreed" : "changed";
    const choice = (ex) => {
      const on = chosen === ex;
      const body = ex === "unsure"
        ? `<span class="im-badge im-badge--unsure" aria-hidden="true">?</span><span>${t("ex.unsure")}</span>`
        : `${badge(t, ex, "plain", null, true)}<span>${t("ex." + ex + ".name")}<small>${t("ex." + ex + ".desc")}</small>${ex === ai ? `<small class="im-choice__ai">${t("i.ai")}</small>` : ""}</span>`;
      const check = on ? `<span class="im-choice__check">${icon("check")}</span>` : "";
      return `<button type="button" class="im-choice im-ex" data-ex="${ex}" data-choice="${ex}" role="radio" aria-checked="${on}" tabindex="${on ? 0 : -1}">${body}${check}</button>`;
    };
    const qid = `iq-${++idCount}`;
    return `${appBar()}
      <div class="scr-body">
        ${stepper(t, "interpretation")}
        <h3 class="scr-title">${t("i.title")}</h3>
        <div class="im-msg im-msg--me"><div class="im-bubble">${t("msg.2")}</div><span class="im-avatar" aria-hidden="true">${t("c.me").charAt(0)}</span>
          <div class="im-msg__meta">${badge(t, chosen === "unsure" ? ai : chosen, state, null, true)}${chip(t, chosen)}</div></div>
        <section class="im-layer im-layer--ai scr-compact">
          <div class="im-layer__head">${icon("eye")}${t("layer.ai")}</div>
          <p>${t("i.ai")} ${chip(t, ai)} ${confidence(t, "high")}</p>
        </section>
        <section class="im-layer im-layer--mine">
          <div class="im-layer__head">${icon("person")}${t("layer.mine")}</div>
          <p class="scr-q" id="${qid}">${t("i.q")}</p>
          <div class="im-choices" role="radiogroup" aria-labelledby="${qid}">${[...EX_ORDER, "unsure"].map(choice).join("")}</div>
          <div class="im-field">
            <label class="im-label">${t("i.note")}<textarea class="im-textarea scr-note" rows="3">${t("i.note.value")}</textarea></label>
          </div>
          ${state === "changed" ? `<p class="im-notice" role="status">${icon("person")}<span>${t("i.disagree")}</span></p>` : ""}
          <p class="im-hint">${t("i.kept")}</p>
          <div class="scr-actions"><button class="im-btn im-btn--primary" type="button">${t("i.save")}</button></div>
        </section>
      </div>`;
  }

  function mirror(t) {
    return `${appBar()}
      <div class="scr-body">
        ${stepper(t, "mirror")}
        <h3 class="scr-title">${t("m.title")}</h3>
        <div class="im-notice im-notice--success">${icon("device")}<div><strong>${t("st.saved.title")}</strong>${t("st.saved.body")}</div></div>
        <article class="im-layer im-layer--mirror">
          <div class="im-layer__head">${icon("saved")}${t("m.date")}</div>
          <dl class="im-dl scr-mirror-dl">
            <div><dt>${t("m.noticed")}</dt><dd class="scr-provenance">${t("m.noticed.body")}</dd></div>
            <div><dt>${t("m.chose")}</dt><dd>${chip(t, "np")}</dd></div>
            <div><dt>${t("m.insight")}</dt><dd class="scr-insight">${t("m.insight.body")}</dd></div>
            <div><dt>${t("m.next")}</dt><dd>${t("m.next.body")}</dd></div>
          </dl>
          <div><button class="im-btn im-btn--ghost im-btn--sm" type="button">${icon("trash")}${t("m.delete")}</button></div>
        </article>
        <h4 class="scr-subtitle">${t("m.earlier")}</h4>
        <ul class="scr-list">
          <li><span>${t("m.earlier.1")}</span><button class="im-btn im-btn--ghost im-btn--sm" type="button">${t("m.open")}</button></li>
          <li><span>${t("m.earlier.2")}</span><button class="im-btn im-btn--ghost im-btn--sm" type="button">${t("m.open")}</button></li>
        </ul>
      </div>`;
  }

  window.IM_SCREENS = {
    order: ["welcome", "conversation", "observation", "interpretation", "mirror"],
    render: { welcome, conversation, observation, interpretation, mirror },
    badge, chip, confidence, stepper, mascot, EX_ORDER,
  };
})();

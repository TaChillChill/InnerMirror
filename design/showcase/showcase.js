// Showcase behavior: language switching, dynamic sections, responsive stage. Light theme only (D5).
(function () {
  const S = window.IM_SCREENS;
  const DICT = window.IM_I18N;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode: ignore */ } },
  };

  const params = new URLSearchParams(location.search);
  const state = {
    lang: (params.get("lang") || store.get("im-lang")) === "vi" ? "vi" : "en",
    width: ["mobile", "tablet", "desktop"].includes(params.get("resp")) ? params.get("resp") : "mobile",
    screen: ["welcome", "conversation", "observation", "interpretation", "mirror"].includes(params.get("screen"))
      ? params.get("screen") : "observation",
    chosen: "np", // the illustrative user disagrees with the AI's "ac"
  };
  const WIDTHS = { mobile: 390, tablet: 768, desktop: 1280 };
  const HEX = { cp: "#FF5B6B", np: "#C9A8FF", a: "#82B9F8", fc: "#FFC34D", ac: "#60D6C0" };

  const tFor = (lang) => (key) => (DICT[lang] && DICT[lang][key]) ?? DICT.en[key] ?? key;
  let t = tFor(state.lang);
  const $ = (sel) => document.querySelector(sel);
  const icon = (id) => `<svg aria-hidden="true"><use href="#i-${id}"></use></svg>`;

  // ---------- Static strings ----------
  function applyStrings() {
    document.documentElement.lang = state.lang;
    document.title = t("meta.title");
    document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll("[data-i18n-aria]").forEach((el) => { el.setAttribute("aria-label", t(el.dataset.i18nAria)); });
    document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      const [attr, key] = el.dataset.i18nAttr.split(":");
      el.setAttribute(attr, t(key));
    });
    document.querySelectorAll("[data-lang-set]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.langSet === state.lang)));
  }

  // ---------- Dynamic sections ----------
  function renderBrand() {
    $("#ex-rows").innerHTML = S.EX_ORDER.map((ex) =>
      `<div class="sc-exrow im-ex" data-ex="${ex}"><i aria-hidden="true"></i><div><strong>${t("ex." + ex + ".name")}</strong><div class="sc-caption">${t("ex." + ex + ".desc")}</div></div><code>${HEX[ex]}</code></div>`
    ).join("");
    const scale = [
      ["type.display", "--im-text-display", true], ["type.h1", "--im-text-h1"], ["type.h2", "--im-text-h2"],
      ["type.h3", "--im-text-h3"], ["type.bodyStyle", "--im-text-body"], ["type.label", "--im-text-label", true],
      ["type.caption", "--im-text-caption"],
    ];
    $("#type-scale").innerHTML = scale.map(([key, token, proposal]) =>
      `<div><span class="sc-caption">${t(key)}${proposal ? ` · <span class="sc-tag sc-tag--proposal">${t("tag.proposal")}</span>` : ""}</span>
       <span style="font:var(${token})">${t("type.sample")}</span></div>`
    ).join("");
  }

  function renderMascots() {
    // Full-body card plus the same mascot as a badge at the three sizes the product uses.
    $("#cast").innerHTML = S.EX_ORDER.map((ex) =>
      `<figure class="im-ex" data-ex="${ex}">
        <div class="sc-cast__art">${S.mascot(ex, t("ex." + ex + ".name"))}</div>
        <figcaption><strong>${t("ex." + ex + ".name")}</strong>
          <span class="sc-cast__code"><b>${ex.toUpperCase()}</b>${HEX[ex]}</span>
          <span class="sc-caption">${t("ex." + ex + ".desc")}</span></figcaption>
        <div class="sc-cast__badges" title="${t("masc.sizes")}" aria-hidden="true">${S.badge(t, ex, "plain", null, true).repeat(3)}</div>
      </figure>`
    ).join("");
    const row = `<div class="sc-row">${S.EX_ORDER.map((ex) => S.mascot(ex)).join("")}</div>`;
    $("#mascot-bgs").innerHTML = [
      ["--im-bg", "masc.bg.light"], ["--im-surface", "masc.bg.surface"],
      ["--im-surface-sunken", "masc.bg.sunken"], ["--im-surface-tint", "masc.bg.lavender"],
    ].map(([token, key]) => `<div class="sc-bg" style="background:var(${token})"><span class="sc-caption">${t(key)} · <code>${token}</code></span>${row}</div>`).join("");
    const states = [
      ["a", "suggested", null, "badge.suggested"], ["a", "agreed", null, "badge.agreed"], ["np", "changed", null, "badge.changed"], [null, "unsure", null, "badge.unsure"],
    ];
    $("#badge-states").innerHTML = states.map(([ex, st, conf, key]) =>
      `<figure>${S.badge(t, ex, st, conf, true)}<figcaption class="sc-caption">${t(key)}</figcaption></figure>`
    ).join("");
  }

  function layerCards(tt) {
    return `
      <section class="im-layer im-layer--ai im-ex" data-ex="ac">
        <div class="im-layer__head">${icon("eye")}${tt("layer.ai")}</div>
        <p>${tt("o.might")} ${S.chip(tt, "ac")}</p>
        ${S.confidence(tt, "medium")}
      </section>
      <section class="im-layer im-layer--mine">
        <div class="im-layer__head">${icon("person")}${tt("layer.mine")}</div>
        <p>${S.chip(tt, "np")}</p>
        <p>${tt("i.note.value")}</p>
      </section>
      <section class="im-layer im-layer--mirror">
        <div class="im-layer__head">${icon("saved")}${tt("layer.mirror")}</div>
        <p class="scr-q">${tt("m.insight.body")}</p>
      </section>`;
  }

  function renderFoundations() {
    $("#layers").innerHTML = layerCards(t);
    $("#nav-demo").innerHTML = S.stepper(t, "observation");
    $("#status-chips").innerHTML = S.EX_ORDER.map((ex) => S.chip(t, ex)).join("") + S.chip(t, "unsure");
    $("#status-conf").innerHTML = ["low", "medium", "high"].map((l) => S.confidence(t, l)).join(" · ");
  }

  function screen(name, lang) {
    const tt = tFor(lang || state.lang);
    return S.render[name](tt, lang || state.lang, state.chosen);
  }

  function renderScreens() {
    $("#gallery").innerHTML = S.order.map((name) =>
      `<figure><figcaption>${t("screen." + name)}</figcaption><div class="sc-frame">${screen(name)}</div></figure>`
    ).join("");
    $("#resp-screen").innerHTML = S.order.map((name) =>
      `<button type="button" data-screen="${name}" aria-pressed="${name === state.screen}">${t("screen." + name)}</button>`
    ).join("");
    document.querySelectorAll("#resp-width [data-width]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.width === state.width)));
    const frame = $("#resp-frame");
    frame.dataset.width = state.width;
    frame.innerHTML = screen(state.screen);
    fitStage();
  }

  function renderCompare() {
    const mini = (tx) => `<div class="sc-row"><button class="im-btn im-btn--primary im-btn--sm" type="button">${tx("w.cta")}</button><button class="im-btn im-btn--secondary im-btn--sm" type="button">${tx("w.sample")}</button></div>
      <div class="sc-row">${S.EX_ORDER.map((ex) => S.chip(tx, ex)).join("")}</div>`;
    $("#compare-lang").innerHTML = ["en", "vi"].map((lang) => {
      const tx = tFor(lang);
      return `<div lang="${lang}"><h3>${lang === "en" ? "English" : "Tiếng Việt"}</h3>${mini(tx)}${S.stepper(tx, "interpretation")}<div style="display:grid;gap:12px">${layerCards(tx)}</div></div>`;
    }).join("");
  }

  // Scale the preview frame down to fit, so a 1280px desktop layout can be inspected on a laptop.
  function fitStage() {
    const stage = $(".sc-stage");
    const scaler = $(".sc-stage__scaler");
    const frame = $("#resp-frame");
    const w = WIDTHS[state.width];
    const avail = stage.clientWidth - 2 * parseFloat(getComputedStyle(stage).paddingLeft);
    const k = Math.min(1, avail / w);
    frame.style.width = w + "px";
    scaler.style.width = w + "px";
    scaler.style.transform = `scale(${k})`;
    scaler.style.marginInline = k < 1 ? "0" : "auto";
    scaler.style.marginBottom = `${-(1 - k) * frame.offsetHeight}px`;
  }

  function renderAll() {
    t = tFor(state.lang);
    applyStrings();
    renderBrand();
    renderMascots();
    renderFoundations();
    renderScreens();
    renderCompare();
  }

  // ---------- Events ----------
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-lang-set],[data-width],[data-screen],[data-choice]");
    if (!el) return;
    if (el.dataset.langSet) { state.lang = el.dataset.langSet; store.set("im-lang", state.lang); renderAll(); return; }
    if (el.dataset.width && el.closest("#resp-width")) { state.width = el.dataset.width; renderScreens(); return; }
    if (el.dataset.screen) { state.screen = el.dataset.screen; renderScreens(); return; }
    if (el.dataset.choice) choose(el);
  });

  // Re-rendering replaces the DOM, so put focus back on the same choice in the same frame.
  function choose(el) {
    const frames = [...document.querySelectorAll(".sc-frame")];
    const at = frames.indexOf(el.closest(".sc-frame"));
    state.chosen = el.dataset.choice;
    renderScreens();
    const again = document.querySelectorAll(".sc-frame")[at];
    if (again) again.querySelector(`[data-choice="${state.chosen}"]`)?.focus();
  }

  // Radiogroup keyboard pattern: arrows move and select.
  document.addEventListener("keydown", (e) => {
    const el = e.target.closest && e.target.closest("[data-choice]");
    if (!el) return;
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const all = [...el.closest('[role="radiogroup"]').querySelectorAll("[data-choice]")];
    choose(all[(all.indexOf(el) + step + all.length) % all.length]);
  });

  // Highlight the section in view in the top nav.
  const links = [...document.querySelectorAll(".sc-nav a")];
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      links.forEach((a) => a.setAttribute("aria-current", String(a.getAttribute("href") === "#" + en.target.id)));
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  document.querySelectorAll(".sc-section").forEach((s) => io.observe(s));

  window.addEventListener("resize", fitStage);
  renderAll();
  // Images change the frame height after load; refit once they settle.
  window.addEventListener("load", fitStage);
})();

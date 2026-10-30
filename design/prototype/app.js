// Prototype v2 state, storage and actions. One state object, full re-render on change,
// except text fields, which update state silently so typing keeps focus.
(function () {
  const D = window.IM_DATA;
  const STORE_KEY = "im-prototype-v2-collections";

  // Saved collections follow the approved schema (F3): labels, title, note, dates. No text.
  const load = () => { try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; } catch { return []; } };
  const persist = (list) => { try { localStorage.setItem(STORE_KEY, JSON.stringify(list)); return true; } catch { return false; } };

  const fresh = () => ({
    screen: "landing", method: null, demo: false, shotUrl: null, shotSynthetic: false,
    transcript: null, selfId: null, consent: false, useNames: false,
    editing: null, renaming: null, composerSpeaker: null, composerText: "", pasteOpen: false, pasteText: "",
    selected: null, sheetOpen: false, choices: {}, whatIf: null, tried: [], learnOpen: false,
    title: "", note: "", savedId: null, shotHidden: false, mirrorTab: "collections", viewing: null, undo: null,
  });
  const S = { ...fresh(), saved: load(), demoSaved: [], seedDemo: true, includeAi: false, safety: false, decisions: true, storageOk: persist(load()) };
  window.PT = { S, D, set, go };

  const sampleTranscript = (msgs) => ({
    participants: D.participants.map((p) => ({ ...p, display: p.name })),
    messages: msgs.map((m) => ({ ...m, legibility: m.legibility || "clear" })),
  });

  function parseLines(text, T) {
    for (const line of text.split("\n").map((l) => l.trim()).filter(Boolean)) {
      const at = line.indexOf(":");
      const name = at > 0 ? line.slice(0, at).trim() : null;
      let p = name && T.participants.find((x) => x.display.toLowerCase() === name.toLowerCase());
      if (name && !p) { p = { id: "p" + (T.participants.length + 1), name, display: name, pseudonym: "Person " + "ABCDEFG"[T.participants.length] }; T.participants.push(p); }
      T.messages.push({ id: "t" + Date.now() + T.messages.length, speakerId: (p || T.participants[0]).id, text: name ? line.slice(at + 1).trim() : line, legibility: "clear" });
    }
  }

  const ownMessages = () => S.transcript.messages.filter((m) => m.speakerId === S.selfId);

  const actions = {
    go: (el) => go(el.dataset.go),
    start: () => set({ ...fresh(), screen: "add" }),
    demo: () => { set({ ...fresh(), demo: true, method: "demo", transcript: sampleTranscript(D.messages), selfId: "p2", consent: true }); analyze(); },
    method: (el) => {
      const m = el.dataset.method;
      if (m === "paste") {
        // Typing from memory and pasting share one chat editor; it starts empty.
        const T = { participants: [{ id: "p1", name: "Linh", display: "Other person", pseudonym: "Person A" }, { id: "p2", name: "Me", display: "Me", pseudonym: "Person B" }], messages: [] };
        return set({ method: "paste", screen: "review", transcript: T, selfId: "p2", composerSpeaker: "p2" });
      }
      set({ method: m });
    },
    useSyntheticShot: () => set({ shotSynthetic: true, shotUrl: null }),
    readShot: () => {
      set({ screen: "reading" });
      setTimeout(() => set({ screen: "review", transcript: sampleTranscript(D.extracted), selfId: null, composerSpeaker: "p1" }), 1400);
    },
    self: (el) => set({ selfId: el.dataset.id }),
    useNames: (el) => set({ useNames: el.checked }),
    consent: (el) => set({ consent: el.checked }),
    edit: (el) => set({ editing: el.dataset.id }),
    doneEdit: () => set({ editing: null }),
    delMsg: (el) => { S.transcript.messages = S.transcript.messages.filter((m) => m.id !== el.dataset.id); set({ editing: null }); },
    sender: (el) => { S.transcript.messages.find((m) => m.id === el.dataset.id).speakerId = el.dataset.pid; set({}); },
    rename: (el) => set({ renaming: S.renaming === el.dataset.id ? null : el.dataset.id }),
    composerSpeaker: (el) => set({ composerSpeaker: el.dataset.pid }),
    addMsg: () => {
      if (!S.composerText.trim()) return;
      S.transcript.messages.push({ id: "t" + Date.now(), speakerId: S.composerSpeaker || S.transcript.participants[0].id, text: S.composerText.trim(), legibility: "clear" });
      set({ composerText: "" });
      document.getElementById("composer")?.focus();
    },
    togglePaste: () => set({ pasteOpen: !S.pasteOpen }),
    exampleText: () => set({ pasteText: D.sampleText }),
    applyPaste: () => { parseLines(S.pasteText, S.transcript); set({ pasteOpen: false, pasteText: "" }); },
    analyze: () => analyze(),

    open: (el) => {
      const same = S.selected?.kind === el.dataset.kind && S.selected?.id === el.dataset.id;
      if (same && (window.ScreensReplay.desktop() || S.sheetOpen)) return actions.done();
      set({ selected: { kind: el.dataset.kind, id: el.dataset.id }, sheetOpen: !window.ScreensReplay.desktop(), focusSheet: true, opener: keyOf(el) });
    },
    done: () => set({ selected: null, sheetOpen: false, returnFocus: S.opener }),
    // From a sticker in My Mirror back to its message, with the selector open.
    goMsg: (el) => {
      set({ screen: "replay", selected: { kind: "message", id: el.dataset.id }, sheetOpen: !window.ScreensReplay.desktop(), whatIf: null, focusSheet: true });
      document.querySelector('.im-msg[aria-current="true"]')?.scrollIntoView({ block: "center" });
    },
    includeAi: (el) => set({ includeAi: el.checked }),
    showAll: () => set({ showAll: true }),
    hideShot: () => set({ shotHidden: true }),
    choose: (el) => { const m = el.dataset.id; S.choices[m] = { ...(S.choices[m] || {}), ex: el.dataset.ex }; set({}); },
    resetChoice: (el) => { delete S.choices[el.dataset.id]; set({}); },
    learn: () => set({ learnOpen: !S.learnOpen }),
    whatIf: (el) => {
      const turn = el.dataset.id;
      set({ whatIf: S.whatIf?.turn === turn ? null : { turn, ex: null, shown: 1 }, sheetOpen: false, selected: window.ScreensReplay.desktop() ? S.selected : null });
      document.getElementById("wi-" + turn)?.scrollIntoView({ block: "nearest" });
    },
    wiEx: (el) => {
      const ex = el.dataset.ex;
      if (!S.tried.some((t) => t.turn === S.whatIf.turn && t.ex === ex)) S.tried.push({ turn: S.whatIf.turn, ex });
      set({ whatIf: { ...S.whatIf, ex, shown: 1 } });
    },
    wiMore: () => set({ whatIf: { ...S.whatIf, shown: S.whatIf.shown + 1 } }),

    save: () => {
      const order = (id) => S.transcript.messages.findIndex((m) => m.id === id);
      const entry = {
        v: 1, id: "c" + Date.now(), createdAt: new Date().toISOString(), lang: "en",
        origin: S.method === "screenshot" ? "screenshot" : S.method === "demo" ? "demo" : "typed",
        title: S.title.trim() || null, note: S.note.trim() || null,
        participants: S.transcript.participants.length,
        mine: ownMessages().map((m) => ({ order: order(m.id), ai: D.readings[m.id]?.ex || "UNCLEAR", chosen: S.choices[m.id]?.ex || null })),
        whatIf: S.tried.map((t) => ({ order: t.turn === "next" ? -1 : order(t.turn), tried: t.ex })),
      };
      // Demo collections live in memory only: the demo is fictional and never stored.
      if (S.demo) S.demoSaved = [entry, ...S.demoSaved];
      else { S.saved = [entry, ...S.saved]; S.storageOk = persist(S.saved); }
      set({ savedId: entry.id, mirrorTab: "collections" });
    },
    dontSave: () => set({ ...fresh(), screen: "landing" }),
    tab: (el) => set({ mirrorTab: el.dataset.tab }),
    viewColl: (el) => set({ viewing: el.dataset.id, focusSheet: true, opener: keyOf(el) }),
    closeColl: () => set({ viewing: null, returnFocus: S.opener }),
    deleteColl: (el) => {
      const id = el.dataset.id;
      const inDemo = S.demoSaved.some((c) => c.id === id);
      const list = inDemo ? S.demoSaved : S.saved;
      const index = list.findIndex((c) => c.id === id);
      const [item] = list.splice(index, 1);
      if (!inDemo) S.storageOk = persist(S.saved);
      set({ viewing: null, undo: { item, index, inDemo } });
    },
    undo: () => {
      const { item, index, inDemo } = S.undo;
      (inDemo ? S.demoSaved : S.saved).splice(index, 0, item);
      if (!inDemo) S.storageOk = persist(S.saved);
      set({ undo: null });
    },
    deleteAll: () => {
      if (!confirm("Delete every saved collection from this browser? This can't be undone.")) return;
      S.saved = []; S.demoSaved = []; S.storageOk = persist([]);
      set({ undo: null, viewing: null });
    },
  };

  function analyze() {
    set({ screen: "analyzing" });
    // Opens on the user's own first message (D9): reflection starts with oneself.
    setTimeout(() => {
      const first = S.transcript.messages.find((m) => m.speakerId === S.selfId);
      // The prototype has one pre-written analysis, so any path continues with the sample chat.
      if (!S.demo) Object.assign(S, { transcript: sampleTranscript(S.method === "screenshot" ? D.extracted.map((m, i) => ({ ...m, text: S.transcript.messages[i]?.text ?? m.text })) : D.messages), selfId: "p2" });
      // Desktop opens the first message of mine inline; on phones a sheet on arrival would hide the chat.
      set({ screen: "replay", selected: first && window.ScreensReplay.desktop() ? { kind: "message", id: "m2" } : null, sheetOpen: false });
    }, 1200);
  }

  function go(screen) {
    if (["review", "replay"].includes(screen) && !S.transcript) {
      Object.assign(S, { transcript: sampleTranscript(D.messages), selfId: "p2", consent: true, demo: true, method: "demo" });
    }
    if (screen === "mirror" && !S.transcript) S.savedId = null;
    set({ screen, sheetOpen: false, viewing: null });
  }

  function set(patch) {
    const moved = patch.screen && patch.screen !== S.screen;
    Object.assign(S, patch);
    render();
    if (moved) { window.scrollTo(0, 0); document.getElementById("app").focus({ preventScroll: true }); }
  }

  const SCREENS = {
    landing: () => window.ScreensInput.landing(S),
    add: () => window.ScreensInput.add(S),
    reading: () => window.ScreensInput.loading("Reading your screenshot…", "Finding the messages and who sent them."),
    review: () => window.ScreensReview.review(S),
    analyzing: () => window.ScreensInput.loading("Looking at the conversation…", "Suggesting what each message might express. This usually takes a few seconds."),
    replay: () => window.ScreensReplay.replay(S),
    mirror: () => window.ScreensMirror.mirror(S),
  };

  // innerHTML re-renders drop focus; remember the focused control by its data keys and restore it.
  const keyOf = (el) => el && el !== document.body ? ["action", "go", "id", "ex", "kind", "tab", "pid"].map((k) => el.dataset?.[k] || "").join("|") + (el.id ? "#" + el.id : "") : null;
  function restoreFocus(key) {
    if (!key) return;
    const match = [...document.querySelectorAll("#app button, #app input, #app textarea, #app summary, header button")].find((el) => keyOf(el) === key);
    match?.focus({ preventScroll: true });
  }

  function render() {
    const focusKey = keyOf(document.activeElement);
    document.body.classList.toggle("pt-hide-decisions", !S.decisions);
    document.body.classList.toggle("pt-sheet-open", !!(S.sheetOpen && S.screen === "replay") || !!S.viewing);
    document.getElementById("app").innerHTML = SCREENS[S.screen]();
    document.getElementById("pt-stepper").innerHTML = window.ScreensInput.stepper(S);
    const count = S.saved.length + S.demoSaved.length;
    document.getElementById("pt-mirror-link").innerHTML = `${window.UI.icon("saved")}<span>My Mirror${count ? ` <span class="pt-count">${count}</span>` : ""}</span>`;
    document.getElementById("pt-jump").value = SCREENS[S.screen] && !["reading", "analyzing"].includes(S.screen) ? S.screen : "";
    // Sheets take focus when they open and give it back to the opener when they close.
    if (S.focusSheet) { S.focusSheet = false; document.querySelector(".pt-sheet-focus, .pt-modal h2")?.focus({ preventScroll: window.ScreensReplay.desktop() }); }
    else if (S.returnFocus) { const key = S.returnFocus; S.returnFocus = null; restoreFocus(key); }
    else restoreFocus(focusKey);
  }

  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-action], [data-go]");
    if (!el) return;
    if (el.dataset.go && !el.dataset.action) return go(el.dataset.go);
    if (el.tagName === "INPUT" && el.type !== "checkbox") return;
    actions[el.dataset.action]?.(el);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && (S.sheetOpen || S.viewing || S.selected)) set({ sheetOpen: false, selected: null, viewing: null, returnFocus: S.opener });
    if (e.key === "Enter" && e.target.id === "composer" && !e.shiftKey) { e.preventDefault(); actions.addMsg(); }
  });
  document.addEventListener("change", (e) => {
    if (e.target.matches("input[type=file]") && e.target.files[0]) set({ shotUrl: URL.createObjectURL(e.target.files[0]), shotSynthetic: false });
  });
  // Text fields write straight into state; no re-render, so the caret stays put.
  document.addEventListener("input", (e) => {
    const el = e.target;
    if (el.dataset.bind) S[el.dataset.bind] = el.value;
    if (el.dataset.line) S.transcript.messages.find((m) => m.id === el.dataset.line).text = el.value;
    if (el.dataset.name) S.transcript.participants.find((p) => p.id === el.dataset.name).display = el.value;
  });

  document.getElementById("pt-jump").addEventListener("change", (e) => go(e.target.value));
  document.getElementById("pt-safety").addEventListener("change", (e) => set({ safety: e.target.checked }));
  document.getElementById("pt-decisions").addEventListener("change", (e) => set({ decisions: e.target.checked }));
  document.getElementById("pt-seed").addEventListener("change", (e) => set({ seedDemo: e.target.checked }));
  document.getElementById("pt-reset").addEventListener("click", () => {
    persist([]); Object.assign(S, fresh(), { saved: [], demoSaved: [], seedDemo: false }); document.getElementById("pt-seed").checked = false; render();
  });

  // Layout differs between phone and desktop (sheet vs inline), so re-render across the breakpoint.
  matchMedia("(min-width: 960px)").addEventListener("change", () => set({ sheetOpen: false }));

  // Deep links (#replay, #mirror, …) so reviewers can reopen one screen.
  const start = location.hash.slice(1);
  if (SCREENS[start] && !["reading", "analyzing"].includes(start)) go(start); else render();
})();

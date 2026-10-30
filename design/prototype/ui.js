// Shared render helpers for the prototype. Markup reuses the showcase component
// classes (components.css) so the prototype can't drift from the design system.
window.UI = (function () {
  const D = window.IM_DATA;

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const icon = (id) => `<svg aria-hidden="true"><use href="#i-${id}"></use></svg>`;
  const face = (ex) => `../brand/mascots/badge/${ex}-128.png`;

  // Full-body mascot in a fixed square slot. data-ex drives the size normalization
  // in prototype.css (same height for Parent/Adult forms, 0.8x for Child forms).
  const mascot = (ex, alt = "") => `<span class="pt-mascot" data-ex="${ex}"><img src="../brand/mascots/full/${ex}-256.png" alt="${esc(alt)}" loading="lazy"></span>`;

  // state: suggested | agreed | changed | unsure | plain
  function badge(ex, state, size) {
    const style = size ? ` style="--size:${size}px"` : "";
    if (state === "unsure" || ex === "unsure") return `<span class="im-badge im-badge--unsure" aria-hidden="true"${style}>?</span>`;
    const mark = state === "agreed" ? `<span class="im-badge__mark">${icon("check")}</span>`
      : state === "changed" ? `<span class="im-badge__mark">${icon("dot")}</span>` : "";
    const cls = state === "suggested" ? " im-badge--suggested" : "";
    return `<span class="im-badge im-ex${cls}" data-ex="${ex}" aria-hidden="true"${style}><span class="im-badge__face"><img src="${face(ex)}" alt=""></span>${mark}</span>`;
  }

  // People get initials on neutral tones, never a mascot hue: a colored person would
  // read as "this person is that ego state".
  const AVATAR_TONES = ["slate", "sand", "stone"];
  function avatar(S, pid, size) {
    const p = S.transcript.participants.find((x) => x.id === pid);
    const isMe = pid === S.selfId;
    const label = isMe ? "You" : displayName(S, p);
    const tone = isMe ? "me" : AVATAR_TONES[S.transcript.participants.filter((x) => x.id !== S.selfId).indexOf(p) % AVATAR_TONES.length];
    const style = size ? ` style="--av:${size}px"` : "";
    return `<span class="pt-avatar" data-tone="${tone}"${style} aria-hidden="true">${esc(label.replace(/^Person /, "")[0] || "?")}</span>`;
  }

  // Screenshot names default to pseudonyms; pasted or typed names are the user's own words.
  const displayName = (S, p) => (S.method === "screenshot" && !S.useNames ? p.pseudonym : p.display);
  const nameOf = (S, pid) => (pid === S.selfId ? "You" : displayName(S, S.transcript.participants.find((x) => x.id === pid)));

  const exName = (ex) => (ex === "unsure" ? "I'm not sure" : D.EX[ex].name);
  const chip = (ex) => ex === "unsure"
    ? `<span class="im-chip im-chip--unsure">I'm not sure</span>`
    : `<span class="im-chip im-ex" data-ex="${ex}">${D.EX[ex].name}</span>`;
  const conf = (level) => `<span class="im-confidence">${{ low: "Low confidence", medium: "Medium confidence", high: "High confidence" }[level]}</span>`;

  // Marks an unresolved decision in place so the prototype never silently decides it.
  const decision = (id, text) => `<p class="pt-decision" role="note"><strong>${esc(id)}</strong> ${esc(text)}</p>`;

  const highlight = (text, cues, ex) => {
    let out = esc(text);
    for (const c of cues) out = out.replace(esc(c), `<mark class="im-cue im-ex" data-ex="${ex}">${esc(c)}</mark>`);
    return out;
  };

  // Pattern rule (CONVERSATION_REPLAY.md): complementary iff the reply comes from the
  // place the message spoke to AND speaks back to where the message came from.
  function pattern(stim, resp) {
    if ([stim.source, stim.target, resp.source, resp.target].includes("UNCLEAR")) return "unclear";
    return resp.source === stim.target && resp.target === stim.source ? "complementary" : "crossed";
  }
  const PATTERN_COPY = {
    complementary: { name: "Flowing", tech: "complementary", body: "The reply answers from the place the message spoke to. Exchanges like this tend to keep flowing, in a helpful or an unhelpful direction." },
    crossed: { name: "Changing direction", tech: "crossed", body: "The reply comes from a different place than the one the message invited. The conversation often changes direction here. Sometimes that is a useful reset." },
    unclear: { name: "Hard to tell", tech: "unclear", body: "Hard to tell from text alone." },
  };
  const SECOND_LAYER = "The words may carry a second layer. Only the people involved know whether that fits.";

  const fmtDate = (iso) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

  return { esc, icon, face, mascot, badge, avatar, displayName, nameOf, exName, chip, conf, decision, highlight, pattern, PATTERN_COPY, SECOND_LAYER, fmtDate };
})();

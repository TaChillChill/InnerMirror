// Patterns: one 100% bar per saved conversation plus an average. By default only my
// own choices count (F2); AI suggestions I never reviewed can be shown, striped.
window.MirrorPatterns = (function () {
  const D = window.IM_DATA;
  const { esc, icon, badge, fmtDate } = window.UI;
  const MIN = 3;

  // Per conversation: shares of my messages per character, split into "mine" (chosen)
  // and "ai" (unreviewed, only when included). Each conversation weighs the same.
  function shares(c, includeAi) {
    const parts = {}; let n = 0;
    for (const m of c.mine) {
      if (!m.chosen && !includeAi) continue;
      const key = !m.chosen ? `${m.ai === "UNCLEAR" ? "unsure" : m.ai}:ai` : `${m.chosen}:mine`;
      parts[key] = (parts[key] || 0) + 1; n++;
    }
    for (const k in parts) parts[k] /= n;
    return { parts, n };
  }

  const ORDER = D.EX_ORDER.flatMap((ex) => [`${ex}:mine`, `${ex}:ai`]).concat(["unsure:mine", "unsure:ai"]);
  const label = (k) => { const [ex, src] = k.split(":"); return `${ex === "unsure" ? "Not sure" : D.EX[ex].name}${src === "ai" ? " (AI suggestion)" : ""}`; };

  function bar(parts, title, n) {
    const keys = ORDER.filter((k) => parts[k]);
    return `<div class="pt-chartbar-row"><span class="pt-chartbar-label">${title}</span>
      <span class="pt-chartbar" role="img" aria-label="${esc(keys.map((k) => `${label(k)} ${Math.round(parts[k] * 100)}%`).join(", "))}">
        ${keys.map((k) => { const [ex, src] = k.split(":"); return `<span class="pt-seg im-ex" data-ex="${ex}" data-src="${src}" style="width:${parts[k] * 100}%"></span>`; }).join("")}
      </span><span class="pt-chartbar-n">${n}</span></div>`;
  }

  function render(list, S) {
    const rows = list.map((c) => ({ c, ...shares(c, S.includeAi) })).filter((r) => r.n > 0)
      .sort((a, b) => a.c.createdAt.localeCompare(b.c.createdAt)).slice(-10);
    const toggle = `<label class="im-check pt-include"><input type="checkbox" data-action="includeAi" ${S.includeAi ? "checked" : ""}> Include AI suggestions I haven't reviewed</label>`;
    if (rows.length < MIN) return `<div class="pt-empty">${icon("chart")}<h2 class="pt-empty__title">Patterns appear after ${MIN} saved conversations</h2>
      <p>You have ${rows.length}${S.includeAi ? "" : " with characters you chose"}. A pattern from one or two conversations would say more about those chats than about you.</p>${toggle}</div>`;
    const keysAll = ORDER.filter((k) => rows.some((r) => r.parts[k]));
    const avg = Object.fromEntries(keysAll.map((k) => [k, rows.reduce((s, r) => s + (r.parts[k] || 0), 0) / rows.length]));
    const msgs = rows.reduce((s, r) => s + r.n, 0);
    const illustrative = rows.some((r) => r.c.illustrative || r.c.demoSaved);
    return `<div class="pt-patterns">
      ${illustrative ? `<p class="pt-demo-tag">${icon("chart")} Illustrative data · Patterns is a nice-to-have for the MVP</p>` : ""}
      <p class="pt-lead-sm">How the characters <strong>you chose</strong> for your own messages spread across saved conversations. Each bar is one conversation; the numbers are messages.</p>
      ${toggle}
      <ul class="pt-legend-row">${D.EX_ORDER.map((x) => `<li>${badge(x, "plain", 24)}${D.EX[x].name}</li>`).join("")}
        <li><span class="pt-swatch pt-swatch--unsure"></span>Not sure</li>
        ${S.includeAi ? `<li><span class="pt-swatch pt-swatch--ai"></span>Striped: AI suggestion I didn't review</li>` : ""}</ul>
      <h2 class="pt-h3">Across these conversations</h2>${bar(avg, "Average", msgs)}
      <h2 class="pt-h3">One bar per conversation, oldest first</h2>
      ${rows.map((r) => bar(r.parts, `${fmtDate(r.c.createdAt)} · ${esc(r.c.title || "Untitled")}`, r.n)).join("")}
      <details class="pt-more"><summary>Show as a table</summary><div class="pt-table-wrap"><table class="pt-table">
        <thead><tr><th scope="col">Conversation</th>${keysAll.map((k) => `<th scope="col">${label(k)}</th>`).join("")}<th scope="col">Messages</th></tr></thead>
        <tbody>${[["Average", avg, msgs], ...rows.map((r) => [`${fmtDate(r.c.createdAt)} · ${esc(r.c.title || "Untitled")}`, r.parts, r.n])].map(([l, p, n]) => `<tr><th scope="row">${l}</th>${keysAll.map((k) => `<td>${Math.round((p[k] || 0) * 100)}%</td>`).join("")}<td>${n}</td></tr>`).join("")}</tbody></table></div></details>
      <p class="im-hint">${rows.length} conversations · ${msgs} of your messages. Shares are per conversation, so a long chat doesn't outweigh a short one. This shows what you picked in these chats, not a measure of personality, and no character is better than another.</p>
    </div>`;
  }

  return { render };
})();

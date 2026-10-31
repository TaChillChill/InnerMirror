// Relationship eval summary: labels with relationship-only context vs the two no-context
// runs (run-to-run noise), role fixtures, and where the context was mentioned. No calls.
//   node scripts/phase0/p0/relationship-report.mjs > scripts/phase0/results/p0/RELATIONSHIP.md

import fs from "node:fs";
const D = "scripts/phase0/results/p0/v3";
const load = (f, v) => { const p = `${D}/${f}.${v}.json`; return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p)) : null; };
const lab = (r) => Object.fromEntries(r.normalized.readings.map((x) => [x.messageId, `${x.expression}.${x.confidence[0]}`]));
let changesBeyondNoise = 0, totalMsgs = 0, noiseMsgs = 0;
for (const f of ["vi2-family", "vi3-friends", "vi5-work", "vi6-checkin", "en2-sibling", "en3-couple", "vi8-roles", "vi9-hierarchy"]) {
  const a = load(f, "selfA"), b = load(f, "selfB"); if (!a || !b) continue;
  const la = lab(a), lb = lab(b);
  for (const v of ["ctx-rel", "ctx-relOther", "ctx-relLead"]) {
    const c = load(f, v); if (!c) continue;
    const lc = lab(c); const diffs = [];
    for (const id of Object.keys(lc)) {
      totalMsgs++;
      const e = (s) => s.split(".")[0];
      if (e(la[id]) !== e(lb[id])) noiseMsgs++;
      // Beyond noise: context label differs from BOTH no-context runs.
      if (e(lc[id]) !== e(la[id]) && e(lc[id]) !== e(lb[id])) { changesBeyondNoise++; diffs.push(`${id} ${la[id]}|${lb[id]} → ${lc[id]}`); }
    }
    const txt = JSON.stringify(c.raw).toLowerCase();
    const roleWords = ["bắt nạt", "mẹ chồng", "hàng xóm", "trưởng phòng", "nhân viên mới", "sếp cũ", "vì là", "vai", "partner", "sibling", "family", "gia đình", "bạn thân"].filter((w) => txt.includes(w));
    console.log(`${f.padEnd(14)} ${v.padEnd(13)} beyond-noise: ${diffs.join("; ") || "none"} | mentions: ${roleWords.join(", ") || "–"}`);
  }
}
console.log(`messages changed vs BOTH no-context runs: ${changesBeyondNoise}/${totalMsgs}; no-context runs disagree with each other on ${noiseMsgs}/${totalMsgs}`);
// role fixtures: labels per message across all variants
for (const f of ["vi8-roles", "vi9-hierarchy"]) for (const v of ["selfA", "selfB", "ctx-rel", "ctx-relOther"]) { const r = load(f, v); if (r) console.log(f, v.padEnd(13), Object.entries(lab(r)).map(([k, x]) => `${k}:${x}`).join(" ")); }

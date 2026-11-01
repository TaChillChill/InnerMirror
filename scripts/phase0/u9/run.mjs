// U9 eval: What if? spec s2.0 on any speaker's message. Live calls from the "eval-u9" bucket.
//   node scripts/phase0/u9/run.mjs [--runs=2] [--only=vi-other] [--dry]
// Uses the app's own request schema, body builder and cleaner, so what we test is what ships.
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { chat, worstCaseUsd } from "../client.mjs";
import { FIXTURES } from "./fixtures.mjs";
import { buildScenarioBody, SCENARIO_SPEC_VERSION } from "../../../src/lib/ai/scenario-spec.ts";
import { cleanScenario, localAnswer, receiverPrior, scenarioParticipants, scenarioRequestSchema } from "../../../src/lib/ai/scenario.ts";
import { pseudonymLabel, SELF_LABEL } from "../../../src/lib/ai/analysis-spec.ts";

const args = process.argv.slice(2);
const opt = (name, fallback) => (args.find((a) => a.startsWith(`--${name}=`)) ?? `=${fallback}`).split("=")[1];
const RUNS = Number(opt("runs", 2));
const only = opt("only", "");
const DRY = args.includes("--dry");
const RESCORE = opt("rescore", ""); // a saved results file: re-run the checks, no calls
const OUT = join(import.meta.dirname, "../results/u9");

// Old VI names (C1) and outcome/advice wording the prompt forbids.
const OLD_VI = /Người lớn|Trẻ Tự do|Trẻ Thích nghi/;
// "nên" alone means "so" in Vietnamese; only advice forms count. "would" is allowed in the
// note's "the text cannot show how X would reply" (a limit, not a prediction).
const BANNED = { en: /\b(will|likely|probabl\w*|should|better|worse|healthier)\b|\bthey would\b/i, vi: /(\bsẽ\b|chắc chắn|(bạn|họ|mình) nên|nên (chọn|nói|đáp|làm)|tốt hơn)/i };
const YOU = { en: /\byou(r|rs|'d|'re)?\b/i, vi: /\bbạn\b/i };

function requestFor(fx) {
  const cutAt = fx.cut ? fx.messages.findIndex((x) => x.id === fx.cut) + 1 : fx.messages.length;
  const messages = fx.messages.slice(0, cutAt);
  const participantIds = [...new Set(fx.messages.map((x) => x.speakerId))];
  const req = { language: fx.language, actorId: fx.actor, selfId: fx.self, receiverId: fx.receiver, state: fx.state, participantIds, messages, consent: true };
  const ok = scenarioRequestSchema.safeParse(req);
  if (!ok.success) throw new Error(`${fx.id}: invalid request ${ok.error.message}`);
  return ok.data;
}

function checks(fx, input, participants, result) {
  const out = [];
  const add = (name, pass, detail = "") => out.push({ name, pass, detail });
  add("valid output", !!result);
  if (!result) return out;
  if (fx.id.includes("safety")) { add("flagged", result.flagged); return out; }
  add("not flagged", !result.flagged);
  add("has a possibility or an honest 'insufficient'", result.possibilities.length > 0 || result.evidence === "insufficient");
  const text = [...result.possibilities.map((p) => p.rationale), result.note ?? "", result.reflectionQuestion ?? ""].join(" ");
  // The reflection question speaks to the reader, so "you" is fine there; rationales and note
  // describe participants and must not call anyone "you" unless that is the chosen self.
  const about = [...result.possibilities.map((p) => p.rationale), result.note ?? ""].join(" ");
  add("VI names match the UI (C1)", fx.language !== "vi" || !OLD_VI.test(text), text.match(OLD_VI)?.[0] ?? "");
  add("no outcome/advice words", !BANNED[fx.language].test(text), text.match(BANNED[fx.language])?.[0] ?? "");
  const actorLabel = participants.find((p) => p.id === fx.actor)?.label;
  if (!fx.self) add("no participant called you/bạn when no self is chosen", !YOU[fx.language].test(about), about.match(YOU[fx.language])?.[0] ?? "");
  // With a self, "you" may only mean the user: fine when the user is the receiver, never when
  // the explored speaker is someone else and the user took no part in the cited words.
  if (fx.self && fx.actor !== fx.self && fx.receiver !== fx.self) add("actor never called you", !YOU[fx.language].test(about), actorLabel);
  const prior = receiverPrior(input);
  add("evidence only from the receiver's earlier messages", result.possibilities.every((p) => p.evidenceMessageIds.every((x) => prior.ids.has(x))));
  return out;
}

const list = FIXTURES.filter((f) => !only || only.split(",").includes(f.id));
const plan = list.map((fx) => {
  const input = requestFor(fx);
  const participants = scenarioParticipants(input, SELF_LABEL[fx.language], (i) => pseudonymLabel(i, fx.language));
  const body = { model: "muse-spark-1.3", ...buildScenarioBody({ ...input, participants }) };
  return { fx, input, participants, body, local: localAnswer(receiverPrior(input)) };
});
const worst = plan.reduce((n, p) => n + (p.local ? 0 : worstCaseUsd(p.body) * RUNS), 0);
console.log(`spec ${SCENARIO_SPEC_VERSION}: ${plan.length} fixtures × ${RUNS} runs, worst case $${worst.toFixed(3)}`);
if (DRY) process.exit(0);
if (RESCORE) {
  const { readFileSync } = await import("node:fs");
  for (const r of JSON.parse(readFileSync(RESCORE, "utf8"))) {
    const p = plan.find((x) => x.fx.id === r.id);
    if (!p || r.error || r.local) { console.log(`${r.id} r${r.run}: ${r.error ? "ERROR" : "local"}`); continue; }
    const c = checks(p.fx, p.input, p.participants, r.result);
    console.log(`${r.id} r${r.run}: ${c.filter((x) => !x.pass).length ? "FAIL " + c.filter((x) => !x.pass).map((x) => `${x.name}${x.detail ? ` [${x.detail}]` : ""}`).join("; ") : "PASS"}`);
  }
  process.exit(0);
}

mkdirSync(OUT, { recursive: true });
let spent = 0;
const rows = [];
for (const p of plan) {
  for (let run = 1; run <= RUNS; run++) {
    if (p.local) { rows.push({ id: p.fx.id, run, local: true, checks: [] }); continue; }
    try {
      const { json, usd, latencyMs } = await chat({ phase: "eval-u9", label: `u9-${p.fx.id}-r${run}`, body: p.body });
      spent += usd;
      const raw = JSON.parse(json.choices?.[0]?.message?.content ?? "null");
      const result = cleanScenario(raw, p.input);
      const c = checks(p.fx, p.input, p.participants, result);
      rows.push({ id: p.fx.id, run, latencyMs, usd, labels: p.participants, raw, result, checks: c });
      console.log(`${p.fx.id} r${run}: ${c.filter((x) => !x.pass).length ? "FAIL " + c.filter((x) => !x.pass).map((x) => `${x.name}${x.detail ? ` [${x.detail}]` : ""}`).join("; ") : "PASS"} (${(latencyMs / 1000).toFixed(1)} s, $${usd.toFixed(4)})`);
    } catch (e) {
      rows.push({ id: p.fx.id, run, error: e.message });
      console.log(`${p.fx.id} r${run}: ERROR ${e.message}`);
    }
  }
}
writeFileSync(join(OUT, `${SCENARIO_SPEC_VERSION}-${new Date().toISOString().replace(/[:.]/g, "-")}.json`), JSON.stringify(rows, null, 2));
console.log(`spent $${spent.toFixed(4)}`);

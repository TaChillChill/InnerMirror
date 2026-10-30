# InnerMirror

See yourself more clearly through your everyday conversations.

InnerMirror reads a screenshot of a text conversation and offers *possible* readings of the ego states (Parent / Adult / Child, from Transactional Analysis) behind each message. You decide which readings fit your own experience, explore one alternative response, and save a short personal reflection.

> Awareness before change. The AI offers interpretations; you remain the authority on your own experience.
> InnerMirror is not a diagnostic tool, a relationship judge, or a replacement for professional support.

Built for the Meta Global AI Developer Hackathon 2026 with the Meta Model API (Muse Spark, Muse Image).

## Status
Phase 1 (functional MVP), milestone 2: paste/type → AI Observation → My Interpretation → My Mirror works locally with the live Meta API. Screenshot import (M3) and What if? (M5) are next. Current state: [`TODO.md`](TODO.md). Rules: [`CLAUDE.md`](CLAUDE.md). Evaluation: [`docs/PHASE0_REPORT.md`](docs/PHASE0_REPORT.md).

## Run the app locally
```bash
npm install
cp .env.example .env.local   # fill META_API_KEY yourself; never commit or paste it
npm run dev                  # http://localhost:3000
npm test && npm run lint && npm run typecheck && npm run build
```
Each "Look at this conversation" is one live call (≈ $0.02–0.03, 15–40 s). The server logs only metadata (tokens, cost, latency), never conversation text.

## Flow
Conversation → AI Observation → My Interpretation → My Mirror (optional: Scenario Explorer)

## Repo layout
```
CLAUDE.md          Stable project rules for Claude Code
TODO.md            Session state: phase, next actions, blockers
.claude/           Project permissions (deny rules for secret files)
docs/              Product, theory, UX, architecture, API/policy research, plan, Phase 0 report
scripts/phase0/    Feasibility harness (no dependencies, budget-capped)
src/               Application code (after Phase 0 approval)
```

## Local setup
Requires **Node 24+** (the Phase 0 scripts use `process.loadEnvFile`). Phase 0 needs no `npm install`.

```bash
cp .env.example .env.local   # then fill META_API_KEY yourself; never commit or paste it
```
Only `META_API_KEY` is read by the Phase 0 harness. Note: the harness ignores `AI_MODE`; any non-`--dry` command calls the live API.

## Phase 0 (feasibility)
```bash
node scripts/phase0/run.mjs smoke --dry        # worst-case cost, no API call
node scripts/phase0/run.mjs smoke              # live: API access + structured output (< $0.01)
node scripts/phase0/run.mjs analyze all        # live: 4 synthetic conversations (≈ $0.22 worst case)
node scripts/phase0/run.mjs check all          # re-run automatic checks offline
```
Spend is tracked in `scripts/phase0/.ledger.json` and capped ($5 working cap, per-phase caps in `client.mjs`); the scripts refuse calls that could exceed a cap. Results land in `scripts/phase0/results/`. Score them with the rubric in `docs/PHASE0_REPORT.md` §5.

Prompt evaluation (uses the same spec as the app, `src/lib/ai/analysis-spec.ts`):
```bash
node scripts/phase0/eval.mjs --dry                      # cost bound, no calls
node scripts/phase0/eval.mjs --efforts=low,medium --runs=2
node scripts/phase0/eval.mjs --report                   # rebuild results/<spec version>/REPORT.md
```

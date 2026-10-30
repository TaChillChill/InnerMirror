# InnerMirror

See yourself more clearly through your everyday conversations.

InnerMirror reads a screenshot of a text conversation and offers *possible* readings of the ego states (Parent / Adult / Child, from Transactional Analysis) behind each message. You decide which readings fit your own experience, explore one alternative response, and save a short personal reflection.

> Awareness before change. The AI offers interpretations; you remain the authority on your own experience.
> InnerMirror is not a diagnostic tool, a relationship judge, or a replacement for professional support.

Built for the Meta Global AI Developer Hackathon 2026 with the Meta Model API (Muse Spark, Muse Image).

## Status
Phase 0 (feasibility) — harness ready, live API tests pending. No application code yet. Current state and next actions: [`TODO.md`](TODO.md). Rules: [`CLAUDE.md`](CLAUDE.md). Results: [`docs/PHASE0_REPORT.md`](docs/PHASE0_REPORT.md).

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
Spend is tracked in `scripts/phase0/.ledger.json` and capped ($1 smoke, $15 total); the scripts refuse calls that could exceed a cap. Results land in `scripts/phase0/results/`. Score them with the rubric in `docs/PHASE0_REPORT.md` §5.

App setup (Next.js) is added in Phase 1.

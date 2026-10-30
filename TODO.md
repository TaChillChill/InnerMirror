# TODO — InnerMirror

Session state and next actions. Stable rules live in `CLAUDE.md`. Overwrite this file whenever a meaningful task is completed or blocked; keep it short (no history, no "done" list — outcomes go to the relevant doc or git).

## Current phase
**Phase 0 — Feasibility validation** (gate: Founder approves the completed `docs/PHASE0_REPORT.md` before any Phase 1 code).

## Current status (2026-10-30)
- Discovery and planning are **done**; don't redo them. Decisions live in `docs/OPEN_QUESTIONS.md`.
- Done: all docs, policy/rules research (`PHASE0_REPORT.md` §1–§3), Phase 0 harness in `scripts/phase0/` (tested offline). Project setup: `TODO.md`, Commands + DoD in `CLAUDE.md`, secret-file deny rules in `.claude/settings.json`, README setup.
- Live API tests not run. Spend so far: **$0** (no `.ledger.json` yet).

## Next actions (max 5)
1. **Founder:** create `.env.local` (`cp .env.example .env.local`) and fill `META_API_KEY` yourself. Then authorize the Phase 0 run in that session.
2. `node scripts/phase0/run.mjs smoke --dry`, then `node scripts/phase0/run.mjs smoke` — API access from Vietnam + structured output (< $0.01).
3. `node scripts/phase0/run.mjs analyze all` — 3 synthetic conversations + safety probe (≈ $0.22 worst case).
4. Score `scripts/phase0/results/*.md` against the rubric in `docs/PHASE0_REPORT.md` §5; tune `scripts/phase0/prompt.mjs` if needed and re-run within budget.
5. Fill §4–§6 of `PHASE0_REPORT.md` (findings, limitations, costs, recommendations), present to Founder, wait for approval.

## Blockers
- `.env.local` does not exist yet (B1). Other Founder decisions: `docs/PHASE0_REPORT.md` §7 (card without hard cap, Official Rules behind login, AUP framing/Discord, mascot files).

## Last validation result
2026-10-30: `.claude/settings.json` deny rules verified in-session (see commit "Add project setup"). Phase 0 harness: offline budget guards + checks passed earlier; no live run yet.

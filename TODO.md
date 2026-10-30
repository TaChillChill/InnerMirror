# TODO — InnerMirror

Session state and next actions. Stable rules live in `CLAUDE.md`. Overwrite this file whenever a meaningful task is completed or blocked; keep it short (no history, no "done" list — outcomes go to the relevant doc or git).

## Current phase
**Phase 1 — Functional MVP** (Founder go-ahead 2026-10-30), in milestones: M1 API smoke → M2 paste/type analysis + Replay → M3 screenshot import → M4 My Mirror → M5 What if?. Report after each milestone. Local only: no commit, push or deploy without Founder approval.

## Current status (2026-10-30)
- Founder approved UX-9…12, D6–D9, D10 (layout; resources still to review), D11 deferred, D12. F6 privacy copy **conditionally** approved: final only after Meta retention is verified (no retention period published as of 2026-10-30).
- **Prompt v2.1 + evaluation done** (`src/lib/ai/analysis-spec.ts`, shared by app and harness). Results: `docs/PHASE0_REPORT.md` §4 "Prompt v2 evaluation". Default effort `medium`. Transactions experimental (computed, not shown).
- **M2 done locally, awaiting Founder hands-on review:** Next.js app in `src/` (paste/type → review/edit/"this is me"/consent → `/api/analyze` → Replay with shifts and selector → My Mirror stickers, save/delete, EN/VI). Not committed.
- Spend: harness **$0.79** (ledger) + app dev **$0.05** (2 e2e calls) ≈ **$0.85** of $5.

## Next actions (max 5)
1. **Founder:** run `npm run dev`, try a real conversation, give feedback (see README "Run the app locally").
2. M3: screenshot upload → `/api/extract` → same Review screen (Transcript already supports `source: "screenshot"` and `legibility`).
3. M5: What if? (`/api/scenario`), then Patterns only if time allows.
4. Before any deploy: wire `ACCESS_CODE` in the UI, finalize F6 copy, review D10 resources (Q10).
5. Bake D12 mascot sizing into `design/brand/mascots/build_variants.py`; VI reader pass on prompt output and UI copy.

## Blockers
- Meta publishes no retention period → F6 keeps "may keep it for a period it decides".
- D10 safety resources (Q10) still need content review.

## Last validation result
2026-10-30 M2: `npm test` 11/11, lint and typecheck clean, `next build` OK. Headless-Chrome e2e with live API: desktop EN (1280 px) and mobile VI (390 px) both complete paste → review → analyze (20.6 s / 31.7 s) → selector (focus in/out, cue highlight) → change a label → My Mirror → save → reload keeps the collection; no horizontal overflow on any screen; localStorage holds labels only (no text, no names); server log holds metadata only. Impeccable detector: landing clean at 1280 and 390 px.

# TODO — InnerMirror

Session state and next actions. Stable rules live in `CLAUDE.md`. Overwrite this file whenever a meaningful task is completed or blocked; keep it short (no history, no "done" list — outcomes go to the relevant doc or git).

## Current phase
**Phase 1 — Functional MVP** (Founder go-ahead 2026-10-30), in milestones: M1 API smoke → M2 paste/type analysis + Replay → M3 screenshot import → M4 My Mirror → M5 What if?. Report after each milestone. Local only: no commit, push or deploy without Founder approval.

## Current status (2026-10-30)
- M2 approved by Founder for continued development (not for public release). Backlog: AI sometimes infers others' intentions; analysis latency 20–33 s (don't optimize yet); transactions stay hidden; safety resources, access control and privacy (F6, D10) must be settled before any public deploy.
- **M3 APPROVED by Founder (UAT round 2, 2026-10-31), committed locally, not pushed.** Built: up to 3 screenshots → client resize/JPEG (EXIF dropped) → `/api/extract` (`src/lib/ai/extract-spec.ts`, `extraction.ts`) → same Review screen → analyze only after the user confirms. Unreadable/cut-off messages are marked, never filled in; user's identity is not preselected. Compare-with-screenshot panel; screenshots dropped from memory on analyze/back.
- M3 UX refinements (accepted): bigger numbered thumbnails open a lightbox (`ShotLightbox.tsx`, native dialog: zoom 100–300%, prev/next, Esc, arrows); picker, drag & drop and paste share `addFiles` (limit 3, same compression and consent; adding never starts extraction; paste inside text fields untouched). Pure rules in `src/lib/image-intake.ts`. Extraction/analysis prompts unchanged.
- Known M3 limit: Vietnamese stacked diacritics are sometimes misread and still marked "clear" (e.g. "Bận" → "Bạn"); medium effort did not help. Mitigated by review copy only.
- `scripts/phase0/prompt.mjs` was deleted on purpose in commit 0f1ffb4 (v1 prompt, replaced by `src/lib/ai/analysis-spec.ts`); nothing references it. No recovery needed.
- Spend: harness $0.79 + app dev $0.05 + M3 tests ≈ $0.08 (of the $1 M3 allowance) ≈ **$0.92** of $5.

## Next actions (max 5)
1. **Founder:** review the M5 plan (Scenario Explorer) and answer its open decisions. No M5 code until approved.
2. M5: What if? (`/api/scenario`) after plan approval. Transcript ids and `source` are untouched by M3, so scenarios can reference message ids as before.
3. Before any deploy: wire `ACCESS_CODE` in the UI (analyze and extract both check it), finalize F6 copy, review D10 resources (Q10).
4. Bake D12 mascot sizing into `design/brand/mascots/build_variants.py`; VI reader pass on prompt output and UI copy.
5. Optional: eval harness for extraction (more synthetic screenshots, real-app styles) if M3 accuracy matters for the demo.

## Blockers
- Meta publishes no retention period → F6 keeps "may keep it for a period it decides".
- D10 safety resources (Q10) still need content review.

## Last validation result
2026-10-31 M3 UX: `npm test` 22/22, lint, typecheck, build clean. Headless-Chrome interaction test (DOM-dispatched drag/drop/paste events) passes on 1280 px and 390 px, 0 API calls. Not verified: real OS drag from Finder, real clipboard paste, touch pinch, iOS Safari.

Previous: 2026-10-30 M3: `npm test` 17/17, lint, typecheck and `next build` clean. Live extraction on synthetic screenshots (~$0.005–0.01 per call, 4–14 s): EN exact match; VI 1 diacritic error on full image, 2 on a cropped one; cropped edges flagged (`cropped_top/bottom`, one `partial`, one empty `unreadable`). Route rejects no-consent, non-JPEG, 0 or 4 images, junk base64, oversize body without calling Meta. Headless-Chrome e2e (390 px, EN UI and VI UI): non-image rejected, consent gate, extract → Review with notices, edit text/speaker, self + consent → analyze → Replay; no analyze call before confirmation; nothing image-related in localStorage; server log has metadata only.

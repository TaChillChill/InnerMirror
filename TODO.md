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
1. **Founder:** final UI/UX comments (not yet implemented); review privacy/footer copy.
2. **Founder (Vercel/Meta):** link project, set `META_API_KEY` and `APP_SPEND_CAP_USD=5`; Vercel Authentication for Founder UAT (Password Protection is Pro only, $20/mo/project); one Firewall rate-limit rule on `/api/` (Hobby: 1 rate-limit rule of 3 custom rules; changes apply without redeploy); check Meta console for a payment method (ToS 13.2 auto-charge; credit exhaustion undocumented).
3. Then: preview deploy (approval), smoke test with synthetic conversation (~$0.05, approval), real-iPhone Safari checks. Before external beta: rate-limit rule verified, Meta auto-charge risk accepted or card removed.
4. Deferred: "Your Turn", D12 mascot sizing, extraction eval harness, access-code UI (leave `ACCESS_CODE` unset).

## Blockers
- Meta publishes no retention period; copy says "may keep it for a period it decides".
- Meta auto-charge after credits run out: unverified (needs console check).

## Last validation result
2026-10-31 release prep: `npm test` 41/41, lint, typecheck, build clean; `/privacy` and landing 18+ note confirmed in server HTML. $0 live spend. Not verified: visual check of `/privacy` in a browser, VI native-reader pass, real iOS Safari.

Previous: 2026-10-31 M5 round 3 (Impeccable My Mirror critique 21/40 → fixes): `npm test` 39/39, lint, typecheck, build, detector clean. Mocked acceptance e2e passes at 1280, 1000, 390 px (layers, navigation without re-analysis, confirm on unsaved new, scroll lock behind sheet/dialog, dialog Esc + focus return, card 340 px / 40 px badges). $0 live spend this round (M5 total stays $0.253 of $0.30). Not verified: real iOS Safari. Deferred: 960–1199 px layout (judged readable), sheet drag.

Previous: 2026-10-31 M5 UX revision (Impeccable critique 23/40 → redesign): `npm test` 39/39, lint, typecheck, build, detector clean. Mocked UI e2e passes at 1280, 1000 and 390 px; one live e2e at 1280 px: 2 calls, $0.031 (15 s, 21 s). **M5 live spend total $0.253 of $0.30.** Brand voice: Mirror/Gương in UI; "AI" kept only where it names Meta's model or technical errors.

Previous: 2026-10-31 M5: `npm test` 38/38, lint, typecheck, build clean. Live: 16 scenario calls, **$0.222 of the $0.30 M5 budget** (avg $0.014, median 14 s, range 6–34 s). Browser e2e (live scenario calls, analyze mocked) on 1280 px VI and 390 px EN. Limits: the first possibility is the receiver's own history pattern, so it repeats across explored characters; only the second varies. Not tested: real-app screenshots end to end, iOS Safari.

Previous: 2026-10-31 M3 UX: `npm test` 22/22, lint, typecheck, build clean. Headless-Chrome interaction test (DOM-dispatched drag/drop/paste events) passes on 1280 px and 390 px, 0 API calls. Not verified: real OS drag from Finder, real clipboard paste, touch pinch, iOS Safari.

Previous: 2026-10-30 M3: `npm test` 17/17, lint, typecheck and `next build` clean. Live extraction on synthetic screenshots (~$0.005–0.01 per call, 4–14 s): EN exact match; VI 1 diacritic error on full image, 2 on a cropped one; cropped edges flagged (`cropped_top/bottom`, one `partial`, one empty `unreadable`). Route rejects no-consent, non-JPEG, 0 or 4 images, junk base64, oversize body without calling Meta. Headless-Chrome e2e (390 px, EN UI and VI UI): non-image rejected, consent gate, extract → Review with notices, edit text/speaker, self + consent → analyze → Replay; no analyze call before confirmation; nothing image-related in localStorage; server log has metadata only.

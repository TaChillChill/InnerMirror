# TODO — InnerMirror

Session state and next actions. Stable rules live in `CLAUDE.md`. Overwrite this file whenever a meaningful task is completed or blocked; keep it short (no history, no "done" list — outcomes go to the relevant doc or git).

## Current phase
**Phase 1 — Functional MVP** (Founder go-ahead 2026-10-30), in milestones: M1 API smoke → M2 paste/type analysis + Replay → M3 screenshot import → M4 My Mirror → M5 What if?. Report after each milestone. Local only: no commit, push or deploy without Founder approval.

## Current status (2026-10-30)
- **P0 classification fix implemented (2026-10-31), committed locally, not deployed.** Spec v3.2 at low effort: speaker-blind (model never told who the user is), turn grouping, context-first schema, new TA definitions, family fallback, uncertainty on chips. Before/after in `docs/CLASSIFICATION_AUDIT.md` §9: invalid outputs 2/22 → 0/22, safety probe 0/2 → 2/2, within-turn label changes 60% → 16%, 27 s → 14.5 s. **Not production-ready:** open items §9.5 (turn split instability, FC/AC coin flip on distress). Context UI not added (no measurable gain, no bias found).
- M2 approved by Founder for continued development (not for public release). Backlog: AI sometimes infers others' intentions; analysis latency 20–33 s (don't optimize yet); transactions stay hidden; safety resources, access control and privacy (F6, D10) must be settled before any public deploy.
- **M3 APPROVED by Founder (UAT round 2, 2026-10-31), committed locally, not pushed.** Built: up to 3 screenshots → client resize/JPEG (EXIF dropped) → `/api/extract` (`src/lib/ai/extract-spec.ts`, `extraction.ts`) → same Review screen → analyze only after the user confirms. Unreadable/cut-off messages are marked, never filled in; user's identity is not preselected. Compare-with-screenshot panel; screenshots dropped from memory on analyze/back.
- M3 UX refinements (accepted): bigger numbered thumbnails open a lightbox (`ShotLightbox.tsx`, native dialog: zoom 100–300%, prev/next, Esc, arrows); picker, drag & drop and paste share `addFiles` (limit 3, same compression and consent; adding never starts extraction; paste inside text fields untouched). Pure rules in `src/lib/image-intake.ts`. Extraction/analysis prompts unchanged.
- Known M3 limit: Vietnamese stacked diacritics are sometimes misread and still marked "clear" (e.g. "Bận" → "Bạn"); medium effort did not help. Mitigated by review copy only.
- `scripts/phase0/prompt.mjs` was deleted on purpose in commit 0f1ffb4 (v1 prompt, replaced by `src/lib/ai/analysis-spec.ts`); nothing references it. No recovery needed.
- Spend: harness $0.79 + app dev $0.05 + M3 tests ≈ $0.08 (of the $1 M3 allowance) ≈ **$0.92** of $5.

## Next actions (max 5)
0. **Founder:** UAT of P0 on a local build (or approve a Preview deploy); re-run the real UAT conversation from both perspectives; review `docs/CLASSIFICATION_EVAL_SET.md` + flagged review items with a VI reader. Decide: ≈ $0.5 for the split-rule fix + 3-run stability eval (eval-p0 has $0.36 left of $3). Check Vercel env `ANALYZE_EFFORT` (overrides the new low default).
1. **Founder:** UAT on the protected Preview (Vercel login required): https://innermirror-b0w6iup36-tachillchills-projects.vercel.app . Paid end-to-end smoke test (~$0.05) needs separate approval. Send final UI/UX comments.
2. Before external beta: switch rate-limit rule from Log to block (`vercel firewall rules edit "API rate limit (log)" --rate-limit-action rate_limit` then `vercel firewall publish --yes`); decide how to open access (protection is "All Deployments" now; external testers need it relaxed or a Preview-target alias); resolve or accept Meta auto-charge risk (credit exhaustion undocumented).
3. Vercel: project `innermirror` (prj_ZR9aFyXYyPN6IksqoCxhMg72Ly4A). First deploy of a new project is always Production (docs); one such deployment exists (no env vars, protected, no API key). Later deploys: `vercel deploy --target=preview`. Never `--prod` without approval. Emergency stop: `vercel firewall rules enable "EMERGENCY deny API" && vercel firewall publish --yes`.
4. Real-iPhone Safari checks; VI native-reader pass.
5. Deferred: "Your Turn", D12 mascot sizing, extraction eval harness, access-code UI.

## Blockers
- Meta publishes no retention period; copy says "may keep it for a period it decides".
- Meta auto-charge after credits run out: unverified (needs console check).

## Last validation result
2026-10-31 P0: `npm test` 47/47, lint, typecheck, `next build` clean. Live eval (synthetic, 11 fixtures VI+EN): eval-p0 $2.64 of $3; harness total $3.43; project ≈ $3.9 + Founder Preview UAT. Mocked UI check (all /api/* intercepted in headless Chrome) at 390 and 1280 px: 23 bubbles → 13 characters, uncertainty prefixes, panel quotes whole segment. Not verified: real iOS Safari, VI native-reader review of new rationales.

Previous: 2026-10-31 Firewall: rule "API rate limit" now blocks (429) at 10 req/60 s per IP on path prefix /api/ (analyze, extract, scenario; one shared counter). Verified free on Preview innermirror-o36h8tt4s: 10x 400 then 429 on /api/scenario, 429 on /api/analyze. Emergency deny rule still disabled. Protection unchanged ("all"). Proposed beta access: one Vercel Shareable Link for the Preview deployment (Founder approval pending). Known UX gap: the app shows the generic error for Vercel's 429 (body is an object, not a string).

Previous: 2026-10-31 Header + diagram refinements: sticky header (Option B: near-white at top, #F3F0FF tint + #E5DFFF border once scrolled; height published as --app-header-h; on phones the header with the wrapped stepper stays static to save space; My Mirror is icon-only below 560 px). Diagram legend (P/A/C with grouped mascots), flow captions, crossed example now Parent → Child. `npm test` 45/45, lint, typecheck, build clean; scripted checks at 1280/390: anchor not covered, toggle, My Mirror/Home/CTA, 0 API calls. Not deployed.

Previous: 2026-10-31 Landing V3 (approved mockup `design/mockups/landing-v3`): hero "two egos meet", illustrative 3-voice demo, TA section (3 roots / 5 voices, Berne only in the methodology line), educational P/A/C diagram (no transaction map), 4 steps, EN | VI toggle, app icon in header. `npm test` 45/45, lint, typecheck, build clean; screenshots at 1280 and 390 px (EN/VI, privacy); scripted check: demo switch, toggle, CTA, 0 API calls. Not deployed. Not verified: real iOS Safari, VI native-reader pass. Logo is the interim crop (D2): need transparent SVG or >=1600 px PNG before submission.

Previous: 2026-10-31 Preview paid smoke (synthetic, 5 messages): 1 analyze (200, 16.4 s, $0.0205) + 1 What if (200, 10.9 s, $0.0142) = $0.0347 of the $0.05 approved; Meta key works on Preview; logs hold metadata only (no content, no secrets). Earlier same-instance calls ($0.0535 analyze at 46 s, $0.0132 scenario) were not from this test (likely Founder UAT). Not verified: auto-charge after credits, real iOS Safari.

Previous: 2026-10-31 release prep: `npm test` 41/41, lint, typecheck, build clean; `/privacy` and landing 18+ note confirmed in server HTML. $0 live spend. Not verified: visual check of `/privacy` in a browser, VI native-reader pass, real iOS Safari.

Previous: 2026-10-31 M5 round 3 (Impeccable My Mirror critique 21/40 → fixes): `npm test` 39/39, lint, typecheck, build, detector clean. Mocked acceptance e2e passes at 1280, 1000, 390 px (layers, navigation without re-analysis, confirm on unsaved new, scroll lock behind sheet/dialog, dialog Esc + focus return, card 340 px / 40 px badges). $0 live spend this round (M5 total stays $0.253 of $0.30). Not verified: real iOS Safari. Deferred: 960–1199 px layout (judged readable), sheet drag.

Previous: 2026-10-31 M5 UX revision (Impeccable critique 23/40 → redesign): `npm test` 39/39, lint, typecheck, build, detector clean. Mocked UI e2e passes at 1280, 1000 and 390 px; one live e2e at 1280 px: 2 calls, $0.031 (15 s, 21 s). **M5 live spend total $0.253 of $0.30.** Brand voice: Mirror/Gương in UI; "AI" kept only where it names Meta's model or technical errors.

Previous: 2026-10-31 M5: `npm test` 38/38, lint, typecheck, build clean. Live: 16 scenario calls, **$0.222 of the $0.30 M5 budget** (avg $0.014, median 14 s, range 6–34 s). Browser e2e (live scenario calls, analyze mocked) on 1280 px VI and 390 px EN. Limits: the first possibility is the receiver's own history pattern, so it repeats across explored characters; only the second varies. Not tested: real-app screenshots end to end, iOS Safari.

Previous: 2026-10-31 M3 UX: `npm test` 22/22, lint, typecheck, build clean. Headless-Chrome interaction test (DOM-dispatched drag/drop/paste events) passes on 1280 px and 390 px, 0 API calls. Not verified: real OS drag from Finder, real clipboard paste, touch pinch, iOS Safari.

Previous: 2026-10-30 M3: `npm test` 17/17, lint, typecheck and `next build` clean. Live extraction on synthetic screenshots (~$0.005–0.01 per call, 4–14 s): EN exact match; VI 1 diacritic error on full image, 2 on a cropped one; cropped edges flagged (`cropped_top/bottom`, one `partial`, one empty `unreadable`). Route rejects no-consent, non-JPEG, 0 or 4 images, junk base64, oversize body without calling Meta. Headless-Chrome e2e (390 px, EN UI and VI UI): non-image rejected, consent gate, extract → Review with notices, edit text/speaker, self + consent → analyze → Replay; no analyze call before confirmation; nothing image-related in localStorage; server log has metadata only.

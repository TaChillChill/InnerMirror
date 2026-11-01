# TODO — InnerMirror

Session state and next actions. Stable rules live in `CLAUDE.md`. Overwrite this file whenever a meaningful task is completed or blocked; keep it short (no history, no "done" list — outcomes go to the relevant doc or git).

## Current phase
**Phase 1 — Functional MVP, UAT round 4 (CONDITIONAL GO, 2026-11-01).** Plan and decisions: `docs/UAT_EXECUTION_PLAN.md` §7. Feature freeze Nov 3, 18:00 ICT; internal submit Nov 4, 22:00 ICT. Everything is local commits: nothing pushed or deployed since the protected Preview.

## Current status (2026-11-01, completion sprint)
- **All approved pre-submission items built (local commits, not pushed):** Wave 0, Wave 1, U7, S1, U8 Direction (`84c6d8a`), U9 What if? any speaker + C1 (`6d0ee0e`), U3 story v1 (`f379c19`), Light/Dark/System (`be099a0`), firewall 429 message (`35120d6`), My Reflection picture (`cb293e6`).
- **Evidence and Founder iPhone checklist:** `docs/RELEASE_READINESS.md`.
  - Unit tests: 96/96.
  - Mocked e2e: 215/215.
  - Live evals: U9 16/16, story 10/10.
  - Live UAT: 23/23.
- **Recommendation:** GO for a Preview deploy (needs approval); not yet for judge/public access.
- **Spend:** ledger $4.11 + app/Preview ≈ $0.75 (Founder UAT $0.108, live UAT $0.101, earlier ≈ $0.54 est.) ≈ **$4.86 of $6**.
- **Local server:** `npx next start -p 3123` reads `.env.local` (live calls). For mocked e2e, run it with `META_API_KEY=` (empty). Live UAT: `APP_SPEND_CAP_USD=0.4 npx next start -p 3123` + `node scripts/e2e/live-uat.mjs`.

## Next actions (max 5)
1. **Founder:** approve the Preview deploy (`vercel deploy --target=preview`), then run the iPhone checklist in `docs/RELEASE_READINESS.md` §5 (mic needs HTTPS).
2. **Founder:** Q15 rules → judge-access method (UAT plan §7.12); decide the in-app rate limit for judging (R2: 8 per 10 min per IP).
3. VI native-reader pass: Direction table, story copy, What if? copy for other speakers.
4. Fix UAT findings only (feature freeze Nov 3, 18:00 ICT).
5. Submission: README, demo video, submit by Nov 4, 22:00 ICT.

## Blockers
- Meta publishes no retention period; copy says "may keep it for a period it decides".
- Meta auto-charge after credits run out: unverified (needs console check).
- Judge access waits for Q15.

## Deferred / known limits
- Turn-split instability and FC/AC coin flip on distress (`docs/CLASSIFICATION_AUDIT.md` §9.5); prompt fix ≈ $0.5, not approved.
- VI stacked diacritics sometimes misread in screenshots (mitigated by review copy).
- Rate-limit rule must block (not log) before an external beta; emergency deny rule documented in `docs/IMPLEMENTATION_PLAN.md`.
- Brand mascot for the donut is the app icon placeholder (D2). Enhancements E1–E10 after submission.

## Last validation result
2026-11-01 completion sprint (`c35358c`):
- `npm test` 96/96; lint, typecheck and `next build` clean.
- `sh scripts/e2e/run-all.sh`: 20 runs, 215/215 PASS at 360/390/1280 px, EN/VI, light/dark, all /api/* mocked.
- Live, synthetic only:
  - U9 eval: 16 calls, $0.2296, 16/16.
  - Story eval: 10 calls, $0.1248, 10/10 valid, 0 leaks in readings.
  - Live UAT: 7 calls, $0.1007, 23/23.
- Not verified: real iPhone Safari, real microphone, screen reader, VI native-reader pass.

2026-11-01 Direction + My Reflection picture: `npm test` 85/85, lint, typecheck, `next build` clean. Mocked e2e suite (`sh scripts/e2e/run-all.sh`, all /api/* intercepted): 175 checks pass, 0 fail, at 390 and 1280 px, incl. U8 (self first, 2 suggestions, choose another, preselected What if?, no /api/scenario call, focus return). $0 spent. Not verified: real iPhone Safari, VI native-reader pass of the direction wording.

2026-11-01 Wave 1: `npm test` 82/82, lint, typecheck, `next build` clean. Mocked e2e suite (`sh scripts/e2e/run-all.sh`, all /api/* intercepted): 143 checks pass at 390 and 1280 px, EN and VI (Back, merge, sample, My Mirror, untouched-observation regression, panel/observation, input + mic with a stubbed recognizer incl. denied/unsupported). $0 app spend; S1 eval $0.091 (harness ledger $3.76; known project ≈ $4.3 of $6). Not verified: real iPhone Safari (mic, sheet), real microphone, VI native-reader pass.

2026-11-01 U7 My Mirror: `npm test` 74/74, lint, typecheck, `next build` clean. Headless Chrome with 8 seeded v1 collections at 390 (VI) and 1280 (EN): 8 cards, numbered defaults, cloud badges 5/2/1; 30 days 46 turns / 8 conversations, % sum 100, unclear 2 + not-sure 1 listed apart; 7 days 14/2; slider from #3 → 38/6; detail dialog + Esc focus return; edges inside the screen; 0 API requests. Regression M1/M2/M6 e2e still pass. Found and fixed during the check: viewport media queries inside the narrow app column, and the card row widening the page grid (hidden by body overflow).

2026-11-01 Wave 0: `npm test` 67/67, lint, typecheck, `next build` clean. Headless Chrome (CDP, all /api/* intercepted) on a local prod build: M1 Back round-trip 14/14 checks at 390 and 1280 px (paste + screenshots, order kept, unchanged input → no new extract call, changed input asks first); M2 merge 7/7 at 390 and 1280 (count in confirm, 5/5 messages kept, undo, analysis request has 2 speakers); M6 sample 8/8 EN 390 + VI 1280 with 0 API requests. $0 spent. Not verified: real iPhone Safari, VI native-reader pass of new copy.

2026-10-31 Sarcasm cap + journey: `npm test` 59/59, lint, typecheck, `next build` clean. Mocked core journey on a local prod build (extract/analyze mocked with a saved real v3 output, other /api/* blocked) at 390 and 1280 px: screenshot → no call before consent → extract → Review (6 bubbles) → self + consent → analyze → Replay ("Fine. Do whatever you want." now "Maybe Adapted Child") → My Mirror save (labels only, no text/names) → survives reload. $0. Not verified: What if? live, real iPhone Safari, keyboard dictation.

2026-10-31 Narrative guard: `npm test` 56/56, lint, typecheck, `next build` clean. Headless Chrome on a local prod build (all /api/* blocked, 0 requests) at 390 px VI and 1280 px EN: story text → notice, stays on Add; editing hides it; "continue" → Review with the narrator line under "Chưa rõ/Unknown"; normal chat (incl. name "Bảo") → Review as before; no horizontal scroll. $0 spent. Not verified: real iPhone keyboard dictation, screenshot flow re-run (code untouched).

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

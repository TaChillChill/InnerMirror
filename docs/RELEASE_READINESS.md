# Release readiness — completion sprint, 2026-11-01

> **Update 2026-11-01 evening:** the Founder UAT fix sprint changed input, Review, observation, Direction, the cloud and the logo. Its status, evidence and re-test guide are in `docs/UAT_FIX_SPRINT.md`; §5 steps 4 and 7 below are updated to match.

Status: **local commits only. Nothing pushed or deployed. Deployment Protection unchanged.** Covers commits `cb293e6` → `c35358c` on top of Wave 1. Sources: the code at `c35358c`, test runs listed in §3, `scripts/phase0/.ledger.json` and server logs.

## TL;DR
- **Built and tested:**
  - Every approved pre-submission item is now built: U3 story input, U8 Direction, U9 What if? for any speaker (+ C1), and Light / Dark / System.
  - The old My Reflection tally is replaced.
  - The firewall 429 now shows the right message.
- **Evidence:**
  - Unit tests: 96/96.
  - Mocked e2e: 215/215 checks over 20 runs (360/390/1280 px, EN/VI, light/dark).
  - Live evals: U9 16/16, story 10/10.
  - Live UAT: 4 journeys, 23/23 checks.
- **Spend:** this sprint $0.455; project ≈ $4.86 of the $6 cap.
- **Recommendation: GO for a Vercel Preview deploy** (needs Founder approval), followed by the Founder's real-iPhone UAT (§5).
- **Main risks:**
  - Nothing has been tested on a real iPhone or with a real microphone.
  - Vietnamese copy has not had a native-reader pass.
  - The in-app rate limit (8 analyses per 10 min per IP) could hit a judge who tries many chats.
- **Founder action:**
  - Approve the Preview deploy.
  - Run the iPhone checklist (§5).
  - Supply the Q15 rules for judge access.

## 1. Feature coverage matrix
DONE = built and tested here. PARTIAL = built, with a stated gap. DEFERRED = explicitly after submission (approved roadmap).

| # | Feature / feedback | Status | Evidence (code) | Missing work | UAT scenario |
|---|---|---|---|---|---|
| 1a | Paste / type a chat | DONE | `conversation.ts` `parsePasted`, `AddConversation.tsx` | — | Paste `Name: text` lines → Review |
| 1b | In-app mic for "Kể lại" | PARTIAL | `use-dictation.ts`; one phrase per line since `f379c19` | Real mic and iPhone Safari untested; needs HTTPS (Preview) | §5 step 3 |
| 1c | Screenshot upload (≤ 3) | DONE | `ShotUpload.tsx`, `/api/extract` | 5–10 screenshots = E7 (deferred) | Live journey C |
| 2 | Story: narration vs dialogue, speakers, context, corrections | DONE (v1) | `src/lib/story.ts`, `StoryLines.tsx`, Review/Replay; narration → `context` | Muse extraction = E1 (deferred) | Live journey B; e2e `u3-story` |
| 3 | Aliases, multi-person, attribution | DONE | `mergeParticipants` + undo; up to 8 people | — | Live journey A (merge "Chị Linh" → "Linh") |
| 4 | Back without losing text/images/edits | DONE | `session.draft`, `rereadPlan` | — | e2e `m1-back` |
| 5 | Honest loading, error recovery | DONE | `Analyzing.tsx`, `lib/api-error.ts` | — | e2e `e1-errors` |
| 6 | "Gương thấy gì?" (arc, evidence, uncertainty, method, learn sheet) | DONE | `Observation.tsx`, `Selector.tsx` | — | e2e `w1-observe` |
| 7a | "Trạng thái bản ngã" vocabulary | DONE | i18n sweep + release test | VI native-reader pass | Read every screen in VI |
| 7b | "Nhịp tương tác" (transaction arrows) | DEFERRED (E4) | — | Needs a transaction-stability eval (54/69 stable offline) | — |
| 7c | "Nhìn lại mình" (picture, note, save) | DONE | `Mirror.tsx` cloud + rows since `cb293e6` | — | e2e `r1-untouched`, `m6-sample` |
| 8 | "Nếu khác đi?" for any speaker (U9, C1) | DONE | `scenario-spec.ts` s2.0, `scenario.ts` `actorId` | — | Live journey A; e2e `w1-observe` |
| 9 | Conversation Direction v1 (fixed table) | DONE | `lib/direction.ts`, `Direction.tsx` | "Next reply" mode = E2 (deferred, core) | e2e `u8-direction`; live journey A |
| 10 | My Mirror: AI default, user wins, unclear apart, history, stats, persistence | DONE | `mirror-stats.ts`, `PersonalMirror.tsx`, `SavedRail.tsx` | Transparent brand mascot (D2) | e2e `u7-mirror`, `r1-untouched` |
| 11 | Sample mode for judges | DONE | `samples.ts`, `.lp-sample` | — | e2e `m6-sample` (0 API calls) |
| 12a | EN/VI consistency | DONE | Copy tests (`release`, `whatif`, `direction`) | VI native-reader pass | — |
| 12b | Responsive 360–1280 px | DONE | Container queries; header one row ≥ 360 px | — | e2e at 360/390/1280 |
| 12c | Light / Dark / System | DONE | `styles/theme.css`, `ThemeToggle`, pre-paint script | — | e2e `t1-theme`; §5 step 9 |
| 12d | Accessibility | PARTIAL | Focus return, aria-pressed, live regions, contrast table §3.4 | No screen-reader pass (VoiceOver) | §5 step 10 |
| 12e | Privacy and consent | DONE | Consent tick before any call; Meta clause; `/privacy` lists stored items incl. theme | Meta retention undocumented (blocker, unchanged) | Read `/privacy` |
| 12f | Safety | DONE | Model flag + backstop (`safety-backstop.ts`); What if? and Direction off | Public release: ≈ 10 more probes × 2 runs | Live journey D |
| 12g | iPhone Safari | NOT TESTED | — | Founder on a real device | §5 |

## 2. Implemented vs. deferred (this sprint)
**Implemented**
| Commit | What |
|---|---|
| `cb293e6` | My Reflection: pre-save/just-saved views use the state cloud + rows |
| `84c6d8a` | U8 Direction v1 |
| `35120d6` | The firewall's 429 reads as "too many tries" (was a generic error) |
| `6d0ee0e` | U9 What if? for any speaker, spec s2.0; C1 VI names |
| `f379c19` | U3 story v1: parser, Review moves, narration as context, medium cap, mic line breaks |
| `be099a0` | Light / Dark / System |
| `8199e9a`, `c35358c` | e2e fixes and additions (relative dates, errors, theme, live UAT script) |

**Deliberately deferred (approved roadmap, after submission):**
- E1: Muse story extraction.
- E2: Direction "next reply" mode.
- E3: Direction suggestions from Muse.
- E4: "Nhịp tương tác" arrows.
- E7: 5–10 screenshots.
- E8: relationship note re-test.
- E9: streaming progress.
- E10: server-side speech-to-text.

## 3. Test evidence
### 3.1 Automated, $0
- `npm test`: 96/96. Lint, typecheck and `next build` are clean at `c35358c`.
- `sh scripts/e2e/run-all.sh`: 20 runs, **215 PASS / 0 FAIL**, on a local production build. Every `/api/*` request is intercepted.
- Every flow above has an e2e run, including Back, merge, sample, My Mirror, the untouched-observation regression, panel/observation, input + mic (stubbed recognizer, denied/unsupported), Direction, story, theme and errors.
- The in-app rate limiter was checked with invalid requests: requests 9–12 → 429 `rate_limited`, with no Meta call.

### 3.2 Live evals (synthetic, harness ledger)
| Eval | Calls | Spend | Result |
|---|---|---|---|
| U9 What if? s2.0 (`scripts/phase0/u9`) | 16 | $0.2296 | See below |
| Story (`scripts/phase0/story`) | 10 | $0.1248 | See below |

**U9 What if? s2.0:**
- 16/16 valid outputs; the safety probe was flagged 2/2.
- 0 old VI state names.
- The actor is never called "you"; with no self chosen, no participant is called "you".
- Evidence comes only from the receiver.
- Minor: 1/16 rationales mention a message id ("m5").

**Story:**
- 10/10 valid.
- 0 narration judgments in readings or rationales.
- 2/10 (both vi-mom) repeat the narrator's judgment in the uncertainty line, framed as "one side's view, not used to conclude".
- The model said "high" in 8/10 runs; the code cap removed every instance.

### 3.3 Live UAT through the app (`scripts/e2e/live-uat.mjs`, `APP_SPEND_CAP_USD=0.4`)
7 calls, $0.1007, **23/23 checks**. (The `c35358c` commit message says 26; 23 is correct.)
- **A, VI, 390 px (12/12):**
  - 3 people plus an alias; merge.
  - Live analysis: the sarcastic "giỏi thật đấy" was not read as high; "..." was read as unclear.
  - What if? on Linh's message, titled "Nếu lúc đó Linh nói khác đi?", answered live.
  - Self → choice → Direction → preselected What if? answered live.
  - Saved labels only; after reload, My Reflection shows "1 bạn chọn".
- **B, EN, 1280 px (5/5):** retold story split 4/2; route accepted `context`; story note and narration shown; no high confidence; "impatient" not repeated.
- **C, VI, 390 px (3/3):** synthetic screenshot → live extract (6 bubbles) → no self preselected → live analysis.
- **D, VI, 390 px (3/3):** hopelessness line → support shown, What if? off, Direction hidden.

### 3.4 Dark theme contrast (WCAG 2.x)
- Text pairs: text/bg 15.2, muted/surface 6.9, primary-ink/tint 5.9, white/primary 4.8.
- State inks on their tints: 6.4–8.9.
- Avatars: ≥ 8.3.
- Control borders: 3.9 (minimum is 3:1).

### 3.5 Not tested (no claims made)
- Real iPhone Safari: layout, bottom sheet, mic, dark mode.
- A real microphone on any device. Only a stubbed recognizer was used.
- Screen readers.
- VI native-reader pass (Direction table, story copy, What if? copy for others).
- Vercel Preview with the current build.

## 4. Remaining defects and risks
| # | Severity | Item | Mitigation |
|---|---|---|---|
| R1 | High (unknown) | iPhone Safari untested; mic needs HTTPS, so it can only be tested on Preview | Preview deploy, then §5 |
| R2 | Medium | In-app rate limit: 8 analyses / 10 min per IP per instance. Judges behind one NAT could share it | Raise to ~20 for judging (one-line change) once access rules are known |
| R3 | Medium | Story parser is heuristic: unusual phrasings leave a line as narration or the speaker as "Chưa rõ" | Review shows every line; moving a line and fixing a speaker is one tap each (tested) |
| R4 | Low | Story uncertainty line may repeat the narrator's judgment as "one side's view" (2/10) | Wording stays disclaimed; prompt change only if the Founder objects (needs eval) |
| R5 | Low | What if? rationale may mention a message id (1/16) | Strip in code later if seen in UAT |
| R6 | Low | Spend before today's sprint is partly estimated (≈ $0.54 of app/Preview spend has no ledger) | Meta console check |
| R7 | Known | Meta retention undocumented; auto-charge after credits unverified | Unchanged blockers (TODO) |
| R8 | Known | P0 classification limits (turn-split instability, FC/AC on distress) | `CLASSIFICATION_AUDIT.md` §9.5 |

No known release-blocking defect remains in the code paths tested.

## 5. Founder UAT checklist — iPhone (Safari, after the Preview deploy)
Use synthetic or your own chats. Each analysis costs ≈ $0.02, each What if? ≈ $0.015.
1. Open the Preview URL in Safari, light mode. Landing: header on one row; "Soi một cuộc trò chuyện" and "Xem một cuộc trò chuyện mẫu" both work.
2. **Sample:** open it, tap a message (the bottom sheet opens, and closes with ✕ or a tap outside it), continue to Nhìn lại mình. No Save, no What if?.
3. **Mic:** Soi → Kể lại → tap the mic.
   - Allow the permission and tell a short story aloud: "mẹ nói con lại về muộn à", pause, "mình bảo con xin lỗi".
   - Text appears, one phrase per line, and stays editable.
   - Stop, deny the permission once in Settings, and check that the denied message appears.
4. **Story:** Tiếp tục → "Gương đã tách câu chuyện của bạn". Grey lines are narration.
   - Tap one and choose who said it; tap a bubble and choose "Đây là lời kể".
   - Fix a speaker name with the pencil.
5. **Analysis:**
   - Tick consent → Xem.
   - The loading text is honest; the Replay note says "Câu chuyện kể lại"; no "cao" confidence anywhere.
6. **What if? on someone else's message:** the title names them, not "bạn"; Khám phá returns states or an honest "chưa đủ".
7. **Bạn là ai? + Hướng đi:** pick yourself → pick "Giảm bớt căng thẳng" → two reference cards, nothing to select, and the line "Đây là những hướng đi để bạn tham khảo…" (reference only since the UAT fix sprint).
8. **Save + reload:** Nhìn lại mình → Lưu → close the tab → reopen → the card and Personal Mirror counts are still there.
9. **Dark mode:**
   - Tap the half-moon button: Sáng → Tối → Theo hệ thống.
   - Switch iOS to dark: the app follows only in "Theo hệ thống".
   - No white flash on reload in Tối.
10. **Screenshots:** Có sẵn cuộc trò chuyện → add 1–3 real screenshots → check diacritics on Review.
11. **Safety:** paste "Mình: Chẳng còn hy vọng gì nữa." plus one reply → support card, no What if?, no Direction.
12. **VoiceOver (optional):** turn it on, open a message panel and close it, and check that focus returns to the message.

Report any failure with the step number and a screenshot.

## 6. GO / NO-GO for Vercel Preview
**GO for deploying a Preview** (`vercel deploy --target=preview`, no `--prod`, protection unchanged), subject to Founder approval:
- Code: all approved pre-submission items done; 96 unit + 215 mocked e2e checks green; live journeys green.
- Budget: ≈ $1.14 left under $6; a Preview smoke costs ≈ $0.05.
- Before deploying, check Vercel env: `META_API_KEY` present for Preview, `ANALYZE_EFFORT` unset (defaults to low), `APP_SPEND_CAP_USD` set (default $1 per instance).

**Not GO for judge/public access** until:
1. Founder iPhone UAT (§5) passes.
2. Q15 decides the access method (§7.12 of the UAT plan).
3. R2 is decided.

## 7. Preview release — 2026-11-02 (Founder GO for Preview, not Production)
**Deployed:** `289a1e4` → https://innermirror-jbj4lc6gz-tachillchills-projects.vercel.app (target preview, Ready). Supersedes `jp5dd2fog` (`b79025e`, same code minus the privacy copy fix below). No `--prod`; Deployment Protection unchanged: anonymous page and `/api/*` requests → 302 to Vercel SSO.

**Configuration checked (names only, values not read):** Preview has `META_API_KEY` and `APP_SPEND_CAP_USD`; `ANALYZE_EFFORT` unset (defaults to low); `ACCESS_CODE` unset. Production has no variables. Firewall rule "API rate limit" (10 req / 60 s per IP on `/api/`, blocks) from Oct 31. In-app: analyze and extract 8 per 10 min per IP, What if? 20 per 10 min, per instance. The app spend cap is per instance and resets on restart, so the real ceiling is the Founder's budget (≈ $1.14 left of $6) and Meta credits.

**Not verified by Claude:** no live call on Preview (protected; using `vercel curl` to bypass needs Founder approval). The Founder's iPhone run is the smoke test.

**Privacy copy audit (names in titles):** `/privacy` "stored" and "never saved", the "what is saved" list and the saved-card note now say names are kept only inside a title, on this device. Fixed in `289a1e4`: the privacy page still named the old "Read my screenshot" button, and the saved-card note said only labels and "your own words" are kept. A release test guards both. Unchanged and accurate: Review names note (names are not sent to Meta, names written inside messages are), screenshot privacy note, landing.

### 7.1 iPhone UAT on Preview (short)
Log in to Vercel in Safari first (Preview is protected). Each analysis ≈ $0.02, What if? ≈ $0.015.
1. **Language:** iPhone in Vietnamese, first visit (or clear website data) → Vietnamese. EN → reload → stays EN; back to VI.
2. **Mic (HTTPS):** Soi → Kể lại → mic → allow → say two short lines → text appears line by line, editable. Deny once in Settings → clear message.
3. **Screenshot:** Có sẵn cuộc trò chuyện → upload area at the top → choose 1–3 screenshots → the newest and Tiếp tục in view → consent → Tiếp tục → Review with one advice line (⊕), people right below; check diacritics.
4. **Analyze:** tick consent → Xem → title "names – 01" → ⊕/⊖ intro → tap a mascot (tab "Trạng thái bản ngã") → Nếu khác đi? on one message.
5. **Save → Reload → Reopen (batch 2 #04):** pick yourself → Nhìn lại mình → edit note → Lưu vào thiết bị này → green confirmation, card listed → reload → card still there → open it: title, note, mascots.
6. **Dark mode:** Tối → logo the same as the header, no white frame.
Report failures with the step number and a screenshot.

### 7.2 Judge access (not opened; needs Q15 and Founder approval)
| Option | Openness | Work | Note |
|---|---|---|---|
| A. Vercel Shareable Link for this Preview | Only link holders; protection stays for everything else | Dashboard → deployment → Share (Founder) | **Recommended** if the rules accept a link. Revoke after judging |
| B. `ACCESS_CODE` | — | Needs new UI (code entry) | **Not usable now:** the API checks the code but the app has no way to send it; setting it would make every analysis fail with 403 |
| C. Protection off for Preview | Anyone with the URL | Dashboard setting | Most open; the firewall and in-app limits stay |
| D. Demo video only | None | — | If the rules allow |

Rate limit for judging (R2): 8 analyses / 10 min per IP is fine for one judge; several judges behind one NAT could hit it. Raise to ~20 only if Q15 implies shared access (one-line change + redeploy, approval). Budget: ≈ $1.14 left ≈ 50 analyses; decide a judging budget before opening access.

### 7.3 Production — deployed 2026-11-02 (Founder approval in session)
- **Deployed:** `a061aca` (app code identical to Preview `289a1e4`; later commits touch only `design/film`, docs and the e2e driver) → https://innermirror-dfwvn065y-tachillchills-projects.vercel.app, production alias **https://innermirror-flame.vercel.app**. Ready.
- **Not ours:** `innermirror.vercel.app` redirects to an unrelated site; never use or share it.
- **Env (values not read):** `META_API_KEY` reused from Preview by adding the Production target through the Vercel API (sensitive; value never returned); `APP_SPEND_CAP_USD=5` for Production (Founder decision; per instance, resets on restart, so it no longer bounds the $6 test budget: the Meta credits are the ceiling). `ANALYZE_EFFORT`, `ACCESS_CODE` unset.
- **Protection unchanged:** project SSO protection covers all deployments, Production included; anonymous page and `/api/*` → 302 to Vercel SSO. The existing automation bypass secret (created earlier) was used by `vercel curl`; no new secret.
- **Live smoke (synthetic, via `vercel curl`):** home 200; `/api/extract` 200 in 6.4 s, 3/3 bubbles read; `/api/analyze` 200 in 15.5 s, 6 readings, spec v3.2, safety not flagged; `/api/scenario` 200 in 11.8 s, model answer. One extract attempt returned 400 because the test sent a PNG (the app always sends JPEG); no model call. Spend ≈ $0.045.
- **Rollback:** `vercel rollback` to `innermirror-19q36ekkb` (Oct 31) or promote the previous Preview; needs Founder approval.
- **Open:** Founder iPhone UAT on Production (7.1, especially Save → reload → reopen); judge access (7.2) not needed yet.

### 7.4 Production opened to the public — 2026-11-02 (Founder approval)
- **Change:** project Deployment Protection `ssoProtection.deploymentType` `all` → `prod_deployment_urls_and_all_previews` (Vercel "Standard Protection"). Public: the production domains `innermirror-flame.vercel.app` and `innermirror-tachillchills-projects.vercel.app`. Still behind Vercel SSO: every Preview and every individual deployment URL, production ones included. No code, env or firewall change.
- **Restore:** PATCH `/v9/projects/innermirror` with `{"ssoProtection":{"deploymentType":"all"}}` (or Dashboard → Settings → Deployment Protection → Vercel Authentication → All Deployments).
- **Anonymous checks (curl, no cookies):** `/` and `/privacy` 200 on both production domains; Preview `jbj4lc6gz` and deployment URL `dfwvn065y` 302 to SSO; `/api/analyze` with an empty body → 400 `invalid_input`; `/api/scenario` with no earlier receiver message → 200 local answer (no model call); firewall burst on `/api/scenario` → 429 from the 11th request in 60 s.
- **Secrets:** no `META_API_KEY`, `APP_SPEND_CAP_USD`, `ACCESS_CODE`, provider host, `Bearer` or key-like strings in the public HTML and 10 JS bundles (≈ 911 KB); `/.env` and `/.env.local` → 404.
- **Risk now that it is public:** anyone with the URL can run paid analyses. Limits: firewall 10 req/60 s per IP on `/api/`, in-app 8 analyses/10 min per IP, `APP_SPEND_CAP_USD=5` per instance (resets on restart). The real ceiling is the Meta credits; watch the Meta console.

# 10 screenshots + Dark by default — audit, changes, evidence

Date: 2026-11-02. Status: **implemented in local commits `108e751`, `33efdf5`, `7ec17f0` (+ docs commit); not pushed, not deployed.** Production untouched.

## TL;DR
- 10 screenshots work end to end: live on two synthetic 10-screenshot chats (VI 47 messages, EN 50), Review matched the ground truth **exactly, in order, with no duplicates**; extraction 25–31 s, 4 requests ≈ $0.05–0.06.
- One request cannot carry 10 images (Vercel 4.5 MB body limit, 110 s route budget), so the browser reads **parts of 3, two at a time**, and merges the seams itself. A failed part never loses the others.
- **Main risk is analysis, not OCR:** 43–46 turns took 48–71 s and 10.3–11.5k of the 16k output tokens. The existing 80-message limit is not reachable reliably (≈ 60+ turns would hit the time or token ceiling). **Founder decision:** lower the limit (recommended 60 messages) or keep it.
- Dark is the default for new visitors, applied before the first paint; stored Light/System choices are respected.
- Recommendation: **Preview GO now; Production GO after a real-iPhone check of 10 screenshots** and the message-limit decision.

## 1. Audit — risks
| # | Risk | Class | Resolution |
|---|---|---|---|
| R1 | 10 images in one request: up to 12 MB vs Vercel's 4.5 MB body limit; one long call vs the 110 s route budget | P0 (design) | Parts of 3 per request (unchanged server limit), 2 in parallel (`src/lib/shot-batches.ts`, `use-shot-reader.ts`) |
| R2 | Messages repeated where two parts meet (the model only merges inside one request) | P0 | Client merges the seam: same sender + same words; a cut-off bubble merges into its full version; a single short reply ("ok", "k") is kept, since it may really repeat; never merges outside the seam |
| R3 | Speaker keys differ between parts (S1 in one = S2 in another) | P0 | Matched by shown name, then by side when only one person is on that side; ambiguous → "Unknown" for Review, never guessed |
| R4 | Partial failure loses 9 good images | P1 | Each part is cached in session memory; "Try those again" sends only failed parts; "Continue without them" → Review says which screenshots are missing; Back + read again fills them in |
| R5 | Rate limit 8 requests/10 min would block a second 10-screenshot try | P1 | Extract limit now counts screenshots: 30 per 10 min per client (≈ old 8 × 3 = 24). Firewall (10 req/60 s per IP) is fine: one conversation = 4 extract + 1 analyze |
| R6 | Spend / abuse | P1 | Unchanged: `APP_SPEND_CAP_USD` (Production 5), firewall, per-request 3-image cap, rate-limit or budget refusal stops further parts |
| R7 | Analysis of long chats (≥ ~60 turns) times out or truncates | **P1, open** | Measured below; needs a Founder decision (§5) |
| R8 | iPhone Safari memory: 10 full-size thumbnails ≈ 120 MB decoded; canvas memory cap | P2 | Canvases released right after compression; `decoding="async"`, lazy compare images. Not verified on a real iPhone. Smaller thumbnails if UAT shows trouble |
| R9 | Existing users who chose **System** before today have no stored value and now get Dark | P2 | Unavoidable (System used to be "nothing stored"); one tap restores it, and System is now stored. Production opened today, so few are affected |
| R10 | iOS `theme-color` follows the OS, not the app theme | P2 | Cosmetic; not changed |

No privacy or safety change: images still go only to `/api/extract`, nothing is logged but counts, extracted text stays in browser memory and is dropped on analysis. Ego-state classification untouched.

## 2. Screenshot flow
Add (any mix of picker, drop, paste, several times) → counter `n/10` → consent → Continue → parts of 3, two at a time, progress "6 of 10 screenshots read…" → merged → Review. Over the limit: "You can add up to 10 screenshots, so 2 weren't added." Back from Review keeps the 10 images, their order, and the reads (unchanged input → Review with no call).

## 3. Evidence
**Unit** (`npm test`, 123): seam merge, cut-off bubbles, NFC/NFD Vietnamese, speaker mapping, group ambiguity, 10 parts of a 60-message chat, empty part, weighted rate limit, wait estimate.

**Mocked e2e** (`sh scripts/e2e/run-all.sh`, 35 runs, all `/api/*` intercepted, $0): 651/651 PASS. New `s1-shots` at 360 VI, 390 EN, 1280 EN/VI: 1/3/5/10 screenshots (1/1/2/4 calls, order, seams), duplicate file across a seam, failed part → retry sends 1 call, continue without → notice → Back fills in, rate limit stops after ≤ 2 calls, 12 dropped → 10, 4000×9000 shrunk to 29 KB, noise image refused, no horizontal overflow. `t1-theme` at 360/1280: 13/13.

**Live** (synthetic, `scripts/e2e/live-shots.mjs`, local prod build with `APP_SPEND_CAP_USD=0.4`; screenshots from `render-long.mjs`, 390×760 @2x, 67 % overlap — more than normal scrolling, to stress the merge):

| Set | Upload (10 JPEG) | Extract wall time | Per request | Review vs truth | Analyze | Cost |
|---|---|---|---|---|---|---|
| VI 47 msgs | 1.5 MB | 31.2 s | 12–16 s, 5.4k in / 1.5–2.7k out tokens | 47/47 exact, in order, 0 dup | 70.6 s, 43 turns, 11.5k out | $0.058 + $0.054 = **$0.113** |
| EN 50 msgs | 1.4 MB | 25.1 s | 5–14 s | 50/50 exact, in order, 0 dup | 47.9 s, 46 turns, 10.3k out | $0.053 + $0.049 = **$0.102** |

Total live spend: **$0.215** (server log). Project ≈ **$5.13 of $6**. Image input measured ≈ 1.4k tokens per 780×1520 screenshot (the route's 3k allowance stays a safe upper bound). Not tested live: real iPhone screenshots, failure paths (mocked only).

## 4. Dark by default
Inline head script: no stored value → `data-theme="dark"` before `<body>` exists (verified by an e2e observer); stored `light` / `system` win; unknown values → Dark; nothing is written for a new visitor. Toggle cycles Dark → System → Light. Checked visually at 390 VI / 1280 EN: Landing, Add with 10 screenshots, Observation, My Interpretation, What if?, My Reflection (dark tokens were contrast-checked when the theme shipped, `RELEASE_READINESS.md`).

## 5. Founder decisions
1. **Analysis length limit (R7).** Measured ≈ 1.1–1.6 s and ≈ 230–260 output tokens per turn. ≈ 60 turns reaches ~90–100 s and ~15k of 16k tokens; 80 messages would fail after ~110 s and still cost ≈ $0.08. Options: **(a) lower `LIMITS.maxMessages` to 60 (recommended**, one line + copy; Review already explains how to trim); (b) keep 80 and accept failures on very long chats; (c) a turn-based limit with a "long chat, ~90 s" warning (more work).
2. **Deploy.** Preview first (protected), then a real-iPhone pass: pick 10 screenshots from Photos in one go and in several goes, Back/Next, memory (no reload/crash), dark default on first open. Production after that.

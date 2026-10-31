# Performance & Latency Audit (v3.2)

Date: 2026-10-31. Scope: screenshot → extraction → review → analysis → Replay, plus What if?. **Audit only:** no code, prompt, schema or model-config changes, and **$0 spent** (no API calls). Sources: token/latency metadata from 92 eval-p0 calls (`scripts/phase0/.ledger.json`, `results/p0/*/`), code reading, a free local JPEG benchmark in headless Chrome, and earlier measurements recorded in `TODO.md`.

Labels: **Measured** = from recorded data or a local benchmark. **Hypothesis** = plausible, not yet tested.

## TL;DR
- **Almost all analysis time is the model generating output tokens.** Latency ≈ 4.9 ms × output tokens (R² 0.86, ~230 tok/s). Input size (~3k tokens, mostly the system prompt), network and our own code barely register. Measured.
- At low effort, output is ~half hidden reasoning, ~half visible JSON. Visible JSON grows ~186 tokens per segment. **Long conversations are the real risk:** a 23-message case took 22 s, and the 80-message limit extrapolates to ~60 s, near the 16k cap (hypothesis).
- The old 40–60 s end-to-end matches v2.1 at medium effort (a 46 s analyze on Preview, likely Founder UAT) plus extraction (4–14 s). v3.2 already halves analysis. Measured, except the split of individual UAT runs.
- **Quick wins (no reliability risk):**
  - honest wait copy (still says "15–40 s");
  - make retries respect the 120 s function limit;
  - instrument per-call timing;
  - keep the result of an unchanged transcript in memory.
- **Biggest structural lever:** a visible-output "token diet" (−20–30% of visible tokens, ≈ −2 s typical, ≈ −8 s for long chats). It needs a prompt/schema change plus a re-run of the P0 eval (≈ $0.4). Streaming progress could cut *perceived* wait at no cost, but streaming together with `json_schema` is unverified on Meta.
- **Founder action:** approve which items to implement, and ≈ $0.5 for the verification runs listed in §5.

## 1. Pipeline and latency breakdown
| Step | Where | Time | Status |
|---|---|---|---|
| Pick screenshots, compress to JPEG (≤1280 px wide, q 0.85→0.55) | browser, main thread | 7–24 ms per image on desktop Chrome (synthetic 780×1280 and 1179×2556); phones maybe 5–10× slower (100–250 ms) | Measured (desktop) / hypothesis (phone) |
| Upload 1–3 images (base64, ≤1.2 MB each) | phone → Vercel (default region, US) | synthetic images 100–220 KB each; real screenshots with photos are likely larger. Est. 0.3–3 s on mobile | Hypothesis |
| Extraction (`/api/extract`, low effort, 8k cap) | Meta | 4–14 s on synthetic screenshots (M3); the smoke run was 6.2 s for 1,216 output tokens, same ~200 tok/s, so also output-bound | Measured |
| **User reviews transcript, picks self, consents** | human | not system time; required by product rules | — |
| Analysis (`/api/analyze`, v3.2 low, 16k cap) | Meta | **p50 12.8 s, p90 21.9 s, max 27.8 s** (22 runs, 3–23 messages) | Measured |
| ↳ input (prefill) | | ~3,000 tokens, nearly constant; the linear fit's intercept ≈ 0 s, so negligible | Measured |
| ↳ hidden reasoning | | avg 1,615 tokens ≈ 7.9 s (≈ 918 + 99 per segment) | Measured |
| ↳ visible JSON | | avg 1,688 tokens ≈ 8.3 s (≈ 186 per segment) | Measured |
| ↳ invalid output → retry (same request) | route | 0/22 at v3.2; each retry doubles time | Measured / code |
| Server work (zod, cleanAnalysis), function cold start, client render | Vercel + browser | expected < 1 s total; not measured on Vercel | Hypothesis |
| What if? (`/api/scenario`, **medium** effort) | Meta | median 14 s, range 6–34 s (M5) | Measured |

**Where the visible JSON goes** (share of characters, v3.2):

| Field | Share |
|---|---|
| `rationale` | 17.5% |
| `context.turns` | 13.5% |
| `alternative` (with rationale) | 12.1% |
| `shifts` | 9.6% |
| `contextCues` | 9.5% |
| `cues` | 6.8% |
| `summary` | 6.0% |
| `dynamics` | 5.8% |
| labels | 4.5% |
| ids | 4.4% |
| `uncertainty` | 3.6% |
| `register` | 3.1% |
| `secondLayer` | 2.0% |
| `safety` | 1.7% |

The UI never shows `contextCues`, `context.turns`, `dynamics`, `register`, `invites` or the alternative's rationale. They exist for reasoning quality and validation, so "not shown" does not mean "safe to drop".

**Anomaly:** both runs of `vi5-work` produced ~2,000 more output tokens than their JSON accounts for (1.26 chars/token versus 2.9–3.5 for every other run), costing ~10 s. Hypothesis: whitespace or newline runs inside the constrained JSON. Not verifiable from saved data, because the harness stores parsed JSON, not the raw string.

**Where the earlier 40–60 s came from:** v2.1 at medium effort (p50 25 s, p90 46 s; a 46 s Preview analyze, likely Founder UAT) plus extraction (4–14 s). A truncated output plus retry could take 90+ s and end in an error. With v3.2 the same path is roughly 6–14 s extraction + 13–22 s analysis.

## 2. Top 5 bottlenecks
1. **Output token generation in analysis.** About 100% of analysis time; it scales with the number of segments. Measured.
2. **Long conversations.** 13 segments ≈ 22 s; extrapolated 25 segments ≈ 41 s and 40 segments ≈ 62 s (16k cap ≈ 78 s of generation). The 80-message limit is untested. Hypothesis grounded in the fit.
3. **Extraction is also output-bound and runs before the user can review.** 4–14 s; it grows with the amount of text. Measured on synthetic screenshots only.
4. **Tail spikes.** Output-token anomalies (+10 s in 2/22 runs), and same-request retries that can exceed the 120 s function limit (90 s per-attempt timeout × 2 attempts). The first is measured; the second follows from the code.
5. **Perceived wait.** One opaque spinner with paced, fake stages and copy that over-promises the wait ("15–40 s"). There is no real progress signal. Measured in code and copy.

Not bottlenecks (measured or near-certain): prompt length or prefill, JPEG compression, JSON validation, React render. Network and cold start are probably < 1 s each (hypothesis; measure on Preview).

## 3. Options with trade-offs
Latency gains are estimates for a typical 6–8 segment conversation, with the long (25-segment) case in brackets.

### Quick wins (no prompt/schema/model change)
| # | Change | Latency | Reliability risk | Complexity | API cost |
|---|---|---|---|---|---|
| Q1 | Honest, size-aware wait copy ("about 10–20 s"; longer for long chats) and stage pacing tied to that estimate | perceived only | none | XS (i18n + Analyzing) | 0 |
| Q2 | Deadline-aware retry: skip the 2nd attempt if it can't finish inside the 120 s limit; show "Try again" instead of a platform 504 | removes worst-case 120 s+ failures | none | S (route) | saves a doomed retry |
| Q3 | Instrument: per-route total server time, plus `chars/token` and segment count in the existing metadata log (no content) | none directly; enables p50/p90 from Vercel logs | none | S | 0 |
| Q4 | Keep the last analysis in memory keyed by a transcript hash; "Back → Analyze" with no edits reuses it | skips a full call on that path | none | S | saves a call |
| Q5 | Extraction loading: same staged UI and estimate; keep the thumbnails visible | perceived only | none | XS | 0 |
| Q6 | Warm the function when the Review screen opens (a no-op request with no body) | ≤ 1 s on cold starts (hypothesis) | none | XS | 0 (Vercel invocation only) |

### Structural (need eval before shipping)
| # | Change | Latency | Reliability risk | Complexity | API cost |
|---|---|---|---|---|---|
| S1 | **Token diet, same architecture:** turn `act` ≤ 6 words; alternative rationale ≤ 1 short clause; `contextCues` max 1 and quoted ≤ 8 words; `cues` ≤ 2; `dynamics` replaces `summary` (written first, shown in UI); `uncertainty` 1 sentence | −20–30% visible ≈ −2 s (−8 s) | low–medium: shorter rationale and context may weaken anchoring; must re-pass P0 metrics | S (prompt + schema + UI uses `dynamics`) | −15–20% per call; eval ≈ $0.4 |
| S2 | **Streaming with honest progress:** stream Meta → server; the server counts finished segments and sends "đã đọc 5/13 lượt"; the client renders only the final validated result | actual 0; perceived large (real progress from ~8 s) | none (output unchanged) | M (stream parsing, NDJSON to client) | 0; verify stream + `json_schema` with 1 call ≈ $0.02 |
| S3 | **Whitespace/tail guard:** confirm the anomaly with Q3 data; if confirmed, add a compact-JSON instruction or a lower cap with a smart retry | −10 s on ~9% of runs (if confirmed) | low | S | 0–small |
| S4 | **Long-conversation policy:** test 40–80 messages; if p90 > 40 s, lower `maxMessages` (e.g. 50) or warn "long chat, ~40 s" before analyzing | bounds the tail | none | S | test ≈ $0.1 |
| S5 | `reasoning_effort: "minimal"` | −1,000–1,500 tokens ≈ −5–7 s | **high**: P0 showed effort affects stability; needs a full eval | XS | −30%; eval ≈ $0.4 |
| S6 | What if? at low effort (currently medium) | −5–7 s per explore (hypothesis, by analogy with P0) | medium; needs its own eval | XS | −40%; eval ≈ $0.2 |
| S7 | Function region near users (e.g. `sin1`) | 0.3–2 s on uploads only (hypothesis); the Meta-side hop gets longer | none | XS config | 0; measure first |

**Rejected:**
- *Speculative analysis while the user reviews.* It breaks "analyze only after the user confirms" and wastes calls.
- *Two-stage (two API calls).* It adds latency, as per the P0 audit.
- *Parallel extraction per screenshot.* It gives up cross-image ordering and dedup, a real reliability risk, for ~2× on 3-image uploads only.
- *Server-side result cache.* We never store conversations.
- *Showing partial unvalidated JSON.* It breaks the rule that every model response is validated before use.

## 4. Recommended plan
1. **Now (free, low risk):** Q1, Q2, Q3, Q5. Then Q4 and Q6 if the review shows they matter. All preserve P0 exactly.
2. **Measure on Preview (free, with Founder approval to deploy and read Preview logs):** 10–20 real flows. Gives p50/p90 per step from Q3 logs, cold-start share, chars/token anomalies, and upload time.
3. **One paid batch (≈ $0.5, needs approval):** S1 on the P0 fixtures (22 runs) + S4 with one 40- and one 80-message synthetic chat + 1 call to verify S2 streaming. Ship S1 only if it passes the gates below.
4. **Then S2** if streaming with `json_schema` works.
5. **Defer S5 and S6.** They are the riskiest gains; consider them only after P0 stability is improved.

## 5. Targets and how to measure
| Metric | Now (v3.2) | Target after step 1–3 | How |
|---|---|---|---|
| Analyze, ≤ 15 messages | p50 12.8 s / p90 21.9 s | p50 ≤ 11 s / p90 ≤ 16 s | eval harness latency table + Q3 logs on Preview |
| Analyze, 16–30 messages | ~22 s (n=2) | p90 ≤ 25 s | add 2 long fixtures (S4) |
| Analyze, up to the message limit | untested | p90 ≤ 40 s, or limit lowered | S4 |
| Extraction, 3 screenshots | 4–14 s (synthetic) | p90 ≤ 12 s | Q3 logs on real-looking screenshots |
| Machine time, screenshots → Replay (excl. review) | ~20–36 s | p50 ≤ 22 s / p90 ≤ 32 s | sum of the two steps from logs |
| Invalid/timeout rate | 0/22 | ≤ 1% | logs + harness |
| Perceived: time to first real progress | none (fake stages) | ≤ 10 s with S2 | Q3 + S2 events |

**Reliability gates every optimization must keep (from P0 §9):**
- 0 invalid outputs on the fixtures;
- safety probe flagged 2/2;
- within-turn label changes ≤ 20%;
- P/A/C family agreement ≥ 90%;
- 0 hard fails;
- no new over-ceiling items on review cases;
- requests stay identical for either self (unit test).

**Measurement method:** median and p90 over ≥ 20 runs per variant; report tokens (reasoning/visible) with latency, because latency ≈ 4.9 ms/token makes token counts a stable proxy that can be tracked without timing noise.

## Open questions
- Does Meta support `stream: true` together with `response_format: json_schema`? Third-party docs disagree; Meta's doc pages were not reachable. Needs 1 paid call.
- Which Vercel region serves the project, and where does Meta serve from? Not visible locally (`.vercel/` is read-protected).
- Is the vi5 token anomaly whitespace, or something else? Q3 will show it.

---

## 6. Implemented (2026-10-31): Q1–Q5
Approved by the Founder: Q1–Q5. Not done: Q6, S1, S2. Prompts, schema and model config are unchanged, so the P0 classification results stand as-is. No API calls were made for this work; all checks below are free (unit tests, measured data, mocked browser runs).

| Item | Change | Measured result |
|---|---|---|
| Q1 | Wait estimate from the measured fit (`src/lib/wait.ts`: 5.6 s + 1.4 s per turn, −20%/+30%). Analyzing stages paced by it; "taking longer than usual" note once past the upper bound | Estimate range covers **19/22** measured v3.2 runs; the old "15–40 s" covered **5/22**. The 2 misses are the vi5 token anomaly, where the "longer than usual" note shows |
| Q2 | `callUntilValid`: a retry starts only if ≥ 20–25 s are left before a 110 s budget; each attempt's timeout is capped by the time left. Shared by analyze, extract and scenario | Unit test with a faked Meta: retry with time left, no retry near the deadline. Worst case drops from "killed at 120 s by the platform" to a clean `invalid_output` within 110 s |
| Q3 | One metadata line per request (`request_done`: totalMs, attempts, outcome, counts of messages, turns, segments and images, image KB) plus `contentChars` on each Meta call. Never text | Typecheck and unit test of the helper. First real log lines appear on the next Founder UAT run (dev server console or Vercel logs) |
| Q4 | In-memory reuse: the key is language + speakers + message ids/texts, **not** who the user is. Session-only; a new conversation drops it. Choices are kept; a save is kept only for the same perspective. New "Edit the conversation or who you are" link on Replay (needed to reach Review again) | Mocked browser run: switching "Who am I?" re-renders Replay in **219 ms with 0 new requests** (vs p50 12.8 s for a call); editing one message → exactly 1 new request |
| Q5 | Screenshot reading uses the same estimate-and-slow-note hint (`extractEstimate`: 5 s to 10 + 4 s per image) | Covers the measured 4–14 s; not yet checked on real screenshots |

Not measured: real-device rendering, Vercel cold start, and real extraction time on phone screenshots. Q3 now produces the data for all three.

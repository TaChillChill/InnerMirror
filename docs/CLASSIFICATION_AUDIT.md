# Classification Reliability Audit (P0)

Date: 2026-10-31. Spec audited: `v2.1` (`src/lib/ai/analysis-spec.ts`). Method: code reading, past eval outputs (`scripts/phase0/results/`), and the Founder UAT conversation (UAT-01). **$0 live spend; no API calls.** Audit only, nothing changed in the app.

Labels used below: **Confirmed** = shown by code or by the UAT screenshots. **Hypothesis** = plausible, not yet tested.

## TL;DR
- **The UAT run was analyzed from the wrong person's point of view (confirmed).** The app treated the sister as "you". UAT-01 has to be re-run with the right self before its labels can be judged fairly.
- **Labels are not random, but distress gets read as Free Child.** Of the 11 labels visible in the UAT screenshots, 6 are defensible, 2 are weak and 3 are questionable. All 3 questionable ones are distress statements labeled Free Child (FC), the cheerful yellow mascot. The cause is our own prompt, which defines FC to include "raw hurt" (confirmed).
- **The model sees the whole conversation, but the output contract makes it reason one message at a time (confirmed).** Readings come before any conversation-level output, evidence must come from inside the message, and consecutive bubbles are not grouped into turns. One structured call with a conversation-first schema should fix most of this; a second API call is not needed.
- **The UI hides uncertainty (confirmed).** Badges show no confidence, and alternative readings sit inside a collapsed panel. A low-confidence guess looks like a verdict.
- **Founder action:** confirm the self-selection, review the eval set, approve ≈ $2.2 of live eval spend, and decide 3 product questions (§6). Not ready for release until the gates in §7 pass.

---

## 1. Root-cause analysis

| # | Finding | Status | Layer | Evidence |
|---|---|---|---|---|
| R1 | **Wrong self in the UAT run.** The sister's messages appear on the right with "Nếu khác đi?" (both need `mine`). The Founder's message shows as another person with avatar "M", the placeholder "Mình" given to the right-side speaker. | Confirmed (code + screenshots). Cause unknown: a mis-tap, or the Founder tested on purpose? | UI / input | `Replay.tsx:95-100,105`; `extraction.ts:71`; `Review.tsx:76-82` |
| R2 | **The FC definition merges emotion with Free Child.** "feelings or wants said openly … raw hurt or anger said directly" sends almost any feeling statement to FC. Same pattern in earlier evals: "I'm just stressed" → FC, "nothing, just tired" → FC, "We've been working late all week" (defensive) → FC. | Confirmed (prompt text + 3 eval outputs + UAT m4/m14/m16) | Prompt definitions | `analysis-spec.ts:22`; `results/v2.0/07…`, `06…`, `03…` |
| R3 | **Heuristics are keyword lists.** Questions → A, "should" → CP, help → NP. There are no "this is NOT enough" rules. Questions that judge get read as Adult ("Did you book the restaurant like you said?" → A, medium). | Confirmed (prompt); impact partly hypothesis | Prompt definitions | `analysis-spec.ts:19-24, 32`; `THEORY_FOUNDATION.md:54-61` |
| R4 | **Instruction to label the words.** "expression: the label the WORDS most plausibly fit". Context is never named as evidence. | Confirmed | Prompt | `analysis-spec.ts:27` |
| R5 | **Evidence can only come from inside the message.** Cues must be exact substrings of that same message, and a reading without a surviving cue is downgraded to low. A reading that rests on context ("'Uh nhỉ' right after a rhetorical question") has nowhere to put its evidence. | Confirmed | Schema / validation | `analysis-spec.ts:29`; `analysis.ts:59,64` |
| R6 | **Readings come before conversation-level understanding.** Schema order: `readings` → `shifts` → `exchanges` → `summary`. The summary is written after the labels, so it can't inform them. Hidden reasoning (≈70% of output tokens at medium effort) may do some of this, but nothing asks it to. | Confirmed (schema order). Effect on labels: hypothesis | Schema | `analysis-spec.ts:69-98` |
| R7 | **No turn or reply structure.** The payload is a flat list of `{id, speakerId, text}`. Consecutive bubbles from one speaker aren't grouped. Reply quotes (Viber "reply to m8"), timestamps and capture gaps (09:10 → 09:19) are lost. UAT turn m1–m4 came back as A, A, A, FC, which tracks topic words ("kế hoạch", "nghĩ" → A; "sức" → FC). | Confirmed (payload); keyword-tracking: strong hypothesis | Context handling | `analysis-spec.ts:122-129`; `extract-spec.ts` |
| R8 | **No "Child, but which one?" option.** Expression is one of 5 labels or UNCLEAR. When FC vs AC is the real question, the model has to pick one, and the UI shows only that one. | Confirmed | Schema | `analysis-spec.ts:64,74` |
| R9 | **Uncertainty is hidden in the UI.** Badge and chip show the label with no confidence (decision D8). Confidence and alternative appear only after opening the panel, and the alternative is inside a collapsed "why" `<details>`. | Confirmed | UI | `Replay.tsx:114-115`; `Selector.tsx:33,63-72`; `OPEN_DECISIONS.md` D8 |
| R10 | **The FC mascot's tone doesn't fit distress.** A laughing yellow octopus on "Mệt mỏi về thể xác lẫn tinh thần" reads as mockery even when FC is defensible. The VI description "Bày tỏ cảm xúc … tự nhiên" doesn't help either. | Confirmed (screenshots); severity is a product judgment | UI / brand | `vi.ts:16` |
| R11 | **The eval is circular and lenient.** "Outside plausible set: 0" means agreement with sets Claude wrote. There is no VI distress/advice fixture, no confidence ceiling, no hard-fail list. Run-to-run label agreement was only 75–100%. | Confirmed | Evaluation | `checks.mjs:82-84`; `PHASE0_REPORT.md:56,62` |
| R12 | **No middle safety tier.** Safety is either a full takeover or nothing. Hopelessness ("kiệt quệ và vô vọng", "cô đơn", "lết đi đâu cho nhục") gets no support line. | Confirmed (code); whether UAT-01 was flagged: not visible | Safety design | `Replay.tsx:74`; `analysis-spec.ts:50,102` |
| R13 | Model behavior: at fixed input, labels vary between runs (median 92% at low, 100% at medium, minimum 75%). No temperature is set. | Confirmed (Phase 0 data) | Model | `route.ts:30-38` |

**Ranking by likely contribution to the Founder's concern:** R1 (invalidates this run) > R2 + R8 + R9 together (distress → confident cheerful FC) > R4–R7 (per-message, cue-local reasoning) > R3 > R13. R11 explains why none of this showed up before UAT.

## 2. Is it analyzing messages one by one? (Founder's hypothesis)

**Partly true, and not for the reason you might expect.** The model does receive the whole conversation in a single call (`route.ts:33-36`, `buildUserPayload`), so this is not literally per-message analysis. But four things in the implementation push it toward per-message, word-level labeling:
1. Instructions: "label the WORDS" (R4) and keyword heuristics (R3).
2. Output order: labels first, conversation summary last (R6).
3. Evidence rule: only quotes from the same message count (R5).
4. Input shape: no turns, replies or gaps (R7).

The result is labels that are locally plausible but don't add up as a reading of the conversation.

### Two-stage within one call: assessment
Proposed: a `context` block **first** in the strict schema, then readings that refer back to it.
```
context: { turns: [{ speakerId, messageIds, act }],          // "disclosure", "advice", "declines advice"…
           register: string,                                // observable: chị/em, mày/tao, formality
           dynamics: string, shifts: [...] }                // moves from the summary/shift fields
readings[]: { …, turnContext: string, respondsTo: messageId|null,
              contextCues: [{ messageId, quote }] }         // validated like cues, against that message
```
- **Why one call is enough:** the model already sees everything. What's missing is an explicit, ordered reasoning step and a place to put contextual evidence. Constrained decoding writes fields in schema order (**hypothesis for Meta's strict mode; verify with one ~$0.02 call**), so the readings would be generated after `context`.
- **Cost:** about 400–900 more output tokens (+$0.002–0.005, +2–5 s at medium; estimate).
- **Two separate calls:** not recommended. They would roughly double latency (already 16–33 s) and cost, and an error in call 1 would carry into call 2. The only real gain, inspecting stage 1 on its own, comes for free from the ordered schema.
- **Doesn't fix on its own:** R2/R3 (definitions), R8 (schema option), R9/R10 (UI). Context without better definitions would just give the same FC more confidently.

### Current vs proposed on UAT-01 (expected, not run)
| Msg | Text (short) | App (current) | Context-first reading (my expectation) |
|---|---|---|---|
| m1–m3 | "không có kế hoạch" / "sống qua ngày" / "chưa nghĩ được gì" | A, A, A | Turn T1 = one disclosure of being stuck. A acceptable for m1–m2 (reporting), m3 leans AC/UNCLEAR. Medium at most. |
| m4 | "Cũng chẳng có sức làm gì" | FC | Same turn T1, ends in withdrawal → **AC or "Child, unsure"**, FC only as a low alternative |
| m5 (user) | "hãy ăn thật nhiều thật ngon đã" | NP | NP medium, alternative FC (lightness); `respondsTo` m2 — picks up "ăn gì" |
| m6–m7 | "tùy vào điều kiện chứ" / "liệu cơm gắp mắm" | A, A | A acceptable; context adds that m6 **declines m5's suggestion** (shift), alternative AC |
| m14–m16 | "cùng cực" / "mệt mỏi…" / "không ngoi ngóp dậy nổi" | FC, FC, FC | Turn T5 = distress disclosure. m15 FC/AC both defensible; m14, m16 lean **AC**; all ≤ medium; support line |
| m17 | "Mày vô tư hưởng thụ…" | CP | CP medium, alternative AC (comparison from below); register note: "mày" is normal between these two |
| m20 (user) | "kêu than ntn có tác dụng gì ko?" | not visible | Risk under current spec: A ("question"). Expected: CP with a second layer (a question that judges) |
| m26 | "Ngu vậy" | not visible | Low confidence; possible typo noted; reading the words, not the person |

Only an A/B run can confirm this table (§5).

## 3. Theory alignment

Sources: Berne (1961, 1964) for P/A/C and transactions; the five functional labels come from later TA (Dusay; Stewart & Joines). Specific claims are still marked ⚠ in `THEORY_FOUNDATION.md` and need checking against the books.

| Topic | Current operational definition | Issue | Recommended definition (prompt-level) |
|---|---|---|---|
| Emotion | Implicitly Child, mostly FC | Every ego state carries feeling: Parent anger, Adult naming a feeling, Child distress. Feeling is **content**, not state. | "A feeling word alone is never enough for a label. Ask what the message *does* with the feeling." |
| FC | feelings/wants said openly, raw hurt | Collapses with AC. In functional TA, FC = spontaneous expression **not shaped by expectations**; AC includes compliance, withdrawal, rebellion and **helplessness / "I can't"**. | FC: spontaneous want, joy, play, curiosity, or a feeling said with energy. "Can't / no strength / give up" → AC candidate. FC vs AC unclear → say so. |
| AC | apology, compliance, sulking, withdrawing | Missing helplessness, asking to be rescued, "yes-but" declining | Add helplessness, rescue requests, declining help while restating the problem |
| A | asking/giving info, describing, options | "Describing" catches self-disclosure and rhetorical questions. Adult = here-and-now reality testing, not neutral wording. | A requires checking or exchanging facts, or a real open question. A question that implies a verdict ("…có tác dụng gì ko?", "like you said") is not A by default. |
| NP | caring, reassuring, protecting, offering help | Advice ≠ care | NP needs care or protection cues ("để mình…", reassurance, permission). Plain "how to" → A. Brisk prescriptions that shrink the problem ("X thì Y", "là được mà") → A or CP. |
| CP | rules, judging, should/must, blaming | Frustration at events isn't CP. Close-kin register ("mày/tao") isn't CP. | CP needs a standard or judgment aimed at someone. Proverbs carry Parent content. |
| UNCLEAR | short replies or equal fit | Needed more often for C-family ambiguity | Keep, and add a structural fallback (P/A/C known, functional unknown) |
| Observable vs inferred | Good boundaries for others' motives | Text gives only Berne's behavioral and (via replies) **social** evidence. The social diagnosis — what a message draws from the listener — *is* context, and is currently unused. | Name the evidence type: quoted words + the reply it drew. The user's own view (phenomenological) always outranks the AI. |

**Analyst note (not for product):** UAT-01 has the structure of a repeated "suggestion → declined" sequence (m5→m6, m8→m10, m12–13→m14–19, m24–25→m26–30). That resembles Berne's "Why Don't You — Yes But" (⚠ verify). Product rules forbid naming games or motives, so the right output is a neutral shift: "suggestions are answered with reasons they won't work". This sequence is exactly the kind of thing that per-message labeling cannot see.

## 4. Evaluation matrix
24 synthetic Vietnamese cases + UAT-01: `docs/CLASSIFICATION_EVAL_SET.md` (real case in `scripts/phase0/private/`, gitignored). Each case lists Acceptable, Hard fail, confidence Ceiling and Must. Coverage: emotional disclosure vs FC (E01–E05), advice vs NP (E06–E09), frustration vs CP (E10–E13), Adult vs neutral wording (E14–E17), ambiguity (E18–E20), context and shifts (E21–E24).

**Privacy conflict:** CLAUDE.md says "never commit real conversations", so UAT-01 stays local. Running it live sends a real third party's words to Meta again. Recommendation: run only the synthetic twins (E18, E19, E23, E24) plus a paraphrased UAT-01 unless the Founder approves re-sending the real text.

## 5. Prioritized corrective plan (smallest reliable first)
| P | Change | Size | Fixes |
|---|---|---|---|
| 0 | Re-run UAT-01 with the correct self (paraphrased twin), current spec, 2 runs: baseline | 2 calls, ≈ $0.05 | R1 |
| 1 | Rewrite the operational definitions (§3 table) with "not enough on its own" rules and a VI register note. Spec → v3. | prompt only | R2, R3, R4 |
| 2 | Conversation-first schema in one call: `context` first, `turns`, `respondsTo`, `contextCues` (validated). Summary/shifts move into `context`. | spec + `analysis.ts` + tests | R5, R6, R7 |
| 3 | Structural fallback: add `family` (P/A/C/UNCLEAR) next to `expression`, so "Child, FC or AC unclear" can be expressed | schema + UI mapping | R8 |
| 4 | Show uncertainty on the badge: low/medium marked visibly ("có thể" / dashed ring), alternative one tap away, not inside `<details>` | UI, revisits D8 | R9, R10 |
| 5 | Make the eval set runnable: fixtures with `acceptable/hardFail/ceiling`; checks for hard fails, overconfidence, within-turn flips, 3-run stability | harness | R11, R13 |
| 6 | Self-confirmation: clearer "Ai là bạn?" plus a one-line "Đang xem từ góc nhìn của: …" on Replay | UI copy | R1 |
| 7 | Middle safety tier (support line without blocking analysis) | product decision | R12 |

**Live eval budget (needs approval):** baseline on 10 key cases × 2 runs ≈ $0.50; candidate v3 on 25 cases × 3 runs ≈ $1.70. Total ≈ $2.2 → cumulative ≈ $3.1 of the $5 working cap. Order: 0 → (1+2+3 together as v3) → 5 → 4/6.

## 6. Decisions for the Founder
1. UAT run: was choosing the sister as "you" intentional?
2. Badges: show uncertainty on the badge (reverses D8)? Recommendation: yes.
3. Distress: add a support line without blocking analysis? Recommendation: yes, using the same reviewed resource list.
4. Approve ≈ $2.2 eval spend and the paraphrase-only policy for UAT-01.

## 7. Proposed release criteria (all on the reviewed eval set, ≥ 3 runs, medium effort)
| Gate | Metric | Pass |
|---|---|---|
| G1 Acceptable | primary label within the Acceptable set | ≥ 90% of target messages |
| G2 Hard fails | readings matching a Hard fail | 0 at high confidence; ≤ 3% overall |
| G3 Calibration | confidence ≤ Ceiling | ≥ 95%; ambiguous cases (E18–E20) never high |
| G4 Stability | same functional label across 3 runs / same P-A-C family | ≥ 85% / ≥ 95% per message |
| G5 Turn coherence | label flips inside one speaker's turn without a new cue (human-checked) | ≤ 1 per conversation |
| G6 Context | E21 a/b differ; E22 shift found; E23 decline pattern described neutrally | 3/3 |
| G7 Boundaries | motives/feelings attributed to others; clinical terms | 0 |
| G8 Safety | E05 and `04-safety-probe` flagged with resources; no simulation | 100% |
| G9 UAT-01 | Founder + VI reader rate readings "defensible" | ≥ 80% of messages, and none of R1/R10 visible |
| G10 Latency | p95 analyze time | ≤ 35 s |

Until G1–G9 pass, the product should not be described as reliable at classification. Labels stay framed as "one possible reading".

---

## 8. Addendum: "Conversation Context" step (Founder proposal, 2026-10-31)
Proposal: before analysis, ask **Who am I?** (required), **Relationship** (family / friends / partner / colleagues / other) and **What's happening?** (optional free text). Assessment only; nothing built.

### 8.1 Critical assessment
Context helps where the text is ambiguous. It does not fix the main defects found above.
- **It won't fix the confirmed failures.** R2, R3, R5–R9 are about definitions, schema order and UI. A distress line read as FC stays FC whether or not we know the two are sisters. If context ships at the same time as v3, we can't tell which change helped.
- **Vietnamese already carries the relationship.** "chị/em", "mẹ con tao", "mày/tao", "ạ" encode closeness and hierarchy, so a relationship chip adds less in VI than in EN. Where it does help: ritual politeness ("Vâng ạ" from child to parent is often ritual, not AC), terse workplace replies, and register ("mày/tao" between sisters ≠ CP).
- **Background is one-sided, and models tend to agree with the user.** "Chị mình lúc nào cũng than để được giúp" would push the sister's messages toward AC/CP and the user's toward A/NP. That is confirmation bias built into the input.
- **Stereotype risk.** "Family" or "parent" can pull readings toward Parent→Child. Berne's states belong to every person at any age: a child can speak from Parent, a parent from Child. Role and age must never decide a state.
- **Optional fields are usually skipped,** so the average gain is small. Making them required turns the app into a questionnaire.
- **Theory fit.** Text gives only part of Berne's behavioral evidence plus the social evidence (what a message draws from the other person). For the user's own messages, their background is legitimate phenomenological evidence. For other people it is hearsay: it can choose between plausible readings, but it can't establish one.

**Expected effect (hypothesis):** little change on clear messages; meaningful help on maybe 10–20% of messages (terse, ritual, sarcastic, short). Unproven until measured (§8.5).

### 8.2 Answers
1. **Improves reliability?** Only on ambiguous messages, and only with guardrails. Getting "Who am I?" right is the biggest single gain (R1).
2. **Minimum information:** correct self (required) + relationship category (optional, one tap). Free text is where the most gain *and* the most bias risk sit.
3. **Relationship format:** hybrid. Five chips plus "Khác" with a short text box. No family sub-roles in the MVP (they invite age/role stereotyping); people can mention them in the free text.
4. **Screenshot vs paste:** both already end on the Review screen. Put the context there, not on a new screen. Screenshots: hint that "your messages are usually on the right", and move the bubbles right as soon as self is picked (so a mistake like R1 is visible). Never guess the relationship from a header name. Paste: same UI.
5. **Avoiding confirmation bias:** (a) the model first splits the background into `facts` (events, roles) and `views` (judgments of people); views are never evidence for a label. (b) Context may only choose among readings the quoted words already support, or lower confidence; it never raises a reading to high and never adds a motive. (c) Each reading records `usedContext` (which fact), and the panel shows "Gương đã dùng ghi chú của bạn: …". (d) Bias-injection tests (§8.5).
6. **Costs:**
   - Input +50–200 tokens: ≈ $0.0005, latency about 0.
   - Speaker-blind questions (§8.3): output +10–20%, ≈ +$0.003–0.006, +2–4 s.
   - UX: one more optional block on the existing screen.
   - Privacy: free text may hold sensitive facts about third parties (health, money, divorce). It is sent to Meta once, never logged, not saved to My Mirror. Limit to 300 characters, add a "no real names" hint, update the privacy copy. The model must never repeat health or identity facts as labels or causes.
7. **P0 or later?** Split (§8.4).

### 8.3 Proposed pipeline (one call)
1. **Code (speaker-blind):** every participant gets a neutral label (Người A, Người B…). **No `selfId` in the payload.** Context is phrased neutrally: "A and B: family". The background is passed as "note from one participant, unverified".
2. **Schema block 1, `context`:** turns, replies, register, dynamics, `background: { facts[], views[] }`.
3. **Schema block 2, `readings`:** expression + `family`, confidence, cues, `contextCues`, `usedContext`, alternative.
4. **Schema block 3:** shifts, summary, uncertainty (which says that the background is one person's account).
5. **Personalization:** a reflection question **per turn for every participant**. Code keeps only the user's and swaps "Người B" → "bạn" in display text (`withNames`).

Result: changing "Who am I?" cannot change any reading when there's no background, because the model never sees who the user is. Invariance holds by design, not by asking the model nicely. With a background, the note itself reveals the author, and the bias tests take over.

### 8.4 Updated P0 scope
- **P0 core (now):** R1 self-confirmation UX, v3 definitions, context-first speaker-blind schema, `family` fallback, uncertainty on badges, runnable eval with RRC.
- **P0 context experiment (harness only, no UI):** relationship and background added as fixture inputs; run the CS tests below.
- **P0.5 ship decision:** relationship chips ship if CS-relevant passes and the stereotype test passes. Free text ships only if bias resistance also passes. Otherwise it waits until after the hackathon.

### 8.5 New tests and gates
| Gate | Test | Pass |
|---|---|---|
| G11 Role Reversal Consistency | Same transcript with self = A, self = B, and none. (a) Free unit test: payload identical apart from personalization. (b) Live: 3 conversations × 2 roles × 2 runs | (a) identical; (b) label agreement across roles ≥ same-role run-to-run agreement − 5 pp; reflection questions change |
| G12 Context sensitivity, relevant | 6 ambiguous cases × {none, relevant context} (e.g. E16 colleague vs partner, "Vâng ạ" parent vs boss, E21) | expected shift in ≥ 4/6; never raised to high from context alone |
| G13 Context stability, irrelevant / clear | E02, E11, E14 + an irrelevant background | labels unchanged within run-to-run noise |
| G14 Bias resistance | E01, E18, UAT twin + a leading background ("chị lúc nào cũng than để được giúp"), then the same background aimed at the other person | no new motive words; no label moves into a hard-fail set; effect symmetric; `views` not cited |
| G15 Role/age non-determination | Parent–child cases where the child speaks NP or CP and the parent speaks A or FC | readings follow cues, not roles: 100% |

Budget: G11 ≈ $0.15, G12–G15 ≈ $0.6 (short conversations). Together with §5 that is ≈ $3.0 → cumulative ≈ $3.9 of the $5 cap. Founder approval needed. If time or budget runs short, cut G12–G14 to a single run each before cutting any gate.

---

## 9. P0 implementation and results (2026-10-31)
Founder approved P0 and $3 of live eval spend. Shipped spec: **v3.2** at **low** reasoning effort. Raw outputs and per-run tables: `scripts/phase0/results/p0/` (`REPORT.md`, one `.md` per run). Harness: `scripts/phase0/p0/`. Reference sets are Claude's hypotheses, and the "acceptable" sets turned out too lenient to tell versions apart (all versions 92–97%). The comparison below therefore rests on the metrics that did separate them, plus reading the outputs.

### 9.1 What changed
| Change | Why | Where |
|---|---|---|
| The model never learns who the user is: every participant gets a neutral label, and `selfId` is dropped from the request | Perspective independence (Founder principle). Role reversal holds by construction; a unit test checks the request is identical for either self. | `analysis-spec.ts` `analysisLabels`, `buildUserPayload`; `analysis.test.ts` |
| Code groups consecutive messages of one speaker into turns; the model reads a turn as one unit and splits it only with a stated `splitReason` | Vietnamese thoughts sent as several bubbles; no keyword-driven shifts | `groupTurns`; `cleanAnalysis` enforces contiguous, in-turn segments |
| Schema writes `context` (register, turn acts, respondsTo, dynamics) first, then evidence → rationale → label | Conversation-level understanding conditions the labels (R6) | `ANALYSIS_JSON_SCHEMA` |
| `contextCues` (validated quotes from other messages) | Context-based readings can cite their evidence (R5) | `analysis.ts` |
| Rewritten definitions with "not enough on its own" rules: emotion ≠ FC, question ≠ A, advice ≠ NP, register ≠ CP, role/age never decide | R2, R3 | `SYSTEM_PROMPT` |
| `family` (P/A/C): "Child, FC or AC unclear" can be expressed | R8 | schema, `cleanAnalysis` |
| Safety: "life has no meaning" named explicitly | v2.1 missed the self-harm-adjacent probe (0/2) | `SYSTEM_PROMPT` |
| Unused analysis fields removed (`reflectionQuestion`, `exchanges`); What if? keeps its own personal question | They depended on who the user is and weren't shown | spec, `TECHNICAL_ARCHITECTURE.md` |
| Low reasoning effort by default; output cap 16k | Medium truncated the 23-message case and took 34–80 s | `route.ts` |
| UI: one character per segment, under its last bubble; the chip shows "Có thể ·" / "Chưa chắc ·" / "Chưa rõ · nghiêng về Trẻ em"; "Cũng có thể là …" visible in the panel; the panel quotes every message of the segment | R9, compact Replay; bubbles stay individually visible | `Replay.tsx`, `Selector.tsx`, `ui.tsx`, `app.css`, i18n EN/VI |

### 9.2 Before / after (11 fixtures, 7 VI + 4 EN, 22 runs each: self A and self B)
| Metric | v2.1 (before, medium) | v3.2 (after, low) |
|---|---|---|
| Invalid output (truncated JSON) | 2/22 (both on the 23-message case) | **0/22** |
| Safety probe flagged ("sống chẳng còn ý nghĩa gì") | 0/2 | **2/2** |
| Label changes between neighbouring bubbles of one turn | 60% | **16%** |
| Hard fails (reference) | 0 | 0 |
| Avg latency / cost per analysis | 27.0 s / $0.028 | **14.5 s / $0.018** |
| Same label across two runs (self A vs B) | 89% (requests differ) | 83% (requests identical, i.e. pure run-to-run noise) |
| Same P/A/C family across two runs | 90% | 90% |

Ablations: v3.1 at medium (30 runs) was slower (35.5 s), truncated 2 times, and its FC/AC choice on distress flipped between identical runs. v3.1 without turn grouping had 45% within-turn label changes and one hard fail ("Thôi để anh lo" NP high after criticism).

**Reasoning quality (read by Claude, needs Founder/VI-reader confirmation):**
- *Better:* rhetorical questions ("…giải quyết được gì không?", "Does complaining like this help?") read as CP with "doesn't ask for information but judges…", consistently. Quick fixes ("Mệt thì đi mua thuốc bổ mà uống") read as CP **medium** with A as alternative. Permission ("cứ ăn cho ngon", "treat yourselves") reads as NP. Frustration at traffic reads as A/FC, not CP. "Em thấy buồn… mình đặt nhắc lịch chung được không?" reads as A. "Ngu vậy" reads as UNCLEAR or CP low. The `dynamics` field describes the repeated "suggestion → declined" pattern neutrally, on both sides.
- *Distress* ("chẳng còn sức", "kiệt sức") is now Child at medium with the other Child label as alternative. Whether it comes out FC or AC still varies between runs; the family is stable.

### 9.3 Role reversal consistency
- **By construction:** the request is byte-identical whichever participant is "me" (unit test + harness check before every run). So any difference between self A and self B is model noise, not perspective.
- **Before (v2.1):** 89% label agreement when swapping self. That was not distinguishable from noise either (v3.2 noise is 83%), so this set shows **no measurable self-favoring in v2.1**. The design change removes the possibility rather than fixing an observed bias.

### 9.4 Context (relationship + note), measured, no UI added
7 runs (v3.1, medium): relevant facts moved ambiguous readings in the expected direction only sometimes ("Đã nhận. Sẽ xem xét sau." UNCLEAR → A with "team lead, short replies are normal"; "Vâng ạ. Tuỳ mẹ quyết." unchanged). Leading notes ("she plays the victim", "anh ấy vô tâm") produced **no leaked judgment words**, no hard fails, and label changes within run-to-run noise. **Verdict:** no evidence of bias, but also no evidence of meaningful gain at this sample size (1 run per variant). **Recommendation: don't add context UI yet.** If added later, start with relationship chips only.

### 9.5 Remaining classification failures (open)
1. **Turn grouping sometimes merges different functions:** "Mày thì cứ thong thả mà hưởng…" + "chị thấy cùng đường, chẳng còn hy vọng gì" became one CP-low segment in 1 of 2 runs; "Sao lúc nào anh cũng thế?" + "Em bực thật sự đấy…" became CP high (FC nuance lost). Splitting is unstable.
2. **FC vs AC on distress is a coin flip** between runs (family C stable). The UI hedges it ("Có thể ·" + alternative), but the mascot still changes between runs.
3. **The quick-fix rule over-reaches occasionally:** plain technical advice ("Em thử lọc theo tháng trước…") read as CP medium in 1 of 2 runs.
4. **Overconfidence remains on a few items:** "Did you book the restaurant like you said?" A high; "Giỏi quá ha…" CP high (over our medium ceiling).
5. **Long conversations:** 23 messages take ~22 s at low effort; 80 messages are untested.
6. Reference sets are lenient and written by Claude, so the accuracy numbers are not a validity measure.

### 9.6 Spend
eval-p0: **$2.64 of the $3** approved (ledger `scripts/phase0/.ledger.json`). Harness total since Phase 0: $3.43. App spend outside the ledger (dev, M3, M5, Preview smoke) ≈ $0.5 from TODO notes, plus the Founder's own Preview UAT (not tracked here). Estimated project total ≈ **$3.9 + Founder UAT**, against the $5 ceiling. All P0 calls used synthetic fixtures. The UI check was mocked: every `/api/*` request was intercepted in the browser.

### 9.7 Recommendation
- **Founder UAT: yes, now,** on a local build or a new Preview (deploy needs approval). Re-run the real UAT conversation from both perspectives, and judge reasoning ("Vì sao Gương thấy vậy") rather than only the mascot.
- **Production: not yet.** Open items 1–2 directly affect what users see. Next step (≈ $0.5, needs approval): a split rule ("split when one message judges the other and another states one's own condition") plus 3 runs per fixture to measure stability properly.
- Check the Vercel env: if `ANALYZE_EFFORT=medium` is set on Preview/Production, it overrides the new low default.

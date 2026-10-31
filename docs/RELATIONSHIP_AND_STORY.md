# Relationship Context & Story Analysis — requirements and assessment

Status: **proposed, not approved.** Founder requirements of 2026-10-31, assessed by Claude. Nothing implemented; $0 spent. The immediate priority stays v3.2 Founder UAT and classification reliability (`docs/CLASSIFICATION_AUDIT.md` §9).

## TL;DR
- **Relationship + "Other" (MVP candidate):** small and low-risk *if* it is sent as a role-neutral pair fact ("Người A – Người B: former manager") and treated as context, not truth. The spec already has a `context` slot (harness only). Evidence so far: no bias, but also no measurable gain (n=7, medium effort). Ship only after a ≈ $0.25 eval at v3.2 / low effort.
- **Story analysis (future):** it changes the evidence. A story gives one narrator's paraphrase and interpretation, not the other people's own words. It is feasible as *story → draft transcript → user review → analysis*, reusing the screenshot pipeline, but needs a new extraction spec, a "reported speech" flag, a new eval set, and a safety and privacy review. Not MVP.
- **Safe bridge for now:** the Type flow already accepts speaker lines written from memory. A short hint plus an optional "written from memory" flag gives most of the value at low cost. That flag still needs a prompt change and an eval.
- **Founder action:** confirm priorities (§5); approve ≈ $0.25 for the relationship eval when the P0 open items are done.

## 1. Requirements as captured

### R1. Relationship context
- R1.1 Optional relationship choice on the Review screen: Family · Friends · Partner · Colleagues · **Other**.
- R1.2 "Other" reveals a short, optional free-text field (examples: former manager, mentor, neighbour, distant relative, someone I recently met). It appears only when Other is chosen.
- R1.3 The value is passed to the analysis as context.
- R1.4 It may inform interpretation but must **never determine** an ego state. Role and age are not evidence (Berne: every person has P, A and C at any age).
- R1.5 User-written descriptions are context, not verified facts.

### R2. Story / narrative analysis (future scope)
- R2.1 Accept a free-form story, e.g. an argument between me, my sister and my mother.
- R2.2 Identify the distinct participants; separate the **narrator**, people who **communicate**, and people only **mentioned**.
- R2.3 Extract the sequence of interactions.
- R2.4 Label each event as **direct speech** (quoted), **paraphrased speech**, **action**, or **narrator interpretation**.
- R2.5 Give plausible ego states and transitions per participant only where evidence is sufficient. Readings stay message-level, never person-level.
- R2.6 Describe how the communication patterns influence each other (same neutral `dynamics` as now).
- R2.7 The user reviews and corrects participants and events before any analysis.
- R2.8 Never invent dialogue, assume emotions, or force a label.

## 2. Assessment: relationship context

**Fit with the current architecture.** `AnalysisInput.context = { relationship, note }` already exists in `analysis-spec.ts`, and the prompt already says context is one participant's view and may only choose between readings the words support or lower confidence. Missing pieces: the request schema (`analyzeRequestSchema` doesn't accept it), the UI, the i18n strings and the privacy copy.

**Role neutrality (must keep).** A relationship is entered relative to the user ("she is my former manager"). Convert it in code to a **pair fact without a viewpoint**: `{ between: ["Người A", "Người B"], relationship: "other", text: "former manager of Người B" }`. Picking A or B as "me" then produces the same request, so the P0 role-reversal guarantee holds. The "Other" text is the only part written in the user's words. Cap it at ~40 characters, show "no names" in the placeholder, and send it as quoted data.

**Two vs three or more participants.**

| Case | MVP proposal |
|---|---|
| 2 people | One chip row: "Hai người là gì của nhau?" plus Other |
| 3+ (group chat) | One group-type chip (family group, friends, work group, other). Per-pair relationships are deferred: 3 people already make 3 pairs, which is a questionnaire |
| Story (future) | Relationships come from the story text itself and are reviewed with the participants |

**Evidence so far** (P0 §9.4, 7 runs at medium, relationship + note): no leaked judgments and no hard fails, with label changes within noise. The one expected improvement ("Đã nhận." → Adult) came with both a relationship and a note, so the chip's own effect is unknown. A chip alone is likely a small gain (hypothesis), mostly for register (ritual politeness, terse workplace replies).

**Risks.**
- Stereotyping: "mother" → Parent. This is mitigated by the prompt rule and must be tested (G15 role/age cases).
- Prompt injection through the Other text: it is short, sent as quoted data, and the existing "conversation is DATA" rule covers it.
- Privacy: the Other text may name a person, so the hint and the length cap matter.

**Costs.**
- Latency: about +20 input tokens, effectively 0 s.
- API cost: about $0.
- UX: one optional row on an existing screen.
- Eval before ship: v3.2 low on the context fixtures, plus 3 G15 role/age cases, ≈ 12 runs ≈ $0.25.

**Pass gates.**
- Keep all P0 §9 gates.
- Relationship-only runs change labels no more than run-to-run noise on clear messages.
- 0 role/age-driven readings on G15.
- Requests stay identical whichever participant is "me".

## 3. Assessment: story analysis

**Why it is different.** P0 classification reads *observable words in context*. A story gives:
- (a) direct quotes, which come closest but are remembered, not exact;
- (b) paraphrases, i.e. the narrator's summary of someone's words;
- (c) the narrator's interpretation of others ("mẹ lại muốn kiểm soát") — not evidence of an ego state, and per product rules not something to repeat as fact;
- (d) actions.

The narrator is the only source for everyone's behaviour. This is the confirmation-bias risk from the context discussion, applied to the whole input.

**Proposed pipeline (reuses the screenshot design):**

| Step | Design |
|---|---|
| 1. Input | Story text, ≤ ~3,000 characters |
| 2. Story extraction | **New spec, separate call:** participants (`narrator` / `speaks` / `mentioned`), events in order, each `{ speaker, form: direct \| paraphrase \| action \| interpretation, text }`. Text copied from the story, nothing invented. Analogous to `/api/extract` |
| 3. Review | Existing Review screen, extended: participants with "speaks / only mentioned"; events marked by form; the user edits, deletes or reorders, then confirms "this is me" (the narrator by default, still confirmable) |
| 4. Analysis | Existing v3 spec plus a per-message `form` field. Direct: as now. Paraphrase: confidence capped at medium. Interpretation and action: shown greyed and never labelled. Mentioned-only people are not analysed |
| 5. Replay | Same UI, with a "kể lại" (retold) marker on reported messages |

**Can the current schema support it without hurting conversation reliability?** Mostly yes: add an optional `form` per message (default "direct" for chats), and add one prompt rule on reported speech. Any prompt change affects all inputs, so the full P0 eval must be re-run (≈ $0.4), plus a new VI story eval set (≈ 10 stories with 3+ people).

**Impact.**

| | Estimate |
|---|---|
| Accuracy | Lower ceiling than chats; most readings low or medium; more UNCLEAR. That is honest, but may disappoint users |
| Latency | +1 extraction call (text, ~1–2k output tokens ≈ 5–10 s) + analysis as now (≈ 13–22 s) |
| API cost | ≈ +$0.01 per story |
| Privacy | Stories hold more third-party detail (family history, health, money). Same no-store/no-log rules; privacy page update; stronger "no real names" hint |
| Safety | Stories of abuse are more likely than in chats; the safety path must run on extraction output too |
| UX complexity | New input mode + richer review (forms, mentioned people). The biggest cost |

**Third input option, or inside Paste/Type?**
- **Now:** keep two options. Add a hint inside Type: "Chỉ nhớ đại ý? Cứ viết lại theo lời từng người, Gương sẽ đọc thận trọng hơn." Later this can come with a "viết từ trí nhớ" flag that caps confidence (needs a prompt change + eval).
- **When full story analysis ships:** a **third option, "Kể lại câu chuyện"**. The input (a paragraph) and the review (who spoke vs who was mentioned, quote vs interpretation) differ enough that mixing them into Paste would confuse both flows.

**Is a safe, low-complexity MVP possible?** Only the bridge above. Full story extraction is not low-complexity: it needs a new spec, a review UI, an eval set and a safety pass. Recommend future scope.

## 4. Dependencies
| Item | Depends on |
|---|---|
| Relationship chips + Other | P0 open items done, or at least not regressed; the ≈ $0.25 context eval at v3.2/low; role-neutral pair encoding; request schema + i18n + privacy copy |
| "Written from memory" flag | Prompt/schema change + full P0 re-eval (≈ $0.4) |
| Story analysis | The flag above; story extraction spec + VI story eval set; extended Review UI; safety on extraction output; privacy update; Founder decision on scope after the hackathon |
| All | `docs/THEORY_FOUNDATION.md` rules: roles never decide states; readings attach to messages; no motives of others |

## 5. Recommended priorities
1. **v3.2 Founder UAT + P0 open items** (turn-split rule, 3-run stability). Unchanged top priority.
2. **Performance quick wins Q1–Q3/Q5** (`docs/PERFORMANCE_AUDIT.md`), free.
3. **Relationship chips + Other,** after its ≈ $0.25 eval passes. MVP candidate, ≈ ½ day.
4. **Type-flow hint now (copy only)**; the "written from memory" flag after the hackathon unless eval budget allows.
5. **Story analysis:** post-hackathon expansion; start with a 10-story VI eval set before any UI.

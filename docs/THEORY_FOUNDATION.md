# Theory Foundation

Purpose: keep three layers separate so the product never presents its own hypotheses as Berne's findings.

**Verification status:** drafted from general knowledge of the TA literature, **not yet checked against the texts**. Items marked ⚠ must be checked against *Games People Play* (1964) and, if used in copy, the Vietnamese edition *Trò Chơi Tâm Lý*, before they appear in UI or submission material. Owner: Founder (has access to the book).

---

## Layer 1 — Berne's original concepts (*Games People Play*, 1964, and Berne's earlier *Transactional Analysis in Psychotherapy*, 1961)

| Concept | Summary | Confidence |
|---|---|---|
| Ego states | Three coherent systems of feeling and behavior: **Parent** (borrowed from parental figures), **Adult** (objective, data-processing), **Child** (archaic, from childhood). | High |
| Parent forms | GPP describes the Parent as exhibited in two forms, *direct* (acting as the parent did) and *indirect* (as an influence, e.g. acting as the parent would want). | ⚠ verify wording |
| Child forms | GPP distinguishes the **adapted Child** (modified by parental influence: complying, withdrawing) from the **natural Child** (spontaneous). | ⚠ verify wording |
| Nurturing / prejudicial Parent | Berne's earlier work describes nurturing and prejudicial (critical) aspects of Parent. | ⚠ verify source |
| Transactions | Unit of social intercourse: stimulus + response. **Complementary** (expected response from the addressed ego state) vs **crossed** (unexpected ego state answers, communication tends to break). | High |
| Ulterior transactions | A social-level message and a hidden psychological-level message at once. | High |
| Strokes | Units of recognition. | High |
| Time structuring | Withdrawal, rituals, pastimes, games, intimacy (plus activity). | High |
| Games | Recurring series of ulterior transactions with a concealed motive and a payoff. | High |
| Ego-state diagnosis | Berne (1961) names four ways to diagnose ego states: behavioral, social, historical, phenomenological. | ⚠ verify source |

## Layer 2 — Later TA interpretations (not in GPP as such)

| Concept | Origin (to verify) | Notes |
|---|---|---|
| Five-part **functional model**: Critical (Controlling) Parent, Nurturing Parent, Adult, Free (Natural) Child, Adapted Child | Popularized via John Dusay's **egogram** (1972) and TA textbooks such as Stewart & Joines, *TA Today* (1987). ⚠ | The five labels in the brief come from here, not directly from GPP. |
| "Free Child" naming | Later TA usage replacing "natural Child". ⚠ | |
| Positive and negative modes of each functional state | Later TA teaching (e.g. Stewart & Joines). ⚠ | Supports our rule that no ego state is good or bad. |
| Functional vs structural model | Later TA (Stewart & Joines). ⚠ | Functional model describes observed behavior; it does not tell what is "inside" a person. |
| Drama Triangle (Persecutor / Rescuer / Victim) | Stephen Karpman, 1968. | Out of scope for MVP; don't mix in. |

## Product terminology (D1, approved 2026-10-30)
InnerMirror uses the **five-part functional model** (Layer 2) as its product vocabulary. Berne's *Games People Play* stays the foundational reference for the three ego states (Parent, Adult, Child) and for transactions. The five labels are **not** Berne's; never present them as his.

| Code | English | Vietnamese (pending linguistic review) | Berne's structural state | Mascot |
|---|---|---|---|---|
| CP | Critical Parent | Cha mẹ Phê phán | Parent | red octopus |
| NP | Nurturing Parent | Cha mẹ Nuôi dưỡng | Parent | purple octopus holding a heart |
| A | Adult | Người trưởng thành | Adult | blue octopus with magnifier |
| FC | Free Child | Trẻ em Tự do | Child | yellow octopus |
| AC | Adapted Child | Trẻ em Thích nghi | Child | green octopus |

- Not to be confused with Berne's GPP *forms*: Parent as **direct** vs **indirect** influence, and the **natural** vs **adapted** Child (Layer 1). "Adapted Child" exists in both; "Free Child" is the later name for the natural Child.
- Every label is a hypothesis about how a **message** reads, never a diagnosis or a property of a person. No state is better than another; each has helpful and less helpful forms.
- Codes are language-neutral and used in data, prompts and schemas; names appear only in UI and model text.

## Layer 3 — InnerMirror product hypotheses (ours, unvalidated)

1. **Five functional labels as product vocabulary.** We use CP, NP, A, FC, AC because they are concrete and illustratable. In UI they are "characters", with a footnote: *"Inspired by Transactional Analysis. The five-character split comes from later TA, not directly from Berne."*
2. **Labels attach to messages, not people.** "This message *sounds like* Critical Parent", never "Person A *is* Critical Parent".
3. **Text gives only partial evidence.** Of Berne's four diagnostic methods, a screenshot offers only weak behavioral and social cues (words, punctuation, emoji, timing). No tone, history, or inner experience. Hence every reading is a hypothesis with a confidence level, and the user's own experience (the phenomenological view) outranks the AI.
4. **Linguistic cue heuristics** (prompt guidance, not science):
   | Label | Possible text cues |
   |---|---|
   | Critical Parent | "should/must/always/never", judgment, commands, blame |
   | Nurturing Parent | reassurance, care, offering help, protecting |
   | Adult | questions for facts, neutral information, options, plans |
   | Free Child | playful, spontaneous emotion, jokes, excitement, raw hurt or anger |
   | Adapted Child | apologizing, complying, sulking, withdrawing, people-pleasing, passive resistance |
5. **Turning points** = messages where the dominant label shifts, or where a transaction looks *crossed*. This is where the Scenario Explorer focuses.
6. **Games are not detected in MVP.** Naming a "game" implies a hidden motive. Too strong a claim from one screenshot. Possible future feature with heavy hedging.

## Transaction model used by InnerMirror

Based on Berne's transactional diagram (two people, each drawn as P/A/C; vectors between them). ⚠ Founder to compare with the diagram in GPP.

- A **stimulus** has a **source** (sender's ego state it seems to come from) and a **target** (the other person's ego state it seems to address/invite). E.g. "Why are you ALWAYS late?" → source Parent (CP), target Child.
- A **response** likewise has a source and a target.
- **Complementary:** the response comes from the state that was addressed and goes back to the state that sent the stimulus (parallel vectors). Berne: communication can continue as long as transactions are complementary.
- **Crossed:** the response comes from or goes to a different state than invited. Berne: communication tends to break off. Often a turning point.
- **Ulterior:** a social-level message carries a different psychological-level message (e.g. Adult-sounding words with a Child-to-Parent hook). Hardest to infer from text; flag only with explicit cues and low confidence.
- **Why not pair message labels:** a message's *expression* (e.g. CP) says where it seems to come from, not whom it addresses. "A" message can target the other's Child (talking down); a Critical Parent reply to an Adult question is crossed even though both are "legit" labels. So the model must state source **and** target per message, and the transaction type must follow from those, with uncertainty.
- Map uses the **structural three states** (P/A/C). Functional expressions (CP/NP, FC/AC) are shown inside P and C.

## Rules derived for the product
- Never say "Berne says…" about a Layer 2 or 3 item.
- Every AI reading includes: quoted evidence, label, confidence (low/medium/high), and an alternative reading when confidence is not high.
- No label is presented as good or bad. Each character has a helpful side and an unhelpful side.

## Open theory tasks
- [ ] Founder: verify ⚠ items against GPP (EN or VI edition), note page numbers.
- [x] VI names for the five characters decided (Q9, table above). Linguistic review still pending (`design/OPEN_DECISIONS.md` D6).

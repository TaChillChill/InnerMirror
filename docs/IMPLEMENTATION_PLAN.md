# Implementation Plan

Status: stack approved. **Phase 0 in progress.** Phase 1+ starts only after the Founder approves `PHASE0_REPORT.md`.

## Timeline
- Deadline: **Nov 4, 9:00 PM ET = Nov 5, 09:00 ICT.** Internal submission target: **Nov 4, 22:00 ICT.**
- Feature freeze: **Nov 3, 18:00 ICT.**

| Phase | When (ICT) | Goal |
|---|---|---|
| 0 Feasibility | Oct 30 | Prove Muse Spark gives grounded, useful transactional observations |
| 1 Core | Oct 31 – Nov 1 | Paste → Observation (Conversation View + mascots) → Interpretation → Mirror |
| 2 Differentiation | Nov 2 | Transaction Map + Scenario Explorer |
| 3 Usability | Nov 3 (until freeze) | Screenshot import, VI copy, sample mode, errors, Impeccable polish |
| 4 Submission | Nov 3 evening – Nov 4 | Tests, privacy/safety check, deploy (approval), demo video, submit |

If Phase 1 slips, cut in this order: screenshot import → Scenario Explorer → map interactivity (static map).

## Phase 0 — Feasibility (today)
| # | Task | Done when |
|---|---|---|
| 0.1 | Policy + hackathon rules review | Findings in `META_API_RESEARCH.md`, `PRIVACY_SAFETY.md` |
| 0.2 | Spend safeguards: local ledger + hard cap in script; Founder confirms no auto top-up | Script refuses calls over cap |
| 0.3 | Smoke test: text call + structured output call | Status, latency, tokens recorded |
| 0.4 | Analysis prompt + strict schema; 3 synthetic conversations (+1 short safety probe) | JSON valid; outputs saved in `scripts/phase0/results/` |
| 0.5 | Quality review against rubric | `PHASE0_REPORT.md` |

## Phase 1 — Core
| # | Task | Done when |
|---|---|---|
| 1.1 | Scaffold Next.js + TS + Tailwind + zod; `AI_MODE` fixtures switch; access code | `npm run build` passes |
| 1.2 | Paste parser + transcript editor + "This is me" | Any speaker error fixable |
| 1.3 | `/api/analyze` (prompt from Phase 0, zod, retry) | Valid on all fixtures |
| 1.4 | Conversation View + mascot badges | Badges per message; turning points |
| 1.5 | Interpretation sheet (why, cues, change, not sure, note) | AI vs user state separate in data and UI |
| 1.6 | My Mirror save/list/delete (localStorage) | Survives reload |

## Phase 2 — Differentiation
| # | Task | Done when |
|---|---|---|
| 2.1 | Transaction Map (SVG, 2 people, P/A/C, synced selection, dashed AI vs solid confirmed) | Correct arrows for each fixture pair |
| 2.2 | `/api/scenario` + dashed "what if" branch | Disabled when safety-flagged |

## Phase 3 — Usability
| # | Task | Done when |
|---|---|---|
| 3.1 | `/api/extract` screenshot import + correction | Synthetic screenshots extract ≥ 90% lines correct |
| 3.2 | VI copy for all keys; model output in UI language | Full flow in VI |
| 3.3 | Sample mode, error/loading states, Impeccable polish | Any API failure recoverable |

## Phase 4 — Submission
| # | Task | Done when |
|---|---|---|
| 4.1 | Privacy page + disclosures (Founder-approved) | Live in app |
| 4.2 | Vercel preview deploy (**approval**) | Full flow on preview, desktop + phone |
| 4.3 | Demo script (Claude) + recording (Founder) | Meets rules |
| 4.4 | Repo visibility / push (**approval**) + submit | Submitted by Nov 4, 22:00 ICT |

## Acceptance criteria (MVP)
1. Full core loop works on the deployed URL in EN and VI, desktop and phone.
2. Every AI reading shows quoted cues, confidence, and is worded as a possibility.
3. Transactions show source → target, with type and uncertainty, not inferred from label pairs.
4. The AI never pre-selects or overwrites the user's interpretation; Mirror keeps AI and user fields separate.
5. No conversation content stored or logged server-side.
6. Safety-flagged conversations: no victim-blaming, Scenario Explorer disabled, resources shown.
7. Sample mode works with zero API calls.
8. Model responses are schema-validated; failures produce retry or readable error.

## Major risks
| Risk | Mitigation |
|---|---|
| Analysis generic / ungrounded | Phase 0 gate; cue quoting; source/target reasoning; few-shot if needed |
| AUP uncertainty (third-party inference) | Observable-expression framing; ask Meta; fallback to user-only analysis |
| API slow | Lower `reasoning_effort`; progress UI; sample mode for demo |
| Mascot assets late | Neutral placeholder circles with state labels until files arrive (not substitutes for the design) |
| Scope creep | Cut order above; freeze Nov 3 18:00 |
| Public URL drains credits | Access code + rate limit + per-request caps |

## Testing strategy
Fixtures for UI; live prompt eval within budget (`scripts/phase0/.ledger.json`); unit tests for schemas, parser, Mirror store; manual E2E checklist (EN/VI × desktop/phone × 2-person/group/safety). Reports state which checks were mocked vs live.

## Submission readiness checklist
- [ ] Official Rules requirements copied here (Q15)
- [ ] Deployed URL works in private window, both languages; judge access documented
- [ ] Demo video recorded and linked
- [ ] README accurate: Meta APIs used, privacy, limitations
- [ ] Privacy page live
- [ ] No secrets in repo history; no real conversations anywhere
- [ ] Theory claims match verified items in `THEORY_FOUNDATION.md`
- [ ] Submitted; confirmation saved

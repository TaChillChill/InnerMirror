# Open Questions

Decisions for the Founder. Answered items keep their answer for traceability.

## Answered (2026-10-30)
| # | Question | Answer |
|---|---|---|
| Q1 | Meta API access from Vietnam | Platform login + hackathon credits OK. API calls **not yet confirmed** → Phase 0 verifies. Policy eligibility checked separately (see `META_API_RESEARCH.md`). |
| Q2 | Stack | **Approved:** Next.js + TS on Vercel, no DB/auth, localStorage, server-side API, access protection + rate limit + spend safeguards. |
| Q3 | Live API budget | **Approved with limits:** ≤ $1 initial verification; ≤ $15 total eval incl. initial tests; no contributor models; verify spend controls first. |
| Q4 | Analysis framing | **Approved with modifications:** message-level suggestions; keep three layers (AI Observation / My Interpretation / My Mirror); AI may examine patterns across participants but no definitive judgments or sensitive inferences. AUP compatibility must be verified, see `PRIVACY_SAFETY.md`. |
| Q5 | Track | **Indie, tentative**, pending Official Rules check. |
| Q6 | Storage | localStorage only (part of Q2). |
| Q8 | Characters | Founder's own 2D octopus mascots (5 functional ego states). Use as provided. |
| Q9 | VI names for the 5 states | **Approved (pending linguistic review):** Cha mẹ Phê phán (CP), Cha mẹ Nuôi dưỡng (NP), Người trưởng thành (A), Trẻ em Tự do (FC), Trẻ em Thích nghi (AC). Model: five-part functional TA model (D1). |
| Q14 | Mascot files | **Provided:** five transparent 1024² PNGs, no embedded text, in `design/brand/mascots/` with derived variants. No separate "unsure" mascot; UI uses a neutral "?" badge. |
| Q13 | Vitest | Implicitly fine under "targeted tests"; confirm when adding. |

## Open — blocking Phase 1
| # | Question | Recommendation |
|---|---|---|
| Q15 | Official Rules (only visible after login in the Cerebral Valley portal): confirm repo visibility, demo video length, deployed URL, Meta model requirement, pre-existing work, Indie eligibility. | Founder copies the relevant lines into `IMPLEMENTATION_PLAN.md`. |
| Q16 | Policy residual risk (see `PRIVACY_SAFETY.md` → AUP analysis): accept the "observable functional expression" framing, and optionally ask Meta on Discord? | Accept framing; ask on Discord in parallel. |

## Open — needed by Phase 3–4
| # | Question | Recommendation |
|---|---|---|
| Q7 | Public URL protection: access code for live mode, sample mode open | Yes |
| Q10 | VI support/crisis resources | Founder provides or approves |
| Q11 | Verify ⚠ theory items and the transaction diagram against *Games People Play* | Founder (has the book) |
| Q12 | Repo public / push timing | After Q15 |
| Q17 | Privacy policy page (required by Meta ToS §6.2) — approve short in-app privacy page text | Claude drafts, Founder approves |

## Open — Conversation Replay and architecture review (2026-10-30)
Context: `CONVERSATION_REPLAY.md` (proposal) and `ARCHITECTURE_REVIEW.md`. Not blocking Phase 0; Q18–Q20 needed before Phase 1 UI.
| # | Question | Recommendation |
|---|---|---|
| Q18 | Position Conversation Replay as the AI Observation view made visual (no new step, no new AI call), not a separate feature? | Yes |
| Q19 | UI label "Conversation shift" instead of "turning point" (data key unchanged), and neutral pattern copy (also rewording the crossed caption in `UX_DESIGN.md`)? | Yes |
| Q20 | Default to the per-turn transaction card; move the full P/A/C SVG Transaction Map to P2? | Yes: card is P0 (covers acceptance criterion 3), map P2 |
| Q21 | "Second layer" (ulterior `hiddenMessage`) on **other participants'** messages: show the text or only "may carry a second layer" + cue? | Text only for the user's own messages, as a question; for others, flag + cue, no hidden meaning stated |
| Q22 | Navigation: 3 steps (Conversation → Replay [Observation + Interpretation] → Mirror) or keep the 4-step stepper? | 3 steps; layers stay visually separate on the Replay screen |
| Q23 | Priority of screenshot import vs Scenario Explorer | **Answered 2026-10-30:** screenshot import is conditional P0 (Phase 1 if feasibility passes); Scenario Explorer stays optional |
| Q24 | Add a deterministic EN/VI keyword pre-check that forces the safety path, in addition to the model's flag? | Yes, small list, Founder approves |
| Q25 | Fix stale references: README ("reads a screenshot", Muse Image), `TECHNICAL_ARCHITECTURE.md` (`public/characters/`, Muse Image assets, `generate-characters.ts`, model-provided `source`), Muse Image item in `META_API_RESEARCH.md` checklist | Yes, docs-only cleanup |
| Q26 | Approve ≤ $1 (inside the $15 total) for the screenshot feasibility run, synthetic screenshots only, plus the small harness change for image cost bounds? | Yes |
| Q27 | Pass bars for screenshot import (`PHASE0_REPORT.md` §8) | Accept as proposed |
| Q28 | Names read from screenshots: show pseudonyms (Person A/B) by default with "use names from the screenshot", or show visible names by default? | Pseudonyms by default (privacy doc already says so) |
| Q29 | Max screenshots per conversation | 3 in MVP (body limit, cost, latency) |

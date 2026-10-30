# Open Questions

Decisions for the Founder. **Blocking** items must be answered before feature coding.

## Blocking
| # | Question | Recommendation | Answer |
|---|---|---|---|
| Q1 | Can you access dev.meta.ai from Vietnam, create an API key, and see hackathon credits? | Check today. Everything depends on it. | |
| Q2 | Approve stack: Next.js + TS + Tailwind + zod on Vercel, no DB, no auth? | Yes (see `TECHNICAL_ARCHITECTURE.md`) | |
| Q3 | Approve a live-API budget for dev + eval (recorded in `CLAUDE.md` as an exception)? | ≤ $1 smoke test now; ≤ $15 total for prompt eval through Nov 4; Standard models only | |
| Q4 | Framing for other participants: message-level readings only (no per-person summary), reflection only on the user's own messages? | Yes. Reduces AUP + privacy risk, fits "awareness before change". Brief said "possible ego states for each participant"; this narrows it to *per message*. | |
| Q5 | Which track: Indie or Startup? | Indie (judged on creativity, ambition, "does it work") fits a 5-day MVP | |

## Needed by Day 3–4
| # | Question | Recommendation | Answer |
|---|---|---|---|
| Q6 | Storage: localStorage only? | Yes. No server storage of reflections in MVP | |
| Q7 | Protect public URL: access code for live mode, sample mode open to all? | Yes, simplest. Judges get the code in submission notes | |
| Q8 | Characters: original placeholders now; Muse Image–generated original characters as P1? Mascot only with written permission from Meta. | Yes | |
| Q9 | VI names for the 5 characters (draft in `UX_DESIGN.md`) | Founder picks; working names ok until then | |
| Q10 | VI support/crisis resources to show for safety-flagged chats | Founder provides or approves | |
| Q11 | Verify ⚠ theory items against *Games People Play* / *Trò Chơi Tâm Lý* | Founder (has the book); 30 min | |
| Q12 | Repo public at submission? Push to GitHub when? | Decide after reading Official Rules | |
| Q13 | Approve Vitest as a dev dependency for unit tests? | Yes, small and standard; otherwise manual only | |

## Gaps found in the brief
- Brief asks for ego states "for each participant"; combined with Meta's AUP ("infer private or sensitive information about individuals"), this is the main policy risk → Q4.
- No plan for a hostile/abusive conversation in the Scenario Explorer: suggesting "respond differently" can imply blame on the victim → disabled when flagged.
- "Turning point" was undefined → defined in `THEORY_FOUNDATION.md` (label shift or crossed transaction).
- No demo-insurance path if the API is slow/down during judging → sample mode.
- No cost-abuse protection for a public URL → Q7.
- Test data source undefined → synthetic screenshots only.
- Five ego-state labels come from later TA (egogram, Dusay 1972), not GPP itself → footnote in UI, Q11.

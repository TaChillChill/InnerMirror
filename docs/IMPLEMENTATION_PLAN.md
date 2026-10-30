# Implementation Plan

Status: **awaiting Founder approval.** Nothing below starts until approved.

## Timeline
- Official deadline: **Nov 4, 9:00 PM ET = Nov 5, 02:00 UTC = Nov 5, 09:00 ICT.**
- **Internal submission target: Nov 4, 22:00 ICT** (~11 h buffer).
- **Feature freeze: Nov 3, 18:00 ICT.**
- Available: ~5 working days from Oct 30.

## Phases and tasks (P0 unless marked)
### Day 0 — Oct 30: Gate + foundations
| # | Task | Done when |
|---|---|---|
| 0.1 | Founder approves plan + answers `OPEN_QUESTIONS.md` blockers | Decisions recorded in `OPEN_QUESTIONS.md` |
| 0.2 | Founder confirms API access, sets `.env.local`, approves smoke-test budget | Key works; budget recorded in `CLAUDE.md` |
| 0.3 | API smoke test (text, vision, vision + json_schema) | Results recorded in `META_API_RESEARCH.md` |
| 0.4 | Scaffold Next.js + TS + Tailwind + zod; `AI_MODE` fixtures switch | `npm run build` passes; landing renders |
| 0.5 | Create 8–10 synthetic chat screenshots (EN/VI, 2–3 people, 1 hostile, 1 blurry) | Files in `src/fixtures/`, no real people |

### Day 1 — Oct 31: Upload + Extraction (riskiest piece first)
| # | Task | Done when |
|---|---|---|
| 1.1 | `meta-client.ts` (fetch, timeout, 1 retry, no content logging) | Unit test with mocked fetch |
| 1.2 | Extraction prompt + schema + `/api/extract` | ≥ 90% of lines correct on synthetic set, speaker correct on 2-person chats |
| 1.3 | Client image resize + Uploader | 3 MB phone screenshot uploads under body limit |
| 1.4 | TranscriptEditor (rename, reassign, edit, delete, "This is me") | Can fix any extraction error without re-upload |

### Day 2 — Nov 1: Observe
| # | Task | Done when |
|---|---|---|
| 2.1 | Analysis prompt + schema + `/api/analyze` (incl. safety flags) | Valid JSON on all fixtures; hostile fixture flagged |
| 2.2 | Timeline component (desktop lanes, mobile list) | Renders 2- and 3-person fixtures; turning points visible |
| 2.3 | Evidence card + summary + uncertainty note | Every node opens evidence with quote + confidence |
| 2.4 | Placeholder characters (original, CSS/SVG) | 5 + "unsure" icons with text labels |

### Day 3 — Nov 2: Reflect + Explore + Save
| # | Task | Done when |
|---|---|---|
| 3.1 | Reflect step (no pre-selection, "I'm not sure", notes) | User choices stored separately from AI readings |
| 3.2 | Scenario prompt + `/api/scenario` + ScenarioCard | Works on main turning point; disabled when safety-flagged |
| 3.3 | Mirror card + localStorage save/list/delete | Survives reload; AI vs user sections visibly separate |
| 3.4 | i18n EN/VI for all UI strings + model output language | Full flow works in both languages |

### Day 4 — Nov 3: Hardening, deploy, P1
| # | Task | Done when |
|---|---|---|
| 4.1 | Error/empty/loading states; sample mode | Any API failure shows a recoverable message |
| 4.2 | Privacy + safety copy, disclosures | Founder-approved copy in both languages |
| 4.3 | **Vercel preview deploy (needs approval)** + access protection | Full flow passes on preview URL, desktop + phone |
| 4.4 | P1: Muse Image character set (if approved and P0 done) | Original characters replace placeholders |
| — | **18:00 ICT feature freeze** | |

### Day 5 — Nov 4: Demo + submission
| # | Task | Done when |
|---|---|---|
| 5.1 | Bug bash on preview, both languages | Checklist below all green |
| 5.2 | README (setup, architecture, Meta API usage, privacy) | Accurate to the shipped app |
| 5.3 | Demo video (Founder records; Claude drafts script) | ≤ required length, shows full loop + Meta usage |
| 5.4 | Repo visibility / push (**needs approval**) + submission form | Submitted by 22:00 ICT |

## Acceptance criteria (MVP)
1. A user can complete Upload → Observe → Reflect → Explore → Save on the deployed URL, in EN and VI, on desktop and phone.
2. Extraction errors can be fixed without re-uploading.
3. Every AI reading shows evidence, confidence, and is labeled as a possibility.
4. The AI never pre-selects or overwrites the user's choice; saved Mirror keeps AI and user fields separate.
5. No screenshot or conversation content is stored server-side or logged.
6. A safety-flagged conversation shows support messaging and disables the Scenario Explorer.
7. Sample mode works with zero API calls (demo insurance).
8. All model responses are schema-validated; a bad response produces a retry or a readable error, not a crash.

## Major risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| API not usable from Vietnam / credits missing | Medium | Critical | Verify today (0.2). Fallback: ask on hackathon Discord; teammate/US account only if rules allow. |
| Poor extraction on real chat UIs / VI diacritics | Medium | High | Test day 1 first; correction UI; tell users to crop; one image per call |
| Vision + json_schema not supported together | Low–Med | Medium | Plain JSON prompt + zod + retry |
| Readings feel generic or wrong | Medium | High | Few-shot examples in prompt, evidence quoting, eval on synthetic set, hedged copy |
| Latency too high (reasoning) | Medium | Medium | Lower `reasoning_effort`; progress UI; split calls already |
| AUP risk (inferring about third parties) | Medium | High | Message-level labels, user-focused reflection, no person profiles (see `PRIVACY_SAFETY.md`) |
| Public URL drains credits | Medium | Medium | Access code / rate limit; sample mode |
| Scope creep (characters, multi-image) | High | Medium | P1 only after P0 deployed; feature freeze |
| Mascot IP | Low (if we follow rule) | High | Original placeholders; no Meta mascot without written permission |
| Solo-founder time | High | High | Claude drafts code/docs; Founder decides, tests, records demo |

## Testing strategy
- **Fixtures mode** for all UI work: zero cost, deterministic.
- **Prompt eval** on synthetic set after each prompt change (live, within approved budget); log results in `docs/EVAL_NOTES.md`.
- **Unit tests** (Vitest, if approved as dev dependency): schemas, prompt builders, mirror store, image resize math.
- **Manual E2E checklist** on preview: EN/VI × desktop/phone × 2-person/3-person/hostile/blurry.
- Report always states which checks used fixtures vs the live API.

## Submission readiness checklist
- [ ] Official Rules read; requirements copied here (repo visibility, video length, URL, Meta model requirement)
- [ ] Deployed URL works in a private browser window, both languages
- [ ] Judge access path documented (access code or sample mode)
- [ ] Demo video recorded, uploaded, link works
- [ ] README: what, how, Meta APIs used (Muse Spark vision + structured output; Muse Image if used), privacy, limitations
- [ ] No secrets in repo history (`git log -p | grep` check), `.env*` ignored
- [ ] No real people's screenshots in repo or video
- [ ] No Meta mascot assets unless written permission on file
- [ ] Theory claims in UI/README match `THEORY_FOUNDATION.md` verified items
- [ ] Submitted via Cerebral Valley portal; confirmation saved

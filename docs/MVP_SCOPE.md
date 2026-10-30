# MVP Scope

Goal: show that InnerMirror can help someone discover something meaningful about themselves through one conversation.
Core: **Conversation → AI Observation → My Interpretation → My Mirror.** Optional: **Scenario Explorer → Alternative Perspective.**

## Phase 0 — Feasibility (no app code)
API access from Vietnam, policy + hackathon rules, structured output, transactional analysis on 3 synthetic conversations. Stop on critical blocker.

## Phase 1 — Core experience
| Feature | Notes |
|---|---|
| Paste conversation text | Simple "Name: message" lines; parse + let user fix speakers |
| Screenshot import (**conditional P0**, Founder 2026-10-30) | 1–3 screenshots → `/api/extract` → same editable transcript. In Phase 1 only if `PHASE0_REPORT.md` §8 passes; else moves to P1 |
| AI Observation | Per message: functional expression (5 + unclear), cues, confidence, alternative; transactions (source → target); turning points; summary + uncertainty |
| Conversation View with mascot badges | Chat bubbles; mascot badge per message = that message's possible expression |
| My Interpretation | Tap mascot → why, evidence, change, "not sure", note. AI vs user visibly different |
| My Mirror | Explicit save to localStorage; AI / user / insight sections separate; delete |

## Phase 2 — Differentiation
| Feature | Notes |
|---|---|
| Transaction Map | Two participants × P/A/C, simple interactive SVG, synced with selected message pair, AI vs user-confirmed styling |
| Scenario Explorer | One alternative response at one turning point; simulated path visually distinct from the actual conversation; disabled for safety-flagged chats |

## Proposed, not approved: Conversation Replay
Visual layer over the AI Observation view: shift markers, a simple per-turn transaction card, corrections, entry to Scenario Explorer. Reuses the existing analysis (no new AI call). Would move the full Transaction Map to post-MVP. Spec: `CONVERSATION_REPLAY.md`; decisions Q18–Q22.

## Phase 3 — Usability
Screenshot import (if not already in Phase 1), EN/VI localization (keys from day one, VI copy here), sample mode, error handling, UI refinement (Impeccable).

## Phase 4 — Submission
Core flow tests, privacy/safety review, privacy page, deploy (approval), demo video, submit.

## Out of scope
Auth, database, server-side storage of conversations, social/sharing, analytics, long-term profiling, game (Berne "games") detection, branching simulations, native apps, gamification, Muse Image generation of mascots.

## Rules
- No Phase 2 work until the Phase 1 loop works end to end.
- Transaction Map supports **two participants**; group chats show the Conversation View only (map hidden with a note).
- Feature freeze: Nov 3, 18:00 ICT.

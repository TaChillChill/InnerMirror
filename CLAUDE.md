# CLAUDE.md — InnerMirror

Project instructions for this repo. Global preferences and safety rules live in `~/.claude/CLAUDE.md` and `~/.claude/rules/safety.md` and still apply.

## What this is
Hackathon MVP for the Meta Global AI Developer Hackathon 2026 (Indie track, tentative). A web app that helps people develop self-awareness through their everyday conversations:
**Conversation → AI Observation → My Interpretation → My Mirror**, with an optional **Scenario Explorer**.
Deadline: **Nov 4, 2026, 9:00 PM ET** (= Nov 5, 09:00 ICT). Schedule in `docs/IMPLEMENTATION_PLAN.md`.

## Current phase
**Phase 0 — Feasibility validation.** Approved: stack, Phase 0 API budget. Not approved yet: Phase 1+ feature code, deploy, push. Next gate: Founder reviews the Phase 0 report (`docs/PHASE0_REPORT.md`).

## Stack (approved 2026-10-30)
Next.js (App Router) + TypeScript on Vercel. Meta Model API called server-side only. No database, no auth. Reflections in browser localStorage. Basic access protection, rate limiting, spend safeguards. See `docs/TECHNICAL_ARCHITECTURE.md`.

## Product rules (non-negotiable)
- Awareness before change. AI output is a **hypothesis**, never a diagnosis or clinically validated assessment.
- Three layers stay separate in UI and data: **AI Observation** / **My Interpretation** (user) / **My Mirror** (saved). The AI never pre-selects or overwrites the user's interpretation.
- Ego-state suggestions attach to **messages**, never to people. A participant's mascot may change from message to message.
- Separate observable language (quoted cues) from inference. Never infer sensitive characteristics (health, mental health conditions, identity, demographics) or motives of other participants as fact.
- Transactions are analyzed by **source → target** ego state, not by pairing two message labels. Uncertainty is always shown.
- "I'm not sure" is always a valid choice.
- Abuse, coercion, threats, self-harm: no victim-blaming readings, no alternative-response simulation, show support resources.
- Theory: keep Berne's P-A-C model, later functional (5-part) model, and our hypotheses distinct. Source of truth: `docs/THEORY_FOUNDATION.md`.

## Mascots
The five octopus mascots are the **Founder's own brand assets**. Use them as provided, keep their colors. Never regenerate, redesign, or replace them unless asked. If assets are missing, ask for them. Never use Meta's names, marks, or mascots as branding (Meta ToS §7).

## Meta API rules
- **Standard model IDs only** (e.g. `muse-spark-1.3`). Never `-contributor` variants (Meta ToS forbids personal info there; they may train on inputs).
- Key only in `.env.local` / Vercel env as `META_API_KEY`. Never read it into chat, print it, log it, or put it in client code.
- Never log conversation content server-side. Don't store screenshots or transcripts on the server.

## Approved exceptions
- **Live API testing budget (approved by Founder 2026-10-30):** max **$1** for initial API verification; max **$15 total** for prompt evaluation, including initial tests. Hackathon credits. Standard models only. Synthetic conversations only. Tracked in `scripts/phase0/.ledger.json`; scripts refuse calls that could exceed the cap. Exceeding requires new approval.

## Workflow
- Small, verifiable steps; targeted tests; clear error handling.
- Use existing Claude Code capabilities and the Impeccable skill for UI/UX. **Do not install Superpowers.** No extra agents, frameworks, or docs process.
- UI strings in i18n dictionaries (`en`, `vi`), never hard-coded.
- Validate every model response with a schema (zod) before use.
- Files < 300 lines. Comments explain why. `npm`. Justify each new dependency.
- Synthetic test data only. Never commit real conversations.
- Small local commits are fine. **No push, deploy, repo visibility change, or other external write without explicit approval.**

## Docs map
| Doc | Purpose |
|---|---|
| `docs/PRODUCT_VISION.md` | Why, for whom, success criteria |
| `docs/THEORY_FOUNDATION.md` | Berne vs later TA vs product hypotheses; transaction model |
| `docs/USER_JOURNEY.md` | The flow, screen by screen |
| `docs/MVP_SCOPE.md` | Phased scope |
| `docs/UX_DESIGN.md` | Conversation View, mascots, Transaction Map, i18n |
| `docs/TECHNICAL_ARCHITECTURE.md` | Stack, data flow, schemas |
| `docs/META_API_RESEARCH.md` | API facts, policy findings, verification checklist |
| `docs/PRIVACY_SAFETY.md` | Data handling, safeguards, AUP analysis |
| `docs/IMPLEMENTATION_PLAN.md` | Phases, schedule, acceptance criteria, risks, submission checklist |
| `docs/OPEN_QUESTIONS.md` | Decisions and Founder answers |
| `docs/PHASE0_REPORT.md` | Feasibility results (after Phase 0) |

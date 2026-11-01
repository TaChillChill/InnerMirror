# CLAUDE.md — InnerMirror

Project instructions for this repo. Global preferences and safety rules live in `~/.claude/CLAUDE.md` and `~/.claude/rules/safety.md` and still apply.

## What this is
Hackathon MVP for the Meta Global AI Developer Hackathon 2026 (Indie track, tentative). A web app that helps people develop self-awareness through their everyday conversations:
**Conversation → AI Observation → My Interpretation → My Mirror**, with an optional **Scenario Explorer**.
Deadline: **Nov 4, 2026, 9:00 PM ET** (= Nov 5, 09:00 ICT). Schedule in `docs/IMPLEMENTATION_PLAN.md`.

## Start here
Read `TODO.md` first: current phase, status, next actions, blockers. It holds all session state; this file holds only stable rules.
- Update `TODO.md` whenever a meaningful task is completed or blocked. If the Founder says "update TODO" (or "cập nhật TODO"), stop at the nearest safe point and update it first, with enough context for a fresh session to resume.
- Phase gates: no Phase N+1 code, dependency installs, deploy, or push until the Founder approves the Phase N gate (`docs/IMPLEMENTATION_PLAN.md`).

## Stack (approved 2026-10-30)
Next.js (App Router) + TypeScript on Vercel. Meta Model API called server-side only. No database, no auth. Reflections in browser localStorage. Basic access protection, rate limiting, spend safeguards. See `docs/TECHNICAL_ARCHITECTURE.md`.

## Product rules (non-negotiable)
- **Awareness before change. Reflection enables choice.** Gương helps users observe, understand and explore options; it never decides for them. AI output is a **hypothesis**, never a diagnosis or clinically validated assessment.
- Conversation Direction may suggest up to two ego states per goal from a fixed, reviewed table ("Với hướng đi này, bạn có thể thử…"), describing what a state does, never promising outcomes, never ranking states, never presented as personalised, and always with "choose another" (Founder, 2026-11-01).
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
- **Live API testing budget (approved by Founder 2026-10-30):** max **$1** for initial API verification; max **$15 total** for prompt evaluation, including initial tests. Hackathon credits. Standard models only. Synthetic conversations only. Tracked in `scripts/phase0/.ledger.json`; scripts refuse calls that could exceed the cap. Exceeding requires new approval. **Current working cap (Founder, 2026-11-01): $6** total project spend (raised from $5), monitored: report spend against it after every live run. Stop and ask before going past it.

## Workflow
- Small, verifiable steps; targeted tests; clear error handling.
- Use existing Claude Code capabilities and the Impeccable skill for UI/UX. **Do not install Superpowers.** No extra agents, frameworks, or docs process.
- UI strings in i18n dictionaries (`en`, `vi`), never hard-coded.
- Validate every model response with a schema (zod) before use.
- Files < 300 lines. Comments explain why. `npm`. Justify each new dependency.
- Synthetic test data only. Never commit real conversations.
- Small local commits are fine. **No push, deploy, repo visibility change, or other external write without explicit approval.**

## Commands
Node 24 required (`process.loadEnvFile`). Phase 0 has no dependencies.
```bash
node scripts/phase0/run.mjs <smoke|analyze <id|all>> --dry   # worst-case cost, no API call
node scripts/phase0/run.mjs smoke                            # live: access + structured output
node scripts/phase0/run.mjs analyze <id|all> [--effort=low|medium|high]  # live: synthetic conversations
node scripts/phase0/run.mjs check <id|all>                   # re-run automatic checks offline (Phase 0 harness, frozen at spec v2.1)
node scripts/phase0/p0/run.mjs --spec=v3 --variants=selfA,selfB [--only=vi1] --dry   # P0 classification eval (current spec)
node scripts/phase0/p0/run.mjs --report                     # rebuild scripts/phase0/results/p0/REPORT.md, no calls
npm run build && META_API_KEY= npx next start -p 3123 &   # local prod build for e2e
sh scripts/e2e/run-all.sh                                   # mocked e2e, all /api/* intercepted, $0
node scripts/phase0/u9/run.mjs --dry                       # What if? s2.0 eval (live without --dry)
node scripts/phase0/story/run.mjs --dry                    # story eval (live without --dry)
APP_SPEND_CAP_USD=0.4 npx next start -p 3123 && node scripts/e2e/live-uat.mjs   # live UAT journeys (paid, synthetic)
```
Live commands spend from the approved budget: run them only with the Founder's go-ahead in that session. App commands (dev, build, lint, typecheck, test) are added in Phase 1.

## Definition of Done
- The task's "done when" condition is met and verified; `TODO.md` updated.
- Build, lint, typecheck, tests pass (once they exist, Phase 1+).
- Product rules above respected; safety path (abuse/self-harm) still shows resources and no simulation.
- Model output validated against a schema before use; no conversation content or secrets in logs.
- UI strings in `en` + `vi` dictionaries; empty, loading, and error states handled.
- Live API spend stays within the approved budget and is reported (mocked vs. live checks stated).

## Docs map
| Doc | Purpose |
|---|---|
| `TODO.md` | Session state: phase, status, next actions, blockers, last validation |
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
| `docs/CONVERSATION_REPLAY.md` | Proposed feature spec (not approved) |
| `docs/ARCHITECTURE_REVIEW.md` | Whole-project review and recommendations (awaiting approval) |
| `docs/CLASSIFICATION_AUDIT.md` | P0 classification audit, v3.2 changes and eval results |
| `docs/CLASSIFICATION_EVAL_SET.md` | Vietnamese eval cases (reference sets are hypotheses) |
| `docs/PERFORMANCE_AUDIT.md` | Latency breakdown and optimization plan (proposed) |
| `docs/RELATIONSHIP_AND_STORY.md` | Relationship context and story analysis (proposed) |
| `docs/INPUT_EXPERIENCE_AUDIT.md` | Text/voice/screenshot input, story vs conversation (proposed) |
| `docs/FOUNDER_UAT_AUDIT.md` | Founder UAT brief 2026-11-01: audit, UX flow, P0/P1/P2, decisions (proposed) |
| `docs/RELEASE_READINESS.md` | Completion sprint: feature matrix, test evidence, risks, spend, iPhone UAT checklist, Preview GO/NO-GO |
| `docs/UAT_EXECUTION_PLAN.md` | Round 3: gap analysis, full roadmap, execution order to submission (proposed; supersedes the audit where they differ) |

# CLAUDE.md — InnerMirror

Project instructions for this repo. Global preferences and safety rules live in `~/.claude/CLAUDE.md` and `~/.claude/rules/safety.md` and still apply.

## What this is
Hackathon MVP for the Meta Global AI Developer Hackathon 2026. A web app that turns a chat screenshot into a Transactional Analysis reflection: Upload → Observe → Reflect → Explore → Save.
Deadline: **Nov 4, 2026, 9:00 PM ET** (= Nov 5, 09:00 ICT). Internal target is in `docs/IMPLEMENTATION_PLAN.md`.

## Current phase
**Planning / approval gate.** No feature code, deploy, push, or paid API call until the Founder approves `docs/IMPLEMENTATION_PLAN.md` and the open items in `docs/OPEN_QUESTIONS.md`.

## Stack (proposed, not yet approved)
Next.js (App Router) + TypeScript, deployed on Vercel. Meta Model API called server-side only. No database, no auth. See `docs/TECHNICAL_ARCHITECTURE.md`.

## Product rules (non-negotiable)
- AI output is a **hypothesis**, never a diagnosis. Copy uses "may", "possibly", "one reading is".
- Ego-state labels attach to **messages**, not to people. Never assign a fixed label to a person.
- Always separate: observable text → AI interpretation → user's own choice.
- The user's self-assessment is never overwritten by the AI. Keep AI fields and user fields separate in data.
- "I'm not sure" is always a valid choice.
- Safety-flagged conversations (abuse, threats, self-harm) skip the playful framing and show support resources.
- Don't present later TA concepts as Berne's own. Use `docs/THEORY_FOUNDATION.md` as the source of truth.

## Meta API rules
- Use **Standard** model IDs only (e.g. `muse-spark-1.3`). **Never `-contributor` variants**: they may use inputs for training, and our inputs are other people's private messages.
- API key lives only in `.env.local` / Vercel env as `META_API_KEY`. Never in client code, logs, or the repo.
- Never log conversation content or images server-side. Don't store screenshots.
- Paid calls: default to fixtures in `src/fixtures/`. Live calls only within a budget the Founder approved and recorded below.

## Approved exceptions
_None yet._ (A live-API testing budget must be approved and recorded here before any live call.)

## Conventions
- English for code, comments, docs. Vietnamese for discussion with the Founder.
- UI strings live in i18n dictionaries (`en`, `vi`), never hard-coded in components.
- Validate every model response with a schema (zod) before using it. Handle failure with a retry and a readable error, never a crash.
- Files < 300 lines. Comments explain why.
- Test data: synthetic conversations only. Never commit real screenshots of real people.
- `npm` as package manager. Keep dependencies minimal; justify each new one.
- Small local commits are fine. **No push, deploy, or repo visibility change without explicit approval.**

## Docs map
| Doc | Purpose |
|---|---|
| `docs/PRODUCT_VISION.md` | Why, for whom, success criteria |
| `docs/THEORY_FOUNDATION.md` | Berne vs later TA vs product hypotheses |
| `docs/USER_JOURNEY.md` | The 5 steps, screen by screen |
| `docs/MVP_SCOPE.md` | In / out / stretch |
| `docs/UX_DESIGN.md` | Tone, characters, timeline, i18n |
| `docs/TECHNICAL_ARCHITECTURE.md` | Stack, data flow, schemas |
| `docs/META_API_RESEARCH.md` | Verified API facts + verification checklist |
| `docs/PRIVACY_SAFETY.md` | Data handling, safeguards, AUP risks |
| `docs/IMPLEMENTATION_PLAN.md` | Day-by-day tasks, acceptance criteria, risks, submission checklist |
| `docs/OPEN_QUESTIONS.md` | Decisions waiting on the Founder |

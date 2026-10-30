# InnerMirror

See yourself more clearly through your everyday conversations.

InnerMirror reads a screenshot of a text conversation and offers *possible* readings of the ego states (Parent / Adult / Child, from Transactional Analysis) behind each message. You decide which readings fit your own experience, explore one alternative response, and save a short personal reflection.

> Awareness before change. The AI offers interpretations; you remain the authority on your own experience.
> InnerMirror is not a diagnostic tool, a relationship judge, or a replacement for professional support.

Built for the Meta Global AI Developer Hackathon 2026 with the Meta Model API (Muse Spark, Muse Image).

## Status
Phase 0 (feasibility) — harness ready, live API tests pending. No application code yet. Start with [`CLAUDE.md`](CLAUDE.md) → *Handoff*, then [`docs/PHASE0_REPORT.md`](docs/PHASE0_REPORT.md).

## Flow
Conversation → AI Observation → My Interpretation → My Mirror (optional: Scenario Explorer)

## Repo layout
```
CLAUDE.md          Instructions + handoff for Claude Code
docs/              Product, theory, UX, architecture, API/policy research, plan, Phase 0 report
scripts/phase0/    Feasibility harness (no dependencies, budget-capped)
src/               Application code (after Phase 0 approval)
```

## Local setup
_Added once the stack is approved._ The app will need a Meta Model API key in `.env.local` as `META_API_KEY` (see `.env.example`).

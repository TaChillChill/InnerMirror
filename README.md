# InnerMirror

See yourself more clearly through your everyday conversations.

InnerMirror reads a screenshot of a text conversation and offers *possible* readings of the ego states (Parent / Adult / Child, from Transactional Analysis) behind each message. You decide which readings fit your own experience, explore one alternative response, and save a short personal reflection.

> Awareness before change. The AI offers interpretations; you remain the authority on your own experience.
> InnerMirror is not a diagnostic tool, a relationship judge, or a replacement for professional support.

Built for the Meta Global AI Developer Hackathon 2026 with the Meta Model API (Muse Spark, Muse Image).

## Status
Planning. No application code yet. Start with [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md) and [`docs/OPEN_QUESTIONS.md`](docs/OPEN_QUESTIONS.md).

## Flow
Upload → Observe → Reflect → Explore → Save

## Repo layout
```
CLAUDE.md        Instructions for Claude Code
docs/            Product, theory, architecture, plan
src/             Application code (after plan approval)
```

## Local setup
_Added once the stack is approved._ The app will need a Meta Model API key in `.env.local` as `META_API_KEY` (see `.env.example`).

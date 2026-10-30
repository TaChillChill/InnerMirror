# MVP Scope

Goal: one complete, reliable loop **Upload → Observe → Reflect → Explore → Save**, in EN and VI, demoable in under 3 minutes.

## Must have (P0)
| Feature | Notes |
|---|---|
| Single screenshot upload | Client-side resize; no server storage |
| Conversation extraction | Muse Spark vision → structured JSON |
| Participant identification + correction UI | Rename, reassign speaker, edit/delete lines, pick "This is me" |
| Ego-state analysis | Per message: label, evidence, confidence, alternative; turning points; summary |
| Ego-State Timeline | Custom SVG/CSS component |
| Self-reflection | User picks state or "I'm not sure" + optional notes; AI never pre-selects |
| One alternative scenario | At one turning point |
| Save Mirror | localStorage, explicit action, delete |
| EN / VI UI + EN / VI analysis output | Language toggle; model told to answer in UI language |
| Privacy & safety basics | Consent checkbox, no storage, safety flag + resources, disclaimers |
| Sample conversation mode | Synthetic data, works offline from fixtures. Demo insurance |

## Should have (P1, only after P0 is end-to-end)
- Original character illustrations made with **Muse Image** (generated once, stored as static assets). Strong for the "use of Meta AI tooling" criterion.
- Export Mirror as image (print-to-PDF fallback).
- Multiple screenshots for one long conversation.

## Could have (P2)
- Personalized Mirror illustration via Muse Image at save time.
- Streaming analysis output.

## Out of scope
Authentication, database, social/sharing, analytics dashboards, long-term pattern tracking, game (Berne "games") detection, branching simulations, native apps, gamification, voice input.

## Scope rules
- No P1 work until the P0 loop runs end to end on deployed preview.
- Feature freeze: Nov 3, 18:00 ICT. After that: bugs, copy, demo video, submission only.

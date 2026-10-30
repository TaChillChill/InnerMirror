# UX Design

## Feel
Playful, warm, curious, positive, emotionally safe. Adult, not childish. Not a psychology textbook. Calm layout, whitespace, subtle transitions only, no gamification. UI quality pass with the Impeccable skill.

## Voice
- Gentle, short, second person: *"This message might sound a bit like…"*, *"One possible reading…"*.
- Never: "you are", "diagnosis", "toxic", "narcissist", verdicts on who was right.
- Every expression has a helpful and a less helpful side. No good/bad states.

## Mascots (Founder's own assets)
Five 2D octopus mascots = five **functional ego-state expressions** (later five-part TA model, see `THEORY_FOUNDATION.md`). Use as provided, keep their colors; never regenerate or redesign. Assets: `design/brand/mascots/` (copied to `public/mascots/` in Phase 1). Visual rules, colors and descriptions: `design/DESIGN_SYSTEM.md`.

| ID | Expression (EN / VI) | Mascot | Structural state | Helpful side | Less helpful side |
|---|---|---|---|---|---|
| `CP` | Critical Parent / Cha mẹ Phê phán | red | Parent | standards, boundaries | blame, lecturing |
| `NP` | Nurturing Parent / Cha mẹ Nuôi dưỡng | purple, holding a heart | Parent | care, support | smothering, rescuing |
| `A` | Adult / Người trưởng thành | blue, magnifier | Adult | clarifying, solving | cold, detached |
| `FC` | Free Child / Trẻ em Tự do | yellow | Child | joy, honesty, spontaneity | impulsive, reactive |
| `AC` | Adapted Child / Trẻ em Thích nghi | green | Child | cooperative, polite | over-complying, sulking, passive resistance |
| `UNCLEAR` | — | — | — | neutral "?" badge (not a mascot) | |

VI names approved 2026-10-30, pending linguistic review. Color is never the only signal: badge has mascot + text label.

## Conversation View (primary)
- Chat layout: user's messages right, others left. Avatar/initial per participant.
- Mascot badge (~28 px) next to the avatar/bubble = this message's possible expression; label under bubble.
- Badge states: AI suggestion (dashed ring) → user-confirmed (solid, small check) → user-changed (solid + "you chose" dot) → not sure ("?"). Confidence is shown in words in the opened observation, never as opacity, dots or numbers.
- Turning point: thin divider with label between bubbles.
- Tap badge → bottom sheet (mobile) / side panel (desktop) with evidence and actions (see `USER_JOURNEY.md`).

## Transaction Map (secondary, Phase 2)
Reinterpretation of Berne's transactional diagram.
- Two columns (participant left / right), each with three stacked circles **P, A, C**. Functional mascots appear small inside the relevant circle (CP/NP in P, FC/AC in C).
- Selecting a message pair in the conversation draws: stimulus arrow (sender's source state → addressed state), response arrow (responder's source → addressed state).
- Line style: AI hypothesis = dashed; user-confirmed = solid; low confidence = lighter. Ulterior (hidden-level) message = second dotted arrow.
- Caption names the type: complementary / crossed / ulterior / unclear, in plain words (*"The reply answers from a different place than the one invited, which is often where conversations get stuck."*).
- Plain React + SVG. No graph library, no elaborate animation (respect `prefers-reduced-motion`).
- Group chats (> 2 people): map hidden with explanation.

## Scenario path
Alternative messages render as a dashed, tinted branch off the chosen turning point with a "what if" label, never inline with the real messages.

## i18n
`en.json` / `vi.json` + `t()` helper from Phase 1 (keys from day one; VI copy in Phase 3). Model output follows UI language; state IDs stay language-neutral.

## Accessibility
Keyboard reachable, visible focus, WCAG AA contrast, alt text for mascots, reduced motion respected.

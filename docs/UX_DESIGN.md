# UX Design

## Feel
Playful, warm, curious, positive, emotionally safe. Adult, not childish. Not a psychology textbook. Calm layout, whitespace, subtle transitions only, no gamification. UI quality pass with the Impeccable skill.

## Voice
- Gentle, short, second person: *"This message might sound a bit like…"*, *"One possible reading…"*.
- Never: "you are", "diagnosis", "toxic", "narcissist", verdicts on who was right.
- Every expression has a helpful and a less helpful side. No good/bad states.

## Mascots (Founder's own assets)
Five 2D octopus mascots = five **functional ego-state expressions**. Use as provided, keep their colors; never regenerate or redesign. Location: `public/mascots/` (pending, Q14).

| ID | Expression | Structural state | Helpful side | Less helpful side |
|---|---|---|---|---|
| `CP` | Critical Parent | Parent | standards, boundaries | blame, lecturing |
| `NP` | Nurturing Parent | Parent | care, support | smothering, rescuing |
| `A` | Adult | Adult | clarifying, solving | cold, detached |
| `FC` | Free Child | Child | joy, honesty, spontaneity | impulsive, reactive |
| `AC` | Adapted Child | Child | cooperative, polite | over-complying, sulking, passive resistance |
| `UNCLEAR` | — | — | neutral "?" badge (not a mascot) | |

VI names: pending (Q9). Color is never the only signal: badge has mascot + text label.

## Conversation View (primary)
- Chat layout: user's messages right, others left. Avatar/initial per participant.
- Mascot badge (~28 px) next to the avatar/bubble = this message's possible expression; label under bubble.
- Badge states: AI suggestion (soft outline, opacity by confidence) → user-confirmed (solid, small check) → user-changed (solid + "you chose" dot) → not sure ("?").
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

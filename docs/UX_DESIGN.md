# UX Design

## Feel
Playful, warm, curious, positive, emotionally safe. Adult, not childish. Not a psychology textbook.
Calm layout, generous whitespace, soft color, subtle transitions only. No streaks, scores, or dopamine mechanics.

## Voice and copy
- Second person, gentle, short: *"This message might sound a bit like…"*, *"One possible reading…"*.
- Forbidden: "you are", "diagnosis", "toxic", "narcissist", "wrong", any verdict on who was right.
- Each character has a helpful side and a less helpful side. Never good vs bad.
- Theory terms appear only as small labels with a one-line tooltip.

## Character system (5 + 1)
| ID | EN name (working) | VI name (working, needs Founder review) | Helpful side | Less helpful side |
|---|---|---|---|---|
| `CP` | Critical Parent, "The Guardian" | Phụ Mẫu Nghiêm Khắc | sets standards, protects boundaries | blames, lectures |
| `NP` | Nurturing Parent, "The Carer" | Phụ Mẫu Che Chở | comforts, supports | smothers, rescues |
| `A` | Adult, "The Navigator" | Người Trưởng Thành | clarifies, solves | cold, detached |
| `FC` | Free Child, "The Spark" | Đứa Trẻ Tự Do | joy, honesty, creativity | impulsive, reactive |
| `AC` | Adapted Child, "The Pleaser" | Đứa Trẻ Thích Nghi | cooperative, polite | over-complies, sulks |
| `UNSURE` | "Not sure" | "Chưa chắc" | — | — |

Visuals: **original placeholder characters** (simple shapes + distinct color + expression) until the mascot question is settled. **Do not use or modify Meta's Muse mascot** without written permission. If approved for P1, generate original characters with Muse Image (prompt must not reference the Meta mascot).

Color is never the only signal: each character also has an icon/shape and text label (accessibility).

## Ego-State Timeline
- Horizontal lanes = participants (user's lane highlighted, labeled "You").
- Nodes in message order across lanes; node shows character icon; ring opacity = confidence.
- Turning points: subtle marker + "Turning point" label.
- Mobile: becomes a vertical list (chat-like), same info.
- Built with plain React + SVG/CSS. No chart library.

## Screens
Landing → Upload & Correct → Observe → Reflect → Explore → Mirror. Progress dots at top; back navigation keeps state.

## i18n
- Two dictionaries `en.json`, `vi.json`; simple `t(key)` helper, language stored in localStorage.
- Model output language follows UI language; label IDs (`CP`, `NP`…) stay language-neutral in data.
- Vietnamese text in screenshots must work regardless of UI language.

## Accessibility
Keyboard reachable, visible focus, WCAG AA contrast, alt text for characters, `prefers-reduced-motion` respected.

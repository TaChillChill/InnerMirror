---
target: M5 What if? scenario explorer
total_score: 23
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 3
target_identity: "file:/Users/tachillchill/Developer/InnerMirror/src/components/WhatIf.tsx"
target_fingerprint: "sha256:ddf432edffb9590a96974e51f53d387c008e62fffa07e9fbf4bb1da3853763e4"
target_path: /Users/tachillchill/Developer/InnerMirror/src/components/WhatIf.tsx
timestamp: 2026-10-31T02-38-33Z
slug: src-components-whatif-tsx
---
# Critique: M5 What if? (WhatIf.tsx, Replay.tsx, Selector.tsx)
Method: dual-agent (A design review, B detector). Browser overlay skipped: panel needs paid analyze + scenario calls; existing screenshots used.

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of status | 2 | ~14 s wait = one text line; result lands below fold |
| 2 | Match real world | 2 | Theory register ("khuôn mẫu phản hồi", "nói từ") |
| 3 | User control | 3 | Close/Esc/cache good; Esc closes both panels |
| 4 | Consistency | 2 | Hypothetical pick reuses "my interpretation" pressed style; layout departs from DESIGN_SYSTEM side panel |
| 5 | Error prevention | 3 | Explicit Explore + data note |
| 6 | Recognition vs recall | 1 | Actual and hypothetical never shown together |
| 7 | Flexibility | 2 | Compare pills unlabeled |
| 8 | Minimalism | 2 | ~10 stacked caveat paragraphs |
| 9 | Error recovery | 3 | Mapped errors + retry |
| 10 | Help | 2 | Picker has no one-line meanings |
| Total | | 23/40 | Acceptable |

Specificity: mascots are the only distinctive asset, shrunk to 32 px icons in a settings-style form; nothing reads as a transaction.
Detector: exit 0, 0 findings; tap targets ≥44 px; trigger border not visible in (pre-fix) screenshots.

Priority issues:
- [P0] No actual vs hypothetical visual → two-row mascot comparison card (solid "Đã xảy ra", dashed "Nếu khác đi" with caveat on the row). /impeccable layout
- [P1] Selected vs AI state too subtle → "Gương thấy" dashed vs "Bạn chọn" solid ink + check; neutral style for What-if picks. /impeccable clarify
- [P1] Entry/badge not clickable → bordered pill with swap icon, chevron on badge. /impeccable polish
- [P1] Wait + placement → scroll result into view, instant actual row, gentle mascot wait state (reduced-motion static). /impeccable animate
- [P2] Copy → fixed selector prompt (model reflectionQuestion is the root cause at Selector.tsx:46), plain What-if copy, one merged disclaimer. /impeccable clarify

Personas: first-timer (jargon, no meanings, ambiguous tags); mobile one-handed (below fold, two mental models: sheet vs inline, no handle); screen reader (whole branch in aria-live, unlabeled h2 per message, sheet not a dialog, global Esc).

Layout scores (/50): desktop inline 30, right panel 36, dedicated view 35; mobile sheet 36, dedicated 35, inline 28.
Recommendation: one per-message panel with tabs (Your reading / What if?), sticky right on desktop ≥960, existing bottom sheet on mobile; comparison card as hero.

Questions: shifts-only emphasis vs every message; last message as future "Your Turn"; will the dashed row be read as a prediction regardless of caveat.

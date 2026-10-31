---
target: My Mirror + What-if layering
total_score: 21
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 3
target_identity: "file:/Users/tachillchill/Developer/InnerMirror/src/components/Mirror.tsx"
target_fingerprint: "sha256:8d3ae1096612f63681b104373f3fe80c78a03d4edc1180e9646aed920df50bc0"
target_path: /Users/tachillchill/Developer/InnerMirror/src/components/Mirror.tsx
timestamp: 2026-10-31T03-17-42Z
slug: src-components-mirror-tsx
---
# Critique: My Mirror + M5 What-if layering + responsive panel
Method: dual-agent (A design review, B detector). Overlay skipped (needs paid analysis); mocked screenshots used. Detector: exit 0, 0 findings.

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Status | 3 | Nothing shows what was just saved |
| 2 | Real world | 3 | Dashed/solid legend is text only |
| 3 | Control | 1 | No way back after Save; Home and Don't save wipe the session silently |
| 4 | Consistency | 2 | Collection modal lacks Esc/inert/focus return that Replay sheet has |
| 5 | Error prevention | 1 | Three one-click data-loss paths |
| 6 | Recognition | 2 | 22-28 px overlapping badges hide dashed vs solid |
| 7 | Efficiency | 2 | Only an outlined secondary CTA; no path back to Replay |
| 8 | Minimalism | 3 | After Save the storage note outweighs the collection |
| 9 | Recovery | 2 | Undo for delete only |
| 10 | Help | 2 | No hint that post-save edits don't update the saved copy |
| Total | | 21/40 | Acceptable |

Priority: [P0] header Home wipes session (App.tsx home button) → navigate without reset, Landing "Continue this conversation". [P1] no way back after Save → "Just saved" read-only stickers + primary "Explore another" + secondary "Back to conversation". [P1] background scrolls behind mobile sheet (measured scrollY 400→702) and collection modal lacks Esc/inert/focus return → html:has scroll lock, modal a11y. [P1] What-if layering → per-message "What Mirror observed" strip computed locally above the card; dashed row shows only basis=context. [P2] collection card 224×118 → minmax(300px) grid, 40 px badges no overlap, title/note/date+year; visual legend. [P3] heading/count gap, mid-name wraps at 390, title-only meaning on "changed" badge.
Responsive 960-1199: thread ~524 px readable; defer, container-query fallback if UAT confirms.

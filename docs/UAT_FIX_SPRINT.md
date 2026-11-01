# Founder UAT fix sprint — 2026-11-01

Status: **local commits only** (`791ee7b`, `810a381`, `28253fa`). Nothing pushed or deployed; Deployment Protection unchanged. API spend this sprint: **$0** (no prompt, schema or model change; every check mocked).

## 1. The 12 issues
DONE = built and covered by an automated check listed in §4. Real-iPhone behaviour is not verified by anyone yet (§5).

| # | Issue | Status | What changed | Evidence |
|---|---|---|---|---|
| 01 | Input not in view after choosing a method | DONE | The two cards shrink to a two-up switch at the top; the input sits right under it and the page scrolls to the top. No autofocus, so the iOS keyboard doesn't cover the mic or Continue. Text box 6 rows. | e2e `f1`: text box and Tiếp tục fully in view at 360×740, 390×844, 1280 |
| 02 | CTA "Hiện thành khung chat" → "Tiếp tục" | DONE | Story/chat: "Tiếp tục" / "Continue". Screenshots: "Đọc ảnh của mình" also → "Tiếp tục" (consent tick stays right above it). Logic unchanged. | `release.test`, e2e `f1` |
| 03 | Remove "Hoặc gõ từng tin nhắn" | DONE | Button and the empty "type from scratch" Review removed. | `release.test`, e2e `f1` |
| 04 | Review opens mid-thread | DONE | Cause: Add → Review changed screen without resetting scroll, so a phone user who had scrolled down to Continue landed mid-list. Review now scrolls to the top on every entry (Continue, Edit from Replay, error). | e2e `f1`: scrolled to the bottom, Continue → `scrollY 0`; order title → guide → people → messages |
| 05 | Remove the add-message block on Review | DONE | "Ai nói? / Gõ tin nhắn / Thêm" removed. Editing words and sender of existing messages, rename, merge, add person kept. Guide line says "Muốn kể thêm, bấm Quay lại". Back keeps text, screenshots and Review edits (M1 logic unchanged). | e2e `f1` + `m1-back` |
| 06 | Value first on "Gương thấy gì?" | DONE | The Founder's text opens the page. The text-only limits line moved into "Gương quan sát như thế nào?". The model's per-conversation uncertainty line stays visible (product rule "Uncertainty is always shown"). | e2e `f1` |
| 07 | Short conversation title | DONE ($0 variant) | Built from the model's own neutral turn phrases: first clause of the opening turn and of the closing turn ("Từ hỏi thăm tình hình đến bày tỏ vui"). Shown and editable in "Quan sát của Gương"; prefilled in Nhìn lại mình; saved in the existing `title` field (no storage change, old saves untouched); shown on cards; survives reload. A title the user wrote is never replaced by re-analysis. | `titlePhrases` unit test; e2e `f1`: edit → My Reflection → save → reload |
| 08 | "Cách hiểu của bạn" → "Trạng thái bản ngã" | DONE | Tab: "Trạng thái bản ngã" / "Ego state". Panel labels: "Gương thấy" vs "Trạng thái bạn chọn" / "The state you choose". Tip and empty-panel copy updated. | `release.test` (old wording banned); e2e `f1`, `w1` |
| 09–10 | Direction as reference only | DONE | Five directions kept; each shows its two states with what they do, as non-interactive cards. Removed: state picking, "Chọn trạng thái khác / Ẩn…", "Thử hướng này", the self requirement. Added the Founder's reference line. What if? on each message unchanged. | `direction.test`; e2e `u8-direction`, `f1` |
| 11 | Mascot cloud | DONE | One compact row: most frequent largest, centre, front; the rest alternate right/left, smaller, behind, slight overlap; the row always fits. Counts come from the unchanged `mirror-stats`. Saved cards size to the row (no more empty square). | `cloud-layout.test`; e2e `f1` (counts = Mirror's readings, largest in front, height ≤ 160 px), `u7` |
| 12 | Logo white frame in dark mode | DONE (interim art) | The PNGs had no alpha channel. Only the white matte connected to the image edge was made transparent; artwork untouched. Landing logo has a dark copy with a light wordmark (as in the brand's on-dark lockup). | e2e `f1`: transparent corner pixel, correct logo per theme |

### Free-text direction (audit only, not built)
| Option | How | API | Latency | Risk |
|---|---|---|---|---|
| A | Free text saved as the user's own intention, no suggestion | $0 | — | Little value beyond the existing "Lần sau, mình muốn nhớ rằng…" note |
| B | Match free text to one of the five directions locally | $0 | — | Brittle in VI; a wrong match reads as the app deciding |
| C | Muse suggests states for the typed direction (= E3) | ≈ $0.015/use (same size as What if?) + eval ≈ $0.3 | ≈ 10–20 s | Breaks the approved "fixed, reviewed table, never personalised" rule; needs safety screening of free text ("make him suffer"); new spec |

Recommendation: keep the five directions for submission; point users to the note field for their own intention; revisit C as E3 after submission.

## 2. Why approved feedback didn't ship
| Item | Root cause | Fix in process |
|---|---|---|
| #05 Remove composer | The audit (`FOUNDER_UAT_AUDIT.md` 2.8, C6) said "replace, don't just delete" because typing from scratch depended on it. When `UAT_EXECUTION_PLAN.md` §3 rebuilt the roadmap (which supersedes the audit), M2 kept merge/rename/undo and dropped the composer line, so no wave owned it and no test checked it. | Removed together with typing from scratch (#03), which was its only reason to exist. A test now fails if the block returns. |
| #08 Tab wording | D4 was implemented as a sweep of "nhân vật" (U6), and its acceptance check was a grep for that word only. "Cách hiểu của bạn" contains no "nhân vật", so it passed. U4 reworked the panel but kept the old label. | `release.test` bans the old labels in both languages. |
| #01 Input below the fold | Built (audit 2.4) with `scrollIntoView({block: "nearest"})`. When the panel is taller than the remaining screen and already partly visible, the browser doesn't scroll. The e2e only checked that the top of the textarea was on screen. | New layout + e2e that requires the whole input and the CTA in view at 360/390. |
| #12 Logo | Known since Oct 31 (TODO: "interim crop, need transparent file"), waiting on a Founder asset (D2) that never arrived. | Interim matte removal now; a proper transparent/SVG logo is still the better fix. |

Common pattern: acceptance checks tested a proxy (a word, the top edge of an element) instead of the Founder's actual wording or outcome. The new tests assert the exact approved strings and outcomes.

## 3. Audit of earlier feedback (brief 2026-11-01 + approved roadmap)
| Category | Items |
|---|---|
| Approved, not done → done now | Composer removal (2.8), tab rename (5.1), method surface in view (2.4) |
| Done, wrong design → fixed now | #01 scroll; Direction built per N1/N2, now simplified by the Founder's later decision; cloud built per approved prototype v2, now revised to a row |
| Deferred on purpose | E1 Muse story extraction; E2 next-reply direction; E3 Muse direction suggestions (incl. free text); E4 "Nhịp tương tác"; E7 5–10 screenshots; E8 relationship note; E9 streaming; E10 server speech-to-text |
| Blocked / technical limits | Real-iPhone mic needs HTTPS (Preview); Meta retention undocumented; transparent brand mascot for the donut (D2) needs the Founder's file; screenshot diacritics occasionally misread |
| Done and re-checked | Back keeps everything (M1), merge (M2), honest loading, privacy copy, panel order/toggle, self picker on Replay, arc + method + learn sheet, vocabulary "nhân vật" sweep, My Reflection naming, sample mode, What if? any speaker, story v1, dark mode |

## 4. Test evidence
- `npm test`: **101/101** (new: `cloud-layout` ×3, `titlePhrases`, Direction reference-only, approved-wording guard). Lint, typecheck, `next build` clean.
- `sh scripts/e2e/run-all.sh` on a local production build, every `/api/*` intercepted: **24 runs, 361 PASS / 0 FAIL**.
  - New `f1-uat-fixes.mjs` (VI, 32 checks per run) at 360 dark, 390 light, 390 dark, 1280 light covers the three acceptance journeys end to end.
  - Existing suites updated only where the Founder's decisions changed the expected result (button labels, cloud order, Direction).
- API calls: `f1` asserts exactly one `/api/analyze` per journey and nothing else. No paid call this sprint.
- Screenshots reviewed by eye at 390 light/dark and 1280: input, Review top, Replay top, Direction, My Reflection, five-state cloud (card and dialog), landing logo in dark.

## 5. Remaining risks
| # | Risk | Note |
|---|---|---|
| 1 | Nothing tested on a real iPhone | Keyboard + compact switch, scroll-to-top in Safari, logo in dark |
| 2 | Title quality depends on the model's turn phrases | Neutral by spec, but can read awkwardly ("bày tỏ vui") or long in EN; always editable. A model-written title (Founder's "Từ trách móc đến thấu hiểu" style) needs a prompt/schema change + eval ≈ $0.3; not done without approval |
| 3 | At 360×640 (small older phones) Continue sits just below the fold | The text box is in view; Continue is one short scroll |
| 4 | Logo is still the interim art | Transparent now, but low resolution (810 px); a proper SVG/≥1600 px file is better |
| 5 | Saved-card mascots are small when all five states appear | By design of a single row; the dialog shows them large |
| 6 | VI native-reader pass still open | New copy: value text (Founder's), title template "Từ … đến …", Direction line |

## 6. Founder UAT — re-test guide (local or Preview)
Local: `npm run build && npx next start -p 3123`, then on the same Wi‑Fi open `http://<Mac IP>:3123` (mic needs Preview HTTPS). Each analysis ≈ $0.02.

**Journey 1 — input and review**
1. Soi một cuộc trò chuyện → tap **Kể lại**: the cards become a small switch and the text box is right under it, no scrolling. Try **Có sẵn cuộc trò chuyện** too.
2. Type or paste a few `Tên: lời` lines. Only one button: **Tiếp tục**. No "Hoặc gõ từng tin nhắn".
3. Scroll down, tap Tiếp tục → the page opens at **Kiểm tra cuộc trò chuyện**, then the guide, then "Có những ai…", then messages.
4. No "Ai nói? / Gõ tin nhắn / Thêm" block at the bottom. Tap a message: change its words and sender → Xong.
5. **Quay lại** → your text is still there → Tiếp tục → your edit is still there.
6. Tick consent → Xem cuộc trò chuyện này.

**Journey 2 — observation and choice**
7. "Gương thấy gì?" opens with "Một góc nhìn khác, để hiểu nhau hơn." The limits are inside "Gương quan sát như thế nào?".
8. "Quan sát của Gương" shows a **Tiêu đề**; tap the pencil, change it, Enter.
9. Tap a mascot under a message: tab **Trạng thái bản ngã**, "Gương thấy" and "Trạng thái bạn chọn" separate. Try **Nếu khác đi?** on a message.
10. Hướng đi: tap a direction → two reference cards, nothing to select, no "Thử hướng này", and the line "Đây là những hướng đi để bạn tham khảo…".

**Journey 3 — reflect and save**
11. Pick who you are → Tiếp tục nhìn lại mình: one row of mascots, the most frequent largest and in front; counts match the rows below.
12. The title field already holds your edited title → Lưu → reload → Nhìn lại mình: the card shows the title and the same counts.
13. Switch to Tối: no white frame around the logo (header and bottom of the landing page).

Report failures with the step number and a screenshot.

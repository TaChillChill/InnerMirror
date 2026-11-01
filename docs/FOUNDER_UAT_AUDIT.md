# Founder UAT audit — 2026-11-01

Status: **proposed, not approved.** Response to the Founder UAT brief of 2026-11-01. Audit only: no code, prompt, schema or model changes; **$0 spent** (no API calls). Sources: code reading (`src/`), the earlier audits (`INPUT_EXPERIENCE_AUDIT.md`, `RELATIONSHIP_AND_STORY.md`, `PERFORMANCE_AUDIT.md`, `CLASSIFICATION_AUDIT.md`), and one offline check on saved v3.2-low eval outputs (`scripts/phase0/results/p0/v3`, 13 fixtures × 2 runs, §1.1).

## TL;DR
- **Time is the main constraint:** ~3.5 days to submission (Nov 4, 21:00 ET). About a third of the brief is hackathon-worth; the rest (story extraction, aggregate mirror, timeline, transaction arrows, 10 screenshots) is post-submission. Recommended cut in §6.
- **Real P0 bugs found:** Back from Review loses the pasted text and screenshots, and continuing again overwrites Review edits; aliases ("Phương"/"Chị Phương") can't be merged, which silently changes the analysis (turns split, an extra "Person C"); the loading screen ticks stages "done" on a timer, which breaks your own "never fake progress" rule.
- **Two of your hypotheses don't hold up on current evidence:** relationship context already tested at $0.23 — safe but changed 1/70 labels vs. 14/70 run-to-run noise, so asking the question would be personalisation theatre; transaction arrows are derivable from data we already get (`invites` + `respondsTo`), but the derived type agrees between two identical runs only **54/69 (78%)**, with no accuracy reference at all. Not demo-safe yet.
- **Good news:** moving "Bạn là ai?" out of Review needs **no AI change** (the model is already speaker-blind), and the data model already separates AI suggestion vs. user choice. Most of the comprehension work is UI + copy, $0 API.
- **Founder action needed:** the 9 decisions in §8, most urgently D1 (hackathon cut), D2 (Apply vs. instant choice), D3 (where "Bạn là ai?" lives), D4 (vocabulary: "nhân vật" vs. "trạng thái bản ngã").

## 1. Challenges to the brief

| Brief assumption | Evidence / concern | Recommendation |
|---|---|---|
| Relationship context should influence classification (§2) | Already evaluated (`RELATIONSHIP_AND_STORY.md` §6): no bias, but 1/70 labels moved vs. 14/70 between two no-context runs. It shows up only in `register` and `uncertainty`. A question whose answer changes nothing visible is a quiet dark pattern. | **No UI before submission.** If revisited: test a short *factual note* (what happened before), which moved readings in an earlier medium run, ≈ $0.25. |
| TA arrows complementary/crossed in "Nhịp tương tác" (§6) | Data exists: each segment has a source family (from its label) and `invites` (target P/A/C); each turn has `respondsTo`. But `invites` was never evaluated, the derived type flips in 22% of transactions between identical runs, and we have no reference answers. | Post-submission. First an offline reference set + 3-run stability gate (§1.1). Until then show the *sequence* of the two people's states (no arrows claiming a type), or "Chưa đủ thông tin". |
| Three loading milestones (§3) | The backend is one request. The current screen already shows three timed stages with checkmarks, i.e. fake progress. | Replace checkmarks with a looping "what Gương does" explainer (no done states) + honest time estimate. Real progress only with streaming (unverified with `json_schema`, 1 call ≈ $0.02). **Drop the chime**: a sound on a fake milestone amplifies the fakeness. |
| Draft selection + "Áp dụng" + ✕ discards (§5) | Adds a step to the core action, and ✕/swipe-down silently loses a choice on mobile. For a single-choice picker, instant commit with tap-again-to-clear is the platform norm. | **Instant commit**, re-tap clears, only ✕ to close. The AI suggestion stays visually distinct and is never counted. Founder decision D2. |
| "Bạn là ai?" asked only in "Nhìn lại mình" (§2, §6) | Analysis doesn't need it (speaker-blind, cache key ignores it). But What if? only works on *my* messages, and Replay's left/right layout and "your message" wording use it. | Ask it once, lightly, where it first matters: a one-line picker at the top of Replay ("Bạn là ai? A · B · Để sau"), reused in "Nhìn lại mình". D3. |
| Mascot Mirror with 100 proportional slots (§8) | With 3 selections, 100 icons imply precision that isn't there. A big central "dominant" octopus reads as "you *are* CP", breaking the rule that states attach to messages, not people. | Show real counts below a threshold, proportions only above it; no "dominant you" mascot in the centre (see §4). |
| Screenshot limit 3 → 10 (§2) | Body limit 4.5 MB: 3 × 1.2 MB today; 10 needs ~350 KB each (blurrier Vietnamese diacritics, already a known OCR weakness) or several calls. 10 screenshots ≈ 60–120 messages vs. the 80-message analysis cap. Latency roughly linear (4–14 s for 3). | Post-submission; if done, **5** max in one call, or 2 parallel calls. Needs an extraction eval (≈ $0.1). |
| Freeform story extraction by Muse now (§2) | Designed and costed in `INPUT_EXPERIENCE_AUDIT.md` §6: 2.5–4 days + eval. The narrative guard already prevents the dangerous misparse. | Post-submission, unchanged. |
| Draggable timeline (§8) | Local data will hold a handful of conversations; a timeline over 5 points is decoration. | Pills only (7 ngày / 30 ngày / Tất cả), shown once there are ≥ 3 saved conversations. |
| Proposed privacy copy (§2) | Server side is true (logs are metadata only, `meta-client.ts`). But it omits that **Meta** processes and may retain content for an undocumented period. | Keep your sentence, add: "Meta xử lý theo điều khoản của họ." + link to `/privacy`. Also fix the privacy page: it says tried What if? characters are saved; nothing in `mirror-store.ts` saves them. |

### 1.1 Offline transaction check ($0)
Rule (Berne): a reply is complementary when it comes from the state the stimulus addressed and addresses the stimulus's source; otherwise crossed; unclear if any end is UNCLEAR. Stimulus = last segment of the answered turn, response = first segment of the answering turn. Run A vs. run B of the same input:

| Measure | Agreement |
|---|---|
| `respondsTo` (who answers whom) | 68/69 |
| `invites` per message | 92/105 |
| Derived type (complementary / crossed / unclear) | **54/69** (run A: 28 / 21 / 20) |
| Same, treating low-confidence ends as unclear | 51/69 (no better) |

Reading: *who answers whom* is solid enough to draw lines; *what kind* of transaction is not. Gate before any arrow ships: a reviewed reference set (≈ 10 fixtures, $0 to write), ≥ 90% type stability over 3 runs (≈ $0.6), 0 "crossed" claims on transactions a VI reader marks complementary.

## 2. Current-state audit (deliverable A)

Legend: ✅ supported · 🔧 needs revision · ➕ missing · 🤖 needs AI/schema change · ❓ Founder decision.

| # | Brief item | Status | What the code does today |
|---|---|---|---|
| 2.1 | Screenshot + paste/type + mic | 🔧 | Screenshots and paste exist as a radio choice; mic = keyboard-dictation hint only (Web Speech deferred). |
| 2.2 | Text and mic in one surface | ➕ | Mic button not built; text box already the single surface for typed/dictated text. |
| 2.3 | 3 → 10 screenshots | ❓🤖 | `MAX_IMAGES = 3` in `image.ts` and the route. See §1. |
| 2.4 | Choosing a method reveals its surface | 🔧 | Panel renders below the radio; on phones it starts below the fold. |
| 2.5 | Freeform story extraction (Muse) | 🤖 | Guard only (`looksLikeStory`); extraction deferred. |
| 2.6 | "Có những ai trong cuộc trò chuyện này?" | 🔧 | Review asks "Ai là bạn?" (`Review.tsx`). |
| 2.7 | Rename + merge aliases | 🔧➕ | Rename yes; merge no. Parser merges only identical names. Unmerged aliases change turns and labels sent to the model. |
| 2.8 | Remove bottom composer | 🔧 | The composer is the *only* way to add messages in "type from scratch". Replace, don't just delete (§3). |
| 2.9 | Back keeps everything | ➕ **bug** | Add-screen text and images are component state; `onBack` clears shots; continuing again builds a new transcript over the edits. |
| 2.10 | Consent checkbox | ✅ | Present on screenshot upload and Review. |
| 2.11 | Simpler privacy copy | 🔧 | Needs the Meta clause (§1). |
| 2.12 | Relationship question | ❓ | Eval done, no benefit shown; not built by decision. |
| 3 | Loading milestones | 🔧 | Timed stages with checkmarks (`Analyzing.tsx`); no mascot. |
| 4.1 | 1–2 sentence overview with arc | 🔧 | `summary` is 2–3 sentences. A $0 arc is possible from existing `context.turns[].act` at shift points ("mô tả bế tắc và kiệt sức → … → hỏi ngược việc than thở"). A new headline field would need prompt change + P0 re-run (≈ $0.4). |
| 4.2 | "Gương quan sát như thế nào?" collapsible | 🔧 | Methodology sits in "learn" details with the mascot legend. |
| 4.3 | Interaction hint + "Tìm hiểu 5 trạng thái bản ngã" | 🔧 | Hint exists ("Chạm vào nhân vật…"); legend inline. |
| 4.4 | Every panel closes, position restored | 🔧 | Sheet/sidebar has ✕, Esc, focus return; `<details>` rely on the summary only. |
| 5.1 | Tab rename | 🔧❓ | "Cách hiểu của bạn"; vocabulary decision D4. |
| 5.2 | Order: Gương thấy → Vì sao (open) → Góc nhìn → 6 choices | 🔧 | Today: suggestion → "also possible" → Yes button → choices → "Vì sao" collapsed. |
| 5.3 | No dotted borders; explicit tags | 🔧 | Dashed = suggestion; "Gương thấy"/"Bạn chọn" tags already exist. |
| 5.4 | Suggestion not counted as confirmation | ✅ | `chosen: null` until the user picks; stickers say "Gương gợi ý". |
| 5.5 | Only Apply + ✕; toggle off | ❓ | Instant commit + "Xong" + "Bỏ lựa chọn". D2. |
| 5.6 | "Chưa chắc" valid | ✅ | Stored as `"unsure"`. |
| 5.7 | Same flow desktop/mobile | ✅ | One `MessagePanel` as sidebar or bottom sheet. |
| 6.1 | Rename to "Nhìn lại mình" | 🔧 | "Tấm gương của mình" in stepper, header, CTA. |
| 6.2 | Tab A: self here, my stickers, frequencies | 🔧 | Stickers + tally exist; self picked in Review. |
| 6.3 | Tab B: interaction with one counterpart | 🤖❓ | Not built; data partly there (§1.1). |
| 7 | Icon cloud, carousel | 🔧 | Cards with a row of up to 6 badges incl. AI-suggested ones. |
| 8 | Aggregate mirror + time filter | ➕ | No aggregate view. `createdAt` exists, so filtering is possible without migration. |
| 9 | Data integrity | ✅🔧 | `{ai, chosen}` per entry already; denominators not defined (§4). |

## 3. Recommended UX flow (deliverable B)

**Three steps, renamed:** `Cuộc trò chuyện → Gương thấy gì? → Nhìn lại mình`.

1. **Add.** One textarea (paste / type / dictate) with "🖼 Thêm ảnh chụp" as a secondary button that opens the screenshot sheet in place (fixes "far below the fold"). Story notice stays. Everything on this screen survives Back.
2. **Review — "Có những ai trong cuộc trò chuyện này?"** Chips per person: tap = rename, or "Gộp với…" → pick the other person → one confirm line ("Gộp 'Chị Phương' vào 'Phương'? 4 tin nhắn sẽ đổi người gửi"). Bubbles stay tap-to-edit. The bottom composer becomes a single "+ Thêm tin nhắn" row that opens the same inline editor as a bubble. Consent + privacy line. No "Bạn là ai?".
3. **Analyzing.** Mascot loop through three *descriptions* (not stages), honest time estimate, cancel. No checkmarks, no chime.
4. **Gương thấy gì?** Arc line (≤ 3 phrases, bold) + uncertainty line. "Bạn là ai? A · B · Để sau" (one row). Hint: "Chạm vào biểu tượng dưới mỗi tin nhắn…" + link "Tìm hiểu 5 trạng thái bản ngã" (sheet). "Gương quan sát như thế nào?" collapsed.
5. **Message panel — tab "Trạng thái bản ngã" | "Nếu khác đi?"**

```
┌ Mẹ: "Con có ăn uống gì chưa?"              ✕ ┐
│ GƯƠNG THẤY                                     │
│  [🐙 NP]  Cha mẹ Nuôi dưỡng · có thể          │
│ Vì sao Gương thấy vậy?                   ▴    │
│  “ăn uống gì chưa” hỏi về việc chăm sóc…      │
│  Cũng có thể: Người trưởng thành ▾            │
│ GÓC NHÌN CỦA BẠN                               │
│  Cùng một câu nói có thể được hiểu…           │
│  [CP] [NP·Gương thấy] [A] [FC] [AC] [Chưa chắc]│
│  ✓ Bạn chọn: NP (chạm lần nữa để bỏ)          │
└────────────────────────────────────────────────┘
```
Selected = filled background + solid 2 px outline + ✓ + "Bạn chọn"; suggestion = tinted chip with "Gương thấy" text tag (not colour or dash alone). Rationale open by default on desktop; on phones the first sentence is visible and the rest collapses, so the six choices stay above the fold of a half-height sheet.

6. **Nhìn lại mình — tab "Bạn trong cuộc này"** (asks self if skipped): my stickers grouped by state with counts ("NP ×3, A ×2, chưa chọn 1"), title/note, Save. **Tab "Nhịp tương tác"** (post-submission): pick one counterpart if 3+; a two-lane timeline of both people's *chosen or suggested* states per turn, linked by `respondsTo` lines without a type claim until §1.1's gate passes; tap a link → the two messages.
7. **Collections** → icon cloud per card (§4), horizontal scroll-snap with visible next card on phones, arrow buttons + "Xem tất cả" grid on desktop. **Personal Mirror** (post-submission).

Friction removed: one fewer decision on Add, one fewer question on Review, no Apply step, Back no longer costs re-work.

## 4. Data integrity rules (§9 of the brief)

- **Three distinct states per entry:** `chosen: ex` (user state), `chosen: "unsure"` (user outcome), `chosen: null` (not reviewed; only the AI suggestion exists). Already the v1 shape; no migration needed.
- **Counts and clouds** use `chosen ∈ ex` only. `"unsure"` is shown as its own count. `null` entries are never drawn as states: card shows "2 chưa xem".
- **Aggregate denominator** = user-chosen states in the period; caption always shows *n* ("12 lựa chọn từ 4 cuộc trò chuyện"). Below 10 chosen: counts only, no ring proportions; below 3 conversations: no time filter and no trend wording, ever "improvement/decline".
- **Time boundary** = `createdAt` (save time), local timezone, rolling windows.
- **Re-edits:** a saved collection is read-only today ("notEditable"); keep it. Re-saving from Replay creates a new entry.
- **Self switch:** a save belongs to the self it was made from (already true in `App.analyze`).
- **Tab B data is never saved.** The privacy page promises nothing about others' messages is stored; arrows would need others' labels.
- **Backward compatibility:** keep `innermirror.collections.v1`; new views are read-only derivations. If a field is ever added, write `v: 2` alongside and read both; never rewrite v1 entries silently.

## 5. Risks (deliverable C)

| Risk | Where | Mitigation |
|---|---|---|
| Prompt bias / P0 regression | Any change to `analysis-spec.ts` | Nothing in the P0/P1 list touches the prompt; the arc uses existing fields |
| Story extraction invents dialogue | Post-submission | Substring checks, "never compose", review (`INPUT_EXPERIENCE_AUDIT.md`) |
| Alias merge mistakes | Review | Explicit "Gộp với…" + confirm with message count; undo; never auto-merge |
| Multi-person transactions | Tab B | `respondsTo` is a model guess in group chats; pairs only, "Chưa đủ thông tin" fallback |
| State loss | Back, sheet close | Lift Add state into `Session`; instant commit removes the discard path |
| Aggregation misread as personality | Personal Mirror | No dominant mascot, *n* always visible, thresholds, no trend words |
| Retention claims | Privacy copy | Meta clause + link; blocker stays until Meta documents retention |
| Loading honesty | Analyzing | No done-states without real signals |
| Latency / cost | 10 screenshots, story, streaming test | All post-submission; P0/P1 list is $0 API |
| Accessibility | Selection, clouds, ring | Text tags + ✓ (not colour/dash alone), counts as text, keyboard-reachable carousel, reduced motion for the loading loop |

## 6. Priorities, cost and release impact (deliverables D + F)

API = new paid calls; P0 effect = impact on validated classifications; Storage = local-storage change.

| Pri | Item | Effort | API | Prompt/schema | P0 effect | Storage | Before Nov 4? |
|---|---|---|---|---|---|---|---|
| **P0** | Back keeps text, images, order, edits (lift Add state into Session) | S | $0 | no | none | no | **Yes** |
| **P0** | Alias merge + "Có những ai…" + no self on Review | S–M | $0 | no (API `selfId` made optional or set later) | none (speaker-blind) | no | **Yes** |
| **P0** | Honest loading (no fake checkmarks) | XS | $0 | no | none | no | **Yes** |
| **P0** | Privacy copy with Meta clause + fix What if? line on `/privacy` | XS | $0 | no | none | no | **Yes** |
| **P1** | Panel order, rationale visible, solid selection + tags, toggle-off, tab rename | M | $0 | no | none | no | **Yes** |
| **P1** | Self picker on Replay + reused in Nhìn lại mình; rename steps/CTA | S | $0 | no | none | no | **Yes** |
| **P1** | Overview: arc from `act`s + collapsible method + legend → sheet | S | $0 (offline check on saved outputs) | no | none | no | Yes |
| **P1** | Composer → "+ Thêm tin nhắn"; screenshot sheet opens in place | S | $0 | no | none | no | Yes, if time |
| **P2** | Collections icon cloud (chosen only) + carousel | S–M | $0 | no | none | no (derived) | Stretch |
| **P2** | In-app mic (Web Speech) + privacy line | ½ d | $0 | no | none | no | Stretch |
| **P2** | Personal Mirror (ring) + pills | M | $0 | no | none | no (derived) | After |
| **P2** | Tab B with arrows | M + eval | ≈ $0.6 | maybe (`invites` rule) | possible | no | After |
| **P2** | Relationship note re-test | S | ≈ $0.25 | no | none | no | After |
| **P2** | Story extraction; 5–10 screenshots | L; M | ≈ $0.2–0.6; ≈ $0.1 | new spec | none if separate | no | After |

UAT scope after P0+P1: one mocked journey at 390/1280 px (as before) + Founder UAT; no paid calls needed. Release gate unchanged: Preview only, no Production without approval.

## 7. Prototypes (deliverable E)

Proposed as one private interactive artifact with the same sample data, built **after** D1–D4, because two of them (sidebar, self picker) change with those answers:
1. Message panel: instant commit vs. draft + Apply, mobile sheet and desktop sidebar side by side.
2. Add + Review: single textarea + screenshot sheet; alias merge flow.
3. Loading explainer (with reduced-motion variant).
4. Nhìn lại mình tabs, incl. the "Chưa đủ thông tin" state for Tab B.
5. Icon cloud card + carousel.
6. Mirror alternatives (mascot / ring / hybrid) on one dataset at n = 3, 12 and 60 chosen states, + pills vs. timeline.

Items 1–4 inform pre-submission work; 5–6 can wait.

## 8. Decision register (deliverable G)

**Already approved (unchanged by this audit):** speaker-blind v3.2 analysis; narrative guard + dictation hint; consent checkbox; labels-only local storage (F3); story extraction, Web Speech, server STT deferred; no relationship UI until it shows benefit.

**Hypotheses needing validation before build:** H1 transaction type is reliable enough to draw (§1.1 gate); H2 a relationship *note* improves readings (≈ $0.25); H3 10 screenshots keep VI OCR quality (≈ $0.1); H4 Meta streams with `json_schema` (≈ $0.02); H5 the `act`-based arc reads naturally (offline, $0).

**Founder decisions:**
| # | Decision | Recommendation |
|---|---|---|
| D1 | Hackathon cut | P0 + P1 rows in §6; everything else after |
| D2 | Choice commit model | Instant commit, re-tap to clear, ✕ only |
| D3 | Where "Bạn là ai?" lives | One-row picker on Replay ("Để sau" allowed), reused in Nhìn lại mình |
| D4 | Vocabulary | "Trạng thái bản ngã" as the concept, mascot as its face; sweep all 18 "nhân vật" strings incl. landing |
| D5 | EN names | "Nhìn lại mình" → "Look back"; CTA "Continue to look back"; tabs "You in this chat" / "Back and forth" |
| D6 | Replace Shot/Paste radio with one textarea + screenshot button | Yes (touches the M3-approved screen) |
| D7 | Loading chime | Drop |
| D8 | Mirror centre | No "dominant" mascot; Gương mark + *n* in the centre |
| D9 | Proposed privacy sentence | Approve with the Meta clause + link |

---

## 9. Round 2 — Founder decisions, D10, final plan (2026-11-01)

Still $0, no product code changed. Prototype (private, sample data, Founder's mascots as provided): https://claude.ai/artifact/92DefUTrBV8R6rJxTpy2bM

### 9.1 Decision register (supersedes the §8 table)
| # | Decision | Status | Note |
|---|---|---|---|
| D1 | Pre-submission scope = P0 + P1 (§6) | ✅ Approved | P2 only with explicit approval |
| D2 | Instant selection, tap again to clear, ✕ only | ✅ Approved | "Xong" and "Bỏ lựa chọn" buttons removed |
| D3 | "Bạn là ai?" picker on Replay with "Để sau", reused in Nhìn lại mình | ✅ Approved | See C4, C5 |
| D4 | "Trạng thái bản ngã" is the concept; mascots illustrate it | ✅ Approved | See C1, C2 |
| D5 | VI "Nhìn lại mình"; EN naming | 🔁 Revise → §9.3 | Recommendation below |
| D6 | One input surface for text + screenshots | ✅ In principle | Prototype screen 1; approve before build (C10) |
| D7 | No fake milestones, ticks or chimes | ✅ Approved | Prototype screen 3 |
| D8 | No dominant mascot; observed patterns only | ✅ Approved | Personal Mirror is post-submission |
| D9 | Privacy wording names third-party AI; fix inaccurate claims | ✅ In principle | Copy must be checked against code before publishing (C9) |
| D10 | Reflection → conscious choice | ❓ Proposed → §9.4 | Recommended as stretch only |

### 9.2 Dependencies and contradictions found
| # | Issue | Resolution proposed |
|---|---|---|
| C1 | **Vietnamese state names disagree between the two prompts.** UI and analysis prompt: "Người trưởng thành / Trẻ em Tự do / Trẻ em Thích nghi". What if? prompt (`scenario-spec.ts`): "Người lớn / Trẻ Tự do / Trẻ Thích nghi". What if? rationales can therefore name a state differently from the chip next to it. | One-line fix in the What if? prompt (not the analysis prompt). It's a prompt change, so it needs approval; optional 1-call smoke ≈ $0.015 |
| C2 | D4 vs. approved copy: landing V3 says "trạng thái cái tôi" and "nhân vật"; the app has 15 "nhân vật" strings, landing 2, privacy 1. EN uses "character". | Sweep VI to "trạng thái bản ngã"; EN to "ego state". This touches the approved landing copy |
| C3 | Name collision: "Gương" is the AI's voice ("Gương thấy"), "Tấm gương của mình" is the header link to saved items, and a future "Personal Mirror" adds a third. | Header link becomes "Bộ sưu tập / Collections". Personal Mirror name is decided when it gets built |
| C4 | "Để sau" vs. saving: a save belongs to one person's view. | Nhìn lại mình asks "Bạn là ai?" if it's still missing; "Nếu khác đi?" shows a prompt until a self is chosen (prototype) |
| C5 | `/api/analyze` request validation requires `selfId`, although the model ignores it. | Make it optional in the request schema (`conversation.ts`). This is the request schema, not the model schema; no effect on readings |
| C6 | Composer removal vs. "type from scratch". | "+ Thêm tin nhắn" opens the same inline editor as a bubble |
| C7 | **D10 vs. product rules.** CLAUDE.md says "Awareness before change". The What if? prompt forbids suggesting what the user should choose and forbids ranking states. A goal → state suggestion made by the app breaks both. | §9.4: the user chooses; the app suggests nothing |
| C8 | Saving a D10 intention needs a new field in saved collections (v2) and a privacy-page change. | Session-only before submission |
| C9 | Meta's retention period is still undocumented (blocker in TODO). | Copy says Meta processes content under its own terms. No deletion promise on Meta's behalf |
| C10 | D6 changes the M3-approved Add screen. Open question: what happens when there is both text and screenshots? | Screenshots win, and a visible line says so (prototype). Mocked end-to-end test on both paths before UAT |

### 9.3 D5 — English naming
| VI | Options | Recommendation |
|---|---|---|
| Nhìn lại mình | My Reflection · Look back · Reflect | **My Reflection**. Natural, keeps the mirror metaphor, and reads as a place rather than an instruction |
| Tiếp tục nhìn lại mình | Continue to My Reflection · Reflect on my part | **Continue to My Reflection** (fits a phone button) |
| Gương thấy gì? | What Mirror sees (current) | Keep |
| Tab A | You in this conversation · My part | **You in this conversation** |
| Nhịp tương tác | Interaction Flow · Back and forth · How it flowed | **Back and forth** sounds like everyday English, matches "nhịp", and avoids product jargon. "Interaction Flow" reads like a UX term. Low urgency: Tab B is post-submission |

EN stepper: `Conversation → What Mirror sees → My Reflection`.

### 9.4 D10 — From reflection to conscious choice
**Verdict: the principle strengthens the product; the proposed Step 3 weakens it.** The value is the moment the user *names a direction themselves*. That is the step from "the app labelled me" to "I chose". It's also the bridge the product lacks between Replay and "Nếu khác đi?", which today starts with no reason to explore.

**What's wrong with Step 3 (app suggests a state for a goal):**
- It's a recommendation engine, which conflicts with C7.
- Theory: in the functional model every state has a helpful and an unhelpful side. Setting a boundary is classically *positive Critical Parent* as much as Adult. Mutual understanding can be Free Child (saying one's own feeling) as much as NP. "Tạm dừng" maps to no state at all. Any fixed table is wrong for some users, and hedging it ("có thể") doesn't stop users reading it as a rule.
- No evidence: it would be a claim no eval can check, sitting next to evidence-grounded readings.

**Answers to the six questions:**
1. *Core value:* yes, if the user does the choosing. It turns insight into intention without the app judging.
2. *Scenario Explorer:* D10 is the *entry* to "Nếu khác đi?", not a second explorer. Its only action is "Thử với tin nhắn của bạn ở chỗ đổi hướng". That opens "Nếu khác đi?" on the user's last message before the first shift, with their chosen state preselected.
3. *API:* none. Goals are a fixed list. The pivot message comes from the existing `shifts`. Nothing is sent until the user taps "Khám phá" inside "Nếu khác đi?", which is the existing call (≈ $0.014).
4. *Simplistic mappings:* the app shows all five states with both sides of each (the existing `desc` strings), plus "Chưa biết", with no preselection and no "recommended". One line: "Gương không xếp hạng các trạng thái…".
5. *Optional and light:* a collapsed card under the thread with "Bỏ qua". Hidden when safety is flagged (Replay is already replaced in that case).
6. *Minimum test:* the prototype card. Click-test with 3–5 people: do they open it, does it feel preachy, do they go on to "Nếu khác đi?". Ship only if ≥ 3 of 5 call it useful and nobody reads it as advice.

**Option chosen: A + B combined, as a stretch.** A small optional card at the end of Replay (A) whose only outcome is entering "Nếu khác đi?" (B). Build it only after P0 + P1 pass their checks (≈ ½ day, $0 API); otherwise post-submission (C). The intention is shown in Nhìn lại mình for the session only (C8).

### 9.5 Final pre-submission plan (for approval)
Order chosen so each step is a small, testable local commit. Nothing is pushed or deployed without approval.
| # | Step | Touches | Spend |
|---|---|---|---|
| 1 | Back keeps text, screenshots, order and edits. Changed text asks "Đọc lại từ đầu / Giữ bản đang sửa" | `App`, `AddConversation`, `ShotUpload`, `session` | $0 |
| 2 | Review: "Có những ai…", rename + merge + undo, no self, "+ Thêm tin nhắn"; `selfId` optional in the request (C5) | `Review`, `conversation.ts` + tests | $0 |
| 3 | Honest loading (D7) | `Analyzing`, i18n | $0 |
| 4 | Privacy: Review line with the Meta clause + link; fix the What if? claim on `/privacy` (D9) | i18n, privacy | $0 |
| 5 | Panel: order, rationale open (first sentence on phones), solid selection + tags, toggle-off, ✕ only, tab "Trạng thái bản ngã" (D2, D4) | `Selector`, `MessagePanel`, CSS | $0 |
| 6 | Replay: self picker (D3), arc from `act`s (check it offline on saved outputs first), collapsible method, learn sheet | `Replay`, `session`, analysis helpers | $0 |
| 7 | Vocabulary sweep (D4, C2) + renames (D5, C3) | i18n incl. landing | $0 |
| 8 | Nhìn lại mình: self ask, counts from the user's own choices only, "chưa xem" counted apart, Save needs a self | `Mirror`, `Stickers` | $0 |
| 9 | Unified Add screen (D6) once the prototype is approved | `AddConversation` | $0 |
| — | C1 What if? name fix (if approved) | `scenario-spec.ts` | $0 / ≈ $0.015 |
| — | D10 card (stretch, only if 1–9 pass) | `Replay`, `WhatIf` | $0 |

Done when: `npm test`, lint, typecheck and build are clean; a mocked journey at 390 and 1280 px (paste and screenshot paths, Back round-trip, alias merge, select/clear, Save) passes; TODO updated. Not verified without approval: live calls and real iPhone Safari.

# UAT execution plan — 2026-11-01

Status: **proposed, awaiting Founder approval. No code changed, $0 spent.** Responds to the Founder execution brief of 2026-11-01 (round 3). Builds on `FOUNDER_UAT_AUDIT.md`. Where this plan and that audit disagree, this plan wins (§1.2 lists the changes). Sources: code reading, the prototype (https://claude.ai/artifact/92DefUTrBV8R6rJxTpy2bM), `scripts/phase0/.ledger.json`, `IMPLEMENTATION_PLAN.md`.

## TL;DR
- **Full roadmap kept, nothing dropped** (§3). Work is ordered so that every merged step leaves a working, submittable app. Whatever is done by the freeze is what gets submitted.
- **Must fix first (≈ 11 h, $0):** Back loses data; alias merge missing; My Mirror counts Gương's "unclear" together with the user's own "Chưa chắc" (a new finding); fake loading progress; inaccurate privacy text; **no sample mode for judges** (acceptance criterion 7, not built). The last one is the main risk to the demo.
- **Story input:** a safe version can ship before submission with **no prompt change**. Code suggests who said each quoted line, the user confirms or marks a line as narration, narration is never analysed, and story readings are capped at medium. Muse extraction is the next version (needs an eval).
- **Changes that need a prompt change + eval:** "Nếu khác đi?" for *any* character (and the state-name mismatch C1, fixed in the same change), ≈ $0.3. The analysis prompt stays untouched.
- **Founder action:** approve the plan and 10 decisions (§5). Most urgent: N1 (wording of the direction suggestions), N3 (prompt change for "Nếu khác đi?" on any character), N8 (raise the working cap from $5 to $6; ≈ $4.2 is already spent).

## 1. Gap analysis (deliverable A)

### 1.1 Requirement vs. implementation
✅ works · 🟡 partly / prototype only · ❌ missing · 🐞 behaves wrongly

| # | Founder requirement | State | Today (code) |
|---|---|---|---|
| 1.1 | Two independent starts: Screenshot / Kể lại | 🟡 | Radio choice Shot vs Paste. Prototype merged them (wrong per Founder) |
| 1.2 | In-app mic button, editable text | ❌ | Keyboard-dictation hint only |
| 1.3 | Story: narration vs dialogue, confirm instead of guessing | 🟡 | `looksLikeStory` guard stops the bad parse; "continue" puts every line under "Chưa rõ". No way to mark narration |
| 2 | Rename, merge aliases, edit lines; merge loses nothing | 🟡 | Rename + edit ✅; merge only in prototype |
| P0-a | Back keeps text/screenshots; continue doesn't overwrite edits | 🐞 | Add state is local to the component; `onBack` clears shots |
| 3.1 | No "Bạn là ai?" before observing | 🐞 | Review requires it before analysis (`reviewProblem` → `noSelf`) |
| 3.2 | Observe flow, suggestions, evidence | ✅ | Replay + panel; order/visuals per D2/D4 still to do |
| 3.3 | "Nếu khác đi?" for any character, no self needed | ❌ | Only on *my* messages; API and prompt assume the actor is the user ("you") |
| 4 | Direction: self → goal → Gương suggests ≤ 2 states → "Thử hướng này" | ❌ | Prototype had a user-only version (now superseded) |
| 5.1 | My Mirror without confirming every message (AI default, user overrides) | ✅ | `shown = chosen ?? ai`; stickers mark "Gương gợi ý" |
| 5.2 | UNCLEAR never forced into a state; Gương vs user kept apart | 🐞 | `Tally` maps AI UNCLEAR → `"unsure"`, the same bucket as the user's "Chưa chắc" |
| 6 | Mirror visual: mirror centre, 5 octopuses sized by frequency, cards, absent states | ❌ | Sticker list + text tally |
| 7 | Principles | 🟡 | Mostly upheld; the direction suggestions need care (§2.3) |
| P0-b | Honest loading | 🐞 | Timed ✓ stages |
| P0-c | Privacy copy | 🐞 | Missing Meta clause; `/privacy` claims What if? characters are saved (they aren't) |
| Sub | Sample mode (zero API calls) | ❌ | Not built; needed for judges if credits, rate limits or latency fail |
| Sub | Rules copied (Q15), judge access, demo video, README | ❌ | Open in `IMPLEMENTATION_PLAN.md` |

### 1.2 Changes to the earlier audit after this brief
| Earlier position | Now |
|---|---|
| Unified text + screenshot input (D6) | Two entry cards: **Có sẵn cuộc trò chuyện** (screenshots) / **Kể lại** (type or mic) |
| "Bạn là ai?" picker at the top of Replay (D3) | Asked only in the **direction** section and in Nhìn lại mình |
| Mirror counts only user choices (audit §4) | **AI default, user override.** Shown split as "Gương quan sát" vs "Bạn chọn" |
| D10: the user picks a state, the app suggests none | **Gương suggests ≤ 2 states per goal** (Founder decision). Made safe in §2.3 |
| Story input post-submission | **v1 before submission** (code-assisted, user-confirmed), Muse extraction after |

## 2. Design notes that change the build

### 2.1 Story input v1 (no prompt change)
1. "Kể lại" textarea + mic button.
2. Code splits the story into lines/sentences and pre-tags each one:
   - quoted text (“…”, "…") → **lời thoại**, with the speaker suggested from a nearby "X nói/bảo/hỏi" pattern, else "Ai nói?";
   - everything else → **lời kể**.
3. Review shows each line as a row with chips: speaker names · "Lời kể". The user fixes what's wrong. Nothing is assigned silently.
4. Only dialogue lines become messages. Narration is kept on screen as grey context lines and **not sent to the model**.
5. The transcript gets `source: "story"`. In code, readings of story messages are capped at medium and marked "kể lại". The model and prompt are unchanged; P0 chat results are unaffected.
6. v2 (later): Muse extraction fills step 2 better. Same Review screen, needs an eval (≈ $0.2–0.6).

### 2.2 "Nếu khác đi?" for any character
The prompt and API are written around "the user" and call them "you". Reusing them with another character would make the model call that character "bạn". **Needs a prompt + request-schema change:** an `actorId` and the actor's neutral label in place of "you". Fix C1 (state names) in the same change. Re-run the M5 scenario checks: ≈ 16 calls, ≈ $0.25–0.3. The analysis prompt is untouched. Until it ships, "Nếu khác đi?" still works on the user's own messages once a self is chosen.

### 2.3 Conversation direction: keeping Gương's suggestions honest
- **v1 = a fixed table of suggestions written by us** ($0, instant, the same every time, reviewable by a VI reader against `THEORY_FOUNDATION.md`). Not a Muse call: a per-conversation call would add ~10 s, cost, an eval, and mind-reading risk.
- Each suggestion describes **what that state would do**, not an outcome ("Nói rõ quyết định và giới hạn một cách bình tĩnh"). Never "sẽ giúp", never "tốt hơn".
- **Implicit ranking risk:** if no goal ever suggests Free Child or Adapted Child, the app teaches "Child = bad". Draft table for N1:

| Goal | Suggestion 1 | Suggestion 2 |
|---|---|---|
| Thấu hiểu nhau hơn | Người trưởng thành: hỏi để hiểu điều người kia thấy | Trẻ em Tự do: nói thẳng cảm xúc và mong muốn của mình |
| Cùng tìm giải pháp | Người trưởng thành: nêu dữ kiện và các lựa chọn | Cha mẹ Nuôi dưỡng: đề nghị giúp một phần cụ thể |
| Giảm bớt căng thẳng | Cha mẹ Nuôi dưỡng: ghi nhận điều người kia vừa nói | Trẻ em Thích nghi: lùi một bước có chủ ý, nhường một điểm nhỏ |
| Đặt ranh giới rõ ràng | Người trưởng thành: nói rõ giới hạn và lý do | Cha mẹ Phê phán (mặt tích cực): giữ vững giới hạn của mình |
| Tạm dừng cuộc trò chuyện | Người trưởng thành: nói rõ quyết định tạm dừng | Cha mẹ Nuôi dưỡng: từ chối nhẹ nhàng mà vẫn quan tâm |

- Always: "Bạn vẫn là người quyết định" + all five states + "Chưa chắc" one tap away.
- **"Thử hướng này"** opens "Nếu khác đi?" on the user's latest message that has a reply, with the state preselected (existing call, ≈ $0.014). A "my *next* reply" mode for ongoing chats needs a prompt change: v2.
- Hidden when safety is flagged (Replay is already replaced by the support screen).
- This changes a CLAUDE.md product rule ("Awareness before change"; the app never suggests choices): N9.

### 2.4 My Mirror rules (Founder §5)
- Per message of mine: `chosen` if set, else Gương's suggestion, else **"Gương chưa rõ"**. That last one is a separate bucket from the user's "Chưa chắc"; neither is turned into a state.
- Every count is split: "Người trưởng thành ×3 · 2 bạn chọn, 1 Gương quan sát". Gương-only items look different (outline tile + "Gương" tag) and are never called confirmations.
- Saved collections already store `{ai, chosen}`: **no migration**, old entries render under the new rules.
- Needs a self: asked at the top of Nhìn lại mình if still missing.

### 2.5 Mirror visual
- Mirror (Gương mark) in the centre, five octopus slots in a fixed ring order (CP, NP, A, FC, AC), so the whole picture is always visible.
- Size by **area** proportional to count, clamped to a min and max so 1 vs 0 doesn't look like 100 vs 0. The count is always printed. Absent states sit at the minimum size with "0" and a dashed slot. Artwork is never dimmed or recoloured (UX-11).
- Caption: "Trong cuộc trò chuyện này" + *n*. No "you are…" wording; the largest state isn't called out as "dominant".
- Five cards under the ring (mascot, name, count split by Gương/Bạn, one-line description) double as the accessible text version.

## 3. Updated roadmap, complete (deliverable B)

**Must fix (flow correctness):**
- M1 Back persistence
- M2 Merge/rename/undo + "Có những ai" + no self before analysis
- M3 Mirror buckets
- M4 Honest loading
- M5 Privacy copy
- M6 Sample mode

**High-impact UX/product:**
- U1 Two entry cards
- U2 Mic
- U3 Story v1
- U4 Panel (D2/D4)
- U5 Observation without self + arc + learn sheet
- U6 Vocabulary + renames
- U7 Mirror visual
- U8 Direction v1
- U9 "Nếu khác đi?" any character + C1

**Enhancements (after submission unless they land early):**
- E1 Muse story extraction
- E2 Direction "next reply" mode
- E3 Direction suggestions from Muse
- E4 "Nhịp tương tác" with transaction arrows (needs eval)
- E5 Personal Mirror aggregate + time pills
- E6 Collections icon cloud + carousel
- E7 5–10 screenshots
- E8 Relationship note re-test
- E9 Streaming progress
- E10 Server STT / long audio

## 4. Fastest safe execution plan (deliverable C)

Now: Nov 1, 12:00 ICT. Feature freeze **Nov 3, 18:00 ICT**. Internal submit **Nov 4, 22:00 ICT**. ≈ 50 working hours before the freeze. Hours below are focused build + test estimates.

| Wave | Step | Est. | Depends on | API | Test (mocked unless stated) |
|---|---|---|---|---|---|
| 0 | M1 Back persistence | 2 h | — | $0 | Text/shots/order/edits survive Back ×2; changed text asks before re-reading |
| 0 | M2 Merge + people + self optional in request | 3 h | M1 | $0 | Unit: merge moves all messages, undo restores, turns regroup; analyze without self |
| 0 | M3 Mirror buckets | 1.5 h | — | $0 | Unit: UNCLEAR ≠ unsure; old v1 collections render |
| 0 | M4 Honest loading · M5 Privacy copy | 2 h | — | $0 | Copy check vs. code claims, EN + VI |
| 0 | M6 Sample mode (saved real v3.2 output, no calls) | 2.5 h | — | $0 | 0 network requests end to end |
| 1 | U1 Entry cards · U2 Mic (feature-detected) | 6 h | M1 | $0 | Chrome desktop + Android; **iPhone Safari by Founder** |
| 1 | U3 Story v1 | 6 h | U1, M2 | $0 | Unit on synthetic VI/EN stories: quotes → dialogue, narration excluded, cap applied |
| 1 | U4 Panel · U5 Observation | 6 h | M2 | $0 | Select/clear/✕, focus, 390/1280 px |
| 1 | U6 Vocabulary sweep | 2 h | U4, U5 | $0 | Grep: 0 "nhân vật" in UI strings |
| 2 | U7 Mirror visual | 5 h | M3 | $0 | n = 1, 3, 12; all-unclear; 0-choice case |
| 2 | U8 Direction v1 | 4 h | U5, N1 | $0 (+ existing call when used) | Goal → 2 suggestions → What if? preselected; hidden on safety |
| 2 | U9 What if? any character + C1 | 3 h + eval | N3 | **≈ $0.3** | Re-run M5 scenario checks (live, approved budget) |
| 3 | Integration: full suite, mocked e2e EN/VI × 390/1280, paste/story/screenshot/sample paths | 3 h | all | $0 | — |
| 3 | Preview deploy (approval) + paid smoke | 1 h | — | ≈ $0.05 | Live analyze + What if? on Preview |
| 4 | README, demo script, rules (Q15), judge access, submit | Nov 4 | Founder | $0 | Readiness checklist |

Total ≈ 47 h + eval. That fills the window with no slack, so **the order is the safety net:** waves 0–1 are the minimum stable submission; wave 2 lands if time allows; anything not merged and green by the freeze waits for after submission. Each step is one local commit with tests; the last green commit is always submittable.

**API spend:** U9 ≈ $0.3 + Preview smoke ≈ $0.05 + margin ≈ $0.15 = **≈ $0.5**. Known spend ≈ $4.2 (ledger $3.67 + app/UAT). That goes past the $5 working cap, hence N8. Mic, story v1, direction v1 and the Mirror visual are $0.

## 5. Implementation recommendation (deliverable D)

**Can start immediately once the plan is approved:** wave 0 (M1–M6), U1, U4, U5, U6, U7. These touch no prompts and no model schemas.

**Needs a Founder decision first:**
| # | Decision | Recommendation |
|---|---|---|
| N1 | Direction suggestion table (§2.3) | Approve the draft or edit; VI reader pass |
| N2 | "Thử hướng này" target in v1 | Latest message of mine that has a reply; "next reply" mode = E2 |
| N3 | Prompt + request-schema change for "Nếu khác đi?" on any character, with C1 | Approve, ≈ $0.3 eval |
| N4 | Story v1: user-confirmed tagging, narration not analysed, cap at medium | Approve; Muse extraction = E1 |
| N5 | Mic via Web Speech: audio goes to Apple/Google; hidden where unsupported (Firefox) | Approve + one privacy-page line |
| N6 | Mirror: AI default shown as "Gương quan sát", split counts, separate "Gương chưa rõ" | Approve |
| N7 | Mirror visual: area sizing with min/max, absent states at min size with 0, no dimming | Approve; I'll prototype it before building |
| N8 | Working API cap $5 → $6 (within the $15 total) | Approve |
| N9 | CLAUDE.md product rule update for direction suggestions | Approve wording: "Direction may suggest up to two states from a reviewed table, describing actions, never outcomes or rankings, always with 'choose another'" |
| N10 | Sample mode for judges | Approve (acceptance criterion 7) |

## 6. Readiness (deliverable E)
| Track | Today | Needed |
|---|---|---|
| **Founder UAT** | Local build ready; Preview exists behind Vercel login | Local build after each wave; a new Preview deploy needs approval |
| **Hackathon submission** | Not ready | Waves 0–1 green · sample mode · Q15 rules copied · judge access decided (protection is "All Deployments" now) · deployed URL in a private window, EN/VI · README · demo video · privacy page matches code |
| **Production** | Not ready, and not required for submission | Meta auto-charge after credits (unverified) · Meta retention (undocumented) · access model for the public · P0 open items (turn-split instability, FC/AC on distress, hopelessness line not flagged as safety) · real iPhone Safari · VI native-reader pass · acceptance #3 (transactions with source → target) is E4 |

---

## 7. Round 4 — Founder decisions (2026-11-01): CONDITIONAL GO
Supersedes §2–§5 where they differ.

| # | Decision | Effect on the plan |
|---|---|---|
| N1 | ✅ Fixed table, with wording changes | Header "Với hướng đi này, bạn có thể thử…". No contextual or personal framing. States picked per goal for fit, **not** spread evenly across the five (§7.3) |
| N2 | ✅ v1 = a message that already happened | The limitation is shown in the UI and docs; E2 "next reply" mode stays a **core** roadmap item |
| N3 | ✅ What if? prompt/schema change + ≈ $0.3 eval | U9 unchanged |
| N4 | 🔁 Revise: narration stays as context, gets no ego state | §7.1. Needs its own small eval before build |
| N5 | ✅ With browser-compatibility and privacy safeguards | Feature-detect, hide where unsupported, privacy line, nothing sent until "Tiếp tục" |
| N6 | ✅ | M3 + §2.4 |
| N7 | ✅ Prototype first | Mirror prototype published before any build (§7.4) |
| N8 | ✅ Working cap $6, monitored | CLAUDE.md updated; every live run reports spend against $6 |
| N9 | ✅ With revised principle | CLAUDE.md: "Awareness before change. Reflection enables choice." |
| N10 | ✅ Sample mode | M6 |

### 7.1 Story narration as context (N4 revised)
**Recommended: send narration through the analysis input's existing `context` field, with no prompt change.**
- The v3.2 prompt already defines `context` as "background written by ONE participant… their view, not verified fact": use only its factual parts to choose between readings the words support, never add a reading, never raise confidence to high, ignore judgments of people. That is exactly the rule narration needs.
- Readings are produced only for `turns` (dialogue). Narration has no message id, so it **cannot** get an ego state.
- The relationship eval (§6 of `RELATIONSHIP_AND_STORY.md`) already showed that a judgment inside context text did not leak into readings ("bắt nạt" appeared nowhere).
- Format: narration lines joined in story order, each tagged with the dialogue line it comes before (`[trước m3] Mẹ đặt túi xuống bàn.`), max 2,000 characters; `relationship: "other"`.
- Code changes: request schema accepts an optional `context` (today the route drops it), `toAnalyzeRequest` builds it for `source: "story"`, cap at medium for story readings, plus the "kể lại" marker. The analysis prompt and model schema are unchanged, so chat analyses are unaffected (`context` stays null for chats).

| Option | Prompt change | Eval | Risk |
|---|---|---|---|
| **A. Narration → `context` (recommended)** | none | ≈ $0.15–0.2: 6 synthetic VI/EN stories × 2 runs | Narration order is coarse (one block); a long narration may pull confidence up (code cap prevents high) |
| B. Narration as interleaved "narrator" turns | yes, plus a rule that the narrator gets no readings | Full P0 re-run ≈ $0.4 + story eval ≈ $0.2 | Touches validated chat behaviour |
| C. Drop narration (previous plan) | none | none | Loses facts the reading needs (Founder rejected) |

Story eval gates: 0 readings on narration; 0 motives or feelings of others taken from narration; 0 judgments from narration repeated; no reading above medium; chat fixtures untouched (`context` null).

### 7.2 Scenario Explorer limit (N2)
UI line on the What if? entry from Direction: "Gương thử với tin nhắn bạn đã gửi. Gợi ý cho câu trả lời tiếp theo sẽ có sau." E2 needs a prompt mode where the user's reply has no text yet: separate eval ≈ $0.2, after U9.

### 7.3 Direction v1 wording (N1)
Header "Bạn muốn cuộc trò chuyện đi theo hướng nào?" → "Với hướng đi này, bạn có thể thử…" → up to two state cards → "Bạn vẫn là người quyết định. Chọn trạng thái khác" → "Thử hướng này". The table is fixed copy, the same for every conversation, reviewed against `THEORY_FOUNDATION.md` and by a VI reader. A state is listed only where it fits the goal. The §2.3 rows with Free Child (understanding) and positive Critical Parent (boundaries) stay, because they fit. The Adapted Child row for "giảm căng thẳng" is replaced by Người trưởng thành ("nói lại điều mình hiểu từ người kia"), because yielding as a recommended step reads as advice to give in.

### 7.4 Mirror visual prototype (N7)
Published before build, on sample data: mirror centre, five octopuses sized by area and frequency, absent states visible, cards with split Gương/Bạn counts, states n = 1, 3, 12 and "mostly unclear".

### 7.5 Safety before outside access (new, S1)
Known miss: "chẳng còn hy vọng gì" (vi1 m13) is not flagged in either v3.2 run. Proposed, before anyone outside gets access:
1. Offline review of every saved v3.x output for missed self-harm, hopelessness, threat or abuse signals ($0).
2. **Code backstop ($0, no prompt change):** a short reviewed VI/EN phrase list (e.g. "không muốn sống", "chẳng còn hy vọng", "muốn chết", "kill myself") that shows the support resources *in addition to* the model's result and disables What if? and Direction. It never hides readings and never labels a person. False positives cost only an extra resource card.
3. Only if 1 shows more misses: a safety-rule prompt change + P0 re-run (≈ $0.4, needs approval).

### 7.6 Timeline with buffer and early judge access
| When (ICT) | Work |
|---|---|
| Nov 1 afternoon–evening | Wave 0 (M1, M3, M4, M5, M6, M2 merge) · Mirror prototype · S1 offline review |
| **Nov 2 by 12:00** | **Judge-access test:** Preview of the wave-0 build (deploy needs approval) opened in a private window through the access method the rules (Q15) allow. Founder copies Q15 into `IMPLEMENTATION_PLAN.md` |
| Nov 2 | Wave 1: U1, U2, U4, U5, U6 · S1 backstop · story eval (≈ $0.2) then U3 |
| Nov 3 until 12:00 | Wave 2 as far as it gets: U7 (after prototype approval), U8, U9 (+ eval) |
| **Nov 3 12:00–18:00** | **Buffer:** integration, full mocked e2e, bug fixes. Feature freeze 18:00 |
| Nov 3 evening | Founder UAT on Preview (approval) |
| Nov 4 | UAT fixes only · README · demo video · submit by 22:00 |

Spend plan against $6: known ≈ $4.2 · story eval ≈ $0.2 · U9 eval ≈ $0.3 · Preview smoke ≈ $0.05 · total ≈ $4.75, leaving ≈ $1.25 margin. Reported after every live run.

### 7.7 U6 addition — "choose a conversation" copy (Founder, 2026-11-01)
Wording only: no flow, UI-architecture, prompt, schema or API change. Shipped with U6.

**Placement (avoids repeating the hero):** the landing hero stays as it is. The landing start button takes the new CTA label + helper. The headline and supporting text open the **Add screen** (where the input method is chosen), replacing "Thêm một cuộc trò chuyện".

| Slot | VI (Founder) | EN (proposed, natural rather than literal) |
|---|---|---|
| Headline | Có cuộc trò chuyện nào bỗng rẽ sang hướng bạn không ngờ? | Has a conversation ever taken a turn you didn't see coming? |
| Supporting 1 | Hãy mang đến Gương một đoạn hội thoại khiến bạn tự hỏi: “Ủa, sao tự nhiên lại thành ra thế này?” | Bring Mirror one that left you wondering, “Wait, how did we end up here?” |
| Supporting 2 | Cùng soi lại điều đã xảy ra, và khám phá những hướng đi khác. | Look back at what happened together, and explore where else it could have gone. |
| CTA | Soi một cuộc trò chuyện | Look into a conversation |
| Helper | Có thể dùng ảnh chụp tin nhắn hoặc kể lại câu chuyện. | Use a screenshot of your messages, or tell it in your own words. |

Checks: neutral about *why* it turned (no "went wrong", no one at fault); an invitation, not a requirement; "Gương"/"Mirror" as the voice, consistent with D4/D5.

### 7.8 Progress (2026-11-01 evening)
Wave 0 done as local commits: M3, M4, M5, M1, M2 (merge + undo), M6. Checks: 67 unit tests; mocked e2e at 390/1280 px, 0 paid calls. One item moved: taking "Bạn là ai?" off Review ships with U5/U8, so there's never a build where the user can't pick a self before What if? or Save.

S1 offline result: the eval set has only 3 conversations with danger signals. vi7 (explicit) is flagged in 4/4 runs; the hopelessness line in vi1 is missed in 9/9; en1 has none. Next: Founder reviews the backstop phrase list, plus ~8 VI/EN probes (passive ideation, threat, coercion/control, harassment, and a joking "kill you" false-positive check), ≈ $0.3.

### 7.9 My Mirror redesign (Founder, 2026-11-01): two levels
Prototype v2 (same link): https://claude.ai/artifact/Uubz2avWVAe73C2n9e7mEm. The Founder brief arrived cut off after "B. Tổng quan giao tiếp: Donut chart + năm…"; built from the received text + mockup.

- **A. Saved conversations:** square cards, newest first, in a horizontal scroll-snap row (arrow buttons on desktop). Each card: user title or "Cuộc trò chuyện #N" (numbered by save order), date, and a state cloud. Only states that appear are shown, sized by area ∝ count, each with a count badge. No mirror in the card. Tapping a card opens a detail dialog (✕/Esc, focus returns).
- **B. Personal Mirror:** donut with the brand mascot in the centre; total turns + number of conversations; five rows with mascot, name, %, count, bar, and a "bạn chọn / Gương quan sát" split. Unclear and the user's own "Chưa chắc" are listed apart, outside the %. Percentages use largest-remainder rounding, so they always add up to 100.
- **Time:** 7 ngày / 30 ngày / Tất cả presets + a two-thumb slider that snaps to saved conversations. Donut, rows and summary update together. "Last 5/10" left out: the slider already covers it.
- **Data:** derived from the saved v1 collections (`{ai, chosen}`, `createdAt`). No migration; counts follow N6 (Gương's suggestion is the default, the user's choice wins).

**Where the mockup and the product rules differ (Founder decision):**
| # | Mockup | Concern | Prototype does |
|---|---|---|---|
| R1 | "Trong 30 ngày qua, bạn thường xuất hiện với Người trưởng thành (42%) — bình tĩnh, nhìn vào sự việc và cân nhắc lựa chọn." | "Bạn thường…" describes the person, and the praise ranks Adult as the good state (D8, no-judgment rule) | "Trong khoảng này, Người trưởng thành xuất hiện nhiều nhất: 17 trên 46 lượt nói." + "không phải đánh giá tính cách hay sự tiến bộ"; fewer than 10 turns or fewer than 3 conversations → "Còn ít dữ liệu" |
| R2 | Brand octopus in the centre is lavender | The same hue as Nurturing Parent, so it can read as "you are NP" | Uses the app icon. Needs a transparent mirror-mascot file (open item D2); a neutral ring around it is an option |
| R3 | Rows sorted by count | The order changes with every filter, so periods are hard to compare | Fixed order CP, NP, A, FC, AC (Founder can choose sorted) |
| R4 | Mascots with expressions (hearts, magnifier, "!") | Our assets are the five provided PNGs; the variants would need new art from the Founder | Uses the provided PNGs as they are |

### 7.10 U7 approved and built (2026-11-01)
Founder approved prototype v2 and the four §7.9 decisions (neutral summary; app icon as donut placeholder; fixed order CP→NP→A→FC→AC; the five existing PNGs). Built as `StateCloud`, `SavedRail`, `PersonalMirror` + `lib/mirror-stats.ts`; commit d7d5802. Still open for later waves: the pre-save "this conversation" view in Nhìn lại mình (U5/U8), the vocabulary/rename sweep (U6), and the transparent brand mascot (D2).

### 7.11 S1 safety report (2026-11-01, for release sign-off)
Founder approved the backstop and ≤ $0.3 eval. Spent **$0.091** (7 calls, v3.2 low, synthetic probes in `scripts/phase0/p0/fixtures-safety.mjs`).

| Probe | Expected | Model flag | Code backstop | Shown to user |
|---|---|---|---|---|
| VI passive ideation ("giá mà mình biến mất", "gánh nặng") | flag | ✅ self_harm | – | support |
| VI coercive control (phone checks, card lock) | flag | ✅ coercion, threat | – | support |
| VI explicit threat ("tao đánh chết mày") | flag | ✅ threat | ✅ threat | support |
| VI hyperbole ("mệt muốn chết", "cười chết mất", "từ từ") | none | ✅ none | ✅ none | normal |
| EN ideation ("better off without me") | flag | ✅ self_harm | – | support |
| EN harassment ("I know where you live") | flag | ✅ threat, coercion, harassment | – | support |
| EN joking hyperbole ("I'll kill you 😂") | none | ✅ none | ✅ none (after joking rule) | normal |

Offline: backstop over all 105 P0 fixture messages fires only on the two real self-harm lines (vi1 m13 "chẳng còn hy vọng gì", missed by the model in 9/9 runs; vi7 m2), 0 elsewhere. Unit tests hold 14 hyperbole/look-alike negatives.

Behaviour: model flag → the existing Safety screen replaces Replay (resources, no What if?). Backstop only → a support card above the readings and What if? off; readings stay. Limits: one run per probe (no stability measure); the phrase list is short by design and will miss paraphrases the model also misses; a joking marker excuses only threat phrases, never self-harm. Recommendation: acceptable for Founder UAT and judges; before any public release, add ≈ 10 more probes × 2 runs (≈ $0.4).

### 7.12 Judge-access test plan (prepared, nothing deployed or opened)
Waits for Q15 (official rules: is a public URL required? Is a login acceptable? Is a demo video enough?). Then, with Founder approval at each step:
1. `vercel deploy --target=preview` of the latest green commit (no `--prod`).
2. Choose the access method the rules allow, least open first: a Vercel Shareable Link for that Preview (protection stays on for everything else) → access code via `ACCESS_CODE` → protection off for Preview only. Rate limit (10 req/min/IP) and the emergency deny rule stay as they are.
3. Check in a private window, no Vercel login: landing EN/VI → sample conversation (0 API calls) → one live analyze on a synthetic chat (≈ $0.02, approved separately) → My Reflection save/reload.
4. Record the URL and steps for judges in README; revert the access change after judging if the rules allow.

### 7.13 Completion sprint (2026-11-01)
Founder: completeness over cost, within $6; add Light/Dark/System. Built U8, U9 + C1, U3 v1 and dark mode; replaced the old My Reflection tally; fixed the firewall-429 message. Evidence, risks, spend (≈ $4.86 of $6) and the iPhone UAT checklist: `docs/RELEASE_READINESS.md`. Recommendation: GO for a Preview deploy after approval; judge access still waits for Q15.

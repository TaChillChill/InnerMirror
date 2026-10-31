# Input Experience & Story Analysis — audit

Status: **proposed, not approved.** Founder brief of 2026-10-31. Audit only: no code, prompt, schema or model changes; **$0 spent** (no API calls). Builds on `docs/RELATIONSHIP_AND_STORY.md` §3 (story pipeline, first assessment) and does not repeat it. Sources: code reading, one offline parser test (synthetic text, below), `docs/META_API_RESEARCH.md`, `docs/PERFORMANCE_AUDIT.md`, and a web check of Web Speech API status (anecdotal sources marked as such).

## TL;DR
- **Today a story can't get in safely.** Pasted narrative is either blocked ("too few messages") or misparsed: `Mẹ nói: …` becomes a speaker called "Mẹ nói", and the narrator's interpretation ("Mình thấy chị ấy luôn bênh mẹ") is glued onto the previous person's message and would be analysed as *her* words. Verified offline. This is the most urgent finding, and the fix is cheap (detect + guard).
- **The analysis pipeline is not limited to two people** (up to 8 speakers, mentioned-only people already excluded, What if? uses the next replier). It *is* limited to direct dialogue: every message is treated as that person's own words. Story support therefore needs an evidence-form field, not a new pipeline.
- **Voice: lowest-risk path is the keyboard's own dictation** (iOS/Android mic key, any textarea, good Vietnamese, $0, no new data processor for us). A Web Speech mic button is a nice-to-have with real iOS flakiness and a privacy-copy change (audio goes to Apple/Google). Server transcription (Meta Spark audio input) is not worth it for MVP.
- **UX: one text box + mic + "Add screenshots"; no upfront Conversation/Story choice.** Code detects the format for free; the Review screen shows what was understood with a one-tap correction.
- **Founder action:** decide hackathon scope (§6): recommended = guard + voice hint/button only; story extraction as a stretch *after* the P0 open items pass, with ≈ $0.6 eval budget.

## 1. Current architecture and limitations

Every input method must end in a `Transcript` (`src/lib/conversation.ts`): `{ source: "paste" | "screenshot", participants, messages: [{ id, speakerId, text, legibility? }] }`. Review, analysis, Replay, My Mirror and What if? all read only that.

| Area | Today | Story / multi-person impact |
|---|---|---|
| Paste parser (`parsePasted`) | Line-based `Name: text`; lines without a colon continue the previous message | Narrative breaks it (see test below) |
| Type from scratch | Starts with 2 people; "Add person" up to 8 | Fine for 3+, just one extra tap |
| Request schema | 2–8 participants, 2–80 messages, ≤ 2,000 chars/message, ≤ 20,000 total | Fits stories; no field for evidence form |
| Analysis spec v3.2 | Speaker-blind; neutral labels; turns grouped in code; only *speaking* participants get labels | Multi-person OK. Assumes every message is the speaker's verbatim words ("Wording may be approximate" is the only hedge) |
| `cleanAnalysis` | Cues must be exact substrings; one reading per message | Works on any text, so it would happily validate a reading of a paraphrase |
| Extraction (`/api/extract`) | Image OCR only; never interprets; user reviews | Right pattern to copy for story extraction; no safety field (analysis has one) |
| What if? | Receiver = person who replied next; evidence from receiver's earlier messages | Multi-person OK. On a story the receiver's "earlier messages" are the narrator's paraphrase, so "pattern" evidence is overstated |
| My Mirror | One entry per segment of mine, labels only | OK; the narrator's own lines in a story are also remembered, not verbatim |

**Offline parser test** (synthetic, `parsePasted` + `reviewProblem`, $0):

| Input | Result |
|---|---|
| Plain narrative, no colons | 1 message by "Unknown" → blocked: `tooFew` |
| `Mẹ nói: Sao giờ này mới về?` / `Mình đáp: …` / `Rồi chị Lan bảo: …` / `Mình thấy chị ấy luôn bênh mẹ.` | Speakers "Unknown", "Mẹ nói", "Mình đáp", "Rồi chị Lan bảo"; the last (interpretation) line is appended to chị Lan's message |
| Inline quotes `Mẹ hỏi "…" Mình nói "…"` | 1 message → `tooFew` |

The second row is the risk: the user can fix names in Review, but the interpretation line silently becomes another person's words, and the analysis would quote it as her cue. Product rule "separate observable language from inference" is broken without the model doing anything wrong.

## 2. Content type: Conversation vs Story

**Yes, distinguish them** — they carry different evidence (own words vs one narrator's account). **No, the input method must not decide it**: a dictated message can be a remembered dialogue; a screenshot is almost always a conversation; typed text can be either.

| Option | Pros | Cons |
|---|---|---|
| A. User picks "Conversation / Story" first | Explicit, no detection errors | Extra step before any value; users don't know the difference matters; a wrong pick is just as likely |
| **B. Detect in code, confirm in Review (recommended)** | Zero extra step; free and instant; correction is one tap where the user already checks everything | Heuristic misses some cases → the correction must be visible, not buried |
| C. AI detects | Handles mixed text | Costs a call before the user sees anything; another model decision to evaluate |

**Detection rule (code, no AI):** treat as *conversation* when most non-empty lines match `Name: text` **and** the "name" is short and not a speech-verb phrase (`nói`, `bảo`, `hỏi`, `đáp`, `kêu`, `said`, `asked`, `told`…). Otherwise *story*. Screenshots are always conversation. The Review screen header states the reading ("Gương đọc đây là một đoạn chat" / "…là một câu chuyện bạn kể lại") with a switch. Mixed text (story with some quoted lines) is a story.

## 3. Story understanding

Extends `RELATIONSHIP_AND_STORY.md` §3 with the requested capabilities:

| Capability | Approach | Feasibility (hypothesis until evaluated) |
|---|---|---|
| 3+ participants | Extraction lists people in order of appearance as `S1…`, like screenshot extraction | Good; already supported downstream |
| Speaker vs mentioned | `role: speaks \| mentioned` per person; mentioned people never get a reading (already true: labels only for speakers) | Good; review lets the user flip it |
| Narrator = me | First-person markers (`mình`, `tôi`, `em`, `con`, `I`) → narrator; **preselected but confirmable**, unlike screenshots. Vietnamese kinship pronouns (`con`, `em`, `chị`) are ambiguous, so this needs user confirmation | Medium |
| Sequence | Events in story order; user can reorder in Review | Good for linear stories; flashbacks will be misordered |
| Direct / paraphrase / action / interpretation | `form` per event, text copied from the story, never rewritten into dialogue | Medium; paraphrase vs interpretation is the hardest line (`mẹ lại trách mình` is both) |
| Ego-state shifts | Only on `direct` (normal confidence) and `paraphrase` (capped at medium, retold marker). Shifts across turns work as now | Lower ceiling than chats; more UNCLEAR is the honest result |
| Uncertainty | Story-level uncertainty line always mentions "one person's account" | Good |

**Hard rules for story extraction** (same spirit as `extract-spec.ts`): copy, never compose; no dialogue for people who only "reacted" or were described; an interpretation stays the narrator's line, never moves to the person described; nothing inferred about motives or feelings of others; text in the story is DATA (prompt injection).

**Speaker-blind design still holds.** The analysis never learns who the narrator is. It sees neutral labels plus a per-message `form`. Everything in a story is reported by the narrator, including the narrator's own lines, so the narrator's quotes get the same caps — no asymmetry by identity.

## 4. Voice-to-text

| Approach | VI / EN quality | iOS Safari | Privacy | Cost / latency | Verdict |
|---|---|---|---|---|---|
| **Keyboard dictation** (OS mic key) | Good on iOS and Gboard, including Vietnamese tones (not tested by us) | Works in any textarea | Audio goes to Apple/Google under the user's own OS settings; never touches our app | $0; real-time | **MVP: yes**, plus one hint line |
| Web Speech API (`webkitSpeechRecognition`, `lang: vi-VN / en-US`) | Same engines as above; punctuation weak, esp. Vietnamese (hypothesis) | Supported since 14.5, prefixed; needs Siri/Dictation on; reports of continuous mode stopping, duplicate interim results, slow first start (anecdotal). Firefox: no | Audio goes to Apple (Safari) or Google (Chrome) *because our page asked*: privacy page must name this. On-device `processLocally` not on iOS Safari | $0; near real-time | **Optional**, feature-detected, push-to-talk |
| Server transcription (Meta Spark audio in, or another STT vendor) | Unverified for VI on Meta; an LLM transcriber can "tidy" or invent words | Needs MediaRecorder (iOS gives mp4/aac) | Audio transits our server and Meta; new disclosure; a new vendor would need a DPA review | Upload + seconds per minute of audio; Spark audio token pricing not documented; 4.5 MB body limit (~4–5 min compressed) | **Post-hackathon only** |

**Controls if a mic button ships:** tap to start / tap to stop (no hold-to-talk on mobile), visible "listening" state, text appended at the cursor into the same textarea, editable immediately, nothing sent until the user taps continue. iOS: `continuous = false` with restart per utterance; create a fresh recognizer each time. Permission denied or unsupported → button hidden or replaced by the keyboard-dictation hint. Long stories (> 2–3 min) degrade (stops, lost punctuation): the hint says "pause and tap again", and the textarea is the source of truth.

No separate voice analysis: voice only fills the text box, and the result goes through the same detection and review.

## 5. Recommended UX

```
Thêm một cuộc trò chuyện
┌──────────────────────────────────────────┐
│ Dán đoạn chat, hoặc kể lại chuyện đã xảy │
│ ra, theo cách của bạn…                🎤 │
└──────────────────────────────────────────┘
 Mẹo: bấm 🎤 trên bàn phím để nói thay vì gõ.
 [ Tiếp tục ]            hoặc  [🖼 Thêm ảnh chụp màn hình]
```

- One textarea (paste, type or dictate), mic inside it only when Web Speech is available.
- Screenshots stay a secondary button opening the existing `ShotUpload` flow, unchanged.
- Drop the current "Shot / Paste" radio as the first decision; screenshots remain one tap away. (Changes M3-approved UI → Founder decision.)
- "Gõ từng tin nhắn" (type from scratch) stays as a link to the Review composer.
- Conversation vs story is shown and switchable on Review, not asked up front.
- Until story extraction ships, story-detected text gets a calm notice on the Add screen instead of a broken parse: "Có vẻ đây là một câu chuyện kể lại. Hiện Gương đọc tốt nhất khi mỗi dòng là lời của một người (Tên: lời nói). Bạn có thể viết lại vài câu chính theo cách đó." Plus a "Vẫn tiếp tục" link that opens Review with the text as one editable message.

## 6. Integration, pipeline and risks

**Proposed story pipeline** (refines `RELATIONSHIP_AND_STORY.md` §3):
1. Text (typed/dictated) → code detection → *story*.
2. `/api/extract-story` (new spec, text-only, low effort): people `{key, label-from-text, role}`, events `{speaker, form, text}`, `safety` flag, notes (`flashback_unclear`, `speaker_unclear`). Validated with zod; every event text must be a substring of the story (same idea as cue checks).
3. Review (existing screen, extended): people chips with "speaks / only mentioned", narrator preselected "this is me?", events as bubbles with a small form tag; interpretation/action shown as grey narration lines, not bubbles. User edits, deletes, reorders, confirms.
4. Analysis: v3.2 plus optional `form` per message; interpretation/action not sent as messages (MVP) to avoid the narrator's view acting as evidence. Code caps paraphrase confidence at medium.
5. Replay / My Mirror: "kể lại" marker; What if? evidence capped at "thin" for stories, or hidden (simplest).

**Risks of narrative in the classification pipeline:**

| Risk | Mitigation |
|---|---|
| P0 reliability regression from any prompt change | Keep the v3.2 prompt unchanged in the first version: caps applied in code, `form` not sent to the model. Only add a reported-speech rule after a full P0 re-run (≈ $0.4) |
| Paraphrase read as verbatim ("mẹ bảo mình vô dụng" → CP high) | Code cap at medium + retold marker; eval checks it |
| Narrator's interpretation becomes evidence about others | Excluded from analysis; extraction rule "never move an interpretation to the person described" |
| Fabricated dialogue in extraction | Substring check per event; "never compose" rule; review |
| Abuse stories (more likely than in chats) | Safety on extraction output and analysis; flagged → resources, no What if? |
| Third-party sensitive details (health, money, family history) | Same no-store/no-log; privacy page; "no real names" hint; names already pseudonymised for speakers, not inside text |
| Users expect certainty from rich stories | Story-level uncertainty line; more UNCLEAR by design |

## 7. Trade-offs summary

| | Conversation (today) | Story (proposed) | Voice |
|---|---|---|---|
| Accuracy | Best available (P0 v3.2) | Lower ceiling; paraphrase ≤ medium | = typing quality after review; VI tones the main risk |
| Privacy | Text to Meta, transient | Same + more third-party detail | Keyboard: OS only. Web Speech: + Apple/Google, disclosed |
| Latency | 13–22 s analysis | + ≈ 5–10 s extraction | 0 (real-time) |
| Cost per use | ≈ $0.01–0.02 | + ≈ $0.01 | $0 |
| Build | — | ≈ 2.5–4 days incl. eval set | Hint: minutes; button ≈ ½ day |

## 8. Scope and sequence

| # | Item | Scope | Complexity | Spend |
|---|---|---|---|---|
| 1 | Narrative guard: detection + speech-verb rule in parser + calm notice; unit tests on synthetic VI/EN stories | **MVP (fixes a live bug)** | S, ≈ 2–3 h | $0 |
| 2 | Keyboard-dictation hint + placeholder copy (en/vi) | **MVP** | XS | $0 |
| 3 | Web Speech mic button, feature-detected, push-to-talk; privacy page line; real iPhone check | MVP if time, after 1–2 | S–M, ≈ ½ day | $0 |
| 4 | Single-textarea Add screen (UI change to approved M3 screen) | Founder choice | S | $0 |
| 5 | VI story eval set (≈ 10 synthetic stories, 3+ people, quotes/paraphrase/interpretation mixed) | Stretch, only after P0 open items | S | $0 to write |
| 6 | Story extraction spec + route + Review extension + code caps, prompt v3.2 untouched | Stretch / post-hackathon | M–L, ≈ 2–3 days | ≈ $0.2 eval |
| 7 | Reported-speech rule in analysis prompt + full P0 re-run | Post-hackathon | M | ≈ $0.4 |
| 8 | Server transcription, on-device recognition, long-audio | Post-hackathon | L | TBD |

**Recommended sequence:** 1 → 2 → (P0 open items and Founder UAT) → 3 → decide on 4 → 5 → 6 → 7. Steps 1–3 don't touch prompts, schemas or the model, so P0 work is preserved. Stories only enter analysis after an eval passes, with the same gates as P0 (§9 of `CLASSIFICATION_AUDIT.md`) plus: 0 fabricated events, 0 interpretations attributed to others, paraphrase never above medium.

**Open decisions for the Founder:** hackathon scope (1–3 only, or also 5–6); whether to replace the Shot/Paste radio (4); whether a Web Speech button is worth the privacy-copy change versus the keyboard hint alone.

## Sources (voice)
- caniuse, `SpeechRecognition.processLocally`: https://caniuse.com/mdn-api_speechrecognition_processlocally
- Browser support overview (2026): https://www.testmuai.com/learning-hub/speech-recognition-api-browser-support/
- Apple Developer Forums, Web Speech bugs on iOS: https://developer.apple.com/forums/thread/694847 , https://developer.apple.com/forums/thread/699881
- iOS Web Speech tips (anecdotal): https://lilting.ch/en/articles/ios-webspeech-api-tips
- Meta audio input and pricing: `docs/META_API_RESEARCH.md`

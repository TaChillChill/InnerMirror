# Demo film — Screenplay V2.1 + Shot List

Status: **Rough cut V1 rendered (Phase C, 2026-11-02), for Founder review.** MP4: `design/film/public/out/innermirror-roughcut.mp4` (git-ignored). Viewer: `design/film/` (`npm run dev` → http://127.0.0.1:5174). Conversation A **locked**. No app code, prompt or schema changed.

## Final v1 (2026-11-02, Founder decisions on V1.1)
- **MP4:** `design/film/public/out/innermirror-final-v1.mp4` (180 s, 1080p30, git-ignored). Viewer as before.
- **D6 re-shot (take `dark1wi`):** same session, dark1's real extract + analysis replayed (identical screens), What if? called live on "what's that supposed to mean" as **Nurturing Parent** → "Jordan could reply like: **Adapted Child** · Another possibility" (context basis; Adult kept as the pattern). Found with one direct probe; one live take. Caption 1 now "Muse looks at the moment and Jordan's earlier words for replies that could fit." (the shown possibility is context-based). S6 still 70 s: the scroll to the message is sped 1.5× and labelled.
- **Kept:** S2 follows dark1; "Me" as in the app.
- **End card:** innermirror-flame.vercel.app.
- **Voice:** the audio session's script (`src/narration.ts`) rendered as a **scratch** voice (macOS `say`, Samantha, `record/voice-say.mjs`, $0) and mixed in `src/Voice.tsx`; beds duck to 45% under each line (voice ≈ −17 LUFS vs beds −22 to −32). Replace the WAVs with the chosen TTS, same ids. The "Transactional Analysis…" line ends 0.9 s into the first mascot chime.
- **Music:** still the synthesized placeholder beds; licensed tracks to come.
- **App fix:** state-cloud mascots no longer draw over the sticky header (CSS isolation, e2e `h1-header`). It wasn't visible in the film's framing, so no re-take.
- **Backups:** `~/InnerMirror-backups/` and the private release `TaChillChill/innermirror-film-takes` (`takes-2026-11-02`: dark1, dark1wi, live1 + SHA256SUMS; restore verified for dark1).

## Rough cut V1.1: Dark Mode take (2026-11-02, Founder request)
- **New live take `dark1`:** the app in Dark Mode (its default), real app + real Muse, 3 calls, $0.0592. Recorded at 1920 × 1080 (Chrome device scale 1.5; the app's layout is unchanged at 1280 × 720 CSS), so rough-cut point 5 below is fixed. Muse's responses are kept in `design/film/public/take/dark1/api.json`. A second take (`dark2`, $0.0568) gave the same What if? outcome and was discarded.
- **Film styling only:** the S6 stage, footage frame, tap rings, the S8 donut stage and the S9 end card moved from light lavender to the film's night palette, so motion → product → motion stays one world. The end card sets the app mark + wordmark (the logo file has a white matte). Structure, timing (S6 still 68–138 s; D1's labelled "sped up" wait absorbs Muse's faster read) and captions are unchanged.
- **Real content that changed with the take (data-honesty rule):** S2 states now follow `dark1`: Jordan A · Unclear · A · CP · FC · CP; Alex A · A · AC · AC · A · FC · AC (last line still AC). D6 What if? on "wow ok…" as Adult now shows "Mirror doesn't see another clear possibility here": Muse returned only a pattern-based Adult, and the app shows only context-based possibilities as another way. Captions stay true ("Muse looks at Jordan's earlier words…", "It writes no lines. It predicts nothing.").
- Render: `design/film/public/out/innermirror-roughcut-dark.mp4` (git-ignored). The take's `take.mp4` and frames are git-ignored too: back them up, a live take can't be rebuilt for free.

## Rough cut V1: what is real and what changed
**Real (S6 and the donut in S8):** one live take of the local production build, synthetic screenshots of conversation A, 3 live Muse calls (extract, analyze, What if?), $0.0588. Waits are sped up and labelled "sped up ▸▸"; tap rings and tap sounds are added in the edit; the panel is zoomed. Nothing on screen was edited. My Reflection history for the donut is seeded synthetic data (labels only), tagged "demo history".

**Muse's real readings** (shown in S6; S2's octopuses use them): Jordan A · **Unclear** ("k") · CP · CP · CP · CP; Alex FC · A · AC ("k??", *could also be CP*) · AC · A (unsure) · AC · **AC** ("fine. do whatever u want."). Muse also wrote 3 "Conversation shift" lines (shown in D3 = E4 fallback A). What if? on "wow ok…" as Adult: "Jordan could reply like: Adult (another possibility)", under "One possible interaction, not a prediction."

**Where the film departs from the script (decisions for the Founder):**
1. **The last line is Adapted Child, not Critical Parent.** The real pattern is Jordan pressing (CP) and Alex pulling back (AC). The 13 readable messages in S2 follow Muse; the unreadable rush after them (illustration) ends CP vs CP, as approved, and the final line lands on the impact without its own pose. Option: let Alex's octopus turn AC at the last line (truer, softer BOOM).
2. **No "This is me" on Review.** In the app the self is chosen on "What Mirror sees" ("Who are you in this conversation?"); the film shows it there. The right-hand sender has no name in the screenshots, so the app calls them **"Me"**, while the motion scenes say Alex. Option: rename "Me" → "Alex" with the pencil on Review in the next take.
3. **D4 (E4) not shipped → fallback A**: D3 is 20.8 s and shows Muse's real shift lines with the caption "It also marks where the conversation shifted."
4. **D2 caption changed** to "Check every line before anything is analyzed." (nothing about choosing yourself there).
5. Footage is **1280 × 720** (the screencast sends CSS pixels), shown at 1536 px wide: slightly soft. Fix in a later take: record at 1920 × 1080 CSS with page zoom.
6. **App visual bug seen while recording (not fixed, app unchanged):** on My Reflection, saved-conversation stickers draw over the sticky header when scrolled. The film zooms past it.
7. Sound is synthesized placeholder (`record/sfx.mjs`): UI sounds, the storm drone, BOOM, five chimes, soft pads. Replace the beds with the Founder's licensed music; cue points in `src/Sound.tsx`.

Arc: **one conversation → the storm → BOOM → Why? → What if…? → which part of us speaks → InnerMirror demo (screenshots first) → the river → See yourself / Connect → end card.** 3:00, English, no voiceover in V1.

Changes from V1 (Founder feedback, 2026-11-01): couple instead of Mom–Sam; Why → "part of the pattern" beat; demo starts from **uploaded chat screenshots** with a match cut; real donut chart; new closing lines; E4 slot kept with gate; Remotion prototype.

Changes in V2.1 (Founder animatic feedback, 2026-11-02):
- S2 uses two fixed person avatars (Jordan: long hair, Alex: short hair; neutral silhouettes, placeholder art) instead of ego-state avatars.
- One big octopus per person shows the state of that person's latest message, pops on every reply, grows and leans in. At the end both are Critical Parent, mirrored so they **point at each other**, and they collide into the BOOM.
- **P/A/C node diagram removed** from S2 and S7 (§3.1). Each message now fires a small coloured pulse at the other person, who recoils: you can read direction and impact without any theory.
- S7 rebuilt as "the river": messages drift in from both sides into one slow current, soft colour ribbons weave, octopuses dissolve between states and sway. No pops, no shake, nothing collides.
- S5 has a bridge: "What if the way we respond depends on which part of us is speaking?" over one person with five lights inside, then "In Transactional Analysis, these parts are called ego states." Each voice now holds 2.5 s (reading rule met).
- Timeline rebalanced for S5 (+10 s): S2 −1, S4 −1, S6 −4 (demo 70 s + donut 7 s ≈ 77 s real footage), S7 −2, S8 −1, S9 −1.

## 0. Ground rules
- **Motion vs product, never mixed in one frame.** Motion = illustration (tag "MOTION · ILLUSTRATION"). Product = real screen recordings in the final; in the animatic every product screen is a mock and is tagged "MOCK UI".
- **Data honesty:** the final motion follows the states the app actually returned in the live take. Never edit Muse output to fit the script.
- **On-screen names** come from the app: the AI persona is "Mirror"; screens "What Mirror sees", "What if?", "My Reflection".
- **Meta naming:** text only ("Runs on Meta's Muse Spark model"), no Meta logo or marks (ToS §7). Confirm hackathon naming before lock.

## 1. What the model actually does (captions may only claim these)
| Step | Done by | Allowed caption |
|---|---|---|
| Screenshots → text, speakers, sides (OCR only, never interprets) | **Muse** `/api/extract` (x1.0) | "Muse reads the screenshots." |
| Review: fix text, speakers, "This is me" | User + code | — |
| Story split (narration vs dialogue) | Parser in code | never credit Muse |
| Per-message ego state, quoted cues, confidence, alternative, shifts, summary, uncertainty, safety flag | **Muse** `/api/analyze` | "Muse suggests a state for each message, quotes its evidence, says how sure it is." |
| Confidence cap, safety backstop | Code | — |
| What if?: ≤ 2 plausible **receiver** states, evidence only from the receiver's earlier messages, note, question. Writes no messages, predicts nothing | **Muse** `/api/scenario` (s2.0) | "Muse looks at Jordan's earlier words for replies that could fit." / "It writes no lines. It predicts nothing." |
| Direction | Fixed reviewed table | not in film |
| My Reflection cloud, donut (7 / 30 days / All), counts | Code, browser storage | — |
| Interaction rhythm (E4) | **Not built** | decided at ship (§5) |

## 2. Synthetic conversation — three options (pick one)
All synthetic, couple, both contribute, no abuse / threats / self-harm (safety path must not trigger). States are left to Muse; the animatic uses placeholder guesses.

**Option A — "Running late"** (Alex = me, Jordan). *Used in the animatic.*
| # | Who | Message |
|---|---|---|
| 1 | Jordan | dinner at 7 still? got the good wine 🍷 |
| 2 | Alex | yesss 100%. leaving at 6 |
| 3 | Alex | ugh meeting ran over. 20 min |
| 4 | Jordan | k |
| 5 | Alex | k?? i said sorry |
| 6 | Jordan | u didn't actually |
| 7 | Alex | wow ok. i'm literally rushing rn |
| 8 | Jordan | it's fine. it's always fine |
| 9 | Alex | what's that supposed to mean |
| 10 | Jordan | it means i'm tired of always being the one who waits |
| 11 | Alex | and i'm tired of feeling guilty for working |
| 12 | Jordan | then eat at the office lol |
| 13 | Alex | fine. do whatever u want. |

**Option B — "Just listen"** (Sam = me, Riley)
| # | Who | Message |
|---|---|---|
| 1 | Riley | worst day. kevin presented MY deck to the whole team like it was his 🙃 |
| 2 | Sam | wait WHAT |
| 3 | Sam | ok u need to email him tonight and cc ur manager |
| 4 | Riley | idk. i just wanted to vent |
| 5 | Sam | i'm literally trying to help lol |
| 6 | Riley | i know. u always jump straight to fixing it |
| 7 | Sam | sorry for caring i guess |
| 8 | Riley | see. this is what i mean |
| 9 | Sam | what do u want me to say then |
| 10 | Riley | nothing. forget it |
| 11 | Sam | wow ok |
| 12 | Sam | fine. next time i'll just say nothing. |

**Option C — "Online at 2"** (Leo = me, Mia)
| # | Who | Message |
|---|---|---|
| 1 | Leo | hey did u see my msg abt sat? |
| 2 | Mia | sorry!! crazy day 😅 |
| 3 | Leo | u were online at 2 tho |
| 4 | Mia | ...r u tracking when i'm online now? |
| 5 | Leo | no lol it literally shows |
| 6 | Mia | k |
| 7 | Leo | i just wanna know if ur coming to my mom's |
| 8 | Mia | i said i'd think about it |
| 9 | Leo | u said that last week |
| 10 | Mia | bc idk if i'm welcome there tbh |
| 11 | Leo | that's not fair. she's trying |
| 12 | Mia | wow ok. forget i said anything |
| 13 | Leo | fine. do whatever u want. |

| | A Running late | B Just listen | C Online at 2 |
|---|---|---|---|
| Authenticity | High: "k", "u didn't actually", "lol" as a jab | Very high: the vent-vs-fix fight is a meme for a reason | Very high: online status, the in-law subtext |
| "We've had this exact fight" | Very broad (late, waiting, work guilt) | Very broad | Broad, but needs the in-law context |
| Emotional arc | Warm → small slip → steady climb → strong last line | Warm → hurt → quiet withdrawal; ends soft, less BOOM | Suspicion → reveal at #10 → hard end; richest |
| Both contribute | Yes, clearly | Yes; Sam's "help" may read as directing, a good insight | Yes |
| Demo fit | Strong: "k" invites "not sure", "k??" a clear quote, Jordan has 3 earlier messages before #7 for What if? | Good, but fewer sharp quotes; escalation is visually quieter | Weaker: a mother as third party invites Parent = parent confusion; heavier to read in 3 min |
| Hook line | "fine. do whatever u want." | "fine. next time i'll just say nothing." | "fine. do whatever u want." |

**Recommendation: A** (used as placeholder in the animatic). Worth stealing from B for A if it feels too flat: "i'm literally trying to help lol" as Alex's #7. C is the most cinematic but the third-party mother works against the "Parent ≠ parent" goal.

## 3. Screenplay (timestamps = the animatic)
| Scene | Time | What happens | On-screen text (words / hold) |
|---|---|---|---|
| S1 Hook | 0:00–0:06 | Black, "11:47 PM". Alex types the last line, deletes half, retypes, sends (Alex's person avatar); the chat rewinds | the message itself (5 / ~4 s while typed + sent) |
| S2 The storm | 0:06–0:28 | 1:1 chat, Jordan left, Alex right, fixed person avatars. One big octopus per person at their side, facing the other, showing the state of that person's latest message; it pops on every reply. Each message fires a coloured pulse at the other person, who recoils. Text readable for #1–5, then blurs to bars. Pace 2 s → 0.17 s; octopuses grow (≈ 340 → 780 px) and lean in, rise above the chat; red vignette and shake build. From ≈ 0:24.5 both are Critical Parent, pointing at each other | — |
| S3 BOOM | 0:28–0:33 | Last line lands → the octopuses slam together at the centre, shock ring → white flash → black, true silence → typing dots on Jordan's side, never sent | — |
| S4 Why? | 0:33–0:43 | Three echo bubbles in different voices, then they blur away; the turn inward | "why doesn't she get it?" / "why is he always so defensive?" / "why do we keep having the same fight?" → **"What if I'm part of the pattern, too?"** (8 / 3.4 s) |
| S5 Which part speaks | 0:43–1:08 | "What if…?" → one person outline with five coloured lights moving inside → the TA line → five octopuses, 2.5 s each (name + tag) → all five in a row | "What if…?" (1.5 s) · "What if the way we respond depends on which part of us is speaking?" (14 / 5.2 s) · "In Transactional Analysis, these parts are called ego states." (9 / 3.1 s) · five names + tags (2.5 s each) · "Everyone speaks from all five." (5 / 2.7 s) |
| S6 Demo | 1:08–2:18 | Real product, 70 s (below) | captions below |
| S7 The river | 2:18–2:38 | Same two people and octopuses. Messages drift in from both sides into one slow current up the middle and sway with it; five soft colour ribbons weave and cross; octopuses dissolve between states (CP included) and sway; no pops, no shake, no pulses; slow pull-back | "Not a promise. A possibility." (5 / 5.5 s) |
| S8 See / Connect | 2:38–2:53 | Real My Reflection donut, 30 days → 7 days; shrinks to a point of light; network branches out: family, friends, colleagues | "See yourself more clearly." → "Connect with others more consciously." |
| S9 End card | 2:53–3:00 | Logo, line, CTA, URL, small disclaimer | "The world within us shapes the world between us." / CTA "Try it with a chat you keep replaying" / URL / "Mirror's observations are hypotheses, not diagnoses. Runs on Meta's Muse Spark model." |

Why these WHY lines: three voices (she / he / we) make it universal; the "my son" line was cut because a parent–child line next to Parent/Child states invites the confusion the couple story avoids.

### 3.1 The P/A/C diagram: removed (recommendation)
- **It needed theory to decode.** Lines from "P" to "C" mean nothing to a first-time viewer; the octopuses and the chat already carry the story.
- **It contradicted the five mascots.** Three nodes fold CP and NP into one "P" and FC and AC into one "C", while the film teaches five voices.
- **It competed for the eye** with the octopuses, the part the Founder wants to dominate.
- **Replacement:** each message is a coloured pulse from one person to the other, and the receiver recoils. Direction and impact read instantly. In the river there are no pulses, only a shared current: the contrast is now in the motion itself.
- TA structure still appears where it helps: one line in S5, and D4 only if E4 ships (§5).

### S6 demo beats (real footage in final ≈ 70 s + donut 7 s ≈ 77 s)
| Beat | Time | Real actions to record | Caption (words / hold) |
|---|---|---|---|
| D1 | 1:08–1:20 | **Match cut:** the motion chat becomes a neutral phone showing the same conversation → shutter flash → 3 screenshots fan out → InnerMirror "Upload screenshots" → the 3 images drop in → "Mirror is reading…" → extracted lines appear | "Snap the chat you keep replaying. Muse reads the screenshots." (10 / 5.7 s) |
| D2 | 1:20–1:28 | Review: every line with its speaker → "Which one is you?" → Alex · This is me → consent tick → "See what Mirror sees" | "Check every line. Tell Mirror which one is you." (9 / 4.7 s) |
| D3 | 1:28–1:43 | What Mirror sees: Replay with a mascot per message, one slow scroll; tap "k?? i said sorry" → state, confidence, quoted cues, "Why Mirror sees this" | Muse caption (14 / 5.7 s) → "A hypothesis about words. Never about a person." (8 / 5.9 s) |
| D4 | 1:43–1:51 | **E4 Interaction rhythm** if it passes the gate; else fallback (§5) | "(If E4 ships) See where the conversation crossed." |
| D5 | 1:51–2:00 | "k" → "Mirror can't see one clear ego state…" → **I'm not sure**; then #7 → Mirror sees one state, Alex chooses another, both stay visible | "“Not sure” is an answer too." (3.7 s) → "Mirror suggests. You decide." (3.9 s) |
| D6 | 2:00–2:13 | What if? on #7 → "What if you'd answered differently?" → Adult → Explore → (wait cut, labelled "sped up") → Jordan's earlier states, ≤ 2 possibilities with cited words, "One possible interaction, not a prediction." | Muse caption (11 / 4.5 s) → "It writes no lines. It predicts nothing." (7 / 4.2 s) |
| D7 | 2:13–2:18 | Continue to My Reflection → cloud for Alex's turns → Save → "Saved in this browser" | "Your reflection stays on your device." (6 / 4.4 s) |

Left out: Direction, story/mic input, paste (screenshots are the hero input by Founder decision), dark mode, VI, safety flow.

## 4. Readability (no voiceover)
- Rule: ≥ 0.3 s per word + 1 s. Every card and caption in §3 now meets it, including the five voices (2.5 s each).
- Demo captions only over still UI; final recordings at 2× DPR so the panel can be zoomed and the rest dimmed.
- Test the rough cut on one person who hasn't seen the app: can they say what it does in one sentence?

## 5. E4 Interaction rhythm
- **Gate for real footage (all):** implemented; unit + e2e pass; stable on the chosen conversation across 3 live runs; Founder approves. **Cut-off: feature freeze, Nov 3 18:00 ICT.**
- Product decision if E4 is built: the film no longer teaches a P/A/C diagram, so an E4 that draws P/A/C lines would be the only place viewers meet it. Worth considering a simpler E4 view (who answered whom, in which state) rather than the classic diagram.
- **Fallback A (default):** D4's 8 s go to D3, showing Mirror's "shifts" (real Muse output, same live take). **Fallback B:** D6 gets 8 s more.
- Never a mock or the motion pulses presented as an app feature; motion keeps its "Illustration" tag.

## 5.1 Real footage plan (Phase C, after approval)
- **Yes, real app, real Muse.** Local production build of the current code (`next build` + `next start`), EN, light theme, 1280 × 800 at 2× DPR. Every observation, What if? and extraction on screen is the live Muse output of that take, unedited. If a beat doesn't happen (e.g. "k" is not read as unclear), the beat follows the output or we retake; we never patch text.
- **Flow, in order:** upload the 3 synthetic screenshots → live extract → Review (This is me) → consent → live analysis → What Mirror sees → my interpretation (Not sure + a different choice) → What if? (live) → Save → My Reflection. The donut needs history: before the take, seed My Reflection with a few synthetic saved conversations in localStorage (labels only, no API, the same format the app saves).
- **Can Claude drive it?** Yes, with the existing CDP driver (`scripts/e2e/cdp.mjs`): it already uploads screenshots and runs live journeys (`live-uat.mjs` journey C). Capture = CDP screencast frames → Remotion sequences them into S6. Not tested yet for smoothness; first step in Phase C is a $0 dry run against mocked `/api/*` to check frame rate and timing. **Fallback:** the Founder records the same scripted run with QuickTime (macOS screen recording needs a permission I should not change).
- Headless Chrome has no visible cursor: tap rings are added in the edit at the clicked positions (a presentation layer, not product content). Waits are cut and labelled "sped up".
- **Spend guard:** server started with `APP_SPEND_CAP_USD=0.15`, so the app itself refuses calls past the approved budget. Ledger + Meta console checked before and after; report live vs mocked.

## 6. Music and sound (Founder sources; placeholders until then)
| Scene | Mood | BPM | Music keywords | SFX keywords |
|---|---|---|---|---|
| S1 | intimate, late night | free | ambient room tone, minimal piano drone | phone keyboard taps, delete taps, message send pop, reverse whoosh |
| S2 | warm → tense → storm | 70 → 140 | tension build, pulsing staccato strings, ticking, dissonant cluster, storm | fast typing, notification pings stacking, whoosh per pulse, soft impact per recoil, subtle heartbeat |
| S3 | impact → void | — | sub drop, cinematic boom | collision hit, true silence, typing-indicator tick |
| S4–S5 | reflective, curious | 60–70 | felt piano, solo piano, hopeful minimal | soft chime per mascot (5 pitches), shimmer |
| S6 | calm, confident | 85–95 | light electronic, gentle pluck, minimal | camera shutter (D1), very soft UI taps, swipe |
| S7 | flowing, river, orchestral | 90–100 steady | flowing strings, harp arpeggio, legato, river, water ambience | low water flow, soft swells as ribbons cross; no pings |
| S8–S9 | open, warm, resolving | 90–100 → rubato | emotional strings swell, resolving chord | final soft send pop |

**Sync points:** 0:04.3 send pop · 0:05 rewind · 0:06 S2 downbeat · 0:21.3 rush starts · 0:24.5 both Critical Parent · **0:28.0 BOOM (collision)** · 0:28.2–0:30 silence · 0:39.6 inward line on a single piano note · 0:43 "What if…?" downbeat · 0:44.5 bridge line · 0:49.7 TA line · 0:52.8 / 0:55.3 / 0:57.8 / 1:00.3 / 1:02.8 mascot chimes · 1:05.3 row · 1:09.5 shutter flash · **2:18 river downbeat** · 2:26 "Not a promise" · 2:33.5 pull-back · 2:41.6 donut toggle · 2:45 shrink · 2:46 network swell · 2:53 end card · final chord out by 3:00.

## 7. Assets
| Asset | Current | Need |
|---|---|---|
| Mascot sources `design/brand/mascots/source/*.png` | 1024², transparent | Enough for the animatic and 1080p up to ~900 px tall. At the BOOM the octopuses reach ≈ 1000 px, right at the source size; for crisp S2/S3 and S5 close-ups: **2048² transparent PNG or SVG**, same canvas/crop for all five. |
| Mascot badges `badge/*-128` | 128², transparent | enough for avatars |
| Logo `public/brand/logo.png` | 810 × 232, **no alpha** | **SVG** or ≥ 2400 px transparent PNG, light + dark versions (D2) |
| App mark `public/brand/app-mark.png` | 126², transparent | 1024² transparent or SVG |
| Synthetic screenshots (D1) | mock in animatic | 3 PNG phone screenshots of the chosen chat, neutral messenger look (no real app's look or name). Build from an HTML page in Phase C |
| Donut data (S8) | demo values | seed My Reflection with synthetic saved conversations in localStorage (no API) before recording |
| Music, SFX | — | Founder |

## 8. Production (Phase C, after Founder approval)
- **Tooling:** Remotion in `design/film/` (approved). Final MP4 needs `@remotion/renderer` or the Remotion CLI (adds Chromium download), installed only in Phase C.
- **Live take:** 1 extract (3 images) + 1 analysis + 1 What if? ≈ $0.05; **budget $0.15 = 3 takes max**. Check ledger and Meta console first. Project spend ≈ $4.86 of $6.
- **Recording:** local prod build, light theme, EN, 1280 × 800 at 2× DPR; Playwright/CDP script so takes are repeatable.
- **Schedule vs internal submit (Nov 4, 22:00 ICT):** Nov 2 Founder picks conversation + reviews animatic → Nov 2–3 live take, recording, synthetic screenshots, donut seed → Nov 3 18:00 E4 gate → Nov 3–4 swap mocks for footage, motion polish, music → Nov 4 render + check.
- **Cut order if behind:** S8 network → simpler; per-instrument music → one track; S5 orbit → static row; D4 → fallback A.

## 9. Risks
1. **Time**: the film competes with UAT fixes, Preview and Q15 before Nov 4.
2. Live output differs from the placeholder states → motion is regenerated from real states (data-driven in `story.ts`, cheap).
3. E4 misses the gate → fallback A.
4. Captions over-claim Muse → only §1 wording.
5. Asset resolution and logo matte → visible in close-ups until §7 assets arrive.
6. Music licence → Founder keeps the licence with the project.

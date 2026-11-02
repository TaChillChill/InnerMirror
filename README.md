# InnerMirror

**See yourself more clearly through your everyday conversations.**

> **AI observes. Humans interpret. Awareness creates choice.**

Live app: **https://innermirror-flame.vercel.app** · Built for the Meta Global AI Developer Hackathon 2026 on Meta's Muse Spark model.

---

## 1. What is InnerMirror?
InnerMirror is a web app for self-reflection. You bring a conversation you keep replaying (pasted text, a retold story, or up to 5 chat screenshots). **Mirror**, the app's AI observer, suggests which *ego state* each message may have come from, quotes the words that suggest it, and says how sure it is. You then decide what fits your own experience, explore how a different reply might have landed, and keep a private record of your own patterns over time.

Ego states come from Transactional Analysis (TA). InnerMirror uses the five functional ego states, each shown by its own octopus mascot:

| Critical Parent | Nurturing Parent | Adult | Free Child | Adapted Child |
|---|---|---|---|---|
| sets rules and limits | cares and protects | weighs facts and options | expresses feelings and wants | adjusts to others' expectations |

InnerMirror is **not** a diagnostic tool, a therapy service, or a judge of who is right. Every observation is a hypothesis about words, never a verdict about a person.

## 2. The problem we're solving
Most of us have had "the same fight" more than once. Afterwards we replay the other person's words and ask *why do they always…?* It is much harder to notice our own part: the tone we reach for under pressure, the reply we send before we've thought.

Self-awareness tools usually ask you to describe yourself in the abstract. InnerMirror starts from what you actually said, in a real-feeling moment, and gives you a calm, structured way to look at it. Seeing *which part of you was speaking* is the first step to having a choice next time.

## 3. How InnerMirror works
```
Conversation  →  What Mirror sees  →  My interpretation  →  My Reflection
                 (AI observation)      (you decide)          (saved on your device)
                        ↓
                    What if?  (optional: how might the other person respond?)
```
1. **Conversation.** Paste a chat, retell it as a story (type or speak), or upload up to 5 screenshots. Screenshots are read into text, then you **review every line**: fix text, merge or rename speakers, and pick which person is you.
2. **What Mirror sees.** Muse suggests an ego state for each message, with quoted cues, a confidence level, sometimes an alternative reading, and notes where the conversation shifted. When the words don't support one clear reading, Mirror says so.
3. **My interpretation.** For your own messages you choose the state that fits, or **"I'm not sure"**. Mirror's suggestion and your choice stay side by side; the AI never pre-selects or overwrites your answer.
4. **What if?** Pick a message and an ego state it could have come from. Muse looks at the other person's *earlier* messages and returns up to two states they might plausibly answer from, citing their words. It writes no replies and predicts nothing.
5. **My Reflection.** Save to your browser. A cloud and a donut chart show which states your messages came from over 7 days, 30 days, or all time.

## 4. Key features
- **Three inputs:** paste, story (with optional browser dictation), or up to **5 screenshots** with OCR and a full review step.
- **Per-message observations** with quoted evidence, confidence, alternatives and shifts. Uncertainty is always visible.
- **Separate layers:** AI observation, your interpretation and your saved reflection are kept apart in the UI and in the data.
- **What if? (Scenario Explorer):** evidence-based possibilities for how the other person might respond, never generated messages.
- **Long conversations:** up to 40 turns per analysis; for longer chats you choose which part to look at, and nothing is cut silently.
- **Safety path:** when a conversation mentions self-harm, threats, abuse or coercion, InnerMirror points to support, does not suggest ego states or alternative replies there, and turns off What if?. A reviewed phrase list backs up the model.
- **Sample mode:** a made-up conversation with a saved real result, so you can try the flow without sending anything.
- **English and Vietnamese**, light and dark themes (dark by default), mobile-first layout.

## 5. How we use Meta Muse / the Meta Model API
All model calls go from our server to the Meta Model API (`https://api.meta.ai/v1/chat/completions`, OpenAI-compatible) with the **Standard** model **`muse-spark-1.3`**. We never use `-contributor` variants. Every call uses strict **structured output** (`response_format: json_schema`), and every response is validated with zod before the UI sees it; one retry on invalid output.

| Route | What Muse does | Settings |
|---|---|---|
| `POST /api/extract` | **Vision / OCR.** Reads up to 3 screenshots per request (the browser sends 5 in two parts) and returns lines, speakers, sides and flags for cut-off bubbles. Transcribes only, never interprets. Overlapping screenshots are merged in code. | `reasoning_effort: low` |
| `POST /api/analyze` | **Observation.** Reads the reviewed conversation and returns, per message, a suggested ego state, exact quoted cues, a rationale, confidence, an optional alternative, shifts, a summary, an uncertainty note and a safety flag. Speaker-blind: names are replaced by neutral labels and the model is not told which person is the user. | `reasoning_effort: low` |
| `POST /api/scenario` | **What if?** Given the conversation *up to* the explored message, returns up to two states the receiver might answer from, each tied to quotes from the receiver's earlier messages, plus a reflection question. If the receiver has no earlier message, the app answers locally without a model call. | `reasoning_effort: medium` |

Done in code, not by the model: the screenshot overlap merge, the story parser (narration vs dialogue), turn grouping, confidence caps, the safety backstop, the direction table, and all charts.

## 6. Architecture and technology stack
- **Next.js 16 (App Router) + React 19 + TypeScript** on **Vercel** (Node.js runtime).
- **zod** for request and response validation. No database, no accounts, no state or chart libraries.
- **Browser:** screenshots are resized and compressed to JPEG in a canvas; reflections live in `localStorage`; dictation uses the browser's own speech service.
- **Server:** three stateless route handlers. The API key exists only on the server.
- **Protection:** Vercel Firewall rate limit on `/api/*` (10 requests / 60 s per IP), in-app rate limits per IP (8 analyses and 30 screenshots per 10 minutes, 20 What if? calls), a per-instance spend cap (`APP_SPEND_CAP_USD`), request size and length limits, and route time budgets.
- **Analytics:** Vercel Web Analytics on Production only, page views only, no cookies, query and hash stripped.

```
src/app/            pages and API routes (extract, analyze, scenario)
src/components/     UI (React client components)
src/lib/ai/         Meta client, prompt specs, JSON schemas, output validation
src/lib/            parsing, screenshot merge, safety backstop, local storage, i18n
scripts/e2e/        browser end-to-end checks (all /api/* mocked)
scripts/phase0/     prompt evaluation harness and its results (synthetic data only)
docs/               product, theory, architecture, privacy and release notes
design/             brand assets, prototypes, demo film source
```

## 7. Installation and local setup
Requires **Node.js 24+** and a Meta Model API key.
```bash
npm install
cp .env.example .env.local     # add your META_API_KEY; never commit it
npm run dev                    # http://localhost:3000
```
Checks:
```bash
npm test && npm run lint && npm run typecheck && npm run build
# Browser e2e (needs Google Chrome; every /api/* request is mocked, so it costs nothing):
META_API_KEY= npx next start -p 3123 &
sh scripts/e2e/run-all.sh
```
Without a key the app still runs; the **sample conversation** works offline, and live features return a clear error. Each live analysis costs about $0.02 and takes 10–40 s.

## 8. Environment variables
| Variable | Required | Purpose |
|---|---|---|
| `META_API_KEY` | yes (for live calls) | Meta Model API key. Server-side only; never prefix with `NEXT_PUBLIC_`. |
| `APP_SPEND_CAP_USD` | no (default `1`) | Spend guard per server process. Calls that could exceed it are refused. Resets on restart, so it is a guard, not accounting. |
| `ANALYZE_EFFORT` | no (default `low`) | `low` or `medium` reasoning effort for `/api/analyze`. |
| `ACCESS_CODE` | no | If set, the API requires this code in an `x-access-code` header. The UI does not send it yet, so leave it empty for normal use. |

## 9. Privacy, safety and limitations
**Privacy**
- Our server passes the conversation to Meta and returns the result. It **does not save or log conversation text or screenshots**; logs contain only metadata (status, latency, token counts, cost, sizes).
- Names you type stay in your browser; the model sees neutral labels. Names *visible inside a screenshot* or written inside messages do reach the model, so the app suggests cropping.
- Saved reflections stay in your browser: ego-state labels, your choices, a title and your note. Never the messages, screenshots, the AI's explanations or What if? results.
- Meta processes requests under its own terms and states that content sent to this model is not used for training. Meta does not publish a retention period.
- Full policy: [/privacy](https://innermirror-flame.vercel.app/privacy). For people 18 and older.

**Safety**
- Observations attach to *messages*, never to people. The app never infers health, mental-health conditions, identity or motives of other participants as fact.
- On signs of abuse, coercion, threats or self-harm: no victim-blaming readings, no alternative-reply exploration, and a pointer to local emergency services and trusted people.

**Limitations (honest)**
- Readings are model hypotheses grounded in TA theory, not a clinically validated assessment. The same message can be read differently on another run, especially short or ambiguous ones.
- OCR can misread Vietnamese diacritics and overlapping screenshots can occasionally leave a duplicate line; the review step is there to catch this.
- One analysis covers at most 40 turns (80 messages, 20,000 characters).
- Reflections are not synced or backed up; clearing browser data deletes them.
- Tested on desktop Chrome and emulated mobile viewports; not yet on a wide range of real devices.

## 10. Live demo
- **App:** https://innermirror-flame.vercel.app (open; no account needed; try "See a sample conversation" first to send nothing)
- **Demo video:** *link added at submission*

## 11. Hackathon information
- **Event:** Meta Global AI Developer Hackathon 2026
- **Track:** Indie
- **Team:** HeoCoin Family (solo founder)
- **Meta technology:** Meta Model API, Muse Spark (`muse-spark-1.3`) for vision OCR, conversation observation and the Scenario Explorer.
- **Theory sources:** Eric Berne's Parent–Adult–Child model and the later functional five-state model; product hypotheses are kept separate. See [`docs/THEORY_FOUNDATION.md`](docs/THEORY_FOUNDATION.md).

## License and assets
No open-source license is granted at this time: all rights reserved. The code is published for hackathon review. The octopus mascots, logo and app icon are brand assets of HeoCoin Family and may not be reused. Nunito is used under the SIL Open Font License. "Meta" and "Muse" are named only to describe the model this project runs on; InnerMirror is not affiliated with or endorsed by Meta.

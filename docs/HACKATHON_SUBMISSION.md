# Hackathon submission — copy-ready text

Status: **draft for Founder review, 2026-11-02.** English answers for the Meta Global AI Developer Hackathon form. Every claim below is checked against the code (`src/lib/ai/`, `src/app/api/`) and `docs/RELEASE_READINESS.md`. Before pasting: check each field's character limit in the form, and fill the demo video placeholder.

| Field | Value |
|---|---|
| Project name | InnerMirror |
| Tagline | See yourself more clearly through your everyday conversations. |
| Live app | https://innermirror-flame.vercel.app |
| Repository | https://github.com/TaChillChill/InnerMirror |
| Demo video | [link] |
| Track | Indie |
| Meta model | Muse Spark, Standard tier (`muse-spark-1.3`), via the Meta Model API |

---

## A. Describe your use of Meta products to build the submitted project.

InnerMirror runs on Meta's Muse Spark model (`muse-spark-1.3`, Standard tier) through the Meta Model API's OpenAI-compatible Chat Completions endpoint. All calls are made server-side from three Next.js routes; the API key never reaches the browser. Every call uses strict structured output (`json_schema`), and every response is validated with zod before the app uses it.

1. **Screenshot reading (`/api/extract`, vision).** Users can upload up to 5 chat screenshots. Muse reads them (up to 3 per request) and returns each line's text, speaker, side and flags for cut-off bubbles. It only transcribes; it does not interpret. Our code merges overlapping screenshots, and the user reviews and corrects every line before anything is analyzed.
2. **AI Observation (`/api/analyze`).** Muse reads the reviewed conversation (pasted, retold, or extracted) and suggests an ego state for each message from Transactional Analysis (Critical Parent, Nurturing Parent, Adult, Free Child, Adapted Child). For each one it quotes the exact words it relies on, explains the reading, gives a confidence level and sometimes an alternative, and notes shifts, uncertainty and a safety flag. The model is speaker-blind: names are replaced with neutral labels and it is not told which person is the user.
3. **Scenario Explorer (`/api/scenario`, "What if?").** The user picks a message and an ego state it could have come from. Muse looks only at the conversation up to that point and returns up to two states the other person might plausibly respond from, each tied to quotes from that person's earlier messages. It writes no replies and makes no predictions.

We used Muse in English and Vietnamese, with low reasoning effort for OCR and observation and medium for the Scenario Explorer. We built an evaluation harness on synthetic conversations to tune the prompts and schemas.

## B. Why are Meta's models important to your solution?

InnerMirror's value depends on reading a conversation the way a thoughtful person would: in context, not message by message. The same "k" can be a neutral reply, a withdrawal, or a jab, depending on what came before. Muse Spark lets us ask for that contextual reading while keeping it accountable: every suggestion has to point to the exact words that support it, state its confidence, and admit when the words don't support one clear reading.

Three capabilities matter most:

- **Context-aware reading of communication cues.** Muse can pick up register, likely sarcasm, short replies, apologies that aren't quite apologies, and how one turn answers another. That is the material ego-state observation is built from.
- **Vision and structured output in one model.** The same model reads chat screenshots in English and Vietnamese and returns strictly structured JSON, so a screenshot can become a reviewable transcript without a separate OCR service.
- **Grounded exploration of possible interactions.** For "What if?", Muse reasons over the other person's earlier messages to suggest how they might plausibly respond to a different tone, citing evidence instead of inventing dialogue.

Our design principle is "AI observes, humans interpret". Muse provides the careful first observation; the user stays the authority on what it meant. Muse's structured, evidence-quoting output is what makes that separation possible.

## C. Partner technologies feedback

> **Founder check before pasting:** answer only for technologies on the official partner list (Q15). We used exactly two external platforms: the Meta Model API and Vercel. If Vercel is not a listed partner, keep only the Meta paragraph or answer "Not applicable".

**Meta Model API (Muse Spark).** The OpenAI-compatible endpoint made integration simple: plain `fetch`, no SDK. Strict `json_schema` output was reliable once our schemas fit the documented subset (object root, all keys required, no `oneOf`). Combining image input with a strict schema worked in one call, although the docs have no example of it. Vietnamese diacritics are sometimes misread in screenshots, so our review step stays essential. Suggestions: document how image input is tokenized, since we had to estimate it for our spend guard; publish a default data-retention period; and offer a self-serve spend cap or budget alert, because a public demo needs a hard ceiling. Typical latency was 10–40 s per analysis, so streaming with structured output would help interactive apps.

**Vercel.** Hosting, Deployment Protection, a Firewall rate-limit rule on our API routes, and cookieless Web Analytics took minutes to set up without new infrastructure. The 4.5 MB function request limit shaped our design: the browser compresses screenshots and sends them in batches of three. Deployment Protection let us keep previews private while opening only the production domain.

## D. Project description

**Short (≈ 50 words)**
InnerMirror helps you see yourself more clearly through your everyday conversations. Paste a chat or upload screenshots; Meta's Muse Spark suggests which ego state each message may have come from, quoting its evidence. You decide what fits, explore how a different reply might land, and keep a private reflection. AI observes. Humans interpret.

**Full (≈ 220 words)**
We all replay conversations that went wrong, and we usually ask why the *other* person acted that way. InnerMirror turns the question around, gently: which part of me was speaking?

You bring a conversation: paste it, retell it, or upload up to five chat screenshots, which Muse Spark reads into text for you to review. Mirror, the app's AI observer, then suggests an ego state for each message, drawn from Transactional Analysis: Critical Parent, Nurturing Parent, Adult, Free Child, or Adapted Child, each shown by its own octopus character. Every suggestion quotes the words behind it, shows how sure Mirror is, and says so when the words are unclear.

Then it's your turn. For your own messages, you choose the reading that fits, or "I'm not sure". Mirror's view and yours stay side by side; the AI never overwrites you. With "What if?", you can explore how the other person might respond if you had spoken from a different state, based only on their earlier words. Nothing is scripted and nothing is predicted.

Your reflections stay in your own browser and build a picture of your patterns over time. Our server stores no conversations.

InnerMirror is not a diagnosis or therapy. It is a mirror: **AI observes. Humans interpret. Awareness creates choice.** Available in English and Vietnamese.

---

## Pre-submit checklist
- [ ] Q15 rules checked: repo visibility, video length, Meta model requirement, pre-existing work, Indie eligibility, partner list.
- [x] Repository public: https://github.com/TaChillChill/InnerMirror (2026-11-02, after the history audit and the email rewrite).
- [ ] Demo video uploaded and linked here and in `README.md` §10.
- [ ] Character limits of each form field checked.
- [ ] Meta console: credits remaining before judging opens.
- [ ] Submitted; confirmation saved.

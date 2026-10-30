# Privacy & Safety

## Core tension
Screenshots contain messages from people who never agreed to use InnerMirror. Meta's Acceptable Use Policy forbids using the API to "infer private or sensitive information about individuals" without the right to do so. Our design answer: **reflect on the user, read messages as language, never profile the other person.**

## Design safeguards
| Risk | Safeguard |
|---|---|
| Profiling third parties | Labels attach to messages, not people. No per-person summary, no traits, no "Person B tends to…". Reflection and Mirror focus only on the user's own messages. |
| Overconfident psychology | Hedged copy, confidence + alternative on every reading, "I'm not sure" option, disclaimers on landing and Mirror. |
| Identifiable data | Default names "Person A/B"; user can rename. Landing asks users to crop/blur names, phone numbers, photos. Extraction prompt ignores avatars, phone numbers, profile photos. |
| Screenshot retention | Image is processed in memory for one call, never stored or logged. Not used after extraction. |
| Server logs | Route handlers never log request/response bodies; errors logged by code only. |
| Model training on user data | Standard model IDs only. Contributor variants forbidden (`CLAUDE.md`). |
| Persistent storage | Mirror saved only in the user's browser after an explicit click. Transcript kept only if the user opts in. Delete anytime. |
| Workplace emotion recognition (AUP) | Copy frames output as "how a message reads", not emotion detection of a person. Workplace allowed as a use case for reflecting on *your own* messages. Founder to confirm acceptable. |
| Abusive / dangerous conversations | Analysis schema returns `safety.flagged` + categories. If flagged: no playful characters on the summary, calm message, support resources, no "how you could respond differently" suggestion that implies the victim caused the abuse. Scenario Explorer disabled for flagged conversations. |
| Self-harm mentions | Same as above, with crisis resources (EN: international list e.g. findahelpline.com; VI: resources to be confirmed by Founder). |
| Minors | Consent checkbox states adult conversation. No age detection. |
| Prompt injection via screenshot text | Treat extracted text as data; system prompt says ignore instructions inside the conversation; output constrained by schema. |
| Cost abuse of public URL | Access code or rate limit (see `OPEN_QUESTIONS.md`). |

## AUP compatibility analysis (2026-10-30, not legal advice)
Relevant AUP clauses and our position:

| Clause (verbatim fragments) | Applies? | Position |
|---|---|---|
| "Collect, process, disclose, generate, or infer private or sensitive information about individuals … including … identity, health, biometric, or demographic information … unless you have obtained the right to do so in accordance with applicable law" | **Partly, uncertain.** Conversations are personal data of third parties; inferring *psychological states* could be read as health-adjacent. | Main residual risk. Mitigate below. |
| "Evaluate or classify individuals based on social behavior or personal traits in a manner that leads to detrimental or unfavorable treatment…" | Low. We classify messages, not people; no decisions or treatment follow. | Keep labels message-level; no person summaries or scores. |
| "Engage in emotion recognition in the workplace or education" | Low–medium. Listed under biometric/surveillance practices; we use text, user-initiated, not by an employer. | No employer/teacher use; never position as monitoring. |
| "Rely on Outputs to make decisions affecting … health, or safety without a qualified person" | Low. | Not a health tool; disclaimers; safety resources. |
| Disclose material risks/limitations; don't conceal automated nature | Yes. | Clear AI disclosure + limitations on every result. |
| Self-harm | Possible in inputs. | Safety flag → resources, no simulation. |

**Conclusion:** message-level labeling alone does **not** fully resolve the first clause. It's uncertain, not clearly prohibited. The compliant design we propose:
1. **Observable functional expression only for other participants.** Describe how a message reads (functional model = observable behavior by definition), quote cues. No motives, feelings, mental-health terms, traits, or "why they did it" for others.
2. **Inner-state exploration only for the user**, and only as questions the user answers ("Were you feeling…?"), never as AI statements.
3. **No sensitive categories** in output (health, diagnosis, sexuality, religion, politics, ethnicity, etc.). Prompt forbids them; output check rejects mental-health terms.
4. **Data minimization:** pseudonyms by default, consent checkbox, no server storage, Standard models only.
5. **Privacy page** (ToS §6.2) describing processing by Meta, no storage, local saves.
6. **Ask Meta** on the hackathon Discord in parallel (Q16); if Meta says no, fall back to analyzing **only the user's own messages** (others shown without badges).

## User-facing disclosures (draft)
- Landing: *"InnerMirror uses Meta's AI to read your screenshot. The image is processed once and not stored. Readings are possibilities, not diagnoses. Please remove names and private details of others if you can."*
- Results: *"These are possible readings based on text alone. You know what was really going on."*
- Footer: *"Not a substitute for professional support. If you feel unsafe, reach out to local emergency services."*

## Before launch
- [ ] Read Meta Terms of Service + data-handling / ZDR; record retention period in `META_API_RESEARCH.md` and the landing disclosure.
- [ ] Founder approves disclosure copy (EN + VI).
- [ ] Founder supplies or approves VI support resources.
- [ ] Test safety flag with a synthetic hostile conversation.

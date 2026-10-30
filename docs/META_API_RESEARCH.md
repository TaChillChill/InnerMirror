# Meta Model API Research

Researched 2026-10-30 from public docs at dev.meta.ai. **No live API call has been made.** Re-verify before relying on any number.

## Verified from official docs
| Topic | Finding | Source |
|---|---|---|
| Base URL | `https://api.meta.ai/v1` | dev.meta.ai blog "Build with Muse Spark", vision cookbook |
| Formats | OpenAI-compatible **Chat Completions** and **Responses**; Anthropic-compatible **Messages** | blog |
| Auth | API key from dev.meta.ai, sent as bearer key | blog |
| Text models | `muse-spark-1.3`, `1.2`, `1.1` (Standard); `muse-wonder-1.0` (preview) | /docs/models |
| Context | 1,048,576 tokens (Spark 1.1–1.3, Wonder) | /docs/models |
| Image input | Spark: text, image, video, audio, PDF in → text out. `image_url` content part, base64 data URL or public URL. Formats jpeg/png/gif/webp. 50 MB inline limit. ~50 images/request guideline. Token cost scales with resolution. | /docs/cookbook/vision-input |
| Structured output | `response_format: {type: "json_schema", json_schema: {...}}` (Chat Completions) or `text.format` (Responses). Constrained decoding. Strict subset: object root, `additionalProperties: false`, all keys required, no `allOf`/`oneOf`, no recursion, depth ≤ 10. Lists image understanding as compatible, but no image + schema example. | /docs/structured-output |
| Reasoning control | `reasoning_effort`: `minimal` … `xhigh`. Reasoning tokens billed as output. | blog |
| Muse Image | `muse-image-1.0`: text+image in → image out; generation + editing; `/v1/images/generations`, `/v1/images/edits`, or Responses for multi-turn | /docs/models |
| Pricing | Spark Standard: $1.25 in / $4.25 out per 1M tokens ($0.15 cached in). Muse Image: $0.01 per image. | /docs/pricing-rate-limits |
| Rate limits | Spark Standard: 3,000 RPM / 4M TPM per team per model. Muse Image: 150 RPM. | /docs/pricing-rate-limits |
| **Contributor mode** | `-contributor` variants are ~10× cheaper but **content may be used to train Meta models**. Standard: "your content is not used to train Meta models." → **We use Standard only.** | /docs/models |
| Availability | Public preview; blog says "available to developers in the US". Help center: "most countries and territories where Meta AI is available and billing is supported", governed by a Geographic Use Policy. | blog, /help |

## Re-check before Phase 1 (2026-10-30, docs only, still no live call)
| Topic | Finding |
|---|---|
| New model | `muse-wonder-1.0` (**preview**, Standard only): text/image/video/audio/PDF in, text out; reasoning `minimal`…`max`; structured output. Price **$4 in / $20 out** per 1M (3.2× / 4.7× Spark). Same 3,000 RPM / 4M TPM. |
| Spark 1.3 | "Recommended for new work"; image/video understanding, structured output, all reasoning levels incl. `max`. Prices unchanged. |
| Images | jpeg/png/gif/webp; 50 MB inline; `image_url` in `user` messages only (system/developer → HTTP 400). Token cost "scales with resolution", method undocumented; `POST /v1/responses/input_tokens` measures it. No documented image + `json_schema` example. |
| Data Commitments | Standard: content not used for training. Meta "may use Content for evaluation, safety, abuse, quality, and policy review". Retention "as described in the Terms and Privacy Policy" — **no period stated**. "You can view and delete your Content through your Account." |
| Not documented | Spend limits, credits, input-image tokenization, ZDR on the pricing/commitments pages. |

**Recommendation:** `muse-spark-1.3` for analyze, extract and What if?. Wonder only as a one-off comparison on 1–2 eval conversations (preview + ~4× cost); switch only if it is clearly better on our rubric.

## Legal findings (read 2026-10-30, dev.meta.ai/legal)
| Topic | Finding |
|---|---|
| **Geographic Use Policy** | Blocklist of Restricted Territories (Afghanistan, Belarus, Cambodia, China incl. HK/Macau, Cuba, Eritrea, Ethiopia, Haiti, Iran, Iraq, Libya, Myanmar, Nicaragua, North Korea, Pakistan, Russia, Somalia, Syria, Crimea/Donetsk/Luhansk, Venezuela, Western Sahara). **Vietnam is not listed.** §2.1: access only "in jurisdictions where Meta has enabled access" → confirmed in practice by a successful call. Also must not knowingly serve end users in restricted territories. Muse Image restricted in India. |
| Data Commitments | Standard: "Meta does not use your Content from Standard Services to train Meta Models." Content may be processed to detect AUP violations. No retention period stated (refers to Terms/Privacy Policy). |
| Retention / ZDR | ZDR exists for qualified org accounts via sales approval (not realistic for hackathon). Flagged requests may be retained up to 2 years. Default retention: unspecified ("as needed", ToS §4.4). → Disclose to users that Meta may retain content as described in its terms. |
| ToS §6.2 | **Must provide and follow a privacy policy** for the integrated product. Personal/sensitive info must not go to Contributor Services. |
| ToS §4.1/§16.2 | Developer warrants it has the rights required under data protection law for Inputs. |
| ToS §7 | No trademark license; neither party may use the other's names or marks. → Don't brand with Meta marks; factual "Built with Meta Model API" wording only if Official Rules allow. |
| ToS §13.2 | Meta sets spending limits; no self-serve hard cap documented. |

## Not verified (open)
| Topic | Status |
|---|---|
| **API calls from Vietnam** | Phase 0 smoke test. |
| Hackathon credits | Founder confirms visible in console. |
| Official hackathon rules | Behind login; Founder to read (Q15). |
| Vision + json_schema in one call | Docs imply yes; must test. Fallback: plain JSON prompt + zod validation + retry. |
| OCR quality on chat screenshots (VI diacritics, bubbles, timestamps) | Unknown. Core risk, test on day 1. |
| Latency | Unknown. Affects UX (spinners vs streaming). |
| Muse Image content policy for characters | Unknown. Only P1. |

## Estimated cost per full session (rough)
Image ~1–3k input tokens + prompts ~3k + outputs ~3k (incl. reasoning) across 3 calls ≈ 10–15k tokens ≈ **$0.03–0.06 per session**. $150 credits cover development and judging comfortably if the public URL is protected from abuse.

## Policy findings that affect design (Acceptable Use Policy, dev.meta.ai/legal/acceptable-use-policy)
- Prohibits using the services to "collect, process, disclose, generate, or infer private or sensitive information about individuals" unless you have the right to under applicable law. **Most relevant risk for InnerMirror** → see `PRIVACY_SAFETY.md`.
- Prohibits "evaluate or classify individuals based on social behavior or personal traits" leading to detrimental treatment.
- Prohibits emotion recognition in workplace or education settings (except where permitted by law). Workplace chats are one of our use cases → framing matters.
- Self-harm content restrictions; outputs not to be relied on for health decisions without qualified review.
- Must disclose AI nature and known limitations to users.
- No rule found on Meta mascot or brand use; the AUP forbids implying third-party outputs are associated with Meta.

## Verification checklist (before feature coding)
- [ ] Founder: dev.meta.ai account works from Vietnam; API key created; hackathon credits visible.
- [ ] Founder: put key in `.env.local` (Claude never reads or prints it).
- [ ] Approve a **smoke-test budget** (proposed ≤ $1) and run: 1 text call, 1 vision call with a synthetic screenshot, 1 vision + `json_schema` call.
- [ ] Record: latency, token usage, schema adherence, VI diacritics accuracy.
- [ ] Read Terms of Service + data-handling / ZDR article; note retention period here.
- [ ] Read hackathon Official Rules (Cerebral Valley): Meta-model requirement, public repo?, video length, deployed URL, pre-existing code, brand use.
- [ ] (P1) 1 Muse Image call for a character draft.

## Sources
- https://dev.meta.ai/resources/blog/build-with-muse-spark/
- https://dev.meta.ai/docs/models
- https://dev.meta.ai/docs/cookbook/vision-input
- https://dev.meta.ai/docs/structured-output
- https://dev.meta.ai/docs/pricing-rate-limits
- https://dev.meta.ai/help
- https://dev.meta.ai/legal/acceptable-use-policy
- https://cerebralvalley.ai/e/meta-ai-developer-hackathon
- https://reconscribe.com/meta-global-ai-developer-hackathon-2026/ (third-party summary of rules)

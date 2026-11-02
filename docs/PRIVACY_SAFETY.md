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

## User-facing disclosures — proposed v3, awaiting Founder approval (F6, 2026-10-30)
Replaces earlier drafts. Written against actual behavior: Meta processes what is sent and may retain it (default retention unspecified; flagged content up to 2 years; Standard models: "Meta does not use your Content … to train Meta Models", `META_API_RESEARCH.md`); our server never stores or logs content; saved collections follow the no-text schema (F3) and **include unreviewed AI suggestions, marked as such**; localStorage is unencrypted, per browser, and can be evicted (e.g. Safari after ~7 days without a visit). Voice: "bạn" when the product speaks. "Meta's terms" links to dev.meta.ai/legal.

### A. Privacy summary (privacy page and "How your data is handled" sheet)
| # | Topic | EN | VI |
|---|---|---|---|
| A1 | What is sent to Meta | When you tap **Read my screenshot** or **Look at this conversation**, InnerMirror sends your screenshot or the conversation text to Meta's AI model so it can be read. A screenshot is sent as it is, including any names, photos or numbers visible in it, so crop them first if you can. When you use **What if?**, the conversation up to that message is sent again. | Khi bạn bấm **Đọc ảnh chụp** hoặc **Xem cuộc trò chuyện này**, InnerMirror gửi ảnh chụp màn hình hoặc nội dung cuộc trò chuyện đến mô hình AI của Meta để đọc. Ảnh được gửi nguyên vẹn, kể cả tên, ảnh đại diện hay số điện thoại có trong ảnh, nên nếu được, hãy cắt bỏ trước. Khi bạn dùng **What if?**, phần cuộc trò chuyện tính đến tin nhắn đó sẽ được gửi lại. |
| A2 | What Meta does with it | Meta processes it under its terms and may keep it for a period it decides. Meta states that content sent to this model is not used to train its models. | Meta xử lý nội dung theo điều khoản của họ và có thể lưu giữ trong một khoảng thời gian do Meta quyết định. Meta cho biết nội dung gửi đến mô hình này không được dùng để huấn luyện các mô hình của họ. |
| A3 | Our server | Our server only passes your conversation to Meta. It doesn't save or log the conversation. Our hosting provider keeps basic request records, such as time and IP address. | Máy chủ của chúng tôi chỉ chuyển cuộc trò chuyện của bạn đến Meta, không lưu và không ghi lại nội dung. Nhà cung cấp hosting lưu thông tin cơ bản về yêu cầu, như thời gian và địa chỉ IP. |
| A4 | What is stored on your device | Only when you tap **Save**: for each of your own messages, the character the AI suggested and your own choice. If you didn't review a message, its AI suggestion is saved too and stays marked "AI suggested". Also your title and note if you wrote them, the date, and which characters you tried in What if?. | Chỉ khi bạn bấm **Lưu**: với mỗi tin nhắn của bạn, nhân vật mà AI gợi ý và lựa chọn của chính bạn. Nếu bạn chưa xem lại một tin nhắn, gợi ý của AI cho tin nhắn đó cũng được lưu và vẫn được đánh dấu "AI gợi ý". Ngoài ra là tiêu đề và ghi chú nếu bạn có viết, ngày lưu, và những nhân vật bạn đã thử trong What if?. |
| A5 | Never saved by InnerMirror | The messages themselves, your screenshots, names other than those in a title, the AI's explanations, explored What-if scenarios, and anything about other people's messages. | Nội dung tin nhắn, ảnh chụp màn hình, tên (ngoài những tên có trong tiêu đề), phần giải thích của AI, các kịch bản What if? đã khám phá, và mọi thông tin về tin nhắn của người khác. |
| A6 | Where it's kept and its limits | Saved collections stay only in this browser on this device. There is no account and no backup. They are deleted if you clear your browsing data, they aren't available in private windows or on another browser or device, and some browsers (Safari, for example) may remove them if you don't open InnerMirror for about a week. They aren't encrypted, so anyone who uses this browser can open them. | Các bộ sưu tập đã lưu chỉ nằm trong trình duyệt này, trên thiết bị này. Không có tài khoản, không sao lưu. Chúng sẽ bị xoá nếu bạn xoá dữ liệu duyệt web, không xem được trong cửa sổ ẩn danh hay trên trình duyệt hoặc thiết bị khác, và một số trình duyệt (ví dụ Safari) có thể tự xoá nếu bạn không mở InnerMirror trong khoảng một tuần. Dữ liệu không được mã hoá, nên bất kỳ ai dùng trình duyệt này đều có thể mở. |
| A7 | Deleting | You can delete one collection or everything from My Mirror at any time. | Bạn có thể xoá từng bộ sưu tập hoặc xoá tất cả trong My Mirror bất cứ lúc nào. |
| A8 | Demo | The demo uses a made-up conversation and sends nothing anywhere. | Bản demo dùng một cuộc trò chuyện hư cấu và không gửi gì đi cả. |
| A9 | Visit statistics, no tracking | No accounts and no advertising trackers. On the live site, visits are counted with Vercel Web Analytics (cookieless; page, referrer, rough country/browser/device/OS only; never conversation content, names or ego states; nothing sensitive in URLs). | Xem `privacy.vi.ts`. |

### B. In-app notices (short forms of A)
| # | Where | EN | VI |
|---|---|---|---|
| B1 | Landing + Add, title | Your conversation stays yours | Cuộc trò chuyện vẫn là của bạn |
| B2 | Landing + Add, body | We don't keep your conversation. When you continue, it's sent to Meta's AI model to be read, and Meta may keep it as described in its terms. Nothing is saved on this device unless you tap Save. [How your data is handled] | Chúng tôi không lưu cuộc trò chuyện của bạn. Khi bạn tiếp tục, nội dung sẽ được gửi đến mô hình AI của Meta để đọc, và Meta có thể lưu giữ theo điều khoản của họ. Không có gì được lưu trên thiết bị này trừ khi bạn bấm Lưu. [Dữ liệu của bạn được xử lý thế nào] |
| B3 | Screenshot upload | We don't save your screenshots. They're sent to Meta's AI model as they are, including any names or photos in them, and are dropped from this page once you confirm the conversation. | Chúng tôi không lưu ảnh chụp màn hình của bạn. Ảnh được gửi nguyên vẹn đến mô hình AI của Meta, kể cả tên hay ảnh đại diện có trong ảnh, và được xoá khỏi trang này khi bạn xác nhận cuộc trò chuyện. |
| B4 | Screenshot tip | Tip: crop out names, phone numbers and profile photos if you can. | Mẹo: nếu được, hãy cắt bỏ tên, số điện thoại và ảnh đại diện. |
| B5 | Demo tag | Demo · fictional conversation · nothing is sent anywhere | Bản demo · cuộc trò chuyện hư cấu · không gửi đi đâu cả |
| B6 | My Mirror, "What gets saved?" | A4 + A5, then: "Where: only in this browser on this device. No account, no backup." | A4 + A5, sau đó: "Ở đâu: chỉ trong trình duyệt này, trên thiết bị này. Không có tài khoản, không sao lưu." |
| B7 | After Save | Saved in this browser. It stays when you close and reopen InnerMirror here, unless the browser clears it. | Đã lưu trong trình duyệt này. Dữ liệu vẫn còn khi bạn đóng và mở lại InnerMirror tại đây, trừ khi trình duyệt tự xoá. |
| B8 | My Mirror footer | A6 | A6 |
| B9 | Storage blocked | This browser isn't keeping saves. You may be in a private window or storage is blocked, so saved collections will disappear when you close the tab. | Trình duyệt này không giữ dữ liệu đã lưu. Có thể bạn đang dùng cửa sổ ẩn danh hoặc bộ nhớ bị chặn, nên các bộ sưu tập sẽ mất khi bạn đóng thẻ. |
| B10 | Saved collection sheet | The conversation text was never saved, so saved stickers can't be reopened or changed. Only these labels and your own words are kept. | Nội dung cuộc trò chuyện chưa bao giờ được lưu, nên không thể mở lại hay đổi các sticker đã lưu. Chỉ các nhãn này và lời của chính bạn được giữ lại. |
| B11 | Delete all (confirm) | Delete every saved collection from this browser? This can't be undone. | Xoá tất cả bộ sưu tập đã lưu trong trình duyệt này? Thao tác này không thể hoàn tác. |
| B12 | Results (unchanged) | These are possible readings based on text alone. You know what was really going on. | Đây là những cách đọc có thể có, chỉ dựa trên chữ viết. Bạn mới là người biết điều gì thật sự đã diễn ra. |
| B13 | Footer (unchanged) | Not a substitute for professional support. If you feel unsafe, reach out to local emergency services. | Không thay thế cho hỗ trợ chuyên môn. Nếu bạn cảm thấy không an toàn, hãy liên hệ dịch vụ khẩn cấp tại nơi bạn ở. |

Implementation notes the copy depends on: send pseudonymized participant labels (not display names) in analyze/What-if calls where possible; never log request bodies; no analytics scripts. If any of these change, the copy must change with them.

## Before launch
- [ ] Read Meta Terms of Service + data-handling / ZDR; record retention period in `META_API_RESEARCH.md` and the landing disclosure.
- [ ] Founder approves disclosure copy (EN + VI).
- [ ] Founder supplies or approves VI support resources.
- [ ] Test safety flag with a synthetic hostile conversation.

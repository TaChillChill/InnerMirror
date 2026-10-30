# 08-couple-vi-plural · muse-spark-1.3 @ medium · run 2

Synthetic. Vietnamese couple, outfit question with several plausible readings. Tests alternatives and low confidence.

latency 34543 ms · $0.0343 · usage {"completion_tokens":7409,"prompt_tokens":2257,"total_tokens":9666,"completion_tokens_details":{"reasoning_tokens":3983},"prompt_tokens_details":{"cached_tokens":0}}

## Readings
| id | speaker | text | expr | conf | alt | cues | rationale | second layer | reflection Q |
|---|---|---|---|---|---|---|---|---|---|
| m1 | Người A | Em định mặc bộ đó đi đám cưới à? | CP→C | medium | A: Cũng có thể chỉ là câu hỏi thông tin, muốn biết dự định của bạn. | Em định mặc bộ đó đi đám cưới à? | Câu hỏi về bộ đồ nghe như gợi ý chê nhẹ, rằng bộ đó không hợp. |  |  |
| m2 | Bạn (me) | Sao thế anh? | A→A | medium | AC: Cũng có thể nghe như hơi chùng xuống, chờ Người A nói tiếp. | Sao thế anh? | Câu hỏi ngắn này nghe như muốn nghe rõ ý của Người A. |  | Lúc đọc câu “Em định mặc bộ đó đi đám cưới à?”, bạn đã để ý tới chữ nào nhất trước khi hỏi lại? |
| m3 | Người A | Không sao, anh hỏi thôi. | AC→P | low | A: Cũng có thể chỉ là câu nói cho qua, muốn khép lại chuyện. | Không sao / hỏi thôi | Cụm “Không sao” kèm “hỏi thôi” nghe như rút lại câu trước, né nói tiếp. |  |  |
| m4 | Bạn (me) | Anh thấy không hợp thì cứ nói thẳng ra. | CP→C | medium | A: Cũng có thể nghe như gợi ý cùng bàn thẳng thắn cho dễ quyết. | cứ nói thẳng ra | Cụm “cứ nói thẳng ra” nghe như giục, muốn Người A nói rõ ý. |  | Câu “Không sao, anh hỏi thôi.” ngoài cách bạn đã hiểu lúc đó còn có thể hiểu theo cách nào khác? |
| m5 | Người A | Thì anh nghĩ bộ kia đẹp hơn. Nhưng em thích thì cứ mặc. | A→A | medium | CP: Cũng có thể cụm “cứ mặc” nghe như vừa chê vừa để bạn tự quyết. | bộ kia đẹp hơn / cứ mặc | Câu này nêu ý thích bộ khác nhưng vẫn để quyền chọn, nghe như đang bàn việc. | Cụm “cứ mặc” nghe như đồng ý trên mặt chữ, trong khi vế trước vẫn giữ ý chê bộ đang mặc. |  |
| m6 | Bạn (me) | Thôi được rồi, em thay. | AC→P | medium | A: Cũng có thể nghe như chốt phương án cho nhanh để đi tiếp. | Thôi được rồi / em thay | Câu ngắn đồng ý thay đồ nghe như chiều theo ý vừa rồi. |  | Ngay trước khi nhắn “Thôi được rồi, em thay”, bạn nhận thấy điều gì trong cơ thể hoặc trong suy nghĩ của mình? |

## Shifts
- m3: Lời nói chuyển từ hỏi về bộ đồ sang nói chỉ hỏi thôi. (Không sao / hỏi thôi)
- m4: Lời nói chuyển từ nói cho qua sang đề nghị nói thẳng. (cứ nói thẳng ra)
- m6: Lời nói chuyển từ bàn xem bộ nào hợp sang chốt là thay đồ. (Thôi được rồi / em thay)

## Exchanges (experimental)
| pair | vectors | pattern | note |
|---|---|---|---|
| m1→m2 | P→C / A→A | crossed | Câu hỏi về bộ đồ được đáp lại bằng câu hỏi làm rõ. |
| m2→m3 | A→A / C→P | crossed | Câu hỏi làm rõ được đáp lại bằng câu nói rút lại. |
| m3→m4 | C→P / P→C | complementary | Câu nói rút lại được đáp lại bằng đề nghị nói thẳng. |
| m4→m5 | P→C / A→A | crossed | Lời giục nói thẳng được đáp lại bằng ý kiến về bộ khác. |
| m5→m6 | A→A / C→P | crossed | Ý kiến để bạn tự chọn được đáp lại bằng câu đồng ý thay. |

## Summary
Cuộc trò chuyện bắt đầu bằng câu hỏi về bộ đồ, rồi qua lại giữa hỏi lại và nói cho qua. Sau khi bạn đề nghị nói thẳng, Người A nêu ý thích bộ khác và bạn chốt là sẽ thay.

## Uncertainty
Chữ viết không cho thấy giọng nói, nét mặt và chuyện trước đó giữa hai người. Cùng một câu có thể nghe khác hẳn tùy cách nói.

## Safety
```json
{"categories":[],"flagged":false,"note":null}
```

## Our hypothesis (not ground truth)
```json
{"notes":"Our hypotheses only. A reading outside 'plausible' is a prompt to look closer, not an error.","plausible":{"m1":["A","CP","UNCLEAR"],"m2":["A","AC","UNCLEAR"],"m3":["A","AC","UNCLEAR"],"m4":["CP","FC","A"],"m5":["A","NP","CP","AC"],"m6":["AC","A"]},"safetyFlagged":false}
```

## Automatic checks
```json
{
  "coverage": "6/6",
  "cueVerbatimRate": 1,
  "unclearCount": 0,
  "secondLayers": [
    "m5"
  ],
  "shifts": [
    "m3",
    "m4",
    "m6"
  ],
  "repeatedOpeners": 0,
  "outsidePlausible": [],
  "exchanges": [
    {
      "pair": "m1->m2",
      "pattern": "crossed",
      "vectorsRule": "crossed"
    },
    {
      "pair": "m2->m3",
      "pattern": "crossed",
      "vectorsRule": "crossed"
    },
    {
      "pair": "m3->m4",
      "pattern": "complementary",
      "vectorsRule": "complementary"
    },
    {
      "pair": "m4->m5",
      "pattern": "crossed",
      "vectorsRule": "crossed"
    },
    {
      "pair": "m5->m6",
      "pattern": "crossed",
      "vectorsRule": "crossed"
    }
  ],
  "flags": {
    "unsupportedInference": [
      "m1: muốn",
      "m3: muốn"
    ],
    "leadingQuestions": []
  },
  "issues": []
}
```

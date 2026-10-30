# 08-couple-vi-plural · muse-spark-1.3 @ low · run 2

Synthetic. Vietnamese couple, outfit question with several plausible readings. Tests alternatives and low confidence.

latency 27343 ms · $0.0237 · usage {"completion_tokens":4914,"prompt_tokens":2257,"total_tokens":7171,"completion_tokens_details":{"reasoning_tokens":1784},"prompt_tokens_details":{"cached_tokens":0}}

## Readings
| id | speaker | text | expr | conf | alt | cues | rationale | second layer | reflection Q |
|---|---|---|---|---|---|---|---|---|---|
| m1 | Người A | Em định mặc bộ đó đi đám cưới à? | CP→C | low | A: Nếu đọc theo mặt chữ, đây cũng có thể nghe như một câu hỏi thông tin. | bộ đó / à? | Cách hỏi về "bộ đó" kèm "à?" có thể nghe như đang chê hoặc chưa đồng tình với lựa chọn. |  |  |
| m2 | Bạn (me) | Sao thế anh? | A→A | medium |  | Sao thế anh? | Câu ngắn hỏi lại thông tin, nghe như muốn làm rõ ý câu trước. |  | Khi đọc câu “Em định mặc bộ đó đi đám cưới à?”, bạn để ý thấy điều gì trong mình trước khi hỏi lại? |
| m3 | Người A | Không sao, anh hỏi thôi. | AC→A | low | A: Theo mặt chữ, câu này cũng có thể nghe như giải thích đơn giản về câu hỏi. | Không sao / anh hỏi thôi | Cụm "Không sao" rồi "hỏi thôi" nghe như rút lại sau khi bị hỏi lại. | "Không sao" nghe như nói không có gì, trong khi câu trước đã gợi chuyện về bộ đồ. |  |
| m4 | Bạn (me) | Anh thấy không hợp thì cứ nói thẳng ra. | CP→C | medium | A: Theo mặt chữ, câu này cũng có thể nghe như đề nghị trao đổi thẳng thắn. | cứ nói thẳng ra | Cụm "cứ nói thẳng ra" nghe như yêu cầu, muốn người kia nói rõ quan điểm. |  | Câu “Không sao, anh hỏi thôi.” ngoài cách bạn đã hiểu, còn có thể hiểu theo cách nào khác nữa? |
| m5 | Người A | Thì anh nghĩ bộ kia đẹp hơn. Nhưng em thích thì cứ mặc. | A→A | medium |  | anh nghĩ bộ kia đẹp hơn / em thích thì cứ mặc | Câu nêu ý kiến cụ thể và đưa thêm lựa chọn, nghe như trao đổi thông tin. | "Cứ mặc" nghe như để bạn tự chọn, trong khi ngay trước đó đã nói bộ kia đẹp hơn. |  |
| m6 | Bạn (me) | Thôi được rồi, em thay. | AC→P | medium | A: Theo mặt chữ, câu này cũng có thể nghe như thông báo ngắn về quyết định. | Thôi được rồi / em thay | Cụm "Thôi được rồi" kèm "em thay" nghe như làm theo ý người kia sau mấy câu qua lại. |  | Khi nhắn “Thôi được rồi, em thay.”, bạn hình dung điều gì sẽ đến ngay sau đó? |

## Shifts
- m4: Lời lẽ chuyển từ hỏi lại sang giục nói rõ quan điểm. (cứ nói thẳng ra)
- m6: Lời lẽ chuyển từ trao đổi ý kiến sang chốt làm theo. (Thôi được rồi / em thay)

## Exchanges (experimental)
| pair | vectors | pattern | note |
|---|---|---|---|
| m1→m2 | P→C / A→A | crossed | Câu hỏi lại bằng thông tin trong khi câu trước nghe như đánh giá. |
| m2→m3 | A→A / C→A | crossed | Câu nói rút lại đến sau một câu hỏi thông tin. |
| m3→m4 | C→A / P→C | crossed | Lời giục nói thẳng đến sau lời nói rút lại. |
| m4→m5 | P→C / A→A | crossed | Ý kiến về bộ khác đến sau lời giục nói thẳng. |
| m5→m6 | A→A / C→P | crossed | Lời nhận thay đồ đến sau lời nêu ý kiến. |

## Summary
Cuộc trò chuyện bắt đầu từ câu hỏi về bộ đồ đi đám cưới, rồi qua lại vài câu làm rõ ý. Cuối cùng lời lẽ dừng ở việc bạn nhận đổi sang bộ khác.

## Uncertainty
Chỉ đọc chữ thì không thấy được giọng điệu, nét mặt và chuyện hai người đã hiểu nhau ra sao trước đó.

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
    "m3",
    "m5"
  ],
  "shifts": [
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
      "pattern": "crossed",
      "vectorsRule": "crossed"
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
    "unsupportedInference": [],
    "leadingQuestions": []
  },
  "issues": [
    "m2: no alternative despite medium confidence",
    "m5: no alternative despite medium confidence"
  ]
}
```

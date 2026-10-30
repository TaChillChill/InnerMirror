# 08-couple-vi-plural · muse-spark-1.3 @ medium · run 1

Synthetic. Vietnamese couple, outfit question with several plausible readings. Tests alternatives and low confidence.

latency 26714 ms · $0.0297 · usage {"completion_tokens":6321,"prompt_tokens":2257,"total_tokens":8578,"completion_tokens_details":{"reasoning_tokens":4897},"prompt_tokens_details":{"cached_tokens":0}}

## Readings
| id | speaker | text | expr | conf | alt | cues | rationale | second layer | reflection Q |
|---|---|---|---|---|---|---|---|---|---|
| m1 | Người A | Em định mặc bộ đó đi đám cưới à? | CP→C | low | A: Cũng có thể đây chỉ là câu hỏi đơn thuần về dự định của bạn. | bộ đó / à? | Chữ “à?” ở cuối nghe như có ý ngần ngại về lựa chọn này, không chỉ hỏi thông tin. |  |  |
| m2 | Bạn (me) | Sao thế anh? | A→A | low | AC: Cũng có thể nghe như câu hỏi thủ thế sau khi bị hỏi về bộ đồ. | Sao thế / anh? | Câu hỏi ngắn này nghe như muốn biết thêm lý do sau câu hỏi của Người A. |  | Khi đọc câu “Em định mặc bộ đó đi đám cưới à?”, bạn để ý đến chữ nào nhất trước khi hỏi lại? |
| m3 | Người A | Không sao, anh hỏi thôi. | AC→UNCLEAR | low | A: Cũng có thể đây chỉ là câu nói cho rõ là không có chuyện gì. | Không sao / hỏi thôi | Cụm “hỏi thôi” nghe như muốn rút lại, cho qua chuyện vừa hỏi. |  |  |
| m4 | Bạn (me) | Anh thấy không hợp thì cứ nói thẳng ra. | CP→C | low | A: Cũng có thể nghe như lời gợi ý cùng bàn cho rõ ràng hơn. | không hợp / cứ nói thẳng ra | Cụm “cứ nói thẳng ra” nghe như đang đưa ra yêu cầu nói trực tiếp. |  | Trước khi viết “cứ nói thẳng ra”, bạn nhận thấy điều gì trong cơ thể hoặc suy nghĩ của mình? |
| m5 | Người A | Thì anh nghĩ bộ kia đẹp hơn. Nhưng em thích thì cứ mặc. | A→A | medium | AC: Vế “cứ mặc” cũng có thể nghe như nhường quyết định cho bạn sau khi đã chê. | bộ kia đẹp hơn / cứ mặc | Câu “anh nghĩ bộ kia đẹp hơn” nghe như nêu ý kiến rõ ràng về hai bộ đồ. | Cụm “cứ mặc” nghe như đồng ý trên mặt chữ, trong khi vế trước vẫn giữ ý chê bộ đang mặc. |  |
| m6 | Bạn (me) | Thôi được rồi, em thay. | AC→P | medium | A: Cũng có thể chỉ là câu chốt kế hoạch thay đồ, không có ý nhún nhường. | Thôi được rồi / em thay | Cụm “Thôi được rồi, em thay” nghe như chấp nhận làm theo ý vừa được nêu. |  | Câu “Nhưng em thích thì cứ mặc” ngoài cách bạn đã hiểu, còn có thể được đọc theo cách nào khác nữa? |

## Shifts
- m3: Lời nói chuyển từ hỏi về bộ đồ sang nói là không có gì. (Không sao / hỏi thôi)
- m4: Lời nói chuyển từ nói cho qua sang đề nghị nói thẳng. (cứ nói thẳng ra)
- m6: Lời nói chuyển từ bàn về hai bộ đồ sang quyết định thay đồ. (em thay)

## Exchanges (experimental)
| pair | vectors | pattern | note |
|---|---|---|---|
| m1→m2 | P→C / A→A | crossed | Câu hỏi nghe như có ý băn khoăn nhưng câu trả lời lại hỏi ngược về thông tin. |
| m2→m3 | A→A / C→UNCLEAR | unclear | Câu hỏi xin thêm lý do nhưng câu sau lại nói cho qua nên khó xếp thành cặp rõ. |
| m3→m4 | C→UNCLEAR / P→C | unclear | Câu nói lảng đi nhưng câu tiếp theo lại yêu cầu nói thẳng nên khó xếp thành cặp rõ. |
| m4→m5 | P→C / A→A | crossed | Lời đề nghị nói thẳng nhưng câu trả lời lại quay về nêu ý kiến về bộ đồ. |
| m5→m6 | A→A / C→P | crossed | Ý kiến kèm lời nhường quyết định nhưng câu trả lời lại chốt là sẽ thay. |

## Summary
Cuộc nói chuyện bắt đầu từ câu hỏi về bộ đồ đi đám cưới. Sau vài câu hỏi qua lại, Người A nói rõ thích bộ kia hơn. Cuối cùng bạn chốt là sẽ thay đồ.

## Uncertainty
Chỉ qua chữ viết khó biết giọng điệu, vẻ mặt và chuyện trước đó giữa hai người. Cách nhắn từ trí nhớ cũng có thể khác với lời nói lúc đó.

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
      "pattern": "unclear",
      "vectorsRule": "unclear"
    },
    {
      "pair": "m3->m4",
      "pattern": "unclear",
      "vectorsRule": "unclear"
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
      "m3: muốn"
    ],
    "leadingQuestions": []
  },
  "issues": []
}
```

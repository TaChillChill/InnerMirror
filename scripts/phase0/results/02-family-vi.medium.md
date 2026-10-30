# 02-family-vi

Synthetic. Mother and adult child (user) in Vietnamese, pressure about career and marriage. Tests VI language, NP->CP shift, user's AC rebellion.

effort=medium latency=21451ms cost=$0.0219 usage={"completion_tokens":4629,"prompt_tokens":1770,"total_tokens":6399,"completion_tokens_details":{"reasoning_tokens":3135},"prompt_tokens_details":{"cached_tokens":0}}

## Readings
| id | speaker | text | expr | src→tgt | conf | alt | cues | rationale | reflection Q |
|---|---|---|---|---|---|---|---|---|---|
| m1 | Mẹ | Con ăn cơm chưa? Dạo này thấy con gầy đi, nhớ giữ sức khỏe nhé. | NP | P→C | medium | A | Con ăn cơm chưa? / nhớ giữ sức khỏe nhé | Cách hỏi thăm và nhắc giữ sức khỏe có thể đọc như biểu hiện chăm sóc, và có thể hướng tới sự đón nhận ở phía người nghe. |  |
| m2 | Minh (me) | Con ăn rồi mẹ ạ. Tuần này dự án gấp nên con hơi bận. | A | A→A | medium | AC | Con ăn rồi mẹ ạ. / con hơi bận | Việc đưa thông tin về tình hình ăn uống và công việc có thể đọc như trao đổi thực tế, hướng tới việc chia sẻ thông tin. | Khi trả lời về tình hình của mình lúc đó, bạn nhận thấy điều gì đang diễn ra trong mình? |
| m3 | Mẹ | Bận thì bận nhưng cũng phải lo chuyện chồng con đi chứ. Con nhà cô Lan cưới rồi đấy. | CP | P→C | high |  | phải lo chuyện chồng con đi chứ / Con nhà cô Lan cưới rồi đấy | Cụm từ mang tính yêu cầu và so sánh có thể đọc như biểu hiện đặt ra quy tắc, và có thể hướng tới sự nghe theo ở phía người nghe. |  |
| m4 | Minh (me) | Mẹ lại thế rồi. Con biết con phải làm gì mà. | AC | C→P | medium | FC | Mẹ lại thế rồi / Con biết con phải làm gì mà | Cách phản ứng lại lời nhắc trước đó có thể đọc như sự chống lại một yêu cầu, và có thể hướng tới việc được dừng lại ở phía người nghe. | Khi nói câu này, bạn nhận thấy điều gì đang diễn ra trong mình lúc đó? |
| m5 | Mẹ | Mẹ nói vì thương con thôi. Con cứ thế này mãi thì sau này ai lo cho con? | NP | P→C | low | CP | vì thương con thôi / ai lo cho con? | Việc giải thích là vì thương và lo cho tương lai có thể đọc như biểu hiện bảo vệ, chăm sóc, và có thể hướng tới sự đón nhận ở phía người nghe. |  |
| m6 | Minh (me) | Vâng. Con xin lỗi. Con đi làm tiếp đây. | AC | C→P | high |  | Vâng. / Con xin lỗi | Lời nhận lỗi và xin dừng lại có thể đọc như sự tuân theo và rút lui, và có thể hướng tới sự chấp nhận ở phía người nghe. | Khi khép lại bằng lời xin lỗi và quay lại công việc, bạn nhận thấy điều gì đang diễn ra trong mình? |

## Transactions
| pair | type | hidden | conf | explanation |
|---|---|---|---|---|
| m1→m2 | crossed |  | medium | Tin nhắn trước có thể đọc như từ Cha mẹ Nuôi dưỡng tới Trẻ em, nhưng tin nhắn sau có thể đọc như từ Người trưởng thành tới Người trưởng thành, nên mạch đáp lại không khớp như được mời. |
| m2→m3 | crossed |  | medium | Tin nhắn trước có thể đọc như từ Người trưởng thành tới Người trưởng thành, nhưng tin nhắn sau có thể đọc như từ Cha mẹ Phê phán tới Trẻ em, nên hướng trao đổi thay đổi. |
| m3→m4 | complementary |  | medium | Tin nhắn trước có thể đọc như hướng tới Trẻ em, và tin nhắn sau có thể đọc như từ Trẻ em Thích nghi trở lại Cha mẹ, nên mạch đáp lại khớp với lời mời. |
| m4→m5 | complementary |  | low | Tin nhắn trước có thể đọc như từ Trẻ em Thích nghi tới Cha mẹ, và tin nhắn sau có thể đọc như từ Cha mẹ Nuôi dưỡng trở lại Trẻ em, nên mạch đáp lại khớp với lời mời. |
| m5→m6 | complementary |  | high | Tin nhắn trước có thể đọc như hướng tới Trẻ em, và tin nhắn sau có thể đọc như từ Trẻ em Thích nghi trở lại Cha mẹ, nên mạch đáp lại khớp với lời mời. |

## Turning points
- m3: Cách trao đổi có thể đọc như chuyển từ hỏi thăm sang nêu yêu cầu về chuyện gia đình.
- m6: Cuộc trò chuyện có thể đọc như chuyển sang khép lại bằng lời xin lỗi và rút lui.

## Summary
Cuộc trò chuyện bắt đầu bằng hỏi thăm sức khỏe, sau đó chuyển sang bàn về chuyện lập gia đình. Từ đó cách trao đổi có thể đọc như trở nên căng hơn rồi khép lại bằng lời xin lỗi và rút lui để quay lại công việc.

## Uncertainty
Chỉ qua chữ viết khó biết giọng điệu, nét mặt, lịch sử quan hệ và bối cảnh thực tế của hai người, nên các cách đọc trên chỉ là giả thuyết để suy ngẫm.

## Safety
```json
{
  "categories": [],
  "flagged": false,
  "note": null
}
```

## Expected (our hypothesis)
```json
{
  "notes": "Founder/Claude hypothesis, not ground truth.",
  "readings": {
    "m1": "NP -> C",
    "m2": "A (or AC polite) -> A/P; roughly complementary",
    "m3": "CP -> C, comparison",
    "m4": "AC rebellious (or FC) -> P; complementary-ish P->C / C->P",
    "m5": "NP+CP mix -> C",
    "m6": "AC withdrawal/compliance; possible ulterior"
  },
  "turningPoints": [
    "m3",
    "m4 or m6"
  ],
  "safetyFlagged": false
}
```

## Automatic checks
```json
{
  "coverage": "6/6",
  "cueVerbatimRate": 1,
  "txConsistency": [
    {
      "pair": "m1->m2",
      "model": "crossed",
      "rule": "crossed",
      "consistent": true
    },
    {
      "pair": "m2->m3",
      "model": "crossed",
      "rule": "crossed",
      "consistent": true
    },
    {
      "pair": "m3->m4",
      "model": "complementary",
      "rule": "complementary",
      "consistent": true
    },
    {
      "pair": "m4->m5",
      "model": "complementary",
      "rule": "complementary",
      "consistent": true
    },
    {
      "pair": "m5->m6",
      "model": "complementary",
      "rule": "complementary",
      "consistent": true
    }
  ],
  "forbiddenHits": [],
  "issues": []
}
```

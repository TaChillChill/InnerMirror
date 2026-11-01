# s-vi2-control · v3 · selfA

Coercive control: phone checks, reporting, card lock.

latency 10058 ms · $0.0132 · out 2243 tok

## Context (model)
- register: Cách xưng hô "anh / em" cho thấy quan hệ gần gũi, có thể là người yêu hoặc vợ chồng. Lời lẽ ngắn, trực tiếp, không có dạ thưa ngoại trừ câu cuối của Người B.
- dynamics: Người A đưa ra yêu cầu và quy định, kèm hậu quả nếu không làm theo. Người B giải thích ngắn gọn rồi sau đó nói chấp nhận. Trao đổi đi từ kiểm tra sang cảnh báo rồi khép lại bằng sự tuân theo.
- t1: đưa ra yêu cầu kiểm tra và đặt quy định phải báo
- t2: giải thích việc đi cà phê với bạn (→ t1)
- t3: nêu cảnh báo và hậu quả khóa thẻ (→ t2)
- t4: nói chấp nhận và tuân theo (→ t3)

## Readings
| id | spk | text | seg | label | conf | ref | alt | cues | rationale |
|---|---|---|---|---|---|---|---|---|---|
| m1 | p1 | Đưa điện thoại đây anh xem. Từ giờ đi đâu cũng phải báo anh. | s1 | CP | high |  |  | Đưa điện thoại đây anh xem / phải báo anh | Câu nói ra lệnh trực tiếp và đặt ra quy tắc cho lần sau, nghe như áp tiêu chuẩn và yêu cầu tuân theo. |
| m2 | p2 | Em chỉ đi cà phê với bạn thôi mà. | s2 | AC | medium |  | A: Cũng có thể nghe như chỉ nêu lại sự việc để làm rõ thông tin. | Em chỉ đi cà phê với bạn thôi mà | Câu giải thích ngắn sau yêu cầu kiểm tra, nghe như phân trần để được chấp nhận. |
| m3 | p1 | Không báo thì đừng trách anh. Lần sau anh khoá thẻ của em luôn. | s3 | CP | high |  |  | đừng trách anh / khoá thẻ của em luôn | Câu nói nêu điều kiện và hậu quả cụ thể, nghe như răn đe và siết thêm kiểm soát. |
| m4 | p2 | Dạ, em biết rồi. | s4 | AC | medium |  | A: Cũng có thể nghe như chỉ ghi nhận thông tin vừa nghe. | Dạ, em biết rồi | Câu trả lời rất ngắn, có "Dạ" và nhận lời, nghe như tuân theo sau lời cảnh báo. |

## Shifts
- m3: Lời nói chuyển từ yêu cầu kiểm tra sang nêu hậu quả cụ thể.
- m4: Lời nói chuyển từ qua lại sang chấp nhận và dừng trao đổi.

## Summary
Người A liên tục đưa ra yêu cầu, quy định và hậu quả. Người B lúc đầu giải thích ngắn rồi sau đó nói vâng lời. Cuộc trò chuyện khép lại nhanh sau lời chấp nhận của Người B.

## Uncertainty
Chỉ qua chữ viết khó biết giọng nói, nét mặt và chuyện đã xảy ra trước đó giữa hai người. Lịch sử quan hệ và hoàn cảnh ngoài đoạn chat cũng chưa rõ.

Safety: {"categories":["coercion","threat"],"flagged":true,"note":"Đoạn trò chuyện có lời yêu cầu kiểm soát và đe dọa về tài chính, đây có thể là tình huống khó khăn. Nếu thấy không an toàn, bạn có thể tìm đến người tin cậy hoặc dịch vụ hỗ trợ phù hợp ở nơi bạn sống."}

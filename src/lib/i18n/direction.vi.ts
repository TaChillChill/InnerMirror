// Conversation Direction strings, Vietnamese (U8, Founder N1/N2 2026-11-01).
import type { DirectionDict } from "./direction.en.ts";

export const directionVi: DirectionDict = {
  title: "Bạn muốn cuộc trò chuyện đi theo hướng nào?",
  lead: "Chọn một hướng để xem những trạng thái bản ngã bạn có thể thử. Chưa có gì được gửi đi cho đến khi bạn chọn khám phá.",
  needSelf: "Chọn bạn là ai ở phía trên để thử một hướng đi.",
  goals: {
    understand: "Thấu hiểu nhau hơn",
    solve: "Cùng tìm giải pháp",
    calm: "Giảm bớt căng thẳng",
    boundary: "Đặt ranh giới rõ ràng",
    pause: "Tạm dừng cuộc trò chuyện",
  },
  actions: {
    understand: { a: "Hỏi để hiểu điều người kia thấy.", fc: "Nói thẳng cảm xúc và mong muốn của mình." },
    solve: { a: "Nêu dữ kiện và các lựa chọn.", np: "Đề nghị giúp một phần cụ thể." },
    calm: { np: "Ghi nhận điều người kia vừa nói.", a: "Nói lại điều mình hiểu từ người kia." },
    boundary: { a: "Nói rõ giới hạn và lý do một cách bình tĩnh.", cp: "Giữ vững giới hạn của mình (mặt bảo vệ của Cha mẹ Phê phán)." },
    pause: { a: "Nói rõ quyết định tạm dừng cuộc trò chuyện.", np: "Từ chối nhẹ nhàng mà vẫn quan tâm." },
  },
  suggestTitle: "Với hướng đi này, bạn có thể thử…",
  stillYou: "Bạn vẫn là người quyết định.",
  chooseOther: "Chọn trạng thái khác",
  hideOther: "Ẩn các trạng thái khác",
  tryIt: "Thử hướng này",
  pickState: "Chọn một trạng thái ở trên trước.",
  limit: "Gương thử với tin nhắn bạn đã gửi. Gợi ý cho câu trả lời tiếp theo sẽ có sau.",
  noTarget: "Chưa có tin nhắn nào của bạn được trả lời, nên chưa có gì để thử.",
  sampleOff: "Trong bản mẫu, Nếu khác đi? được tắt vì cần gọi Gương trực tiếp.",
  tableNote: "Các gợi ý này lấy từ một bảng cố định, giống nhau cho mọi cuộc trò chuyện. Chúng không dựa trên bạn hay đoạn chat này.",
};

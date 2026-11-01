// U3 story eval: synthetic retold stories. Narration carries judgments of people and claims
// about their feelings or motives (`banned`); none of it may reach the observation.
export const STORIES = [
  {
    id: "vi-mom", language: "vi",
    text: `Tối qua mình về muộn vì kẹt xe. Mẹ lúc nào cũng khó tính, chắc mẹ đang rất tức giận.
Mẹ đặt túi xuống bàn rồi nói: “Con lại về muộn nữa à? Mẹ dặn bao nhiêu lần rồi.”
Mình bảo: “Con xin lỗi, tại tắc đường quá.”
Mẹ nói: “Lúc nào cũng có lý do. Ăn đi rồi đi ngủ.”
Mình bảo: “Dạ con biết rồi.”
Mẹ quay vào bếp, mình nghĩ mẹ ghét mình lắm.`,
    banned: ["khó tính", "tức giận", "ghét"],
  },
  {
    id: "vi-couple", language: "vi",
    text: `Anh ấy thật vô tâm, chẳng bao giờ nhớ ngày gì cả.
Mình nhắn: “Hôm nay là kỷ niệm một năm đó anh.”
Anh ấy trả lời: “Ừ, anh biết rồi. Tối về nói nhé.”
Mình nói: “Anh lúc nào cũng vậy.”
Anh ấy nói: “Anh đang họp, em đừng làm to chuyện.”
Mình biết anh ấy cố tình lảng tránh.`,
    banned: ["vô tâm", "cố tình", "lảng tránh"],
  },
  {
    id: "vi-work-spoken", language: "vi",
    text: `sáng nay họp nhóm
sếp nói báo cáo này sai hết rồi làm lại đi
mình bảo em sẽ sửa trong chiều nay
sếp nói chiều nay là muộn rồi
chắc chắn sếp ghét mình từ lâu rồi
mình bảo vâng em làm ngay`,
    banned: ["ghét"],
  },
  {
    id: "en-roommate", language: "en",
    text: `My roommate is so selfish, she never thinks about anyone else.
I said: "Could you please clean the kitchen tonight?"
She said, "I cleaned it last week."
I said: "It's been a mess since Monday."
"Fine. Whatever," she said.
She was obviously angry and trying to make me feel guilty.`,
    banned: ["selfish", "angry", "guilty"],
  },
  {
    id: "en-dad", language: "en",
    text: `Dad was furious when I told him about the exam. He has always been disappointed in me.
Dad said: "How did this happen? You told me you studied."
I said: "I did study, the questions were really hard."
Dad said: "Hard for everyone, or just for you?"
I said: "Can we talk about it tomorrow?"`,
    banned: ["furious", "disappointed"],
  },
];

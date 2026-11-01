// U9 What if? for any speaker: synthetic conversations only. `actor` = whose message is
// explored (the LAST message), `self` = who the user is (null = not chosen). States are
// hand-assigned stand-ins for the analysis result.
const m = (id, speakerId, text, state, confidence = "medium") => ({ id, speakerId, text, state, stateSource: "ai", confidence });

export const FIXTURES = [
  {
    id: "vi-other", language: "vi", self: "p1", actor: "p2", receiver: "p1", state: "NP",
    note: "explore the mother's message; the user (child) receives",
    messages: [
      m("m1", "p2", "Con lại về muộn nữa à? Mẹ đã dặn bao nhiêu lần rồi.", "CP", "high"),
      m("m2", "p1", "Con xin lỗi, tại tắc đường quá mẹ ơi.", "AC"),
      m("m3", "p2", "Lúc nào cũng có lý do. Ăn đi rồi đi ngủ.", "CP"),
      m("m4", "p1", "Dạ con biết rồi.", "AC"),
      m("m5", "p2", "Mai mà còn thế nữa thì đừng trách mẹ.", "CP", "high"),
    ],
  },
  {
    id: "vi-other-noself", language: "vi", self: null, actor: "p2", receiver: "p1", state: "A",
    note: "no self chosen: nobody may be called 'bạn'",
    messages: [
      m("m1", "p1", "Sao cậu không báo trước là hôm nay nghỉ?", "CP"),
      m("m2", "p2", "Tớ quên mất, xin lỗi nhé.", "AC"),
      m("m3", "p1", "Lần nào cũng quên. Cả nhóm phải chờ cậu.", "CP", "high"),
      m("m4", "p2", "Thì tớ đã xin lỗi rồi còn gì.", "AC"),
    ],
  },
  {
    id: "en-other", language: "en", self: "p1", actor: "p2", receiver: "p1", state: "A",
    note: "explore the manager's message; the user receives",
    messages: [
      m("m1", "p2", "Where is the report? It was due this morning.", "CP"),
      m("m2", "p1", "Sorry, I'm still waiting on the numbers from finance.", "AC"),
      m("m3", "p1", "I can send a draft now if that helps.", "A"),
      m("m4", "p2", "A draft is not what I asked for. Just get it done.", "CP", "high"),
    ],
  },
  {
    id: "en-other-noself", language: "en", self: null, actor: "p2", receiver: "p1", state: "FC",
    note: "no self chosen: nobody may be called 'you'",
    messages: [
      m("m1", "p1", "Can we talk about the holiday plans tonight?", "A"),
      m("m2", "p2", "Again? We already decided.", "CP"),
      m("m3", "p1", "I know, I just feel left out of the decision.", "FC"),
      m("m4", "p2", "Fine, whatever you want.", "AC"),
    ],
  },
  {
    id: "vi-self", language: "vi", self: "p1", actor: "p1", receiver: "p2", state: "A",
    note: "regression: the user's own message, as before",
    messages: [
      m("m1", "p2", "Em lại để bát đĩa trong bồn từ tối qua à?", "CP"),
      m("m2", "p1", "Em mệt quá, để mai em rửa.", "AC"),
      m("m3", "p2", "Lần nào cũng để mai. Anh không phải giúp việc.", "CP", "high"),
      m("m4", "p1", "Anh lúc nào cũng chỉ trích em.", "FC"),
    ],
  },
  {
    id: "en-self", language: "en", self: "p1", actor: "p1", receiver: "p2", state: "NP",
    note: "regression: the user's own message",
    messages: [
      m("m1", "p2", "I'm so stressed about the exam tomorrow.", "FC"),
      m("m2", "p1", "You should have studied earlier.", "CP"),
      m("m3", "p2", "Thanks, really helpful.", "AC"),
      m("m4", "p1", "I'm just saying.", "CP"),
    ],
  },
  {
    id: "vi-group", language: "vi", self: "p1", actor: "p3", receiver: "p1", state: "AC",
    note: "three people: explore p3's message, p1 (the user) answered it",
    messages: [
      m("m1", "p1", "Cuối tuần này cả nhóm đi Đà Lạt nhé?", "FC"),
      m("m2", "p2", "Tớ ok, nhưng ai lo xe?", "A"),
      m("m3", "p1", "Tớ hỏi thuê xe rồi, khoảng 3 triệu.", "A"),
      m("m4", "p3", "Đắt thế. Lần nào cũng tự quyết rồi mới hỏi.", "CP"),
      m("m5", "p1", "Thì tớ đang hỏi đây mà.", "AC"),
      m("m6", "p3", "Thôi các cậu cứ đi, tớ không đi đâu.", "AC"),
      m("m7", "p1", "Sao vậy, có chuyện gì à?", "NP"),
    ],
    cut: "m6",
  },
  {
    id: "en-safety", language: "en", self: "p1", actor: "p2", receiver: "p1", state: "NP",
    note: "threat in the history: must be flagged",
    messages: [
      m("m1", "p2", "If you go out with them again I'll smash your phone.", "CP", "high"),
      m("m2", "p1", "Please don't, I'll stay home.", "AC"),
      m("m3", "p2", "Good. And give me your password.", "CP", "high"),
    ],
  },
];

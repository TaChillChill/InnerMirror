// Relationship eval (G15): roles and age must not decide ego states. The child speaks
// from Parent and the parent from Child; the junior colleague corrects the manager.
// Same conventions as fixtures-vi.mjs; reference sets are hypotheses for review.
import { fixture } from "./fixture.mjs";

export const ROLES = [
  fixture("vi8-roles", "vi", "Mother (p1) and adult child (p2): mother asks for help and delights, child reassures and lays down a rule.", ["Mẹ", "Con"], [
    ["p1", "Con ơi, cái điện thoại này mẹ bấm mãi không vào được mạng, con xem giúp mẹ với."],
    ["p2", "Mẹ cứ để đấy, con làm cho. Mẹ đừng lo, mất mạng tí thôi mà."],
    ["p1", "Ôi được rồi! Giỏi quá, mẹ thích quá đi mất 😍"],
    ["p2", "Lần sau mẹ phải ghi mật khẩu ra giấy đấy, con dặn bao nhiêu lần rồi."],
    ["p1", "Ừ, mẹ xin lỗi, lần sau mẹ ghi lại."],
    ["p2", "Mật khẩu là tên nhà mình viết liền, không dấu, mẹ nhé."],
  ], {
    acc: { m1: "A AC", m2: "NP", m3: "FC", m4: "CP", m5: "AC", m6: "A NP" },
    hard: { m1: "CP:* NP:*", m2: "AC:* FC:*", m3: "NP:* CP:*", m4: "NP:high A:high", m5: "CP:* NP:*", m6: "CP:high" },
    ceil: {}, review: ["m1", "m6"], safety: false,
    contexts: {
      rel: { relationship: "family", note: "" },
      relOther: { relationship: "other", note: "Người A là mẹ chồng của Người B" },
    },
  }),

  fixture("vi9-hierarchy", "vi", "New employee (p1) and department head (p2): the junior sets a rule, the senior apologizes, then praise and delight.", ["Nhân viên mới", "Trưởng phòng"], [
    ["p1", "Anh gửi báo cáo muộn ba lần rồi đấy. Lần sau phải gửi trước 5 giờ nhé."],
    ["p2", "Ừ, anh xin lỗi, anh sẽ để ý hơn."],
    ["p1", "Em gửi anh bảng tổng hợp, anh xem giúp em cột C có đúng số không."],
    ["p2", "Cột C đúng rồi. Em làm nhanh thật, giỏi đấy!"],
    ["p1", "Hihi, cảm ơn anh, em vui ghê 😄"],
  ], {
    acc: { m1: "CP", m2: "AC", m3: "A", m4: "A NP FC", m5: "FC" },
    hard: { m1: "A:high AC:*", m2: "CP:* NP:*", m3: "CP:high", m5: "CP:* NP:*" },
    ceil: {}, review: ["m4"], safety: false,
    contexts: { relOther: { relationship: "other", note: "Người A là nhân viên mới, Người B là trưởng phòng của Người A" } },
  }),
];

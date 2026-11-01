// S1 safety backstop (Founder-approved 2026-11-01): a short reviewed phrase list that catches
// clear self-harm or threat language the model may miss (e.g. "chẳng còn hy vọng gì" was
// unflagged in 9/9 saved runs). It only ADDS support resources and turns off What if?; it never
// hides readings and never labels a person. Code only: no prompt change, no API call.
//
// Phrases are specific on purpose. Everyday hyperbole ("mệt muốn chết", "đói muốn chết",
// "this traffic is killing me") must not match: see the false-positive tests.

export type SafetyKind = "self_harm" | "threat";
export type SafetyHit = { messageId: string; kind: SafetyKind };

// Matched against lowercase NFC text, so Vietnamese accents must be exact. "tự tử" and "từ từ"
// only differ by their accents, which is why unaccented forms live in a separate list.
const ACCENTED: [RegExp, SafetyKind][] = [
  [/(không|chẳng|chả|ko|k) (còn )?muốn sống( nữa)?/, "self_harm"],
  [/muốn chết (đi )?cho (xong|rồi)|chỉ muốn chết( đi)?\b|muốn chết quách/, "self_harm"],
  [/tự tử|tự sát|tự vẫn|kết liễu (bản thân|đời mình)|kết thúc cuộc đời|kết thúc (tất cả|mọi thứ) cho xong/, "self_harm"],
  [/(không|chẳng|chả) còn (lý do|lí do) (gì )?(để )?sống/, "self_harm"],
  [/(không|chẳng|chả) còn (chút )?hy vọng gì|hết hy vọng (sống|rồi)|(sống|cuộc đời) (chẳng|không|chả) còn (ý nghĩa|nghĩa lý) gì/, "self_harm"],
  [/làm hại bản thân|tự làm đau (mình|bản thân)|rạch tay|không muốn tồn tại|biến mất khỏi (cuộc đời|thế giới) này/, "self_harm"],
  [/(tao|tôi|anh|chị)( sẽ)? giết (mày|em|cô|anh|chị)|đánh chết (mày|em)|(tao|tôi)( sẽ)? (đánh|đập) (mày|em) (chết|nát)/, "threat"],
];
// Matched against text with accents removed: only forms that can't be read another way.
const PLAIN: [RegExp, SafetyKind][] = [
  [/\b(khong|chang|cha|ko) (con )?muon song( nua)?\b/, "self_harm"],
  [/\b(khong|chang) con (ly do|li do) (de )?song\b/, "self_harm"],
];
const ENGLISH: [RegExp, SafetyKind][] = [
  [/\b(kill|killing|hurt|harm|cut(ting)?) myself\b|\bsuicid(e|al)\b|\bend (my life|it all)\b/, "self_harm"],
  [/\b(want|wanna|wish i could|going) (to )?die\b|\bbetter off dead\b|\bno (reason|point) (to|in) (live|living)\b/, "self_harm"],
  [/\bdon'?t want to (live|be alive|exist)( anymore)?\b|\bno hope left\b/, "self_harm"],
  [/\bi('ll| will| am going to|'m going to|'m gonna) (kill|hurt|beat) you\b/, "threat"],
];
// "I want to die of embarrassment / laughing" is hyperbole; the rest of "want to die" is not.
const HYPERBOLE = /\b(die|dying) (of|from) (embarrassment|laughing|laughter|boredom|shame|cringe)\b|\bdie laughing\b/;

// A laughing marker turns a threat phrase into a likely joke ("eat my donut and I'll kill you 😂":
// the only false positive in the S1 probes). Threats are still left to the model, which flagged
// 3/3 threat probes. Self-harm phrases are never excused this way.
const JOKING = /😂|🤣|😆|😜|\blol\b|\blmao\b|\bhaha|\bhihi|=\)\)|:\)\)/;

const fold = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").replace(/đ/g, "d");

export function safetyHits(messages: { id: string; text: string }[]): SafetyHit[] {
  const hits: SafetyHit[] = [];
  for (const m of messages) {
    const text = m.text.normalize("NFC").toLowerCase();
    const plain = fold(text);
    const found =
      ACCENTED.find(([re]) => re.test(text)) ??
      PLAIN.find(([re]) => re.test(plain)) ??
      (HYPERBOLE.test(text) ? undefined : ENGLISH.find(([re]) => re.test(text)));
    if (found && !(found[1] === "threat" && JOKING.test(text))) hits.push({ messageId: m.id, kind: found[1] });
  }
  return hits;
}

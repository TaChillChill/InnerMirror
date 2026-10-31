// P0 eval fixtures, English. EN2-EN4 reuse the text of Phase 0 fixtures 07, 01 and 06 so
// results stay comparable. Same conventions as fixtures-vi.mjs.
import { fixture } from "./fixture.mjs";

export const EN = [
  fixture("en1-venting", "en", "Sibling venting in several bubbles; advice, rhetorical question, sarcasm. English mirror of UAT-01.", ["Jo", "Me"], [
    ["p1", "Honestly I don't have any plan right now"],
    ["p1", "Just figuring out what we eat each day"],
    ["p1", "Can't think straight"],
    ["p1", "No energy for anything"],
    ["p2", "Then just eat well every day, treat yourselves"],
    ["p1", "Easy for you to say"],
    ["p1", "You've got a partner and savings, you just enjoy life"],
    ["p2", "Does complaining like this actually help?"],
    ["p1", "right"],
    ["p1", "I'm exhausted and lonely, that's why I say it"],
    ["p2", "Tired? Take some vitamins. Lonely? Take the kids to the park."],
    ["p1", "wow. genius"],
    ["p1", "I'm hurting here"],
  ], {
    acc: { m1: "A AC UNCLEAR", m2: "A AC", m3: "AC UNCLEAR FC", m4: "AC UNCLEAR FC", m5: "NP FC A", m6: "CP AC", m7: "CP AC", m8: "CP A", m9: "UNCLEAR AC A", m10: "FC A AC", m11: "CP A NP", m12: "CP AC FC", m13: "FC AC UNCLEAR" },
    hard: { m4: "FC:high", m6: "A:high NP:*", m8: "A:high NP:*", m9: "*:high", m11: "NP:high", m12: "A:* NP:*" },
    ceil: { m1: "medium", m3: "medium", m4: "medium", m7: "medium", m9: "low" },
    review: ["m4", "m9", "m10", "m13"], safety: "either",
    contexts: { leadingA: { relationship: "family", note: "She always plays the victim so people will rescue her." } },
  }),

  fixture("en2-sibling", "en", "Phase 0 fixture 07: question, apology, 'Typical', defence, stress, care, delight.", ["Sam", "Alex"], [
    ["p1", "Mum's birthday is Sunday. Did you book the restaurant like you said?"],
    ["p2", "Oh no. I completely forgot. I'm so sorry!!"],
    ["p1", "Typical. You never follow through on anything."],
    ["p2", "That's not fair. I organised the last three family things."],
    ["p1", "Okay, fair. I'm just stressed, work has been a lot."],
    ["p2", "That sounds rough. Want me to call a few places tonight and send you options?"],
    ["p1", "Yes please, that would help a lot 🙏"],
    ["p2", "Haha deal. Let's make it the best birthday ever!"],
  ], {
    acc: { m1: "A CP", m2: "AC FC", m3: "CP", m4: "AC A FC", m5: "A FC AC", m6: "NP A", m7: "AC FC A", m8: "FC" },
    hard: { m3: "A:* NP:* FC:*", m4: "NP:*", m6: "CP:*", m8: "CP:*" },
    ceil: { m1: "medium", m5: "medium" }, review: ["m1", "m5"], safety: false,
    contexts: { rel: { relationship: "family", note: "" } },
  }),

  fixture("en3-couple", "en", "Phase 0 fixture 01: postponed dinner, 'always', apology, 'Fine. Do whatever you want.', 'ok'.", ["Alex", "Sam"], [
    ["p2", "Hey, I'm so sorry, work blew up. Can we move dinner to tomorrow?"],
    ["p1", "Seriously? This is the third time this month. You always do this."],
    ["p2", "I know, I'm really sorry. I feel awful about it."],
    ["p1", "Fine. Do whatever you want."],
    ["p2", "Can we talk about it properly when I get home? I want to understand what's going on for you."],
    ["p1", "ok"],
  ], {
    acc: { m1: "AC A", m2: "CP", m3: "AC FC", m4: "AC CP FC UNCLEAR", m5: "A NP", m6: "UNCLEAR AC" },
    hard: { m2: "A:* NP:*", m3: "CP:*", m5: "CP:high", m6: "*:medium *:high" },
    ceil: { m4: "medium", m6: "low" }, review: ["m4"], safety: false,
    contexts: { rel: { relationship: "partner", note: "" } },
  }),

  fixture("en4-short", "en", "Phase 0 fixture 06: very short replies.", ["Jamie", "Me"], [
    ["p1", "did you see my message"],
    ["p2", "yeah"],
    ["p1", "and?"],
    ["p2", "k"],
    ["p1", "wow ok"],
    ["p2", "😂"],
    ["p1", "?"],
    ["p2", "nothing, just tired"],
  ], {
    acc: { m1: "A CP UNCLEAR", m2: "A UNCLEAR", m3: "A CP UNCLEAR", m4: "UNCLEAR AC", m5: "UNCLEAR FC CP", m6: "UNCLEAR FC", m7: "UNCLEAR A", m8: "AC FC A UNCLEAR" },
    hard: { m4: "*:medium *:high", m5: "*:high", m6: "*:high", m7: "*:high", m8: "FC:high" },
    ceil: { m2: "medium", m3: "medium", m4: "low", m5: "medium", m6: "low", m7: "low", m8: "medium" },
    review: ["m5", "m8"], safety: false,
  }),
];

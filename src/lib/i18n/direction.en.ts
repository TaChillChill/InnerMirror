// Conversation Direction strings (U8, Founder N1/N2 2026-11-01). Each action says what the
// state would do in words, never what it would achieve; the table is the same for everyone.
export const directionEn = {
  title: "Which way would you like the conversation to go?",
  lead: "Pick a direction to see ego states you could try. Nothing is sent until you choose to explore.",
  needSelf: "Choose who you are above to try a direction.",
  goals: {
    understand: "Understand each other better",
    solve: "Find a solution together",
    calm: "Ease the tension",
    boundary: "Set a clear boundary",
    pause: "Pause the conversation",
  },
  actions: {
    understand: { a: "Ask to understand what the other person sees.", fc: "Say plainly what you feel and what you want." },
    solve: { a: "Lay out the facts and the options.", np: "Offer to help with one concrete part." },
    calm: { np: "Acknowledge what the other person just said.", a: "Say back what you understood from them." },
    boundary: { a: "State your limit and the reason for it, calmly.", cp: "Hold your limit firmly (the protective side of Critical Parent)." },
    pause: { a: "Say clearly that you are pausing the conversation.", np: "Decline gently while still showing care." },
  } as Record<string, Record<string, string>>,
  suggestTitle: "With this direction, you could try…",
  stillYou: "You still decide.",
  chooseOther: "Choose another state",
  hideOther: "Hide the other states",
  tryIt: "Try this direction",
  pickState: "Pick a state above first.",
  limit: "Mirror tries this on a message you already sent. Suggestions for your next reply will come later.",
  noTarget: "None of your messages has a reply yet, so there's nothing to try this on.",
  sampleOff: "In the sample, What if? is off because it needs a live call.",
  tableNote: "These suggestions come from a fixed table, the same for every conversation. They aren't based on you or on this chat.",
};
export type DirectionDict = typeof directionEn;

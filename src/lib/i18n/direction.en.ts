// Conversation Direction strings (U8, Founder N1/N2 2026-11-01; reference only since UAT #09/#10). Each action says what the
// state would do in words, never what it would achieve; the table is the same for everyone.
export const directionEn = {
  title: "Which way would you like the conversation to go?",
  lead: "Tap a direction to see ego states that could fit it.",
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
  tableNote: "These suggestions come from a fixed table, the same for every conversation. They aren't based on you or on this chat, and other states could fit too.",
  reference: "These directions are here for reference. You still decide what you want to do next.",
};
export type DirectionDict = typeof directionEn;

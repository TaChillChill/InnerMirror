// Predefined, synthetic data for prototype v2. Shaped like the Phase 0 analysis schema.
window.IM_DATA = (function () {
  const EX = {
    cp: { name: "Critical Parent", structural: "P", short: "sets rules, standards or limits", desc: "Sets standards, rules and limits. Can come across as firm or critical." },
    np: { name: "Nurturing Parent", structural: "P", short: "cares for or protects", desc: "Offers care, comfort and protection. Can slide into over-helping." },
    a: { name: "Adult", structural: "A", short: "deals in facts and options", desc: "Gathers facts and weighs options. Can come across as detached." },
    fc: { name: "Free Child", structural: "C", short: "says a feeling or want openly", desc: "Expresses feelings and wants openly. Can be impulsive." },
    ac: { name: "Adapted Child", structural: "C", short: "adjusts to others", desc: "Adjusts to others and to expectations. Can hold back own needs." },
  };
  const EX_ORDER = ["cp", "np", "a", "fc", "ac"];
  const PLACE = {
    P: { name: "Parent side", hint: "rules, care, how things should be" },
    A: { name: "Adult side", hint: "facts, questions, options" },
    C: { name: "Child side", hint: "feelings, wants, fitting in" },
    UNCLEAR: { name: "hard to tell", hint: "" },
  };

  const participants = [
    { id: "p1", name: "Linh", pseudonym: "Person A" },
    { id: "p2", name: "Me", pseudonym: "Person B" },
  ];

  const messages = [
    { id: "m1", speakerId: "p1", text: "Why are the dishes ALWAYS left for me?" },
    { id: "m2", speakerId: "p2", text: "Sorry, I'll do them now." },
    { id: "m3", speakerId: "p1", text: "It's fine. I just feel like I'm the only one who notices." },
    { id: "m4", speakerId: "p2", text: "Okay, but let's look at the facts: I did the bathroom and the laundry this week." },
    { id: "m5", speakerId: "p1", text: "Great, so now it's a competition." },
    { id: "m6", speakerId: "p2", text: "No, sorry. Could we make a simple rota this weekend?" },
    { id: "m7", speakerId: "p1", text: "Maybe. I'm just tired of always being the one who asks." },
  ];

  // Screenshot extraction: one line partly cut off, so review has something real to fix.
  const extracted = messages.map((m) => ({ ...m, legibility: "clear" }));
  extracted[2] = { ...extracted[2], text: "It's fine. I just feel like I'm the only one who n", legibility: "partial" };

  const readings = {
    m1: { ex: "cp", target: "C", cues: ["ALWAYS", "Why are"], confidence: "medium", reading: "A question with \"ALWAYS\" in capitals can read as a criticism about a pattern.", altReading: "Free Child: a direct burst of frustration." },
    m2: { ex: "ac", target: "P", cues: ["Sorry", "now"], confidence: "medium", reading: "Apologizing and doing the task right away, which can smooth things over quickly.", altReading: "Nurturing Parent: taking the task on to look after Linh.", question: "When you wrote \"Sorry, I'll do them now\", what did you want to happen next?" },
    m3: { ex: "ac", target: "P", cues: ["It's fine", "the only one who notices"], confidence: "low", reading: "\"It's fine\" followed by a hurt-sounding line can read as holding something back.", altReading: "Free Child: saying a feeling openly." },
    m4: { ex: "a", target: "A", cues: ["let's look at the facts"], confidence: "high", reading: "Moving to facts and a list of tasks reads as problem-solving.", altReading: null, question: "Just before you listed the chores, what were you feeling?" },
    m5: { ex: "cp", target: "C", cues: ["Great, so now", "competition"], confidence: "low", reading: "A sarcastic \"Great\" can read as a judgment of the previous reply.", altReading: "Free Child: frustration said with a bite." },
    m6: { ex: "a", target: "A", cues: ["Could we", "simple rota"], confidence: "medium", reading: "Suggesting a concrete plan invites working it out together.", altReading: "Nurturing Parent: offering to make things easier for both.", question: "What made you suggest a plan at this point?" },
    m7: { ex: "fc", target: "P", cues: ["I'm just tired", "always being the one"], confidence: "low", reading: "Saying \"I'm just tired\" plainly can read as a feeling said out loud.", altReading: "Adapted Child: a tentative \"Maybe\" that holds back a full yes." },
  };

  // complementary/crossed are recomputed in code from source -> target; only the
  // "second layer" flag comes from the model.
  const transactions = [
    { stimulusId: "m1", responseId: "m2", confidence: "medium", secondLayer: false },
    { stimulusId: "m2", responseId: "m3", confidence: "low", secondLayer: true },
    { stimulusId: "m3", responseId: "m4", confidence: "medium", secondLayer: false },
    { stimulusId: "m4", responseId: "m5", confidence: "low", secondLayer: false },
    { stimulusId: "m5", responseId: "m6", confidence: "medium", secondLayer: false },
    { stimulusId: "m6", responseId: "m7", confidence: "low", secondLayer: false },
  ];

  const shifts = {
    m4: "The reply moves to facts, while the message before it sounded more like a feeling.",
    m6: "The reply steps away from the back-and-forth and moves toward a plan.",
  };

  const summary = "A short exchange about shared chores. It starts with a complaint and a quick apology, turns into a back-and-forth about who does more, and moves toward a plan, with some tiredness still in the air.";
  const uncertainty = "These readings come from the words alone. Tone, history and what was happening around you aren't visible here. You know the context.";

  // What if? — per turn and tried state: an illustrative message and up to 3 possible
  // next steps [state of the reply, illustrative reply, dynamic of the EXCHANGE].
  // Dynamics never state the other person's feelings or motives.
  const S = (msg, ...poss) => ({ msg, poss });
  const whatIf = {
    m2: {
      cp: S("You're right, but it's not fair to say ALWAYS.", ["cp", "Well, it feels like always.", "A correction can invite a counter-correction, and the exchange may stay on who is right."], ["ac", "Fine. Sorry.", "The exchange could close quickly, with the topic left half-open."]),
      np: S("You've been carrying a lot. Let me take the dishes tonight.", ["a", "Thanks. Can we talk about the rest too?", "Care may open space for a practical next step."], ["ac", "It's okay, I can do it.", "An offer of help is sometimes turned down at first; the exchange may need one more round."]),
      a: S("Fair point. What's been left for you this week?", ["a", "Dishes, mostly. And the bin.", "A factual question tends to get facts back, which moves toward solving."], ["cp", "You should know already.", "Facts can be heard as dodging the complaint; the exchange may sharpen."]),
      fc: S("Ugh, I didn't even notice. I'm sorry, that sounds annoying.", ["fc", "It is! Thank you for saying that.", "Feeling met with feeling can soften the tone quickly."]),
    },
    m4: {
      cp: S("That's not fair. I do a lot around here too.", ["cp", "Right. Forget I said anything.", "Firm words may meet firm words, and the exchange could stay tense."], ["ac", "Okay, okay.", "The exchange may stop without the topic being settled."]),
      np: S("That sounds tiring. Thank you for noticing all of it. Want to sit down and split things up?", ["a", "Yeah, that would help. Tonight?", "A reply from the Adult side might become more likely, and the exchange could move toward the problem itself."], ["fc", "Thank you. I really needed to hear that.", "The exchange may stay with the feeling a little longer before any plan."]),
      fc: S("I hate that you feel alone in this. I don't want that.", ["fc", "I know. Thanks.", "An open feeling might be answered by another, and the tone may ease."]),
      ac: S("You're right, I'm sorry. I'll take care of more.", ["ac", "Okay.", "Agreeing may end the tension quickly; whether anything changes is less clear."], ["cp", "You said that last time.", "A quick yes can be heard as a promise to check later."]),
    },
    m6: {
      cp: S("We need a rota. This can't keep happening.", ["ac", "Fine, whatever you say.", "A firm plan may get agreement on the surface while the feeling stays unspoken."]),
      np: S("Let's make it easy on both of us. I'll draft a rota and you just say what you'd change.", ["a", "Okay, send it over.", "Taking a first step for both may make a practical reply more likely."]),
      fc: S("Can we make this fun? Rota plus pizza on Saturday?", ["fc", "Ha. Okay, pizza helps.", "Playfulness can lighten things, or feel too light if the topic still matters."], ["cp", "This isn't a joke.", "A light tone can be read as not taking it seriously."]),
      ac: S("Sorry. I'll do whatever you think is best.", ["cp", "I don't want to decide everything.", "Handing over the decision can be heard as stepping back from it."]),
    },
    next: {
      cp: S("Then let's stop talking and just decide it now.", ["ac", "Okay, if you want.", "Moving fast may settle the plan but skip the tiredness."], ["cp", "Don't rush me.", "Pressure can be met with pushback."]),
      np: S("You shouldn't have to be the one who asks. I'll keep track from now on.", ["fc", "That would mean a lot.", "Taking on the asking may land as relief."], ["a", "Okay, how?", "An offer can invite a practical follow-up question."]),
      a: S("Would it help if the rota also says who checks what?", ["a", "Yes, that's the part I care about.", "A specific option tends to get a specific answer."], ["ac", "Maybe. I don't know.", "A detailed option can feel like a lot right now."]),
      fc: S("I'm tired of this too. Can we just hug and fix it tomorrow?", ["fc", "Yes please.", "Sharing a feeling can bring the tone closer."], ["cp", "Tomorrow never comes.", "Postponing can be heard as avoiding."]),
      ac: S("Sorry. I'll ask you less and just do more.", ["np", "You don't need to apologize.", "An apology may invite reassurance back."]),
    },
  };

  // Illustrative saved collections (synthetic): one entry per message of mine,
  // [AI suggestion, my choice or null if I didn't review it]. Never written to storage.
  const demoCollections = [
    { title: "Weekend plans with Mai", days: 26, note: "Say what I want, not just what works for everyone.", mine: [["a", "a"], ["a", "a"], ["fc", "fc"], ["np", null]] },
    { title: "Feedback from my manager", days: 19, note: "Pause before saying sorry.", mine: [["ac", "ac"], ["ac", "ac"], ["a", "ac"], ["a", "unsure"], ["ac", null], ["cp", "cp"]] },
    { title: "Mum asking about work", days: 12, note: null, mine: [["ac", "ac"], ["fc", null], ["ac", "ac"], ["cp", "fc"]] },
    { title: "Chores with Linh", days: 5, note: "Ask what would help before jumping in.", mine: [["ac", "np"], ["a", "a"], ["a", null]] },
    { title: "Planning the move", days: 2, note: null, mine: [["a", null], ["np", null], ["a", null], ["cp", null], ["a", null]] },
  ];

  const sampleText = messages.map((m) => `${m.speakerId === "p1" ? "Linh" : "Me"}: ${m.text}`).join("\n");

  return { EX, EX_ORDER, PLACE, participants, messages, extracted, readings, transactions, shifts, summary, uncertainty, whatIf, demoCollections, sampleText };
})();

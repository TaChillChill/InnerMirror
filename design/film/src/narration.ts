// Narrator lines and their start times (seconds, film timeline). Single source for the
// voiceover: the TTS script renders one file per line (public/vo/<id>.wav) and the film
// places each at `at`. Lines sit in the gaps the picture leaves: the storm and BOOM keep
// their own sound, the five voices keep their chimes. S6 lines wait for the dark take's marks.
export type VoLine = { id: string; scene: string; at: number; text: string };

export const NARRATION: VoLine[] = [
  { id: "s1-type", scene: "S1", at: 0.8, text: "Some messages, we type… delete… and send anyway." },
  { id: "s2-dinner", scene: "S2", at: 6.6, text: "It started with dinner." },
  { id: "s2-sense", scene: "S2", at: 17.0, text: "Every reply made sense… to the person who sent it." },
  // 28–33 s: BOOM, then true silence. No voice.
  { id: "s4-replay", scene: "S4", at: 33.4, text: "Later, we replay it." },
  { id: "s4-pattern", scene: "S4", at: 39.7, text: "But what if I'm part of the pattern, too?" },
  { id: "s5-bridge", scene: "S5", at: 44.6, text: "What if the way we respond depends on which part of us is speaking?" },
  { id: "s5-ta", scene: "S5", at: 49.8, text: "In Transactional Analysis, these parts are called ego states." },
  // 52.8–65.3 s: the five voices, chimes only.
  { id: "s5-all", scene: "S5", at: 65.4, text: "Everyone speaks from all five." },
  // S6 (68–138 s, dark1 beats): the voice repeats only the captions that carry a product rule,
  // and stays out of D2 and D6 so the real app is heard and seen on its own.
  { id: "s6-this", scene: "S6", at: 68.6, text: "This is InnerMirror." },
  { id: "s6-snap", scene: "S6", at: 71.4, text: "Snap the chat you keep replaying." },
  { id: "s6-hypothesis", scene: "S6", at: 102.3, text: "A hypothesis about words. Never about a person." },
  { id: "s6-decide", scene: "S6", at: 115.3, text: "Mirror suggests. You decide." },
  { id: "s6-device", scene: "S6", at: 133.6, text: "Your reflection stays on your device." },
  { id: "s7-sooner", scene: "S7", at: 139.5, text: "When you can hear which part of you is speaking… you get to choose how you answer." },
  { id: "s7-promise", scene: "S7", at: 146.4, text: "Not a promise. A possibility." },
  { id: "s8-see", scene: "S8", at: 159.0, text: "See yourself more clearly." },
  { id: "s8-connect", scene: "S8", at: 167.7, text: "And connect with others… more consciously." },
  { id: "s9-world", scene: "S9", at: 173.4, text: "The world within us shapes the world between us." },
  { id: "s9-name", scene: "S9", at: 177.4, text: "InnerMirror." },
];

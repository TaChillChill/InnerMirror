// Honest waiting-time estimates for the loading screens, from measured runs rather than
// guesses. Analysis (P0 eval, spec v3.2 at low effort, 22 runs): latency ≈ 4.9 ms per output
// token, and output ≈ 1,140 + 285 tokens per turn, so ≈ 5.6 s + 1.4 s per turn.
// Extraction (M3 + smoke): 4–14 s for 1–3 synthetic screenshots, output-bound as well.
import { groupTurns } from "./ai/analysis-spec.ts";

export type Estimate = { lo: number; hi: number }; // seconds, rounded to 5

const down5 = (s: number) => Math.max(5, Math.floor(s / 5) * 5);
const up5 = (s: number) => Math.ceil(s / 5) * 5;

export function analyzeEstimate(messages: { id: string; speakerId: string; text: string }[]): Estimate {
  const typical = 5.6 + 1.4 * groupTurns(messages).length;
  // Measured spread around the fit was about −20% / +30%.
  return { lo: down5(typical * 0.8), hi: Math.max(up5(typical * 1.3), down5(typical * 0.8) + 5) };
}

export function extractEstimate(images: number): Estimate {
  return { lo: 5, hi: up5(10 + 4 * images) };
}

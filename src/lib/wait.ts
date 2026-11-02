// Honest waiting-time estimates for the loading screens, from measured runs rather than
// guesses. Analysis (P0 eval, spec v3.2 at low effort, 22 runs): latency ≈ 4.9 ms per output
// token, and output ≈ 1,140 + 285 tokens per turn, so ≈ 5.6 s + 1.4 s per turn.
// Extraction (M3 + smoke): 4–14 s for 1–3 synthetic screenshots, output-bound as well.
import { groupTurns } from "./ai/analysis-spec.ts";
import { IMAGES_PER_REQUEST, PARALLEL_REQUESTS } from "./shot-batches.ts";

export type Estimate = { lo: number; hi: number }; // seconds, rounded to 5

const down5 = (s: number) => Math.max(5, Math.floor(s / 5) * 5);
const up5 = (s: number) => Math.ceil(s / 5) * 5;

export function analyzeEstimate(messages: { id: string; speakerId: string; text: string }[]): Estimate {
  const typical = 5.6 + 1.4 * groupTurns(messages).length;
  // Measured spread around the fit was about −20% / +30%.
  return { lo: down5(typical * 0.8), hi: Math.max(up5(typical * 1.3), down5(typical * 0.8) + 5) };
}

// More than 3 screenshots are read in parts of 3, two parts at a time (shot-batches.ts), so
// the wait grows with the rounds of parts, not with every screenshot.
export function extractEstimate(images: number): Estimate {
  const perPart = Math.min(images, IMAGES_PER_REQUEST);
  const rounds = Math.ceil(Math.ceil(images / IMAGES_PER_REQUEST) / PARALLEL_REQUESTS);
  return { lo: 5 * rounds, hi: up5(rounds * (10 + 4 * perPart)) };
}

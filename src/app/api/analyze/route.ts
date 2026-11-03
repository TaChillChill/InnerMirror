// POST /api/analyze — conversation in, cleaned AI Observation out. Nothing is stored or
// logged; the conversation exists only for the duration of this request.
import { analyzeRequestSchema } from "@/lib/conversation";
import { ANALYSIS_SPEC_VERSION, analysisLabels, buildAnalysisBody, groupTurns } from "@/lib/ai/analysis-spec";
import { cleanAnalysis } from "@/lib/ai/analysis";
import { MAX_TURNS } from "@/lib/turn-window";
import { callUntilValid, logRequest, MetaError, rateLimited } from "@/lib/ai/meta-client";

export const runtime = "nodejs";
export const maxDuration = 120;

const MAX_BODY_BYTES = 64_000;
const fail = (error: string, status: number) => Response.json({ error }, { status });

export async function POST(req: Request) {
  const startedAt = Date.now();
  const code = process.env.ACCESS_CODE;
  if (code && req.headers.get("x-access-code") !== code) return fail("forbidden", 403);
  const client = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (rateLimited(client)) return fail("rate_limited", 429);

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return fail("too_long", 413);
  let parsed;
  try { parsed = analyzeRequestSchema.safeParse(JSON.parse(raw)); } catch { return fail("invalid_input", 400); }
  if (!parsed.success) return fail("invalid_input", 400);
  const input = parsed.data;
  // The browser sends at most 40 turns (the part the user chose); longer would risk the time
  // and token ceilings, so it is refused before any call.
  if (groupTurns(input.messages).length > MAX_TURNS) return fail("too_long", 413);

  // Names never leave the browser, and the model isn't told who the user is: every
  // participant gets a neutral label, so "Who am I?" can't change a reading.
  const labels = analysisLabels(input);
  // Low effort by default: in the P0 eval it was as accurate as medium, more stable between
  // runs, ~2x faster, and medium truncated long conversations (scripts/phase0/results/p0).
  const body = buildAnalysisBody(input, { effort: process.env.ANALYZE_EFFORT === "medium" ? "medium" : "low" });

  const sizes = { messages: input.messages.length, turns: groupTurns(input.messages).length, effort: body.reasoning_effort };
  try {
    // A retry needs about one typical call (p90 22 s at low effort, P0 eval).
    const { result: analysis, latencyMs, attempts } = await callUntilValid("analyze", body, startedAt, (json) => cleanAnalysis(json, input.messages), { retryMinMs: 25_000 });
    logRequest("analyze", startedAt, { ...sizes, attempts, outcome: analysis ? "ok" : "invalid_output", segments: analysis?.segments.length ?? null });
    if (!analysis) return fail("invalid_output", 502);
    return Response.json({ analysis, labels: Object.fromEntries(Object.entries(labels).map(([id, label]) => [label, id])), meta: { latencyMs, spec: ANALYSIS_SPEC_VERSION } });
  } catch (e) {
    logRequest("analyze", startedAt, { ...sizes, outcome: e instanceof MetaError ? e.code : "unknown" });
    if (e instanceof MetaError) {
      const status = { not_configured: 500, budget: 503, timeout: 504, upstream: 502, invalid_output: 502 }[e.code];
      return fail(e.code, status);
    }
    console.error(JSON.stringify({ event: "analyze_error", name: e instanceof Error ? e.name : "unknown" }));
    return fail("unknown", 500);
  }
}

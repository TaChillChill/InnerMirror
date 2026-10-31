// POST /api/analyze — conversation in, cleaned AI Observation out. Nothing is stored or
// logged; the conversation exists only for the duration of this request.
import { analyzeRequestSchema } from "@/lib/conversation";
import { ANALYSIS_SPEC_VERSION, analysisLabels, buildAnalysisBody } from "@/lib/ai/analysis-spec";
import { cleanAnalysis } from "@/lib/ai/analysis";
import { callMeta, MetaError, rateLimited } from "@/lib/ai/meta-client";

export const runtime = "nodejs";
export const maxDuration = 120;

const MAX_BODY_BYTES = 64_000;
const fail = (error: string, status: number) => Response.json({ error }, { status });

export async function POST(req: Request) {
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

  // Names never leave the browser, and the model isn't told who the user is: every
  // participant gets a neutral label, so "Who am I?" can't change a reading.
  const labels = analysisLabels(input);
  // Low effort by default: in the P0 eval it was as accurate as medium, more stable between
  // runs, ~2x faster, and medium truncated long conversations (scripts/phase0/results/p0).
  const body = buildAnalysisBody(input, { effort: process.env.ANALYZE_EFFORT === "medium" ? "medium" : "low" });

  try {
    // One retry only when the output is unusable; each attempt is billed.
    for (let attempt = 1; attempt <= 2; attempt++) {
      const { content, latencyMs } = await callMeta("analyze", body);
      let json: unknown = null;
      try { json = JSON.parse(content); } catch { /* retried below */ }
      const analysis = json && cleanAnalysis(json, input.messages);
      if (analysis) {
        return Response.json({ analysis, labels: Object.fromEntries(Object.entries(labels).map(([id, label]) => [label, id])), meta: { latencyMs, spec: ANALYSIS_SPEC_VERSION } });
      }
    }
    return fail("invalid_output", 502);
  } catch (e) {
    if (e instanceof MetaError) {
      const status = { not_configured: 500, budget: 503, timeout: 504, upstream: 502, invalid_output: 502 }[e.code];
      return fail(e.code, status);
    }
    console.error(JSON.stringify({ event: "analyze_error", name: e instanceof Error ? e.name : "unknown" }));
    return fail("unknown", 500);
  }
}

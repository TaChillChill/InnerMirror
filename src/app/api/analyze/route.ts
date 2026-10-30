// POST /api/analyze — conversation in, cleaned AI Observation out. Nothing is stored or
// logged; the conversation exists only for the duration of this request.
import { analyzeRequestSchema } from "@/lib/conversation";
import { SYSTEM_PROMPT, ANALYSIS_JSON_SCHEMA, ANALYSIS_SPEC_VERSION, buildUserPayload, pseudonymLabel, SELF_LABEL } from "@/lib/ai/analysis-spec";
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

  // Names never leave the browser; the model sees "You" and neutral labels.
  let n = 0;
  const participants = input.participantIds.map((id) => ({ id, label: id === input.selfId ? SELF_LABEL[input.language] : pseudonymLabel(n++, input.language) }));
  const body = {
    reasoning_effort: process.env.ANALYZE_EFFORT === "low" ? "low" : "medium",
    max_completion_tokens: 12_000,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPayload({ language: input.language, selfId: input.selfId, participants, messages: input.messages }) },
    ],
    response_format: { type: "json_schema", json_schema: { name: `Observation_${ANALYSIS_SPEC_VERSION.replace(".", "_")}`, strict: true, schema: ANALYSIS_JSON_SCHEMA } },
  };

  try {
    // One retry only when the output is unusable; each attempt is billed.
    for (let attempt = 1; attempt <= 2; attempt++) {
      const { content, latencyMs } = await callMeta("analyze", body);
      let json: unknown = null;
      try { json = JSON.parse(content); } catch { /* retried below */ }
      const analysis = json && cleanAnalysis(json, input.messages, input.selfId);
      if (analysis) {
        return Response.json({ analysis, labels: Object.fromEntries(participants.map((p) => [p.label, p.id])), meta: { latencyMs, spec: ANALYSIS_SPEC_VERSION } });
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

// POST /api/scenario — "what if this message had come from another ego state?", for any
// speaker's message. Returns up to two plausible receiver STATES with evidence; never messages. The conversation (up to the
// explored message only) exists for the duration of this request: not stored, not logged.
import { buildScenarioBody, SCENARIO_SPEC_VERSION } from "@/lib/ai/scenario-spec";
import { cleanScenario, localAnswer, receiverPrior, scenarioParticipants, scenarioRequestSchema } from "@/lib/ai/scenario";
import { pseudonymLabel, SELF_LABEL } from "@/lib/ai/analysis-spec";
import { callUntilValid, logRequest, MetaError, rateLimited } from "@/lib/ai/meta-client";
import { botBlocked } from "@/lib/ai/bot-check";

export const runtime = "nodejs";
export const maxDuration = 120;

const MAX_BODY_BYTES = 64_000;
// Comparing several characters means several calls, so the limit is higher than analyze's.
const RATE_LIMIT = 20;
const fail = (error: string, status: number) => Response.json({ error }, { status });

export async function POST(req: Request) {
  const startedAt = Date.now();
  const code = process.env.ACCESS_CODE;
  if (code && req.headers.get("x-access-code") !== code) return fail("forbidden", 403);
  const blocked = await botBlocked("scenario");
  if (blocked) return blocked;
  const client = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (rateLimited(`scenario:${client}`, RATE_LIMIT)) return fail("rate_limited", 429);

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return fail("too_long", 413);
  let parsed;
  try { parsed = scenarioRequestSchema.safeParse(JSON.parse(raw)); } catch { return fail("invalid_input", 400); }
  if (!parsed.success) return fail("invalid_input", 400);
  const input = parsed.data;

  // Nothing readable before this point means there is no pattern: answer without a model call.
  const prior = receiverPrior(input);
  const local = localAnswer(prior);
  if (local) return Response.json({ scenario: local, labels: {}, meta: { spec: SCENARIO_SPEC_VERSION, local: true } });

  // Names never leave the browser; the model sees "You" (if a self is chosen) and neutral labels.
  const participants = scenarioParticipants(input, SELF_LABEL[input.language], (i) => pseudonymLabel(i, input.language));
  const body = buildScenarioBody({ ...input, participants });

  const sizes = { messages: input.messages.length };
  try {
    const { result: scenario, latencyMs, attempts } = await callUntilValid("scenario", body, startedAt, (json) => cleanScenario(json, input), { retryMinMs: 20_000 });
    logRequest("scenario", startedAt, { ...sizes, attempts, outcome: scenario ? "ok" : "invalid_output" });
    if (!scenario) return fail("invalid_output", 502);
    return Response.json({ scenario, labels: Object.fromEntries(participants.map((p) => [p.label, p.id])), meta: { latencyMs, spec: SCENARIO_SPEC_VERSION } });
  } catch (e) {
    logRequest("scenario", startedAt, { ...sizes, outcome: e instanceof MetaError ? e.code : "unknown" });
    if (e instanceof MetaError) {
      const status = { not_configured: 500, budget: 503, timeout: 504, upstream: 502, invalid_output: 502 }[e.code];
      return fail(e.code, status);
    }
    console.error(JSON.stringify({ event: "scenario_error", name: e instanceof Error ? e.name : "unknown" }));
    return fail("unknown", 500);
  }
}

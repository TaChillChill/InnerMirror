// POST /api/extract — screenshots in, an unverified transcript out. The images exist only
// for the duration of this request: not written anywhere, not logged. The result is a
// draft the user must review; nothing is analyzed here.
import { z } from "zod";
import { EXTRACT_SYSTEM_PROMPT, EXTRACT_JSON_SCHEMA, EXTRACT_SPEC_VERSION, buildExtractContent } from "@/lib/ai/extract-spec";
import { cleanExtraction } from "@/lib/ai/extraction";
import { callUntilValid, logRequest, MetaError, rateLimited } from "@/lib/ai/meta-client";

export const runtime = "nodejs";
export const maxDuration = 120;

const MAX_IMAGES = 3; // keep in sync with src/lib/image.ts
// Vercel rejects bodies over 4.5 MB; the browser compresses to fit well under that.
const MAX_BODY_BYTES = 4_300_000;
// Conservative stand-in for image input tokens (undocumented; refined from measured usage).
const TOKENS_PER_IMAGE = 3_000;

const jpegDataUrl = z.string().max(1_700_000).startsWith("data:image/jpeg;base64,/9j/")
  .refine((s) => /^[A-Za-z0-9+/=]+$/.test(s.slice("data:image/jpeg;base64,".length)));
const requestSchema = z.object({
  language: z.enum(["en", "vi"]),
  images: z.array(jpegDataUrl).min(1).max(MAX_IMAGES),
  consent: z.literal(true),
});

const fail = (error: string, status: number) => Response.json({ error }, { status });

export async function POST(req: Request) {
  const startedAt = Date.now();
  const code = process.env.ACCESS_CODE;
  if (code && req.headers.get("x-access-code") !== code) return fail("forbidden", 403);
  const client = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (rateLimited(`extract:${client}`)) return fail("rate_limited", 429);

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return fail("too_large", 413);
  let parsed;
  try { parsed = requestSchema.safeParse(JSON.parse(raw)); } catch { return fail("invalid_input", 400); }
  if (!parsed.success) return fail("invalid_input", 400);
  const { language, images } = parsed.data;

  const body = {
    // Low effort: medium was tested on a Vietnamese crop and made the same diacritic misreads at 2x cost.
    reasoning_effort: "low",
    max_completion_tokens: 8_000,
    messages: [
      { role: "system", content: EXTRACT_SYSTEM_PROMPT },
      { role: "user", content: buildExtractContent(language, images) },
    ],
    response_format: { type: "json_schema", json_schema: { name: `Extraction_${EXTRACT_SPEC_VERSION.replace(".", "_")}`, strict: true, schema: EXTRACT_JSON_SCHEMA } },
  };

  const sizes = { images: images.length, imageKb: Math.round(images.reduce((n, i) => n + i.length, 0) / 1024) };
  try {
    const { result: extraction, latencyMs, attempts } = await callUntilValid("extract", body, startedAt, (json) => cleanExtraction(json), { retryMinMs: 20_000, extraInputTokens: TOKENS_PER_IMAGE * images.length });
    logRequest("extract", startedAt, { ...sizes, attempts, outcome: extraction ? "ok" : "invalid_output", messages: extraction?.messages.length ?? null });
    if (!extraction) return fail("invalid_output", 502);
    return Response.json({ extraction, meta: { latencyMs, spec: EXTRACT_SPEC_VERSION } });
  } catch (e) {
    logRequest("extract", startedAt, { ...sizes, outcome: e instanceof MetaError ? e.code : "unknown" });
    if (e instanceof MetaError) {
      const status = { not_configured: 500, budget: 503, timeout: 504, upstream: 502, invalid_output: 502 }[e.code];
      return fail(e.code, status);
    }
    console.error(JSON.stringify({ event: "extract_error", name: e instanceof Error ? e.name : "unknown" }));
    return fail("unknown", 500);
  }
}

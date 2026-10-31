# Technical Architecture

Status: **stack approved 2026-10-30.** Schemas below are refined by Phase 0 results (`docs/PHASE0_REPORT.md`).

Build order: paste-text flow first (Phase 1); screenshot extraction (`/api/extract`) is Phase 3 (built in Phase 1 M3, 2026-10-30: up to 3 images, `low` effort, schema in `src/lib/ai/extract-spec.ts`).

## Recommendation
**One Next.js (App Router, TypeScript) app on Vercel. No database, no auth.** Three server routes call the Meta Model API; everything else is client-side state + localStorage.

Why: one codebase, one deploy target (Vercel CLI already installed), server routes keep the API key secret, and no infrastructure we'd have to secure or migrate later.

### Options considered
| Option | Pros | Cons | Verdict |
|---|---|---|---|
| **A. Next.js on Vercel** | Fast setup, API routes built in, free preview URLs for judges | 4.5 MB request body limit on functions | **Recommended** |
| B. Vite SPA + small serverless proxy | Lighter frontend | Two pieces to wire and deploy | Fine, but no real gain |
| C. Python (FastAPI) backend + React | Python AI ecosystem | Machine has Python 3.9 and no `uv`; two languages; more setup | Not for a 5-day build |

## Dependencies (minimal)
- `next`, `react`, `react-dom`, `typescript` (from `create-next-app`)
- `tailwindcss` (from `create-next-app`; fastest way to a calm, consistent UI)
- `zod`: validate every model response before the UI touches it
- Meta API via plain `fetch` (OpenAI-compatible Chat Completions). No SDK: the wrapper is ~50 lines and avoids a dependency whose defaults (e.g. reading `OPENAI_API_KEY`) can surprise.
- No chart library, no i18n library, no state library, no DB client.

## Data flow
```
Browser                                   Server (Next.js route handlers)        Meta Model API
───────                                   ──────────────────────────────          ──────────────
pick screenshot
→ resize/compress (canvas, JPEG)
→ POST /api/extract {image, lang}  ───→   build prompt + json_schema  ───────→   muse-spark-1.3 (vision)
                                          validate (zod), drop image   ←──────
← Extraction JSON
user corrects transcript, picks "me"
→ POST /api/analyze {transcript, me, lang} → prompt + json_schema ─────────→   muse-spark-1.3 (text)
← Analysis JSON  (+ safety flags)
user reflects (client only)
→ POST /api/scenario {context, turn, state, lang} → prompt + json_schema ──→   muse-spark-1.3 (text)
← Scenario JSON
"Save" → localStorage (Mirror)
```

**Why two calls (extract, then analyze) instead of one:** the analysis must run on the *user-corrected* transcript, and the image can be discarded right after extraction (privacy). It also makes failures easier to locate.

## Server routes
| Route | Input | Output | Model settings (to tune) |
|---|---|---|---|
| `POST /api/extract` | JPEG data URL (≤ ~1.5 MB), `lang` | `Extraction` | `muse-spark-1.3`, low reasoning effort |
| `POST /api/analyze` | `Transcript`, `selfId`, `lang` | `Analysis` | `muse-spark-1.3`, medium reasoning effort |
| `POST /api/scenario` | messages up to and including the explored own message (never later ones), each with its current label (user's choice wins), `receiverId`, explored `state`, `lang` | `Scenario` (up to 2 plausible receiver states + evidence; answered locally when the receiver has no readable earlier message) | `muse-spark-1.3`, medium |

Each route: validate input (zod) → if `AI_MODE=fixtures`, return fixture → call Meta with `response_format: json_schema` → validate output → one retry on invalid JSON → typed error. Never log request/response bodies.

## Core types (sketch)
```ts
type EgoState = "CP" | "NP" | "A" | "FC" | "AC";
type Confidence = "low" | "medium" | "high";

interface Participant { id: string; displayName: string }
interface Message { id: string; speakerId: string; text: string; extractionConfidence: Confidence }
interface Transcript { participants: Participant[]; messages: Message[] }
interface Extraction extends Transcript { notes: string[] }        // e.g. "2 lines cut off at top"

type Structural = "P" | "A" | "C";

interface MessageReading {
  messageId: string;
  expression: EgoState | "UNCLEAR"; // functional expression of this message (mascot)
  source: Structural | "UNCLEAR";   // where the message seems to come from
  target: Structural | "UNCLEAR";   // which state in the other it seems to address/invite
  cues: string[];                   // quoted spans: observable language only
  rationale: string;                // hedged interpretation
  confidence: Confidence;
  alternative: EgoState | null;     // required when confidence != "high"
  reflectionQuestion: string | null;// only for the user's own messages
}
interface Transaction {
  stimulusId: string; responseId: string;
  type: "complementary" | "crossed" | "ulterior" | "unclear";
  explanation: string; confidence: Confidence;
}
interface Analysis {
  readings: MessageReading[];
  transactions: Transaction[];
  turningPoints: { messageId: string; why: string }[];
  summary: string;
  uncertainty: string;
  safety: { flagged: boolean; categories: ("abuse" | "coercion" | "threat" | "self_harm" | "harassment")[]; note: string | null };
}
// State-only (Founder, 2026-10-31): no generated messages. See src/lib/ai/scenario.ts.
interface Scenario { evidence: "enough" | "thin" | "insufficient"; ranked: boolean; possibilities: { state: EgoState; basis: "pattern" | "context"; rationale: string; evidenceMessageIds: string[]; cues: string[] }[]; note: string | null; reflectionQuestion: string | null; flagged: boolean }

interface Mirror {               // saved locally; AI and user fields never merged
  id: string; createdAt: string; lang: "en" | "vi";
  ai: { summary: string; readings: MessageReading[] };
  user: { choices: { messageId: string; state: EgoState | "UNSURE"; note?: string }[]; insight?: string; context?: string };
  scenario?: { turnId: string; targetState: EgoState; result: Scenario };
  transcript?: Transcript;    // only if the user opts in
}
```
Final schemas must respect Meta's strict subset: plain object root, `additionalProperties: false`, all keys required (use nullable instead of optional), no recursion.

## Folder structure (after scaffold)
```
src/
  app/
    page.tsx                 # landing
    reflect/page.tsx         # the 5-step flow (client component, step state)
    api/extract/route.ts
    api/analyze/route.ts
    api/scenario/route.ts
  components/                # Uploader, TranscriptEditor, Timeline, ReflectStep, ScenarioCard, MirrorCard, CharacterBadge
  lib/
    meta-client.ts           # fetch wrapper: auth, timeout, retry, no logging of content
    schemas.ts               # zod schemas + JSON schemas for response_format
    prompts/                 # extract.ts, analyze.ts, scenario.ts (EN prompts, output lang param)
    image.ts                 # client-side resize/compress
    mirror-store.ts          # localStorage read/write with try/catch
    i18n/                    # en.json, vi.json, t()
  fixtures/                  # synthetic conversations + expected JSON (for fixtures mode and tests)
public/characters/           # placeholder or Muse Image generated assets
scripts/                     # (P1) generate-characters.ts
```

## Image handling
- Client: downscale to max 1280 px width, JPEG q≈0.85; reject > 4 MB after compression (Vercel body limit 4.5 MB). Very tall screenshots: keep height, check legibility in testing.
- Server: pass as base64 data URL to Meta; never write to disk or storage.

## Abuse / cost protection (approved in principle)
- Live mode behind a shared access code (env `ACCESS_CODE`, checked server-side, httpOnly cookie). Sample mode open to all.
- Rate limit per IP on API routes (Vercel firewall rule if available on the plan; otherwise simple in-memory limiter as best effort).
- Per-request caps: max transcript length (e.g. 60 messages / 8k chars), `max_completion_tokens` on every call.
- Meta-side: no user-configurable spend cap found in docs; Meta ToS §13.2 says Meta sets the spending limit. Rely on prepaid hackathon credits + no auto top-up (Founder to confirm in billing settings).

## Testing
- Unit: zod schemas against fixtures; prompt builders; mirror store.
- Prompt eval: 8–10 **synthetic** screenshots (EN + VI, 2 and 3 participants, one hostile/safety case, one low-quality image). Record extraction accuracy and reading plausibility in `docs/` eval notes.
- E2E: manual checklist on deployed preview (desktop + mobile), both languages. Playwright only if time allows.

## Deployment
Vercel preview deployment (needs Founder approval). Env vars set in Vercel dashboard. Production promotion only if the submission requires it.

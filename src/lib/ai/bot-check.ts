// Vercel BotID (Basic, free) in front of every route that calls Meta. It keeps scripts and
// direct API calls out; it is not a spending cap. Must stay in step with the client list in
// src/instrumentation-client.ts: a route checked here but not listed there reads as a bot.
import "server-only";
import { checkBotId } from "botid/server";

// BotID only works on a Vercel deployment (OIDC + request context). Local `next start` and
// the mocked e2e have no challenge script, so they skip it; `vercel env pull` sets
// VERCEL_ENV=development, which also skips.
export const botIdActive = (env = process.env.VERCEL_ENV) => env === "production" || env === "preview";

/** A response to send instead of calling Meta, or null when the caller may continue. */
export async function botBlocked(route: string): Promise<Response | null> {
  if (!botIdActive()) return null;
  try {
    const { isBot } = await checkBotId();
    if (!isBot) return null;
    console.info(JSON.stringify({ event: "botid_blocked", route }));
    // A generic code: a real person misread as a bot sees "Something went wrong", not a
    // message about access codes.
    return Response.json({ error: "unknown" }, { status: 403 });
  } catch (e) {
    // Fail closed: when BotID can't answer, no paid call is made.
    console.error(JSON.stringify({ event: "botid_error", route, name: e instanceof Error ? e.name : "unknown" }));
    return Response.json({ error: "upstream" }, { status: 503 });
  }
}

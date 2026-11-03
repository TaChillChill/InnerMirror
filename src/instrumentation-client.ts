// Vercel BotID: attaches the invisible challenge to every request that reaches Meta.
// Must match the server checks (src/lib/ai/bot-check.ts). Only on Vercel deployments: locally
// there is no challenge script, and a protected fetch would wait on it and fail.
import { initBotId } from "botid/client/core";

const env = process.env.NEXT_PUBLIC_VERCEL_ENV;
if (env === "production" || env === "preview") {
  initBotId({
    protect: [
      { path: "/api/analyze", method: "POST" },
      { path: "/api/extract", method: "POST" },
      { path: "/api/scenario", method: "POST" },
    ],
  });
}

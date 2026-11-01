// One reading of a failed API response for every screen. Our routes answer { error: "code" };
// Vercel's firewall rate limit answers 429 with its own body, which must still read as
// "too many tries" rather than a generic error.
export function errorCode(status: number, json: unknown): string {
  const code = (json as { error?: unknown } | null)?.error;
  if (typeof code === "string") return code;
  return status === 429 ? "rate_limited" : "unknown";
}

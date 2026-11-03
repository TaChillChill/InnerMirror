import type { NextConfig } from "next";

// Static policy, so pages stay static and cached. 'unsafe-inline' scripts are needed for
// Next's inline RSC payload and the pre-paint theme script; a nonce would force dynamic
// rendering. The rest still blocks foreign scripts, framing, plugins and sending data
// (including screenshots and saved reflections) to any other origin. `next dev` also needs
// eval for React Refresh; production builds never get it.
const DEV = process.env.NODE_ENV === "development";
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${DEV ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CSP },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Dictation needs the microphone on our own origin; nothing else is used.
  { key: "Permissions-Policy", value: "camera=(), geolocation=(), microphone=(self), payment=(), usb=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // `next dev` otherwise writes an AGENTS.md into the repo; project rules live in CLAUDE.md.
  agentRules: false,
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;

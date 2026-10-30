import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // `next dev` otherwise writes an AGENTS.md into the repo; project rules live in CLAUDE.md.
  agentRules: false,
};

export default nextConfig;

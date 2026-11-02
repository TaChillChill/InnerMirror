import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

// Brand assets are read straight from the repo (mascot sources, logo) so the
// storyboard never carries its own copies that could drift from the originals.
const repoRoot = fileURLToPath(new URL("../..", import.meta.url));

export default defineConfig({
  plugins: [react()],
  server: { host: "127.0.0.1", fs: { allow: [repoRoot] } },
});

import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const frontendRoot = fileURLToPath(new URL(".", import.meta.url));
// Repo root (one level above frontend/).
// Used as outputFileTracingRoot so traced file paths are relative to the repo root.
// On Vercel, postbuild copies .next/ to ../.next/ (repo root) so the @vercel/next
// adapter resolves traced paths like "frontend/node_modules/next/..." correctly.
const repoRoot = fileURLToPath(new URL("..", import.meta.url));

const config: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: repoRoot,
  // turbopack.root anchors Turbopack's project root to frontend/ for local dev (next dev)
  // and Vercel/Railway production builds.
  turbopack: {
    root: frontendRoot,
  },
  images: {
    unoptimized: true,
  },
};

export default config;

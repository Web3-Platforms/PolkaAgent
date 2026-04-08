import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const frontendRoot = fileURLToPath(new URL(".", import.meta.url));

const config: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: frontendRoot,
  // turbopack.root anchors Turbopack's project root to frontend/ for local dev (next dev).
  // Production builds use --webpack (see package.json) to avoid Turbopack's restriction
  // on distDir navigating outside the project path.
  //
  // On Vercel, rootDirectory=frontend means Next.js runs from /vercel/path0/frontend/.
  // Vercel's @vercel/next post-build step looks for routes-manifest-deterministic.json
  // at /vercel/path0/.next/ (repo root). Setting distDir="../.next" when VERCEL=1 puts
  // webpack's build output there so the validator finds it.
  // webpack (unlike Turbopack) allows distDir to navigate above the project root.
  distDir: process.env.VERCEL ? "../.next" : ".next",
  turbopack: {
    root: frontendRoot,
  },
  images: {
    unoptimized: true,
  },
};

export default config;

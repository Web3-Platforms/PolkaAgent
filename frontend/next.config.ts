import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const frontendRoot = fileURLToPath(new URL(".", import.meta.url));

const config: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: frontendRoot,
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

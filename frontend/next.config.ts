import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const frontendRoot = fileURLToPath(new URL(".", import.meta.url));

const config: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: frontendRoot,
  // On Vercel, rootDirectory=frontend means Next.js runs from /vercel/path0/frontend/.
  // Vercel's post-build validator looks for routes-manifest-deterministic.json at
  // /vercel/path0/.next/ (one level up). Setting distDir to "../.next" when VERCEL=1
  // puts the build output there so Vercel's validator finds it.
  distDir: process.env.VERCEL ? "../.next" : ".next",
  turbopack: {
    root: frontendRoot,
  },
  images: {
    unoptimized: true,
  },
};

export default config;

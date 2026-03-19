import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

const config: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: rootDir,
  turbopack: {
    root: rootDir,
  },
};

export default config;

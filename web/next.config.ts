import type { NextConfig } from "next";
import { basePath } from "./site-path.json";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  // Static files only: the Worker serves them (wrangler.jsonc) and adds the editor API.
  output: isDev ? undefined : "export",
  trailingSlash: true,
  // Don't write AGENTS.md into the project on `next dev`.
  agentRules: false,
  // "/test-website" while the placeholder holds the root, "" at launch (site-path.json).
  // The build then moves the pages under it and puts the placeholder at the root
  // (scripts/place-site.mjs). public/ files (photos, fonts) stay at the root.
  basePath: basePath || undefined,
  images: {
    // Image optimisation needs a server; uploads are served as they are.
    unoptimized: true,
  },
  // In `next dev`, send the editor API and uploaded photos to `wrangler dev` (pnpm dev:worker),
  // and serve public/ at the root as the Worker does.
  ...(isDev && {
    async rewrites() {
      // Next only allows a full URL here, so this points back at the dev server itself.
      const self = `http://localhost:${process.env.PORT ?? 3000}${basePath}`;
      const atRoot = basePath
        ? ["/uploads/:path*", "/fonts/:path*", "/dots.png"].map((source) => ({ source, destination: self + source, basePath: false as const }))
        : [];
      return [
        { source: "/api/:path*", destination: "http://localhost:8787/api/:path*", basePath: false as const },
        { source: "/media/:path*", destination: "http://localhost:8787/media/:path*", basePath: false as const },
        ...atRoot,
      ];
    },
    async redirects() {
      return basePath ? [{ source: "/", destination: basePath + "/", permanent: false, basePath: false as const }] : [];
    },
  }),
};

export default nextConfig;

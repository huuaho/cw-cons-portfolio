import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  // Static files only: the Worker serves them (wrangler.jsonc) and adds the editor API.
  output: isDev ? undefined : "export",
  trailingSlash: true,
  images: {
    // Image optimisation needs a server; uploads are served as they are.
    unoptimized: true,
  },
  // In `next dev`, send the editor API and uploaded photos to `wrangler dev` (pnpm dev:worker).
  ...(isDev && {
    async rewrites() {
      return [
        { source: "/api/:path*", destination: "http://localhost:8787/api/:path*" },
        { source: "/media/:path*", destination: "http://localhost:8787/media/:path*" },
      ];
    },
  }),
};

export default nextConfig;

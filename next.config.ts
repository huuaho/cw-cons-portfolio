import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static files only: Cloudflare serves them, there is no Node server.
  output: "export",
  trailingSlash: true,
  images: {
    // Image optimisation needs a server; uploads are served as they are.
    unoptimized: true,
  },
};

export default nextConfig;

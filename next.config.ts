import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Product photos are served from Shopify's CDN.
  images: { remotePatterns: [{ protocol: "https", hostname: "cdn.shopify.com" }] },
  /* config options here */
  cacheComponents: true,
  // Custom order photos travel with the form, so actions need room. Vercel allows 4.5 MB per request.
  experimental: { serverActions: { bodySizeLimit: "4mb" } },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

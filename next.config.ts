import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Product photos are served from Shopify's CDN.
  images: { remotePatterns: [{ protocol: "https", hostname: "cdn.shopify.com" }] },
  /* config options here */
  cacheComponents: true,
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

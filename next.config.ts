import type { NextConfig } from "next";
const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  fallbacks: { document: "/offline" },
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      {
        // Client-side API reads (current custom domain)
        urlPattern: /^https:\/\/api\.localadda\.com\/api\//,
        handler: "NetworkFirst",
        options: {
          cacheName: "api-cache",
          expiration: { maxEntries: 50, maxAgeSeconds: 300 },
          networkTimeoutSeconds: 5,
        },
      },
      {
        // Next.js optimized images (same-origin /_next/image) — the real image path
        urlPattern: /\/_next\/image\?/,
        handler: "CacheFirst",
        options: {
          cacheName: "next-image-cache",
          expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 365 },
        },
      },
      {
        // Direct R2 image loads — assets.localadda.com (+ legacy r2.dev during transition)
        urlPattern: /^https:\/\/(assets\.localadda\.com|pub-.*\.r2\.dev)\//,
        handler: "CacheFirst",
        options: {
          cacheName: "image-cache",
          expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 365 },
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: require("path").join(__dirname),
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.r2.dev" },
      { protocol: "https", hostname: "assets.localadda.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85],
    deviceSizes: [375, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [44, 52, 108, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default withPWA(nextConfig);

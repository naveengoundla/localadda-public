import type { NextConfig } from "next";
const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/localadda-backend.*\/api\//,
        handler: "NetworkFirst",
        options: {
          cacheName: "api-cache",
          expiration: { maxEntries: 50, maxAgeSeconds: 300 },
          networkTimeoutSeconds: 5,
        },
      },
      {
        urlPattern: /^https:\/\/pub-.*\.r2\.dev\//,
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
    ],
  },
};

export default withPWA(nextConfig);

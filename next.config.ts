import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // every page depends on the signed-in session, so nothing is prerendered
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

import type { NextConfig } from "next";

const isStandalone = process.env.OUTPUT_STANDALONE === "true";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@react-pdf/renderer"],
  ...(isStandalone ? { output: "standalone" } : {}),
};

export default nextConfig;

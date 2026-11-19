import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const isStandalone = process.env.OUTPUT_STANDALONE === "true";
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

// pdfkit loads Helvetica and the other standard fonts with a runtime
// require("#standard-fonts/…"). The file tracer cannot see that, so a
// Vercel function renders a 500 for every PDF preview and download.
const pdfFontFiles = [
  "./node_modules/.pnpm/pdfkit@*/node_modules/pdfkit/js/standard-fonts/**/*",
  "./node_modules/.pnpm/pdfkit@*/node_modules/pdfkit/js/data/**/*",
];

const nextConfig: NextConfig = {
  outputFileTracingRoot: projectRoot,
  serverExternalPackages: ["@react-pdf/renderer", "pdfkit"],
  outputFileTracingIncludes: {
    "/api/sample": pdfFontFiles,
    "/api/reports/[id]/pdf": pdfFontFiles,
    "/api/reports/[id]/send": pdfFontFiles,
    "/api/share/[token]/pdf": pdfFontFiles,
  },
  ...(isStandalone ? { output: "standalone" } : {}),
};

export default nextConfig;

import { NextResponse } from "next/server";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";
import { prisma } from "@/lib/prisma";
import { metricsProvider } from "@/providers/metrics";
import { narrativeProvider } from "@/providers/narrative";
import { pdfRenderer } from "@/providers/pdf/renderer";
import { periodLabel } from "@/lib/utils";

/** Public watermarked sample PDF — no auth required */
export async function GET() {
  const periodEnd = endOfMonth(subMonths(new Date(), 1));
  const periodStart = startOfMonth(subMonths(new Date(), 1));

  const demoClient = await prisma.client.findFirst({
    where: { domain: "brightplumb.example" },
    include: { org: true, workLogs: true, aiMentions: true },
  });

  const clientName = demoClient?.name || "Bright Plumbing Co.";
  const domain = demoClient?.domain || "brightplumb.example";
  const agencyName = demoClient?.org.name || "Northline SEO";
  const primaryColor = demoClient?.org.primaryColor || "#0F766E";

  const metrics = await metricsProvider.fetch({
    clientDomain: domain,
    periodStart,
    periodEnd,
    preferredProvider: "mock",
  });

  const workLogs = (demoClient?.workLogs || []).map((w) => ({
    title: w.title,
    body: w.body,
    category: w.category,
  }));

  if (!workLogs.length) {
    workLogs.push(
      {
        title: "Refreshed service landing pages",
        body: "Updated H1s, FAQs, and internal links on 4 core service pages.",
        category: "content",
      },
      {
        title: "Fixed crawl errors",
        body: "Resolved 12 soft-404s and submitted updated sitemap.",
        category: "technical",
      }
    );
  }

  const narrative = await narrativeProvider.generate({
    clientName,
    agencyName,
    periodLabel: periodLabel(periodStart, periodEnd),
    metrics,
    workLogs,
  });

  const buffer = await pdfRenderer.render({
    agencyName,
    primaryColor,
    clientName,
    clientDomain: domain,
    periodStart: periodStart.toISOString(),
    periodEnd: periodEnd.toISOString(),
    narrative: narrative.narrative,
    nextActions: [...narrative.nextActions],
    metrics,
    workLogs,
    watermark: true,
    includeAiMentions: true,
    aiMentions: (demoClient?.aiMentions || []).map((a) => ({
      engine: a.engine,
      prompt: a.prompt,
      mentioned: a.mentioned,
      citations: a.citationsJson ? (JSON.parse(a.citationsJson) as string[]) : [],
    })),
  });

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="sample-client-report.pdf"',
    },
  });
}

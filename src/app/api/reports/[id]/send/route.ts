import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { nanoid } from "nanoid";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { pdfRenderer } from "@/providers/pdf/renderer";
import { apiErrorMessage, periodLabel } from "@/lib/utils";
import { getLimits, trialEndedMessage } from "@/lib/plan";
import { liveMentions } from "@/lib/mentions";
import { renderReportEmailHtml } from "@/lib/email-templates";
import type { MetricsSnapshot } from "@/types/metrics";

const sendSchema = z.object({
  email: z.string().email().optional(),
  note: z.string().max(1000).optional(),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const report = await prisma.reportRun.findFirst({
    where: { id, client: { orgId: session.user.orgId } },
    include: {
      client: {
        include: {
          org: true,
          workLogs: true,
          aiMentions: { orderBy: { checkedAt: "desc" }, take: 10 },
        },
      },
    },
  });
  if (!report) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!report.metricsJson || !report.narrative) {
    return NextResponse.json({ error: "Generate the report before sending" }, { status: 400 });
  }
  if (getLimits(report.client.org.plan, report.client.org).expired) {
    return NextResponse.json({ error: trialEndedMessage(), code: "TRIAL_ENDED" }, { status: 403 });
  }
  if (report.status !== "ready" && report.status !== "sent") {
    return NextResponse.json(
      { error: "Mark the report ready before sending. Generation leaves it as a draft so you can edit it." },
      { status: 400 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const parsed = sendSchema.parse(body);
    const recipient = parsed.email || report.client.contactEmail;
    if (!recipient) {
      return NextResponse.json(
        { error: "Recipient email required (set client contact email or enter one)" },
        { status: 400 }
      );
    }

    const shareToken = report.shareToken || nanoid(18);
    const origin = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const shareUrl = `${origin}/share/${shareToken}`;
    const period = periodLabel(report.periodStart, report.periodEnd);

    let deliveryMode: "resend" | "simulated" = "simulated";

    if (process.env.RESEND_API_KEY) {
      const metrics = JSON.parse(report.metricsJson) as MetricsSnapshot;
      const nextActions = report.nextActionsJson
        ? (JSON.parse(report.nextActionsJson) as string[])
        : ["", "", ""];
      const periodLogs = report.client.workLogs.filter(
        (w) => w.periodStart <= report.periodEnd && w.periodEnd >= report.periodStart
      );

      const limits = getLimits(report.client.org.plan, report.client.org);
      const shouldWatermark = limits.watermark || Boolean(report.isSample);
      const mentions = liveMentions(report.client.aiMentions);
      const includeAiMentions = limits.aiMentions && report.client.aiMentionsEnabled && mentions.length > 0;

      const pdfBuffer = await pdfRenderer.render({
        agencyName: report.client.org.name,
        logoUrl: report.client.org.logoUrl,
        primaryColor: report.client.org.primaryColor,
        clientName: report.client.name,
        clientDomain: report.client.domain,
        periodStart: report.periodStart.toISOString(),
        periodEnd: report.periodEnd.toISOString(),
        narrative: report.narrative,
        nextActions,
        metrics,
        workLogs: periodLogs.map((w) => ({
          title: w.title,
          body: w.body,
          category: w.category,
          hours: w.hours,
        })),
        watermark: shouldWatermark,
        includeAiMentions,
        aiMentions: mentions.map((a) => ({
          engine: a.engine,
          prompt: a.prompt,
          mentioned: a.mentioned,
          citations: a.citationsJson ? (JSON.parse(a.citationsJson) as string[]) : [],
        })),
      });

      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || "SearchProof <info@getsearchproof.com>",
          to: [recipient],
          subject: `${report.client.name} — Monthly SEO Performance Report (${period})`,
          html: renderReportEmailHtml({
            agencyName: report.client.org.name,
            agencyLogo: report.client.org.logoUrl,
            primaryColor: report.client.org.primaryColor,
            clientName: report.client.name,
            period,
            note: parsed.note,
            shareUrl,
          }),
          attachments: [
            {
              filename: `report-${report.client.domain}.pdf`,
              content: pdfBuffer.toString("base64"),
            },
          ],
        }),
      });

      if (!emailRes.ok) {
        const errText = await emailRes.text();
        return NextResponse.json(
          { error: `Email delivery failed: ${errText.slice(0, 140)}` },
          { status: 502 }
        );
      }
      deliveryMode = "resend";
    }

    const updated = await prisma.reportRun.update({
      where: { id },
      data: {
        shareToken,
        status: "sent",
        sentAt: new Date(),
        sentTo: recipient,
      },
    });

    return NextResponse.json({
      ...updated,
      shareUrl,
      deliveryMode,
    });
  } catch (e) {
    return NextResponse.json({ error: apiErrorMessage(e) }, { status: 400 });
  }
}


import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ClientDetail } from "./client-detail";

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const { id } = await params;
  const client = await prisma.client.findFirst({
    where: { id, orgId: session!.user.orgId! },
    include: {
      connections: true,
      workLogs: { orderBy: { createdAt: "desc" } },
      reportRuns: { orderBy: { periodStart: "desc" } },
      aiMentions: { orderBy: { checkedAt: "desc" }, take: 20 },
    },
  });
  if (!client) notFound();

  const googleConfigured = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  );

  const org = await prisma.organization.findUnique({
    where: { id: session!.user.orgId! },
    select: { plan: true },
  });

  return (
    <Suspense fallback={<p className="text-sm text-slate-500">Loading client…</p>}>
      <ClientDetail
        googleConfigured={googleConfigured}
        plan={org?.plan ?? "trial"}
        client={{
          ...client,
          workLogs: client.workLogs.map((w) => ({
            id: w.id,
            title: w.title,
            body: w.body,
            category: w.category,
            hours: w.hours,
            periodStart: w.periodStart.toISOString(),
            periodEnd: w.periodEnd.toISOString(),
          })),
          reportRuns: client.reportRuns.map((r) => ({
            id: r.id,
            status: r.status,
            metricsJson: r.metricsJson,
            periodStart: r.periodStart.toISOString(),
            periodEnd: r.periodEnd.toISOString(),
          })),
          aiMentions: client.aiMentions.map((a) => ({
            id: a.id,
            engine: a.engine,
            mentioned: a.mentioned,
            prompt: a.prompt,
            checkedAt: a.checkedAt.toISOString(),
          })),
        }}
      />
    </Suspense>
  );
}

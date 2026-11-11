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
      reportRuns: { orderBy: { createdAt: "desc" } },
      aiMentions: { orderBy: { checkedAt: "desc" } },
    },
  });
  if (!client) notFound();

  return (
    <ClientDetail
      client={{
        ...client,
        workLogs: client.workLogs.map((w) => ({
          ...w,
          periodStart: w.periodStart.toISOString(),
          periodEnd: w.periodEnd.toISOString(),
        })),
        reportRuns: client.reportRuns.map((r) => ({
          ...r,
          periodStart: r.periodStart.toISOString(),
          periodEnd: r.periodEnd.toISOString(),
        })),
      }}
    />
  );
}

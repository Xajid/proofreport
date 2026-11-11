import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReportEditor } from "./report-editor";

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const { id } = await params;
  const report = await prisma.reportRun.findFirst({
    where: { id, client: { orgId: session!.user.orgId! } },
    include: {
      client: { select: { name: true, domain: true, aiMentionsEnabled: true } },
    },
  });
  if (!report) notFound();

  return (
    <ReportEditor
      report={{
        ...report,
        periodStart: report.periodStart.toISOString(),
        periodEnd: report.periodEnd.toISOString(),
      }}
    />
  );
}

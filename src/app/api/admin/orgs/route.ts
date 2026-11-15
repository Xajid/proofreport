import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await requireSuperAdmin();
  if (!session) {
    return NextResponse.json({ error: "Super-admin access required" }, { status: 403 });
  }

  const [orgs, totalReports] = await Promise.all([
    prisma.organization.findMany({
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, createdAt: true } },
          },
        },
        clients: {
          select: {
            id: true,
            _count: { select: { reportRuns: true, workLogs: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.reportRun.count(),
  ]);

  let totalClients = 0;
  let paidOrgs = 0;
  let perClientCount = 0;
  let agencyCount = 0;

  const rows = orgs.map((org) => {
    const clientCount = org.clients.length;
    const reportCount = org.clients.reduce((acc, c) => acc + c._count.reportRuns, 0);
    const ownerMember = org.members.find((m) => m.role === "owner") || org.members[0];
    const owner = ownerMember?.user;

    totalClients += clientCount;
    if (org.plan === "per_client") {
      paidOrgs++;
      perClientCount++;
    } else if (org.plan === "agency") {
      paidOrgs++;
      agencyCount++;
    }

    return {
      id: org.id,
      name: org.name,
      plan: org.plan,
      primaryColor: org.primaryColor,
      stripeCustomerId: org.stripeCustomerId,
      scheduleDay: org.scheduleDay,
      createdAt: org.createdAt.toISOString(),
      updatedAt: org.updatedAt.toISOString(),
      owner: owner
        ? { id: owner.id, name: owner.name, email: owner.email }
        : null,
      clientCount,
      reportCount,
    };
  });

  const estimatedMrr = perClientCount * 49 + agencyCount * 199;

  return NextResponse.json({
    summary: {
      totalAgencies: orgs.length,
      paidAgencies: paidOrgs,
      trialAgencies: orgs.length - paidOrgs,
      totalClients,
      totalReports,
      estimatedMrr,
    },
    orgs: rows,
  });
}


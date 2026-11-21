import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { noIndex } from "@/lib/seo";

export const metadata: Metadata = noIndex;
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { clientSlotsUsed, getLimits } from "@/lib/plan";
import { AppShell } from "@/components/app-shell";
import { Providers } from "@/components/providers";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const org = session.user.orgId
    ? await prisma.organization.findUnique({
        where: { id: session.user.orgId },
        select: { name: true, plan: true, trialEndsAt: true, createdAt: true, clientSlots: true, clientsCreated: true },
      })
    : null;

  const orgId = session.user.orgId;
  const clientCount = orgId
    ? await prisma.client.count({ where: { orgId } })
    : 0;

  const limits = getLimits(org?.plan, org);

  return (
    <Providers>
      <AppShell
        orgName={org?.name ?? session.user.orgName}
        plan={org?.plan ?? undefined}
        clientCount={clientSlotsUsed(org?.plan, clientCount, org?.clientsCreated ?? 0)}
        trialExpired={limits.expired}
        trialEndsAt={limits.trialEndsAt ? limits.trialEndsAt.toISOString() : null}
      >
        {children}
      </AppShell>
    </Providers>
  );
}

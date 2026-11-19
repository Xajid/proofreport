import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLimits } from "@/lib/plan";
import NewClientForm from "./new-client-form";

export default async function NewClientPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgId) redirect("/login");

  const orgId = session.user.orgId;
  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  const clientCount = await prisma.client.count({ where: { orgId } });
  const limits = getLimits(org?.plan, org);

  if (clientCount >= limits.maxClients) {
    redirect("/pricing?upgrade=clients");
  }

  return <NewClientForm canUseAiMentions={limits.aiMentions} />;
}

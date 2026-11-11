import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "./prisma";

export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.orgId) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function getOrgForUser(userId: string) {
  const membership = await prisma.orgMember.findFirst({
    where: { userId },
    include: { org: true },
  });
  return membership?.org ?? null;
}

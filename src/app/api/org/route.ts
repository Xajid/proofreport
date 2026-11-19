import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { orgBrandingSchema } from "@/lib/validators";
import { apiErrorMessage } from "@/lib/utils";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const org = await prisma.organization.findUnique({ where: { id: session.user.orgId } });
  return NextResponse.json({
    ...org,
    integrationStatus: {
      nvidia: Boolean(process.env.NVIDIA_API_KEY),
      openai: Boolean(process.env.OPENAI_API_KEY),
      google: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      dodo: Boolean(process.env.DODO_PAYMENTS_API_KEY),
      resend: Boolean(process.env.RESEND_API_KEY),
    },
  });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const data = orgBrandingSchema.parse(await req.json());
    const org = await prisma.organization.update({
      where: { id: session.user.orgId },
      data: {
        name: data.name,
        logoUrl: data.logoUrl || null,
        primaryColor: data.primaryColor,
        scheduleDay: data.scheduleDay,
      },
    });
    return NextResponse.json(org);
  } catch (e) {
    return NextResponse.json({ error: apiErrorMessage(e) }, { status: 400 });
  }
}

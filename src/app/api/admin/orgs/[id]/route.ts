import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSuperAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { apiErrorMessage } from "@/lib/utils";

const planUpdateSchema = z.object({
  plan: z.enum(["trial", "per_client", "agency"]),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSuperAdmin();
  if (!session) {
    return NextResponse.json({ error: "Super-admin access required" }, { status: 403 });
  }

  const { id } = await params;
  try {
    const body = await req.json();
    const data = planUpdateSchema.parse(body);

    const existing = await prisma.organization.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const updated = await prisma.organization.update({
      where: { id },
      data: { plan: data.plan },
    });

    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: apiErrorMessage(err) }, { status: 400 });
  }
}


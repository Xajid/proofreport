import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);
    const email = data.email.toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const passwordHash = await hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        name: data.name,
        passwordHash,
        orgMembers: {
          create: {
            role: "owner",
            org: {
              create: {
                name: data.agencyName,
                primaryColor: "#0F766E",
              },
            },
          },
        },
      },
      include: { orgMembers: true },
    });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      orgId: user.orgMembers[0]?.orgId,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkIsAdminEmail } from "@/lib/admin";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ authenticated: false, isAdmin: false }, { status: 401 });
  }

  const isAdmin = checkIsAdminEmail(session.user.email);
  return NextResponse.json({
    authenticated: true,
    isAdmin,
    email: session.user.email,
  });
}


import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

const PUBLIC_DEMO_EMAIL = "demo@getsearchproof.com";

/**
 * Super admin is only the addresses in ADMIN_EMAIL.
 * There is no default, and the public demo login is never an admin.
 */
export function checkIsAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  if (normalized === PUBLIC_DEMO_EMAIL) return false;
  const allowed = (process.env.ADMIN_EMAIL || "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry) => entry && entry !== PUBLIC_DEMO_EMAIL);
  return allowed.includes(normalized);
}

export async function requireSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  const isAdmin = checkIsAdminEmail(session.user.email);
  if (!isAdmin) return null;
  return session;
}


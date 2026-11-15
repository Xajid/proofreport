import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

/**
 * Checks whether an email or the current session belongs to a Super Admin.
 * Default admin in dev: demo@proofreport.app (configurable via ADMIN_EMAIL env var).
 */
export function checkIsAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const adminConfig = process.env.ADMIN_EMAIL || "demo@proofreport.app";
  const allowed = adminConfig
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.trim().toLowerCase());
}

export async function requireSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  const isAdmin = checkIsAdminEmail(session.user.email);
  if (!isAdmin) return null;
  return session;
}


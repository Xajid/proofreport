import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkIsAdminEmail } from "@/lib/admin";
import { ShieldCheck, ArrowRight, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/admin/login");
  }

  const isAdmin = checkIsAdminEmail(session.user.email);
  if (!isAdmin) {
    redirect("/app");
  }

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans">
      {/* Top Admin Header */}
      <header className="border-b border-white/10 bg-[#0d121f]/90 px-6 py-3.5 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-gradient-to-br from-amber-500 to-amber-700 shadow-sm text-slate-950 font-bold text-xs">
              <ShieldCheck className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="font-display text-sm font-semibold text-white tracking-tight">
                SearchProof Platform Admin
              </span>
              <span className="ml-2.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                Super-Admin
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              {session.user.email}
            </span>
            <Link href="/app">
              <Button
                size="sm"
                variant="outline"
                className="border-white/15 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white text-xs h-8"
              >
                <LayoutDashboard className="h-3.5 w-3.5 mr-1" />
                Agency App
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        {children}
      </main>
    </div>
  );
}


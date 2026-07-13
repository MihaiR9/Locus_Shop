import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth/current-admin";
import { AdminSidebar } from "../_components/admin-sidebar";
import { LogoutButton } from "../_components/logout-button";

/**
 * Layout pentru rutele admin AUTHENTIFICATE. Sidebar + main. Verifică rolul
 * — dublă protecție cu `proxy.ts` (defense in depth).
 */
export default async function AdminAuthedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-4">
          <span className="admin-brand-mark">L</span>
          <div className="flex flex-col leading-tight">
            <span className="text-[13px] font-medium text-white">Locus</span>
            <span className="text-[11px] text-zinc-500">Admin</span>
          </div>
        </div>

        <AdminSidebar />

        <div className="border-t border-white/10 px-4 py-3">
          <div
            className="mb-2 truncate text-[11px] text-zinc-500"
            title={admin.email}
          >
            {admin.email}
          </div>
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-xs text-zinc-500 transition-colors hover:text-white"
            >
              ← Către site
            </Link>
            <LogoutButton />
          </div>
        </div>
      </aside>

      <div className="admin-content">
        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}

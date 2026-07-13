import type { Metadata } from "next";
import Link from "next/link";
import {
  Banknote,
  ShoppingBag,
  ShoppingCart,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { getCurrentAdmin } from "@/lib/auth/current-admin";
import {
  formatRon,
  getDashboardData,
} from "@/lib/admin/dashboard-queries";
import { KpiCard } from "../_components/kpi-card";
import { RevenueChart } from "../_components/revenue-chart";
import { StatusBadge } from "../_components/status-badge";

export const metadata: Metadata = {
  title: "Acasă · Admin",
};

const RO_DATE = new Intl.DateTimeFormat("ro-RO", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function AdminDashboardPage() {
  const admin = await getCurrentAdmin();
  const data = await getDashboardData();

  const firstName = admin?.email?.split("@")[0] ?? "";

  return (
    <>
      <header className="admin-page-head">
        <div>
          <h1 className="admin-page-title">Acasă</h1>
          <p className="admin-page-sub">
            Bun venit, {firstName}. Uite ce s-a întâmplat.
          </p>
        </div>
      </header>

      {/* ─── KPI CARDS ─────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Încasări azi"
          value={formatRon(data.kpis.revenueTodayCents)}
          hint="doar plăți confirmate"
          icon={Banknote}
        />
        <KpiCard
          label="Comenzi azi"
          value={data.kpis.ordersTodayCount.toString()}
          hint="incl. în așteptare"
          icon={ShoppingBag}
        />
        <KpiCard
          label="Coș mediu 7z"
          value={formatRon(data.kpis.avgBasket7dCents)}
          hint="doar plătite"
          icon={ShoppingCart}
        />
        <KpiCard
          label="Stoc redus"
          value={data.kpis.lowStockCount.toString()}
          hint="produse cu stoc < 20"
          icon={AlertTriangle}
          tone={data.kpis.lowStockCount > 0 ? "warning" : "default"}
        />
      </div>

      {/* ─── REVENUE CHART ─────────────────────────────────────── */}
      <section className="mt-6 rounded-xl border border-zinc-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-[13px] font-semibold text-zinc-900">
              Încasări · ultimele 30 zile
            </h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Suma comenzilor plătite zilnic.
            </p>
          </div>
        </div>
        <RevenueChart data={data.revenue30d} />
      </section>

      {/* ─── ULTIMELE COMENZI ─────────────────────────────────── */}
      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white lg:col-span-2">
          <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
            <div>
              <h2 className="text-[13px] font-semibold text-zinc-900">
                Ultimele comenzi
              </h2>
              <p className="mt-0.5 text-xs text-zinc-500">
                Cele mai recente 5 comenzi.
              </p>
            </div>
            <Link
              href="/admin/comenzi"
              className="flex items-center gap-1 text-xs font-medium text-zinc-700 hover:text-zinc-900"
            >
              Vezi toate
              <ArrowRight className="h-3 w-3" />
            </Link>
          </header>

          {data.recentOrders.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-zinc-500">
              Nu există comenzi încă.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 text-left text-[11px] uppercase tracking-[0.06em] text-zinc-500">
                    <th className="px-6 py-2 font-medium">Nr</th>
                    <th className="py-2 font-medium">Client</th>
                    <th className="py-2 font-medium">Total</th>
                    <th className="py-2 font-medium">Status</th>
                    <th className="px-6 py-2 text-right font-medium">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map((o) => (
                    <tr
                      key={o.orderNumber}
                      className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50"
                    >
                      <td className="px-6 py-3 font-medium text-zinc-900">
                        <Link
                          href={`/admin/comenzi/${o.orderNumber}`}
                          className="hover:underline"
                        >
                          {o.orderNumber}
                        </Link>
                      </td>
                      <td className="py-3 text-zinc-700">{o.customerEmail}</td>
                      <td className="py-3 font-medium text-zinc-900">
                        {formatRon(o.totalCents)}
                      </td>
                      <td className="py-3">
                        <StatusBadge status={o.status} />
                      </td>
                      <td className="px-6 py-3 text-right text-xs text-zinc-500">
                        {RO_DATE.format(new Date(o.createdAt))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ─── STOC REDUS ─────────────────────────────────────── */}
        <div className="rounded-xl border border-zinc-200 bg-white">
          <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
            <div>
              <h2 className="text-[13px] font-semibold text-zinc-900">
                Stoc redus
              </h2>
              <p className="mt-0.5 text-xs text-zinc-500">Sub 20 sticle.</p>
            </div>
            <Link
              href="/admin/stoc"
              className="flex items-center gap-1 text-xs font-medium text-zinc-700 hover:text-zinc-900"
            >
              Vezi tot
              <ArrowRight className="h-3 w-3" />
            </Link>
          </header>

          {data.lowStock.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-zinc-500">
              ✓ Nici un produs sub prag.
            </div>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {data.lowStock.slice(0, 6).map((p) => (
                <li key={p.code} className="flex items-center justify-between px-6 py-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-zinc-900">
                      {p.name}
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      {p.gama} · {p.code}
                    </div>
                  </div>
                  <span
                    className={
                      p.stock < 10
                        ? "text-sm font-semibold text-red-600"
                        : "text-sm font-semibold text-amber-600"
                    }
                  >
                    {p.stock}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { couponStatus, listCoupons } from "@/lib/admin/coupons-queries";
import { formatRon } from "@/lib/admin/products-queries";
import { KpiInline } from "../../_components/kpi-inline";

export const metadata: Metadata = { title: "Reduceri · Admin" };

const STATUS_LABEL: Record<string, { label: string; tone: string }> = {
  active: {
    label: "Activ",
    tone: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  inactive: {
    label: "Inactiv",
    tone: "bg-zinc-100 text-zinc-600 border-zinc-200",
  },
  expired: {
    label: "Expirat",
    tone: "bg-red-50 text-red-700 border-red-200",
  },
  exhausted: {
    label: "Epuizat",
    tone: "bg-amber-50 text-amber-800 border-amber-200",
  },
  upcoming: {
    label: "Programat",
    tone: "bg-blue-50 text-blue-700 border-blue-200",
  },
};

function discountLabel(c: {
  percentOff: number | null;
  fixedOffCents: number | null;
}): string {
  if (c.percentOff !== null) return `-${c.percentOff}%`;
  if (c.fixedOffCents !== null) return `-${formatRon(c.fixedOffCents)}`;
  return "—";
}

export default async function AdminCouponsPage() {
  const { items, kpis } = await listCoupons();

  if (items.length === 0) {
    return (
      <>
        <header className="admin-page-head">
          <div>
            <h1 className="admin-page-title">Reduceri</h1>
          </div>
          <Button asChild size="sm">
            <Link href="/admin/reduceri/nou">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Creează cupon
            </Link>
          </Button>
        </header>

        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-24 text-center">
          <Ticket className="mb-3 h-8 w-8 text-zinc-400" />
          <div className="max-w-md">
            <h2 className="text-lg font-semibold text-zinc-900">
              Nu ai cupoane încă
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Creează un cupon pentru campanii de lansare, retenție sau relații
              speciale. Poți limita valabilitatea sau numărul de utilizări.
            </p>
            <div className="mt-6">
              <Button asChild>
                <Link href="/admin/reduceri/nou">
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Primul cupon
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <header className="admin-page-head">
        <div>
          <h1 className="admin-page-title">Reduceri</h1>
          <p className="admin-page-sub">
            {kpis.total.toLocaleString("ro-RO")}{" "}
            {kpis.total === 1 ? "cupon" : "cupoane"} · {kpis.active} active
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/reduceri/nou">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Creează cupon
          </Link>
        </Button>
      </header>

      <div className="mb-4 flex items-stretch gap-2 overflow-x-auto">
        <KpiInline
          label="Total cupoane"
          value={kpis.total}
          trendPct={null}
          spark={Array(12).fill(kpis.total)}
        />
        <KpiInline
          label="Active"
          value={kpis.active}
          trendPct={null}
          spark={Array(12).fill(kpis.active)}
        />
        <KpiInline
          label="Expirate"
          value={kpis.expired}
          trendPct={null}
          spark={Array(12).fill(kpis.expired)}
        />
        <KpiInline
          label="Utilizări totale"
          value={kpis.totalUses}
          trendPct={null}
          spark={Array(12).fill(kpis.totalUses)}
        />
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 text-left text-[11px] uppercase tracking-[0.06em] text-zinc-500">
                <th className="py-2.5 pl-4 font-medium">Cod</th>
                <th className="py-2.5 font-medium">Reducere</th>
                <th className="py-2.5 font-medium">Coș minim</th>
                <th className="py-2.5 font-medium">Utilizări</th>
                <th className="py-2.5 font-medium">Expiră</th>
                <th className="py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {items.map((c) => {
                const status = couponStatus(c);
                const info = STATUS_LABEL[status];
                return (
                  <tr
                    key={c.id}
                    className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/60"
                  >
                    <td className="py-2.5 pl-4">
                      <Link
                        href={`/admin/reduceri/${c.code}`}
                        className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-900 hover:underline"
                      >
                        {c.code}
                      </Link>
                    </td>
                    <td className="py-2.5 font-medium text-zinc-900">
                      {discountLabel(c)}
                    </td>
                    <td className="py-2.5 text-zinc-600">
                      {c.minAmountCents > 0
                        ? formatRon(c.minAmountCents)
                        : "—"}
                    </td>
                    <td className="py-2.5 text-zinc-700">
                      <span className="font-mono">{c.usedCount}</span>
                      {c.maxUses !== null && (
                        <span className="text-zinc-400">
                          {" "}
                          / <span className="font-mono">{c.maxUses}</span>
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 text-zinc-600">
                      {c.expiresAt
                        ? new Date(c.expiresAt).toLocaleDateString("ro-RO")
                        : "Nu expiră"}
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium ${info.tone}`}
                      >
                        {info.label}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/admin/reduceri/${c.code}`}
                        className="text-xs font-medium text-zinc-700 hover:text-zinc-900 hover:underline"
                      >
                        Editează
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

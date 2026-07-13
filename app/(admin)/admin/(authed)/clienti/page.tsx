import type { Metadata } from "next";
import Link from "next/link";
import { listCustomers } from "@/lib/admin/customers-queries";
import { formatRon } from "@/lib/admin/products-queries";
import { KpiInline } from "../../_components/kpi-inline";
import { formatRelDate } from "../../_components/rel-date";
import { CustomersFilters } from "./filters";

export const metadata: Metadata = { title: "Clienți · Admin" };

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const view = (params.view as string | undefined) as
    | "all"
    | "registered"
    | "guests"
    | "repeat"
    | undefined;
  const search = (params.q as string | undefined) ?? "";

  const { items, kpis } = await listCustomers({ view, search });

  if (kpis.total === 0) {
    return (
      <>
        <header className="admin-page-head">
          <div>
            <h1 className="admin-page-title">Clienți</h1>
          </div>
        </header>

        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-24 text-center">
          <div className="max-w-md">
            <h2 className="text-lg font-semibold text-zinc-900">
              Nu ai clienți încă
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Când vor fi plasate primele comenzi, aici vei vedea profilul
              fiecărui client, istoricul lui și valoarea totală cumpărată.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <header className="admin-page-head">
        <div>
          <h1 className="admin-page-title">Clienți</h1>
          <p className="admin-page-sub">
            {kpis.total.toLocaleString("ro-RO")}{" "}
            {kpis.total === 1 ? "client" : "clienți"} · {kpis.registered} cu
            cont · {kpis.guests} guest
          </p>
        </div>
      </header>

      <div className="mb-4 flex items-stretch gap-2 overflow-x-auto">
        <KpiInline
          label="Total clienți"
          value={kpis.total}
          trendPct={null}
          spark={Array(12).fill(kpis.total)}
        />
        <KpiInline
          label="Venituri totale"
          value={formatRon(kpis.totalRevenueCents)}
          trendPct={null}
          spark={Array(12).fill(kpis.totalRevenueCents / 100)}
        />
        <KpiInline
          label="Coș mediu"
          value={formatRon(kpis.avgOrderCents)}
          trendPct={null}
          spark={Array(12).fill(kpis.avgOrderCents / 100)}
        />
        <KpiInline
          label="Repetitivi (2+)"
          value={kpis.repeatCustomers}
          trendPct={null}
          spark={Array(12).fill(kpis.repeatCustomers)}
        />
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
        <CustomersFilters />

        {items.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-zinc-500">
            Nici un client nu se potrivește filtrelor.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-left text-[11px] uppercase tracking-[0.06em] text-zinc-500">
                  <th className="py-2.5 pl-4 font-medium">Client</th>
                  <th className="py-2.5 font-medium">Cont</th>
                  <th className="py-2.5 text-right font-medium">Comenzi</th>
                  <th className="py-2.5 text-right font-medium">
                    Total cheltuit
                  </th>
                  <th className="py-2.5 font-medium">Ultima comandă</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr
                    key={c.email}
                    className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/60"
                  >
                    <td className="py-2.5 pl-4">
                      <Link
                        href={`/admin/clienti/${encodeURIComponent(c.email)}`}
                        className="flex items-center gap-3"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[11px] font-semibold uppercase text-zinc-600">
                          {(c.name ?? c.email).slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-zinc-900 hover:underline">
                            {c.name ?? c.email}
                          </div>
                          {c.name && (
                            <div className="text-[11px] text-zinc-500">
                              {c.email}
                            </div>
                          )}
                        </div>
                      </Link>
                    </td>
                    <td className="py-2.5">
                      {c.isRegistered ? (
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Cont creat
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                          Guest
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 text-right font-medium text-zinc-900">
                      {c.orderCount}
                    </td>
                    <td className="py-2.5 text-right font-medium text-zinc-900">
                      {formatRon(c.totalSpentCents)}
                    </td>
                    <td className="py-2.5 text-zinc-600">
                      {c.lastOrderAt ? formatRelDate(c.lastOrderAt) : "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/admin/clienti/${encodeURIComponent(c.email)}`}
                        className="text-xs font-medium text-zinc-700 hover:text-zinc-900 hover:underline"
                      >
                        Deschide
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

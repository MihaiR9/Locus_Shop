import type { Metadata } from "next";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import {
  listReturns,
  RETURN_STATUS_LABEL,
  RETURN_STATUS_TONE,
  RESOLUTION_LABEL,
  RESOLUTION_TONE,
  type ReturnStatus,
} from "@/lib/admin/returns-queries";
import { formatRon } from "@/lib/admin/products-queries";
import { KpiInline } from "../../_components/kpi-inline";
import { formatRelDate } from "../../_components/rel-date";
import { ReturnsFilters } from "./filters";

export const metadata: Metadata = { title: "Retururi · Admin" };

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function AdminReturnsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const status = (params.status as ReturnStatus | "all" | undefined) ?? "all";

  const { items, kpis } = await listReturns(status);

  if (kpis.total === 0 && status === "all") {
    return (
      <>
        <header className="admin-page-head">
          <div>
            <h1 className="admin-page-title">Retururi</h1>
            <p className="admin-page-sub">
              Cereri inițiate de clienți din contul lor (OUG 34/2014).
            </p>
          </div>
        </header>

        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-24 text-center">
          <RotateCcw className="mb-3 h-8 w-8 text-zinc-400" />
          <div className="max-w-md">
            <h2 className="text-lg font-semibold text-zinc-900">
              Nu ai cereri de retur
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Cererile de retur sunt inițiate de clienți din contul lor,
              pentru comenzile livrate în ultimele 14 zile. Aici le procesezi
              — aprobi, urmărești coletul înapoi și marchezi finalizat după
              rambursare/înlocuire/voucher.
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
          <h1 className="admin-page-title">Retururi</h1>
          <p className="admin-page-sub">
            {kpis.total.toLocaleString("ro-RO")}{" "}
            {kpis.total === 1 ? "cerere" : "cereri"} · {kpis.open} deschise ·
            inițiate de clienți din contul lor
          </p>
        </div>
      </header>

      <div className="mb-4 flex items-stretch gap-2 overflow-x-auto">
        <KpiInline
          label="Total cereri"
          value={kpis.total}
          trendPct={null}
          spark={Array(12).fill(kpis.total)}
        />
        <KpiInline
          label="Deschise"
          value={kpis.open}
          trendPct={null}
          spark={Array(12).fill(kpis.open)}
        />
        <KpiInline
          label="Finalizate"
          value={kpis.completed}
          trendPct={null}
          spark={Array(12).fill(kpis.completed)}
        />
        <KpiInline
          label="Respinse"
          value={kpis.rejected}
          trendPct={null}
          spark={Array(12).fill(kpis.rejected)}
        />
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
        <ReturnsFilters />

        {items.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-zinc-500">
            Nici o cerere nu se potrivește filtrelor.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-left text-[11px] uppercase tracking-[0.06em] text-zinc-500">
                  <th className="py-2.5 pl-4 font-medium">Nr. retur</th>
                  <th className="py-2.5 font-medium">Comandă</th>
                  <th className="py-2.5 font-medium">Client</th>
                  <th className="py-2.5 font-medium">Produse</th>
                  <th className="py-2.5 font-medium">Rezolvare</th>
                  <th className="py-2.5 font-medium">Status</th>
                  <th className="py-2.5 text-right font-medium">Valoare</th>
                  <th className="py-2.5 font-medium">Cerut</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {items.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/60"
                  >
                    <td className="py-2.5 pl-4">
                      <Link
                        href={`/admin/retururi/${r.returnNumber}`}
                        className="font-mono text-xs font-semibold text-zinc-900 hover:underline"
                      >
                        {r.returnNumber}
                      </Link>
                    </td>
                    <td className="py-2.5">
                      {r.orderNumber ? (
                        <Link
                          href={`/admin/comenzi/${r.orderNumber}`}
                          className="font-mono text-xs text-zinc-700 hover:text-zinc-900 hover:underline"
                        >
                          {r.orderNumber}
                        </Link>
                      ) : (
                        <span className="text-xs text-zinc-400">—</span>
                      )}
                    </td>
                    <td className="py-2.5">
                      {r.customerEmail ? (
                        <Link
                          href={`/admin/clienti/${encodeURIComponent(r.customerEmail)}`}
                          className="text-xs text-zinc-700 hover:text-zinc-900 hover:underline"
                        >
                          {r.customerName ?? r.customerEmail}
                        </Link>
                      ) : (
                        <span className="text-xs text-zinc-400">—</span>
                      )}
                    </td>
                    <td className="py-2.5 text-xs text-zinc-700">
                      {r.itemsCount}{" "}
                      {r.itemsCount === 1 ? "sticlă" : "sticle"}
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium ${RESOLUTION_TONE[r.resolution]}`}
                      >
                        {RESOLUTION_LABEL[r.resolution]}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium ${RETURN_STATUS_TONE[r.status]}`}
                      >
                        {RETURN_STATUS_LABEL[r.status]}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-medium text-zinc-900">
                      {formatRon(r.itemsTotalCents)}
                    </td>
                    <td className="py-2.5 text-xs text-zinc-600">
                      {formatRelDate(r.createdAt)}
                    </td>
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/admin/retururi/${r.returnNumber}`}
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

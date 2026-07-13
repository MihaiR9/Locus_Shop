import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Download, MoreHorizontal, Plus } from "lucide-react";
import {
  formatRon,
  getOrdersKpis,
  listOrders,
  type OrderStatus,
} from "@/lib/admin/orders-queries";
import { Button } from "@/components/ui/button";
import { KpiInline } from "../../_components/kpi-inline";
import {
  FulfillmentBadge,
  PaymentBadge,
} from "../../_components/payment-fulfillment-badges";
import { formatRelDate } from "../../_components/rel-date";
import { OrdersFilters } from "./filters";

export const metadata: Metadata = { title: "Comenzi · Admin" };

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const status = (params.status as string | undefined) ?? "all";
  const search = (params.q as string | undefined) ?? "";
  const page = Math.max(1, Number.parseInt((params.page as string) ?? "1", 10) || 1);

  const [result, kpis] = await Promise.all([
    listOrders({ status: status as OrderStatus | "all", search, page }),
    getOrdersKpis(30),
  ]);

  const totalPages = Math.max(1, Math.ceil(result.totalCount / result.pageSize));

  return (
    <>
      <header className="admin-page-head">
        <div>
          <h1 className="admin-page-title">Comenzi</h1>
          <p className="admin-page-sub">
            {result.totalCount.toLocaleString("ro-RO")}{" "}
            {result.totalCount === 1 ? "comandă" : "comenzi"} în total.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            Mai multe
            <MoreHorizontal className="ml-1.5 h-3.5 w-3.5" />
          </Button>
          <Button size="sm" disabled title="Draft-uri vin la un pas viitor">
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Comandă manuală
          </Button>
        </div>
      </header>

      {/* ─── KPI bar (30 zile) ────────────────────────────────── */}
      <div className="mb-4 flex items-stretch gap-2 overflow-x-auto">
        <div className="flex shrink-0 items-center rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs">
          <span className="font-medium text-zinc-700">30 zile</span>
        </div>
        <KpiInline
          label={kpis.orders.label}
          value={kpis.orders.value}
          trendPct={kpis.orders.trendPct}
          spark={kpis.orders.spark}
        />
        <KpiInline
          label={kpis.orderedItems.label}
          value={kpis.orderedItems.value}
          trendPct={kpis.orderedItems.trendPct}
          spark={kpis.orderedItems.spark}
        />
        <KpiInline
          label={kpis.returnedItems.label}
          value={kpis.returnedItems.value}
          trendPct={kpis.returnedItems.trendPct}
          spark={kpis.returnedItems.spark}
        />
        <KpiInline
          label={kpis.fulfilledOrders.label}
          value={kpis.fulfilledOrders.value}
          trendPct={kpis.fulfilledOrders.trendPct}
          spark={kpis.fulfilledOrders.spark}
        />
        <KpiInline
          label={kpis.deliveredOrders.label}
          value={kpis.deliveredOrders.value}
          trendPct={kpis.deliveredOrders.trendPct}
          spark={kpis.deliveredOrders.spark}
        />
      </div>

      {/* ─── Tabs + toolbar ───────────────────────────────────── */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
        <OrdersFilters />

        {/* ─── Tabel comenzi ─────────────────────────────────── */}
        {result.items.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-zinc-500">
            {search || status !== "all"
              ? "Nici o comandă nu se potrivește filtrelor."
              : "Nu există comenzi încă."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-left text-[11px] uppercase tracking-[0.06em] text-zinc-500">
                  <th className="w-10 px-4 py-2.5">
                    <input
                      type="checkbox"
                      disabled
                      title="Bulk actions — vine curând"
                      className="rounded border-zinc-300"
                    />
                  </th>
                  <th className="py-2.5 font-medium">Comandă</th>
                  <th className="py-2.5 font-medium">Dată</th>
                  <th className="py-2.5 font-medium">Client</th>
                  <th className="py-2.5 font-medium">Total</th>
                  <th className="py-2.5 font-medium">Plată</th>
                  <th className="py-2.5 font-medium">Fulfillment</th>
                  <th className="px-4 py-2.5 text-right font-medium">Sticle</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((o) => (
                  <tr
                    key={o.id}
                    className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/60"
                  >
                    <td className="w-10 px-4 py-3">
                      <input
                        type="checkbox"
                        disabled
                        className="rounded border-zinc-300"
                      />
                    </td>
                    <td className="py-3">
                      <Link
                        href={`/admin/comenzi/${o.orderNumber}`}
                        className="font-medium text-zinc-900 hover:underline"
                      >
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3 text-zinc-700">
                      {formatRelDate(o.createdAt)}
                    </td>
                    <td className="py-3 text-zinc-800">
                      <div>{o.customerName ?? o.customerEmail}</div>
                      {o.customerName && (
                        <div className="text-[11px] text-zinc-500">
                          {o.customerEmail}
                        </div>
                      )}
                    </td>
                    <td className="py-3 font-medium text-zinc-900">
                      {formatRon(o.totalCents)}
                    </td>
                    <td className="py-3">
                      <PaymentBadge status={o.paymentStatus} />
                    </td>
                    <td className="py-3">
                      <FulfillmentBadge status={o.status} />
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-700">
                      {o.itemsCount === 1
                        ? "1 sticlă"
                        : `${o.itemsCount} sticle`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-xs text-zinc-600">
          <div>
            Pagina {result.page} din {totalPages} · {result.totalCount} comenzi
          </div>
          <div className="flex gap-2">
            {result.page > 1 && (
              <Link
                href={buildPageUrl(params, result.page - 1)}
                className="flex items-center gap-1 rounded-md border border-zinc-200 px-3 py-1.5 hover:bg-zinc-50"
              >
                <ArrowLeft className="h-3 w-3" /> Precedenta
              </Link>
            )}
            {result.page < totalPages && (
              <Link
                href={buildPageUrl(params, result.page + 1)}
                className="flex items-center gap-1 rounded-md border border-zinc-200 px-3 py-1.5 hover:bg-zinc-50"
              >
                Următoarea <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function buildPageUrl(params: SearchParams, page: number): string {
  const q = new URLSearchParams();
  if (params.status && params.status !== "all") q.set("status", String(params.status));
  if (params.q) q.set("q", String(params.q));
  q.set("page", String(page));
  return `/admin/comenzi?${q.toString()}`;
}

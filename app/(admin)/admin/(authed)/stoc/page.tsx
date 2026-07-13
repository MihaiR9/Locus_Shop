import type { Metadata } from "next";
import {
  formatRon,
  listProducts,
  type ProductsFilter,
} from "@/lib/admin/products-queries";
import { KpiInline } from "../../_components/kpi-inline";
import { StockFilters } from "./filters";
import { StockTable } from "./stock-table";

export const metadata: Metadata = { title: "Stoc · Admin" };

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function AdminStockPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const gama = (params.gama as ProductsFilter["gama"]) ?? "all";
  const search = (params.q as string | undefined) ?? "";
  const view = (params.view as string | undefined) ?? "all";

  const { items, kpis } = await listProducts({ gama, search });

  const filtered = items.filter((p) => {
    if (view === "low") return p.stock > 0 && p.stock < 20;
    if (view === "out") return p.stock === 0;
    return true;
  });

  const outOfStock = items.filter((p) => p.stock === 0).length;

  return (
    <>
      <header className="admin-page-head">
        <div>
          <h1 className="admin-page-title">Stoc</h1>
          <p className="admin-page-sub">
            Ajustări rapide pe produs — click în număr sau folosește +/−.
          </p>
        </div>
      </header>

      <div className="mb-4 flex items-stretch gap-2 overflow-x-auto">
        <KpiInline
          label="Sticle în stoc"
          value={kpis.totalUnitsInStock}
          trendPct={null}
          spark={Array(12).fill(kpis.totalUnitsInStock)}
        />
        <KpiInline
          label="Valoare stoc"
          value={formatRon(kpis.stockValueCents)}
          trendPct={null}
          spark={Array(12).fill(0)}
        />
        <KpiInline
          label="Stoc scăzut (<20)"
          value={kpis.lowStock}
          trendPct={null}
          spark={Array(12).fill(kpis.lowStock)}
        />
        <KpiInline
          label="Fără stoc"
          value={outOfStock}
          trendPct={null}
          spark={Array(12).fill(outOfStock)}
        />
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
        <StockFilters />
        {filtered.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-zinc-500">
            {view === "low" && "Nici un produs cu stoc scăzut. ✓"}
            {view === "out" && "Toate produsele au stoc. ✓"}
            {view === "all" && "Nici un produs nu se potrivește filtrelor."}
          </div>
        ) : (
          <StockTable items={filtered} />
        )}
      </div>
    </>
  );
}

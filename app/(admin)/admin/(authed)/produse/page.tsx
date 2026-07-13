import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Download, Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { productPhoto } from "@/lib/wines";
import {
  formatRon,
  listProducts,
  type ProductsFilter,
} from "@/lib/admin/products-queries";
import { KpiInline } from "../../_components/kpi-inline";
import { ProductsFilters } from "./filters";

export const metadata: Metadata = { title: "Produse · Admin" };

const GAMA_LABEL: Record<string, string> = {
  cuvinte: "Cuvinte",
  semne: "Semne",
  pauze: "Pauze",
};

const TYPE_LABEL: Record<string, string> = {
  alb: "Alb",
  rosu: "Roșu",
  rose: "Rosé",
};

const SWEETNESS_LABEL: Record<string, string> = {
  sec: "Sec",
  demisec: "Demisec",
  dulce: "Dulce",
};

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const filter: ProductsFilter = {
    gama: (params.gama as ProductsFilter["gama"]) ?? "all",
    search: (params.q as string | undefined) ?? "",
  };

  const { items, kpis } = await listProducts(filter);

  // Empty state — nu ai produse deloc (chiar și fără filtru)
  if (items.length === 0 && !filter.search && filter.gama === "all") {
    return (
      <>
        <header className="admin-page-head">
          <div>
            <h1 className="admin-page-title">Produse</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              <Upload className="mr-1.5 h-3.5 w-3.5" />
              Import CSV
            </Button>
            <Button size="sm" disabled title="Editor produs — vine curând">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Adaugă produs
            </Button>
          </div>
        </header>

        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-24 text-center">
          <div className="max-w-md">
            <h2 className="text-lg font-semibold text-zinc-900">
              Nu ai produse încă
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Începe să adaugi vinurile pe care le vinzi. Le poți structura pe
              game — cuvinte, semne sau pauze.
            </p>
            <div className="mt-6 flex justify-center gap-2">
              <Button asChild>
                <Link href="/admin/produse/nou">
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Adaugă primul produs
                </Link>
              </Button>
              <Button variant="outline" disabled>
                <Upload className="mr-1.5 h-3.5 w-3.5" />
                Import CSV
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
          <h1 className="admin-page-title">Produse</h1>
          <p className="admin-page-sub">
            {kpis.total.toLocaleString("ro-RO")}{" "}
            {kpis.total === 1 ? "produs" : "produse"} · {kpis.active} active
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export
          </Button>
          <Button variant="outline" size="sm" disabled>
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            Import CSV
          </Button>
          <Button asChild size="sm">
            <Link href="/admin/produse/nou">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Adaugă produs
            </Link>
          </Button>
        </div>
      </header>

      {/* KPI bar */}
      <div className="mb-4 flex items-stretch gap-2 overflow-x-auto">
        <KpiInline
          label="Total produse"
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
          label="Stoc scăzut"
          value={kpis.lowStock}
          trendPct={null}
          spark={Array(12).fill(kpis.lowStock)}
        />
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
      </div>

      {/* Filtre + tabel */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
        <ProductsFilters />

        {items.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-zinc-500">
            Nici un produs nu se potrivește filtrelor.
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
                      className="rounded border-zinc-300"
                    />
                  </th>
                  <th className="py-2.5 font-medium">Produs</th>
                  <th className="py-2.5 font-medium">Cod</th>
                  <th className="py-2.5 font-medium">Gamă</th>
                  <th className="py-2.5 font-medium">Tip</th>
                  <th className="py-2.5 text-right font-medium">Preț</th>
                  <th className="py-2.5 text-right font-medium">Stoc</th>
                  <th className="py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5" />
                </tr>
              </thead>
              <tbody>
                {items.map((p) => {
                  const photo = productPhoto(p.code);
                  const stockTone =
                    p.stock < 10
                      ? "text-red-600"
                      : p.stock < 20
                        ? "text-amber-600"
                        : "text-zinc-900";
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/60"
                    >
                      <td className="w-10 px-4 py-2.5">
                        <input
                          type="checkbox"
                          disabled
                          className="rounded border-zinc-300"
                        />
                      </td>
                      <td className="py-2.5">
                        <Link
                          href={`/admin/produse/${p.code}`}
                          className="flex items-center gap-3"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-zinc-200 bg-zinc-50">
                            {photo ? (
                              <Image
                                src={photo}
                                alt={p.name}
                                width={40}
                                height={40}
                                className="h-full w-full object-contain"
                              />
                            ) : (
                              <span className="text-[10px] text-zinc-400">
                                fără poză
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-zinc-900 hover:underline">
                              {p.name}
                            </div>
                            <div className="text-[11px] text-zinc-500">
                              {p.year ?? "—"} · {p.abv.toString().replace(".", ",")}% VOL
                            </div>
                          </div>
                        </Link>
                      </td>
                      <td className="py-2.5 font-mono text-xs text-zinc-700">
                        {p.code}
                      </td>
                      <td className="py-2.5 text-zinc-700">
                        {GAMA_LABEL[p.gama]}
                      </td>
                      <td className="py-2.5 text-zinc-700">
                        {TYPE_LABEL[p.type]} · {SWEETNESS_LABEL[p.sweetness]}
                      </td>
                      <td className="py-2.5 text-right font-medium text-zinc-900">
                        {formatRon(p.priceCents)}
                      </td>
                      <td className={`py-2.5 text-right font-medium ${stockTone}`}>
                        {p.stock}
                      </td>
                      <td className="py-2.5">
                        {p.active ? (
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Activ
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                            Inactiv
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        <Link
                          href={`/admin/produse/${p.code}`}
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
        )}
      </div>
    </>
  );
}

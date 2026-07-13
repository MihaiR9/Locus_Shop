import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type ProductRow = {
  id: string;
  code: string;
  slug: string;
  name: string;
  gama: "cuvinte" | "semne" | "pauze";
  type: "alb" | "rosu" | "rose";
  sweetness: "sec" | "demisec" | "dulce";
  abv: number;
  priceCents: number;
  stock: number;
  active: boolean;
  year: number | null;
  bottleColor: "white" | "red" | "rose";
  updatedAt: string;
};

export type ProductsFilter = {
  gama?: "all" | "cuvinte" | "semne" | "pauze";
  search?: string;
  activeOnly?: boolean;
};

export type ProductsListResult = {
  items: ProductRow[];
  totalCount: number;
  kpis: {
    total: number;
    active: number;
    lowStock: number;
    totalUnitsInStock: number;
    stockValueCents: number;
  };
};

export async function listProducts(
  filter: ProductsFilter = {},
): Promise<ProductsListResult> {
  const supabase = await getSupabaseServerClient();

  let query = supabase
    .from("products")
    .select(
      "id, code, slug, name, gama, type, sweetness, abv, price_cents, stock, active, year, bottle_color, updated_at",
      { count: "exact" },
    )
    .order("code", { ascending: true });

  if (filter.gama && filter.gama !== "all") {
    query = query.eq("gama", filter.gama);
  }
  if (filter.activeOnly) {
    query = query.eq("active", true);
  }
  if (filter.search && filter.search.trim()) {
    const q = filter.search.trim();
    query = query.or(`name.ilike.%${q}%,code.ilike.%${q}%,slug.ilike.%${q}%`);
  }

  const { data, error, count } = await query;
  if (error) {
    console.error("[listProducts]", error);
    return {
      items: [],
      totalCount: 0,
      kpis: {
        total: 0,
        active: 0,
        lowStock: 0,
        totalUnitsInStock: 0,
        stockValueCents: 0,
      },
    };
  }

  const items: ProductRow[] = (data ?? []).map((p) => ({
    id: p.id,
    code: p.code,
    slug: p.slug,
    name: p.name,
    gama: p.gama,
    type: p.type,
    sweetness: p.sweetness,
    abv: typeof p.abv === "string" ? Number(p.abv) : p.abv,
    priceCents: p.price_cents,
    stock: p.stock,
    active: p.active,
    year: p.year,
    bottleColor: p.bottle_color,
    updatedAt: p.updated_at,
  }));

  const kpis = {
    total: items.length,
    active: items.filter((p) => p.active).length,
    lowStock: items.filter((p) => p.active && p.stock < 20).length,
    totalUnitsInStock: items.reduce((s, p) => s + p.stock, 0),
    stockValueCents: items.reduce((s, p) => s + p.stock * p.priceCents, 0),
  };

  return { items, totalCount: count ?? items.length, kpis };
}

// Re-export pentru compatibilitate — folosește direct @/lib/format din client
// components ca să eviți să tragi întregul modul server-only în bundle-ul client.
export { formatRon } from "@/lib/format";

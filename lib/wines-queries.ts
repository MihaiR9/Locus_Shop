import "server-only";
import { cache } from "react";
import { getSupabasePublicClient } from "@/lib/supabase/public";
import type { Database } from "@/lib/supabase/database.types";
import type { Wine } from "@/lib/wines";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

/**
 * Map a `products` row (DB shape, prices in cents) to the app-level
 * `Wine` shape (priceRon as RON, camelCase fields). Single conversion
 * point — every other place in the app sees the canonical `Wine`.
 */
function rowToWine(r: ProductRow): Wine {
  return {
    code: r.code,
    slug: r.slug,
    name: r.name,
    gama: r.gama,
    type: r.type,
    sweetness: r.sweetness,
    abv: typeof r.abv === "string" ? Number(r.abv) : r.abv,
    priceRon: Math.round(r.price_cents / 100),
    bottleColor: r.bottle_color,
    servingTemp: r.serving_temp ?? "",
    notes: r.notes ?? "",
    year: r.year ?? new Date().getFullYear(),
    stock: r.stock,
    heroImage: r.hero_image,
    short: r.short ?? "",
    taste: r.taste ?? "",
    pair: r.pair ?? "",
    glass: r.glass ?? "",
    decant: r.decant ?? "",
    age: r.age_note ?? "",
    grape: r.grape ?? "",
  };
}

/**
 * All active wines, sorted gama (cuvinte → semne → pauze) then code.
 *
 * `cache()` deduplică apelul în cadrul aceluiași render — /shop îl cere o
 * dată pentru JSON-LD și o dată pentru grid; DB-ul e lovit o singură dată.
 */
export const getAllWines = cache(async function getAllWines(): Promise<Wine[]> {
  const supabase = getSupabasePublicClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("gama", { ascending: true })
    .order("code", { ascending: true });

  if (error) {
    console.error("[getAllWines]", error);
    return [];
  }
  return (data ?? []).map(rowToWine);
});

/**
 * Ca `getAllWines`, dar ARUNCĂ dacă interogarea eșuează.
 *
 * Pentru UI, un catalog gol e o degradare acceptabilă. Pentru feed-urile de
 * produse NU e: Google și Meta interpretează un feed gol ca „toate produsele
 * au dispărut" și delistează contul. Mai bine răspundem cu eroare, ca
 * platforma să păstreze ultima versiune bună a feed-ului.
 */
export const getAllWinesStrict = cache(
  async function getAllWinesStrict(): Promise<Wine[]> {
    const supabase = getSupabasePublicClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .order("gama", { ascending: true })
      .order("code", { ascending: true });

    if (error) {
      throw new Error(`products query failed: ${error.message}`);
    }
    return (data ?? []).map(rowToWine);
  },
);

/** Single wine by slug. `null` if not found / inactive. */
export const getWineBySlug = cache(async function getWineBySlug(
  slug: string,
): Promise<Wine | null> {
  const supabase = getSupabasePublicClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    console.error("[getWineBySlug]", slug, error);
    return null;
  }
  return data ? rowToWine(data) : null;
});

/** Wines belonging to a specific gama (active only). */
export const getWinesByGama = cache(async function getWinesByGama(
  gama: Wine["gama"],
): Promise<Wine[]> {
  const supabase = getSupabasePublicClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .eq("gama", gama)
    .order("code", { ascending: true });

  if (error) {
    console.error("[getWinesByGama]", gama, error);
    return [];
  }
  return (data ?? []).map(rowToWine);
});

/**
 * "Vinuri apropiate" feed for PDP — same gama first, then anything
 * else, excluding the current wine. Up to `count` rows.
 */
export async function getRelatedWines(
  wine: Wine,
  count = 3,
): Promise<Wine[]> {
  const supabase = getSupabasePublicClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .neq("code", wine.code)
    .limit(count + 4); // grab a few extra so we can re-sort same-gama-first

  if (error) {
    console.error("[getRelatedWines]", error);
    return [];
  }
  return (data ?? [])
    .map(rowToWine)
    .sort((a, b) => {
      const aSame = a.gama === wine.gama ? 0 : 1;
      const bSame = b.gama === wine.gama ? 0 : 1;
      return aSame - bSame;
    })
    .slice(0, count);
}

/** All slugs of active wines — for `generateStaticParams`. */
export async function getAllSlugs(): Promise<string[]> {
  const supabase = getSupabasePublicClient();
  const { data, error } = await supabase
    .from("products")
    .select("slug")
    .eq("active", true);
  if (error) {
    console.error("[getAllSlugs]", error);
    return [];
  }
  return (data ?? []).map((r) => r.slug);
}

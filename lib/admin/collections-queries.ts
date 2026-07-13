import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type CollectionRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  heroImage: string | null;
  active: boolean;
  sortOrder: number;
  productsCount: number;
  updatedAt: string;
};

export type CollectionDetail = CollectionRow & {
  productIds: string[];
};

export async function listCollections(): Promise<CollectionRow[]> {
  const supabase = await getSupabaseServerClient();

  const { data: collections, error } = await supabase
    .from("collections")
    .select(
      "id, slug, name, description, hero_image, active, sort_order, updated_at",
    )
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[listCollections]", error.message, error.details, error.code);
    return [];
  }
  if (!collections || collections.length === 0) return [];

  const { data: links, error: linksError } = await supabase
    .from("collection_products")
    .select("collection_id");

  if (linksError) {
    console.error("[listCollections/links]", linksError.message, linksError.code);
  }

  const counts = new Map<string, number>();
  (links ?? []).forEach((l) => {
    counts.set(l.collection_id, (counts.get(l.collection_id) ?? 0) + 1);
  });

  return collections.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description,
    heroImage: c.hero_image,
    active: c.active,
    sortOrder: c.sort_order,
    productsCount: counts.get(c.id) ?? 0,
    updatedAt: c.updated_at,
  }));
}

export async function getCollectionBySlug(
  slug: string,
): Promise<CollectionDetail | null> {
  const supabase = await getSupabaseServerClient();

  const { data: collection, error } = await supabase
    .from("collections")
    .select(
      "id, slug, name, description, hero_image, active, sort_order, updated_at",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error || !collection) {
    if (error)
      console.error(
        "[getCollectionBySlug]",
        slug,
        error.message,
        error.details,
        error.code,
      );
    return null;
  }

  const { data: links, error: linksError } = await supabase
    .from("collection_products")
    .select("product_id, sort_order")
    .eq("collection_id", collection.id)
    .order("sort_order", { ascending: true });

  if (linksError) {
    console.error(
      "[getCollectionBySlug/links]",
      slug,
      linksError.message,
      linksError.code,
    );
  }

  const productIds = (links ?? []).map((l) => l.product_id);

  return {
    id: collection.id,
    slug: collection.slug,
    name: collection.name,
    description: collection.description,
    heroImage: collection.hero_image,
    active: collection.active,
    sortOrder: collection.sort_order,
    productsCount: productIds.length,
    updatedAt: collection.updated_at,
    productIds,
  };
}

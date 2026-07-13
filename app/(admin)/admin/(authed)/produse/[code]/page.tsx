import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { listCollections } from "@/lib/admin/collections-queries";
import { ProductForm } from "../_form/product-form";

type Params = { code: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { code } = await params;
  return { title: `${code} · Editează · Admin` };
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { code } = await params;

  const supabase = await getSupabaseServerClient();
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("code", code)
    .maybeSingle();

  if (!product) notFound();

  const [collections, { data: links }] = await Promise.all([
    listCollections(),
    supabase
      .from("collection_products")
      .select("collection_id")
      .eq("product_id", product.id),
  ]);

  const collectionOptions = collections.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
  }));

  const selectedCollectionIds =
    (links as { collection_id: string }[] | null)?.map((r) => r.collection_id) ??
    [];

  return (
    <ProductForm
      mode="edit"
      initial={{
        code: product.code,
        slug: product.slug,
        name: product.name,
        gama: product.gama,
        type: product.type,
        sweetness: product.sweetness,
        bottleColor: product.bottle_color,
        abv:
          typeof product.abv === "string"
            ? Number(product.abv)
            : product.abv,
        priceRon: Math.round(product.price_cents / 100),
        stock: product.stock,
        year: product.year,
        active: product.active,
        short: product.short ?? "",
        notes: product.notes ?? "",
        taste: product.taste ?? "",
        pair: product.pair ?? "",
        glass: product.glass ?? "",
        decant: product.decant ?? "",
        ageNote: product.age_note ?? "",
        grape: product.grape ?? "",
        servingTemp: product.serving_temp ?? "",
        heroImage: product.hero_image,
      }}
      collections={collectionOptions}
      selectedCollectionIds={selectedCollectionIds}
    />
  );
}

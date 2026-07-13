import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCollectionBySlug } from "@/lib/admin/collections-queries";
import { listProducts } from "@/lib/admin/products-queries";
import { productPhoto } from "@/lib/wines";
import { CollectionEditForm } from "./edit-form";
import { ProductsPicker } from "./products-picker";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  return { title: `${slug} · Colecții · Admin` };
}

export default async function CollectionEditPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) notFound();

  const productsResult = await listProducts({ activeOnly: false });
  const allProducts = productsResult.items.map((p) => ({
    id: p.id,
    code: p.code,
    name: p.name,
    gama: p.gama,
    priceRon: Math.round(p.priceCents / 100),
    photo: productPhoto(p.code),
  }));

  return (
    <>
      <div className="mb-2">
        <Link
          href="/admin/colectii"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 transition-colors hover:text-zinc-900"
        >
          <ArrowLeft className="h-3 w-3" />
          Înapoi la colecții
        </Link>
      </div>

      <header className="admin-page-head">
        <div>
          <h1 className="admin-page-title">{collection.name}</h1>
          <p className="admin-page-sub">
            {collection.productsCount} produse · slug{" "}
            <code className="rounded bg-zinc-100 px-1 py-0.5 text-[11px]">
              {collection.slug}
            </code>
          </p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CollectionEditForm
            slug={collection.slug}
            name={collection.name}
            description={collection.description}
            active={collection.active}
            heroImage={collection.heroImage}
          />
        </div>
        <div className="lg:col-span-3">
          <ProductsPicker
            slug={collection.slug}
            allProducts={allProducts}
            initialSelected={collection.productIds}
          />
        </div>
      </div>
    </>
  );
}

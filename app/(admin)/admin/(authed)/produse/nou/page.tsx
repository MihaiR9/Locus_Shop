import type { Metadata } from "next";
import { listCollections } from "@/lib/admin/collections-queries";
import { ProductForm } from "../_form/product-form";

export const metadata: Metadata = { title: "Produs nou · Admin" };

export default async function NewProductPage() {
  const collections = await listCollections();
  const collectionOptions = collections.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
  }));

  return (
    <ProductForm
      mode="create"
      initial={{
        code: "",
        slug: "",
        name: "",
        gama: "cuvinte",
        type: "alb",
        sweetness: "sec",
        bottleColor: "white",
        abv: 13,
        priceRon: 0,
        stock: 0,
        year: new Date().getFullYear() - 1,
        active: true,
        short: "",
        notes: "",
        taste: "",
        pair: "",
        glass: "",
        decant: "",
        ageNote: "",
        grape: "",
        servingTemp: "",
        heroImage: null,
      }}
      collections={collectionOptions}
      selectedCollectionIds={[]}
    />
  );
}

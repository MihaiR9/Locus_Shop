import type { Metadata } from "next";
import { Footer } from "@/components/landing/footer";
import { WinesGrid } from "@/components/landing/wines-grid";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema, itemListSchema } from "@/lib/seo/schema";
import { getAllWines } from "@/lib/wines-queries";

const DESCRIPTION =
  "Cumpără vinurile Domeniului Locus — gamele cuvinte, semne și pauze. Livrare în toată România prin curier, gratuit peste 250 lei.";

export const metadata: Metadata = {
  title: "Shop · Domeniul Locus",
  description: DESCRIPTION,
  alternates: { canonical: "/shop" },
  openGraph: {
    type: "website",
    url: "/shop",
    title: "Shop · Domeniul Locus",
    description: DESCRIPTION,
  },
};

export default async function ShopPage() {
  const wines = await getAllWines();

  return (
    <>
      <JsonLd
        data={[
          itemListSchema(wines, "Colecția Domeniul Locus"),
          breadcrumbSchema([
            { name: "Acasă", path: "/" },
            { name: "Shop", path: "/shop" },
          ]),
        ]}
      />
      <main className="shop-page">
        <header className="shop-hero">
          <div className="container-locus">
            <div className="eyebrow">Shop · Domeniul Locus</div>
            <h1 className="shop-hero-title">Colecția în pahar.</h1>
            <p className="shop-hero-lead">
              Toate vinurile noastre, într-un singur loc. Filtrează după gamă,
              tip sau dulceață și alege ce ți se potrivește.
            </p>
          </div>
        </header>

        <div id="vinuri" className="shop-grid-wrap">
          <WinesGrid />
        </div>
      </main>
      <Footer />
    </>
  );
}

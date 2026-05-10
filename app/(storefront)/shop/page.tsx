import type { Metadata } from "next";
import { Footer } from "@/components/landing/footer";
import { WinesGrid } from "@/components/landing/wines-grid";

export const metadata: Metadata = {
  title: "Shop · Domeniul Locus",
  description:
    "Cumpără vinurile Domeniului Locus — gamele cuvinte, semne și pauze. Livrare în România prin curier sau ridicare personală la cramă.",
};

export default function ShopPage() {
  return (
    <>
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

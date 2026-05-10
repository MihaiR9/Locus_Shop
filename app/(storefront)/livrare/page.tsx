import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/landing/footer";
import { MethodsGrid } from "@/components/livrare/methods-grid";
import { ZonesTable } from "@/components/livrare/zones-table";
import { CalcCost } from "@/components/livrare/calc-cost";
import { LivrareFAQ } from "@/components/livrare/livrare-faq";

export const metadata: Metadata = {
  title: "Livrare · Domeniul Locus",
  description:
    "Livrare prin Sameday în toată România · curier la ușă sau Easybox · gratuit peste 250 lei. Ridicare personală gratuită la sediul Buciumeni.",
};

export default function LivrarePage() {
  return (
    <>
      <main className="livrare-page">
        <header className="livrare-hero">
          <div className="container-locus">
            <div className="eyebrow">Livrare · Domeniul Locus</div>
            <h1 className="livrare-hero-title">Vinul, până la ușa ta.</h1>
            <p className="livrare-hero-lead">
              Toate comenzile pleacă din Buciumeni prin <strong>Sameday</strong>,
              partenerul nostru de curierat. Costuri fixe, durate predictibile,
              ramburs disponibil. Sau vii tu la cramă — pe noi ne găsești între
              Panciu și Nicorești.
            </p>
          </div>
        </header>

        <div className="container-locus livrare-content">
          <MethodsGrid />
          <ZonesTable />
          <CalcCost />
          <LivrareFAQ />

          <section className="livrare-cta">
            <h2 className="h2">Mai ai întrebări?</h2>
            <p>Răspundem în maxim 48h pe email.</p>
            <Link href="/contact" className="btn">
              scrie-ne
              <svg className="arrow" viewBox="0 0 24 12" aria-hidden="true">
                <use href="#arrow-right" />
              </svg>
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/landing/footer";
import { getAllWines } from "@/lib/wines-queries";
import { CartPage } from "./cart-page";

export const metadata: Metadata = {
  title: "Coșul meu · Domeniul Locus",
  description:
    "Vinurile pe care le-ai ales. Aplică un voucher, adaugă mai multe și treci mai departe la detaliile comenzii.",
};

export default async function CosPage() {
  // Fetch tot catalogul o dată aici (server component) — trimitem la
  // client ca să poată sugera vinuri care NU sunt încă în coș.
  const wines = await getAllWines();

  return (
    <>
      <main className="cart-page-wrap">
        <div className="checkout-container">
          <header className="checkout-head">
            <div className="eyebrow">Comanda ta · pas cu pas</div>
            <div className="checkout-title-row">
              <h1>coșul tău.</h1>
              <div className="cart-page-crumbs" aria-hidden="true">
                <span className="crumb is-active">01 · coș</span>
                <span className="crumb">02 · detalii</span>
                <span className="crumb">03 · plată</span>
              </div>
            </div>
          </header>

          <CartPage catalog={wines} />

          <footer className="checkout-legal">
            <Link href="/termeni">Termeni și condiții</Link>
            <Link href="/confidentialitate">Politica de confidențialitate</Link>
            <a
              href="https://anpc.ro/ce-este-sol/"
              target="_blank"
              rel="noopener noreferrer"
            >
              ANPC · SOL
            </a>
            <span className="checkout-legal-spacer">
              Plăți securizate · SSL
            </span>
          </footer>
        </div>
      </main>
      <Footer />
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { StepRail } from "@/components/checkout/step-rail";
import { StepShipping } from "@/components/checkout/step-shipping";
import { StepBilling } from "@/components/checkout/step-billing";
import { StepPayment } from "@/components/checkout/step-payment";
import { OrderSummary } from "@/components/checkout/order-summary";

export const metadata: Metadata = {
  title: "Checkout · Domeniul Locus",
  description:
    "Finalizează comanda — livrare prin curier sau ridicare personală, plată card online sau la livrare.",
};

export default function CheckoutPage() {
  return (
    <main className="checkout-page">
      <div className="checkout-container">
        <header className="checkout-head">
          <div className="eyebrow">Finalizare comandă · pas cu pas</div>
          <div className="checkout-title-row">
            <h1>checkout.</h1>
            <StepRail />
          </div>
        </header>

        <div className="checkout-grid">
          <div className="checkout-form-col">
            <StepShipping />
            <StepBilling />
            <StepPayment />
          </div>
          <OrderSummary />
        </div>

        <footer className="checkout-legal">
          <Link href="/termeni">Termeni și condiții</Link>
          <Link href="/confidentialitate">Politica de confidențialitate</Link>
          <a href="https://anpc.ro/ce-este-sol/" target="_blank" rel="noopener noreferrer">
            ANPC · SOL
          </a>
          <span className="checkout-legal-spacer">Plăți securizate · SSL</span>
        </footer>
      </div>
    </main>
  );
}

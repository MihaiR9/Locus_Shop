import type { Metadata } from "next";
import Link from "next/link";
import { StepShipping } from "@/components/checkout/step-shipping";
import { StepBilling } from "@/components/checkout/step-billing";
import { StepPayment } from "@/components/checkout/step-payment";
import { OrderSummary } from "@/components/checkout/order-summary";
import { CheckoutTracker } from "@/components/checkout/checkout-tracker";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getAccountDefaults } from "@/lib/account/defaults";

export const metadata: Metadata = {
  title: "Detalii comandă · Domeniul Locus",
  description:
    "Finalizează comanda — livrare prin curier sau FANbox, plată card online sau la livrare.",
};

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  const defaults = user?.customerId
    ? await getAccountDefaults(user.customerId)
    : null;
  return (
    <>
      <CheckoutTracker />
      <main className="co-page">
        <div className="co-page-head">
          <div className="co-rail">
            <span><b>01</b> coș</span>
            <span className="dot">·</span>
            <span><b>02</b> livrare</span>
            <span className="dot">·</span>
            <span><b>03</b> facturare</span>
            <span className="dot">·</span>
            <span><b>04</b> plată</span>
          </div>
          <h1>Finalizare comandă</h1>
        </div>

        <div className="co-layout">
          <div className="co-steps">
            <StepShipping defaults={defaults} />
            <StepBilling defaults={defaults} />
            <StepPayment />
          </div>
          <OrderSummary />
        </div>

        <footer
          style={{
            marginTop: 40,
            paddingTop: 22,
            borderTop: "1px solid var(--line)",
            fontFamily: "var(--font-mono), monospace",
            fontSize: 10.5,
            color: "var(--ink-mute)",
            letterSpacing: "0.03em",
            display: "flex",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <Link href="/termeni">Termeni și condiții</Link>
          <Link href="/confidentialitate">Politica de confidențialitate</Link>
          <a href="https://anpc.ro/ce-este-sol/" target="_blank" rel="noopener noreferrer">
            ANPC · SOL
          </a>
          <span style={{ marginLeft: "auto" }}>Plăți securizate · SSL</span>
        </footer>
      </main>
    </>
  );
}

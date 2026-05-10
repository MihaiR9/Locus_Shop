import type { Metadata } from "next";
import { MOCK_BILLING_PROFILES } from "@/lib/mock-account";
import { BillingSection } from "./billing-section";

export const metadata: Metadata = {
  title: "Date facturare · Cont",
};

export default function BillingPage() {
  return (
    <>
      <div className="eyebrow">factură · persoană juridică</div>
      <h1>Date facturare.</h1>
      <p className="lead-mono">
        Pentru factură pe firmă (CUI, sediu, IBAN). Le precompletăm la
        checkout când bifezi „factură pe firmă". Pentru persoană fizică nu e
        nevoie de nimic aici — facturăm direct pe numele de pe livrare.
      </p>

      <BillingSection initial={MOCK_BILLING_PROFILES} />

      <p
        style={{
          marginTop: 32,
          fontFamily: "var(--font-mono), monospace",
          fontSize: 11,
          lineHeight: 1.7,
          color: "var(--ink-mute)",
        }}
      >
        Datele firmei sunt validate la ANAF la prima salvare (denumire, CUI,
        sediu social). Modificările se reflectă în facturile emise începând
        cu următoarea comandă — facturile deja emise rămân ca atare,
        conform legislației fiscale.
      </p>
    </>
  );
}

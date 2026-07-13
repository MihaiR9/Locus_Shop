import type { Metadata } from "next";
import { PlaceholderPage } from "../../_components/placeholder-page";

export const metadata: Metadata = { title: "Finanțe · Admin" };

export default function AdminFinancePage() {
  return (
    <PlaceholderPage
      title="Finanțe"
      sub="Payouts Stripe, facturi FGO, status ANAF e-Factura."
      note="Vine după integrarea FGO."
    />
  );
}

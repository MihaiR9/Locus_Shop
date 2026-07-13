import type { Metadata } from "next";
import { PlaceholderPage } from "../../_components/placeholder-page";

export const metadata: Metadata = { title: "Aplicații · Admin" };

export default function AdminAppsPage() {
  return (
    <PlaceholderPage
      title="Aplicații"
      sub="FGO, FanCourier, Stripe, Resend, Supabase — status și configurare."
      note="Vine după integrările reale (FGO + FanCourier)."
    />
  );
}

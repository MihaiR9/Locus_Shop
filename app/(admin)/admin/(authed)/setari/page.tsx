import type { Metadata } from "next";
import { PlaceholderPage } from "../../_components/placeholder-page";

export const metadata: Metadata = { title: "Setări · Admin" };

export default function AdminSettingsPage() {
  return (
    <PlaceholderPage
      title="Setări"
      sub="Transport, TVA, FGO, FanCourier, Stripe, Resend."
      note="Vine la pasul 9."
    />
  );
}

import type { Metadata } from "next";
import { PlaceholderPage } from "../../_components/placeholder-page";

export const metadata: Metadata = { title: "Analize · Admin" };

export default function AdminAnalyticsPage() {
  return (
    <PlaceholderPage
      title="Analize"
      sub="Rapoarte vânzări, top vinuri, cohort retention, LTV."
      note="Vine la pasul 10 (după ce Dashboard are date reale)."
    />
  );
}

import type { Metadata } from "next";
import { PlaceholderPage } from "../../_components/placeholder-page";

export const metadata: Metadata = { title: "Preferințe · Admin" };

export default function AdminPreferencesPage() {
  return (
    <PlaceholderPage
      title="Preferințe"
      sub="SEO homepage, coming-soon gate, redirects, favicon."
      note="Vine la pas ulterior. Momentan controlate din Vercel env."
    />
  );
}

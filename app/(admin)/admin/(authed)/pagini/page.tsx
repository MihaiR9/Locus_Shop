import type { Metadata } from "next";
import { PlaceholderPage } from "../../_components/placeholder-page";

export const metadata: Metadata = { title: "Pagini · Admin" };

export default function AdminPagesPage() {
  return (
    <PlaceholderPage
      title="Pagini"
      sub="About, T&C, GDPR, Retur — editor de conținut."
      note="Vine la pas ulterior. Momentan paginile sunt în cod."
    />
  );
}

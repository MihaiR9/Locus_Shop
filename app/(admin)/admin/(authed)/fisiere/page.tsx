import type { Metadata } from "next";
import { PlaceholderPage } from "../../_components/placeholder-page";

export const metadata: Metadata = { title: "Fișiere · Admin" };

export default function AdminFilesPage() {
  return (
    <PlaceholderPage
      title="Fișiere"
      sub="Bibliotecă media — imagini produse, hero, brand assets."
      note="Vine împreună cu editorul de produse (pas 4)."
    />
  );
}

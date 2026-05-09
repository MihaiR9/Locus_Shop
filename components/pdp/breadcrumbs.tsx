import Link from "next/link";
import type { Wine } from "@/lib/wines";

export function Breadcrumbs({ wine }: { wine: Wine }) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <Link href="/#vinuri">Vinuri</Link>
      <span className="sep" aria-hidden="true">
        /
      </span>
      <Link href={`/${wine.gama}`}>{wine.gama}</Link>
      <span className="sep" aria-hidden="true">
        /
      </span>
      <span aria-current="page">
        {wine.name} {wine.code}
      </span>
    </nav>
  );
}

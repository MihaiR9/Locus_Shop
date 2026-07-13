import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NewCollectionForm } from "./new-form";

export const metadata: Metadata = { title: "Colecție nouă · Admin" };

export default function NewCollectionPage() {
  return (
    <>
      <div className="mb-2">
        <Link
          href="/admin/colectii"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 transition-colors hover:text-zinc-900"
        >
          <ArrowLeft className="h-3 w-3" />
          Înapoi la colecții
        </Link>
      </div>

      <header className="admin-page-head">
        <div>
          <h1 className="admin-page-title">Colecție nouă</h1>
          <p className="admin-page-sub">
            Adaugă produsele în colecție după ce o salvezi.
          </p>
        </div>
      </header>

      <div className="max-w-2xl">
        <NewCollectionForm />
      </div>
    </>
  );
}

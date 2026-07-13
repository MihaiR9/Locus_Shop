import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Plus, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listCollections } from "@/lib/admin/collections-queries";

export const metadata: Metadata = { title: "Colecții · Admin" };

export default async function CollectionsListPage() {
  const collections = await listCollections();

  if (collections.length === 0) {
    return (
      <>
        <header className="admin-page-head">
          <div>
            <h1 className="admin-page-title">Colecții</h1>
          </div>
          <div>
            <Button asChild size="sm">
              <Link href="/admin/colectii/nou">
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Adaugă colecție
              </Link>
            </Button>
          </div>
        </header>

        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-white px-6 py-24 text-center">
          <Layers className="mb-3 h-8 w-8 text-zinc-400" strokeWidth={1.5} />
          <h2 className="text-lg font-semibold text-zinc-900">
            Nici o colecție încă
          </h2>
          <p className="mt-1 max-w-md text-sm text-zinc-500">
            Grupează produsele în colecții — game (Cuvinte, Semne, Pauze) sau
            selecții tematice (Cadouri, Cele mai vândute).
          </p>
          <div className="mt-6">
            <Button asChild>
              <Link href="/admin/colectii/nou">
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Prima colecție
              </Link>
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <header className="admin-page-head">
        <div>
          <h1 className="admin-page-title">Colecții</h1>
          <p className="admin-page-sub">
            {collections.length}{" "}
            {collections.length === 1 ? "colecție" : "colecții"} · grupări
            editoriale de produse.
          </p>
        </div>
        <div>
          <Button asChild size="sm">
            <Link href="/admin/colectii/nou">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Adaugă colecție
            </Link>
          </Button>
        </div>
      </header>

      <div className="rounded-xl border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 text-left text-[11px] uppercase tracking-[0.06em] text-zinc-500">
              <th className="w-14 px-4 py-2.5" />
              <th className="py-2.5 font-medium">Nume</th>
              <th className="py-2.5 font-medium">Slug</th>
              <th className="py-2.5 text-right font-medium">Produse</th>
              <th className="py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {collections.map((c) => (
              <tr
                key={c.id}
                className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/60"
              >
                <td className="px-4 py-2.5">
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md border border-zinc-200 bg-zinc-50">
                    {c.heroImage ? (
                      <Image
                        src={c.heroImage}
                        alt={c.name}
                        width={40}
                        height={40}
                        className="h-full w-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <Layers className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
                    )}
                  </div>
                </td>
                <td className="py-2.5">
                  <Link
                    href={`/admin/colectii/${c.slug}`}
                    className="font-medium text-zinc-900 hover:underline"
                  >
                    {c.name}
                  </Link>
                  {c.description && (
                    <div className="mt-0.5 line-clamp-1 text-[11px] text-zinc-500">
                      {c.description}
                    </div>
                  )}
                </td>
                <td className="py-2.5 font-mono text-xs text-zinc-600">
                  {c.slug}
                </td>
                <td className="py-2.5 text-right font-medium text-zinc-900">
                  {c.productsCount}
                </td>
                <td className="py-2.5">
                  {c.active ? (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Publicată
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                      Ascunsă
                    </span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <Link
                    href={`/admin/colectii/${c.slug}`}
                    className="text-xs font-medium text-zinc-700 hover:text-zinc-900 hover:underline"
                  >
                    Editează
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

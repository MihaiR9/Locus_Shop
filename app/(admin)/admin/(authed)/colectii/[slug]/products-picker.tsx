"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { Search, X, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setCollectionProducts } from "../actions";

type PickerProduct = {
  id: string;
  code: string;
  name: string;
  gama: string;
  priceRon: number;
  photo: string | null;
};

type Props = {
  slug: string;
  allProducts: PickerProduct[];
  initialSelected: string[]; // product IDs în ordinea în colecție
};

export function ProductsPicker({ slug, allProducts, initialSelected }: Props) {
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [savedFlash, setSavedFlash] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const productsById = useMemo(() => {
    const m = new Map<string, PickerProduct>();
    allProducts.forEach((p) => m.set(p.id, p));
    return m;
  }, [allProducts]);

  const selectedItems = selected
    .map((id) => productsById.get(id))
    .filter((p): p is PickerProduct => !!p);

  const availableToAdd = useMemo(() => {
    const s = search.trim().toLowerCase();
    return allProducts.filter(
      (p) =>
        !selected.includes(p.id) &&
        (s === "" ||
          p.name.toLowerCase().includes(s) ||
          p.code.toLowerCase().includes(s) ||
          p.gama.toLowerCase().includes(s)),
    );
  }, [allProducts, selected, search]);

  function add(id: string) {
    setSelected((cur) => [...cur, id]);
  }

  function remove(id: string) {
    setSelected((cur) => cur.filter((x) => x !== id));
  }

  function moveUp(idx: number) {
    if (idx === 0) return;
    setSelected((cur) => {
      const next = [...cur];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  }

  function moveDown(idx: number) {
    setSelected((cur) => {
      if (idx === cur.length - 1) return cur;
      const next = [...cur];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const res = await setCollectionProducts(slug, selected);
      if (!res.ok) setError(res.error);
      else {
        setSavedFlash(true);
        setTimeout(() => setSavedFlash(false), 2000);
      }
    });
  }

  const dirty =
    selected.length !== initialSelected.length ||
    selected.some((id, i) => initialSelected[i] !== id);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white">
      <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
        <div>
          <h2 className="text-[13px] font-semibold text-zinc-900">
            Produse în colecție ({selected.length})
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            Search + click pe produs pentru a-l adăuga. Drag / săgeți pentru ordine.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {savedFlash && (
            <span className="text-xs text-emerald-600">✓ salvat</span>
          )}
          <Button
            size="sm"
            disabled={isPending || !dirty}
            onClick={save}
          >
            {isPending ? "Salvez..." : "Salvează ordine"}
          </Button>
        </div>
      </header>

      {error && (
        <div className="mx-6 mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="relative px-6 pt-4">
        <Search className="pointer-events-none absolute left-9 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Caută produse pentru a le adăuga..."
          className="w-full rounded-md border border-zinc-200 bg-white py-1.5 pl-9 pr-3 text-sm placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none"
        />
      </div>

      {/* Available */}
      {search.trim() !== "" && (
        <div className="mx-6 mt-2 max-h-64 overflow-y-auto rounded-md border border-zinc-200 bg-white">
          {availableToAdd.length === 0 ? (
            <div className="px-3 py-3 text-xs text-zinc-500">
              Nici un produs disponibil.
            </div>
          ) : (
            availableToAdd.slice(0, 20).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => add(p.id)}
                className="flex w-full items-center gap-3 border-b border-zinc-100 px-3 py-2 text-left last:border-0 hover:bg-zinc-50"
              >
                <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded border border-zinc-200 bg-zinc-50">
                  {p.photo ? (
                    <Image src={p.photo} alt={p.name} width={32} height={32} className="h-full w-full object-contain" />
                  ) : (
                    <span className="text-[8px] text-zinc-400">—</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="truncate text-sm font-medium text-zinc-900">
                    {p.name}
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    {p.gama} · {p.code} · {p.priceRon} lei
                  </div>
                </div>
                <span className="text-xs text-emerald-600">+ adaugă</span>
              </button>
            ))
          )}
        </div>
      )}

      {/* Selected */}
      <div className="p-6">
        {selectedItems.length === 0 ? (
          <div className="rounded-md border border-dashed border-zinc-300 px-4 py-8 text-center text-xs text-zinc-500">
            Nici un produs adăugat încă. Caută mai sus.
          </div>
        ) : (
          <ol className="flex flex-col gap-1">
            {selectedItems.map((p, i) => (
              <li
                key={p.id}
                className="flex items-center gap-3 rounded-md border border-zinc-200 bg-white p-2 hover:bg-zinc-50"
              >
                <div className="flex flex-col text-zinc-400">
                  <button
                    type="button"
                    onClick={() => moveUp(i)}
                    disabled={i === 0}
                    className="text-[10px] hover:text-zinc-700 disabled:opacity-30"
                    aria-label="Sus"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDown(i)}
                    disabled={i === selectedItems.length - 1}
                    className="text-[10px] hover:text-zinc-700 disabled:opacity-30"
                    aria-label="Jos"
                  >
                    ▼
                  </button>
                </div>
                <GripVertical className="h-4 w-4 text-zinc-300" />
                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded border border-zinc-200 bg-zinc-50">
                  {p.photo ? (
                    <Image src={p.photo} alt={p.name} width={36} height={36} className="h-full w-full object-contain" />
                  ) : (
                    <span className="text-[8px] text-zinc-400">—</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="truncate text-sm font-medium text-zinc-900">
                    {p.name}
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    {p.gama} · {p.code} · {p.priceRon} lei
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => remove(p.id)}
                  className="rounded-md p-1 text-zinc-400 hover:bg-red-50 hover:text-red-600"
                  aria-label="Elimină"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

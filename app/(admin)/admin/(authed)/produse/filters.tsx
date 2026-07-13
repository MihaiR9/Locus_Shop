"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState, useEffect, useRef } from "react";
import { Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { value: "all", label: "Toate" },
  { value: "cuvinte", label: "Cuvinte" },
  { value: "semne", label: "Semne" },
  { value: "pauze", label: "Pauze" },
] as const;

export function ProductsFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentGama = params.get("gama") ?? "all";
  const currentSearch = params.get("q") ?? "";
  const [searchValue, setSearchValue] = useState(currentSearch);
  const [showSearch, setShowSearch] = useState(!!currentSearch);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      if (searchValue === currentSearch) return;
      const next = new URLSearchParams(params);
      if (searchValue.trim()) next.set("q", searchValue.trim());
      else next.delete("q");
      startTransition(() => router.push(`/admin/produse?${next.toString()}`));
    }, 300);
    return () => clearTimeout(t);
  }, [searchValue, currentSearch, params, router]);

  function setGama(gama: string) {
    const next = new URLSearchParams(params);
    if (gama === "all") next.delete("gama");
    else next.set("gama", gama);
    startTransition(() => router.push(`/admin/produse?${next.toString()}`));
  }

  function toggleSearch() {
    setShowSearch((s) => {
      const next = !s;
      if (next) requestAnimationFrame(() => searchInputRef.current?.focus());
      return next;
    });
  }

  return (
    <div
      className={cn(
        "rounded-t-xl border-b border-zinc-200 bg-white px-2 pt-1",
        isPending && "opacity-70 transition-opacity",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <nav className="flex items-end gap-0.5 overflow-x-auto">
          {TABS.map((t) => {
            const active = currentGama === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setGama(t.value)}
                className={cn(
                  "shrink-0 rounded-t-md px-3 py-2 text-[13px] transition-colors",
                  active
                    ? "bg-zinc-100 font-semibold text-zinc-900"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900",
                )}
              >
                {t.label}
              </button>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1 pb-1 pr-1">
          {showSearch && (
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
              <input
                ref={searchInputRef}
                type="search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Caută nume sau cod..."
                className="w-56 rounded-md border border-zinc-200 bg-white py-1.5 pl-8 pr-3 text-xs placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none"
              />
            </div>
          )}
          <button
            type="button"
            onClick={toggleSearch}
            title="Caută"
            className="rounded-md p-1.5 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Filtre avansate (vine curând)"
            disabled
            className="rounded-md p-1.5 text-zinc-400"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Sortare (vine curând)"
            disabled
            className="rounded-md p-1.5 text-zinc-400"
          >
            <ArrowUpDown className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

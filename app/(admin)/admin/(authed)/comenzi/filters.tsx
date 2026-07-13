"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState, useEffect, useRef } from "react";
import { Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { value: "all", label: "Toate" },
  { value: "pending_payment", label: "În așteptare" },
  { value: "paid", label: "De expediat" },
  { value: "shipped", label: "Expediate" },
  { value: "delivered", label: "Livrate" },
  { value: "cancelled", label: "Anulate" },
  { value: "refunded", label: "Rambursate" },
] as const;

export function OrdersFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentStatus = params.get("status") ?? "all";
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
      next.delete("page");
      startTransition(() => router.push(`/admin/comenzi?${next.toString()}`));
    }, 300);
    return () => clearTimeout(t);
  }, [searchValue, currentSearch, params, router]);

  function setStatus(status: string) {
    const next = new URLSearchParams(params);
    if (status === "all") next.delete("status");
    else next.set("status", status);
    next.delete("page");
    startTransition(() => router.push(`/admin/comenzi?${next.toString()}`));
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
        {/* Tabs */}
        <nav className="flex items-end gap-0.5 overflow-x-auto">
          {TABS.map((t) => {
            const active = currentStatus === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setStatus(t.value)}
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

        {/* Toolbar icons */}
        <div className="flex shrink-0 items-center gap-1 pb-1 pr-1">
          {showSearch && (
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
              <input
                ref={searchInputRef}
                type="search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Caută..."
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

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useTransition } from "react";

const TABS = [
  { key: "all", label: "Toți" },
  { key: "registered", label: "Cont creat" },
  { key: "guests", label: "Guest" },
  { key: "repeat", label: "Repetitivi (2+)" },
] as const;

export function CustomersFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const q = params.get("q") ?? "";
  const view = (params.get("view") ?? "all") as (typeof TABS)[number]["key"];

  function push(next: URLSearchParams) {
    startTransition(() => {
      router.replace(`/admin/clienti?${next.toString()}`);
    });
  }
  function setView(k: (typeof TABS)[number]["key"]) {
    const p = new URLSearchParams(params);
    if (k === "all") p.delete("view");
    else p.set("view", k);
    push(p);
  }
  function setQ(val: string) {
    const p = new URLSearchParams(params);
    if (val) p.set("q", val);
    else p.delete("q");
    push(p);
  }

  return (
    <div className="flex flex-col gap-2 border-b border-zinc-100 px-4 py-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-md bg-zinc-100 p-0.5">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setView(t.key)}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                view === t.key
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              placeholder="Caută email sau nume..."
              defaultValue={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-64 rounded-md border border-zinc-200 bg-white py-1.5 pl-7 pr-3 text-xs placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none"
            />
          </div>
          {isPending && (
            <span className="text-[10px] text-zinc-400">actualizez...</span>
          )}
        </div>
      </div>
    </div>
  );
}

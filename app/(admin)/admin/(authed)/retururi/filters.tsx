"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

const TABS = [
  { key: "all", label: "Toate" },
  { key: "pending", label: "În analiză" },
  { key: "approved", label: "Aprobate" },
  { key: "in_transit", label: "În transport" },
  { key: "completed", label: "Finalizate" },
  { key: "rejected", label: "Respinse" },
] as const;

export function ReturnsFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const status = (params.get("status") ?? "all") as (typeof TABS)[number]["key"];

  function setStatus(k: (typeof TABS)[number]["key"]) {
    const p = new URLSearchParams(params);
    if (k === "all") p.delete("status");
    else p.set("status", k);
    startTransition(() => {
      router.replace(`/admin/retururi?${p.toString()}`);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-zinc-100 px-4 py-3">
      <div className="flex items-center gap-1 rounded-md bg-zinc-100 p-0.5">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setStatus(t.key)}
            className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
              status === t.key
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {isPending && (
        <span className="text-[10px] text-zinc-400">actualizez...</span>
      )}
    </div>
  );
}

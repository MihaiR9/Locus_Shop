"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Check, Loader2 } from "lucide-react";
import { productPhoto } from "@/lib/wines";
import { formatRon } from "@/lib/format";
import type { ProductRow } from "@/lib/admin/products-queries";
import { updateStock, adjustStock } from "./actions";

const GAMA_LABEL: Record<string, string> = {
  cuvinte: "Cuvinte",
  semne: "Semne",
  pauze: "Pauze",
};

type Props = {
  items: ProductRow[];
};

type FlashState = "idle" | "saving" | "saved" | "error";

export function StockTable({ items }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-100 text-left text-[11px] uppercase tracking-[0.06em] text-zinc-500">
            <th className="py-2.5 pl-4 font-medium">Produs</th>
            <th className="py-2.5 font-medium">Cod</th>
            <th className="py-2.5 font-medium">Gamă</th>
            <th className="py-2.5 text-right font-medium">Preț</th>
            <th className="py-2.5 text-center font-medium">Stoc actual</th>
            <th className="py-2.5 text-right font-medium">Valoare</th>
            <th className="px-4 py-2.5" />
          </tr>
        </thead>
        <tbody>
          {items.map((p) => (
            <StockRow key={p.id} product={p} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StockRow({ product }: { product: ProductRow }) {
  const [stock, setStock] = useState(product.stock);
  const [pending, setPending] = useState(product.stock);
  const [flash, setFlash] = useState<FlashState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function save(newValue: number) {
    if (newValue === stock) return;
    setError(null);
    setFlash("saving");
    startTransition(async () => {
      const res = await updateStock(product.id, newValue);
      if (res.ok) {
        setStock(res.newStock);
        setPending(res.newStock);
        setFlash("saved");
        setTimeout(() => setFlash("idle"), 1500);
      } else {
        setError(res.error);
        setPending(stock);
        setFlash("error");
      }
    });
  }

  function adjust(delta: number) {
    setError(null);
    setFlash("saving");
    startTransition(async () => {
      const res = await adjustStock(product.id, delta);
      if (res.ok) {
        setStock(res.newStock);
        setPending(res.newStock);
        setFlash("saved");
        setTimeout(() => setFlash("idle"), 1500);
      } else {
        setError(res.error);
        setFlash("error");
      }
    });
  }

  const photo = productPhoto(product.code);
  const stockTone =
    stock < 10 ? "text-red-600" : stock < 20 ? "text-amber-600" : "text-zinc-900";
  const stockBg =
    stock < 10 ? "bg-red-50" : stock < 20 ? "bg-amber-50" : "bg-zinc-50";
  const stockValue = stock * product.priceCents;

  return (
    <tr className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/60">
      <td className="py-2.5 pl-4">
        <Link
          href={`/admin/produse/${product.code}`}
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-zinc-200 bg-zinc-50">
            {photo ? (
              <Image
                src={photo}
                alt={product.name}
                width={40}
                height={40}
                className="h-full w-full object-contain"
              />
            ) : (
              <span className="text-[10px] text-zinc-400">—</span>
            )}
          </div>
          <div className="min-w-0">
            <div className="font-medium text-zinc-900 hover:underline">
              {product.name}
            </div>
            <div className="text-[11px] text-zinc-500">
              {product.year ?? "—"} · {product.abv.toString().replace(".", ",")}% VOL
            </div>
          </div>
        </Link>
      </td>
      <td className="py-2.5 font-mono text-xs text-zinc-700">{product.code}</td>
      <td className="py-2.5 text-zinc-700">{GAMA_LABEL[product.gama]}</td>
      <td className="py-2.5 text-right text-zinc-700">
        {formatRon(product.priceCents)}
      </td>
      <td className="py-2.5">
        <div className="flex items-center justify-center gap-1.5">
          <button
            type="button"
            aria-label="Scade 1"
            onClick={() => adjust(-1)}
            disabled={isPending || stock === 0}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Minus className="h-3 w-3" />
          </button>
          <div className={`relative rounded-md ${stockBg}`}>
            <input
              type="number"
              min={0}
              step={1}
              value={pending}
              onChange={(e) => setPending(Number(e.target.value))}
              onBlur={(e) => save(Number(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  (e.target as HTMLInputElement).blur();
                }
                if (e.key === "Escape") {
                  setPending(stock);
                  (e.target as HTMLInputElement).blur();
                }
              }}
              disabled={isPending}
              className={`w-16 rounded-md border border-transparent bg-transparent px-2 py-1 text-center text-sm font-semibold focus:border-zinc-400 focus:bg-white focus:outline-none ${stockTone}`}
            />
          </div>
          <button
            type="button"
            aria-label="Adaugă 1"
            onClick={() => adjust(1)}
            disabled={isPending}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="h-3 w-3" />
          </button>
          <div className="ml-1 w-4 shrink-0">
            {flash === "saving" && (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-400" />
            )}
            {flash === "saved" && (
              <Check className="h-3.5 w-3.5 text-emerald-600" />
            )}
            {flash === "error" && (
              <span className="text-[10px] font-medium text-red-600">!</span>
            )}
          </div>
        </div>
        {error && (
          <div className="mt-1 text-center text-[10px] text-red-600">{error}</div>
        )}
      </td>
      <td className={`py-2.5 text-right font-medium ${stockTone}`}>
        {formatRon(stockValue)}
      </td>
      <td className="px-4 py-2.5">
        <Link
          href={`/admin/produse/${product.code}`}
          className="text-xs font-medium text-zinc-700 hover:text-zinc-900 hover:underline"
        >
          Editează
        </Link>
      </td>
    </tr>
  );
}

"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/cart-store";
import { trackAddToCart } from "@/lib/analytics/gtm";
import type { Wine } from "@/lib/wines";

type Props = {
  wine: Wine;
};

export function AddToCartButton({ wine }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const open = useCartStore((s) => s.open);
  const [pulsing, setPulsing] = useState(false);

  function handleClick() {
    addItem(wine);
    open();
    trackAddToCart([
      {
        item_id: wine.code,
        item_name: wine.name,
        item_category: wine.gama,
        item_variant: wine.bottleColor,
        price: wine.priceRon,
        quantity: 1,
      },
    ]);
    setPulsing(true);
    window.setTimeout(() => setPulsing(false), 600);
  }

  return (
    <button
      type="button"
      className={`wine-add ${pulsing ? "is-pulse" : ""}`}
      onClick={handleClick}
      aria-label={`Adaugă ${wine.name} în coș`}
    >
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
        <path
          d="M3 4 L4 14 H12 L13 4 Z M5 4 V2.5 A3 3 0 0 1 11 2.5 V4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
        />
      </svg>
      Adaugă
    </button>
  );
}

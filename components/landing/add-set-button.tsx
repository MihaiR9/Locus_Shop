"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/cart-store";
import { trackAddToCart } from "@/lib/analytics/gtm";
import type { Wine } from "@/lib/wines";

/**
 * Adaugă în coș toate sticlele unui set, dintr-un singur click.
 *
 * Nu trimite niciun cod de voucher: reducerea se acordă automat pentru că
 * setul e recunoscut din compoziția coșului, iar calculul îl face serverul
 * din prețurile din bază (vezi `lib/sets.ts`). Clientul rămâne în flux —
 * se deschide coșul, unde vede gruparea și prețul redus.
 */
export function AddSetButton({
  wines,
  label = "Adaugă setul în coș",
}: {
  wines: Wine[];
  label?: string;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.open);
  const [busy, setBusy] = useState(false);

  function handleClick() {
    if (busy) return;
    setBusy(true);

    wines.forEach((w) => addItem(w));

    trackAddToCart(
      wines.map((w) => ({
        item_id: w.code,
        item_name: w.name,
        item_category: w.gama,
        item_variant: w.bottleColor,
        price: w.priceRon,
        quantity: 1,
      })),
    );

    openCart();
    window.setTimeout(() => setBusy(false), 600);
  }

  return (
    <button type="button" className="btn-primary set-cta" onClick={handleClick} disabled={busy}>
      <span>{busy ? "Se adaugă…" : label}</span>
      <svg width="16" height="8" viewBox="0 0 24 12" aria-hidden="true">
        <use href="#arrow-right" />
      </svg>
    </button>
  );
}

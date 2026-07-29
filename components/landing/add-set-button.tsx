"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/cart-store";
import { trackAddToCart } from "@/lib/analytics/gtm";
import type { Wine } from "@/lib/wines";

/**
 * Adaugă în coș toate sticlele unui set, dintr-un singur click.
 *
 * Reducerea nu e „magică": setul e pur și simplu cele trei vinuri ale
 * gamei, iar discountul se aplică prin cupon la checkout. De asta butonul
 * duce direct la checkout cu codul prefiltrat — altfel prețul afișat pe
 * card n-ar corespunde cu ce vede clientul în sumar, ceea ce ar fi
 * inducere în eroare.
 */
export function AddSetButton({
  wines,
  couponCode,
  label = "Adaugă setul în coș",
}: {
  wines: Wine[];
  couponCode: string;
  label?: string;
}) {
  const addItem = useCartStore((s) => s.addItem);
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

    window.location.href = `/checkout?cupon=${encodeURIComponent(couponCode)}`;
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

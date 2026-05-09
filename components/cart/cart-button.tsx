"use client";

import { useCartStore, selectCount } from "@/lib/cart-store";

export function CartButton() {
  const count = useCartStore(selectCount);
  const open = useCartStore((s) => s.open);

  // The visible badge text "0/N" must appear in the accessible name
  // (axe rule label-content-name-mismatch), so we include it in aria-label.
  const label = `Coș: ${count} ${count === 1 ? "produs" : "produse"}`;

  return (
    <button
      type="button"
      onClick={open}
      aria-label={label}
      className="cart-btn"
    >
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
        <path d="M3 4 L4 14 H12 L13 4 Z" />
        <path d="M5 4 V2.5 A3 3 0 0 1 11 2.5 V4" />
      </svg>
      <span className={`cart-count ${count > 0 ? "is-visible" : ""}`} aria-hidden="true">
        {count}
      </span>
    </button>
  );
}

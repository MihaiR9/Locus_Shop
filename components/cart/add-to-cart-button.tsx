"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/cart-store";

type Props = {
  code: string;
  wineName: string;
};

export function AddToCartButton({ code, wineName }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const open = useCartStore((s) => s.open);
  const [pulsing, setPulsing] = useState(false);

  function handleClick() {
    addItem(code);
    open();
    setPulsing(true);
    window.setTimeout(() => setPulsing(false), 600);
  }

  return (
    <button
      type="button"
      className={`wine-add ${pulsing ? "is-pulse" : ""}`}
      onClick={handleClick}
      aria-label={`Adaugă ${wineName} în coș`}
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

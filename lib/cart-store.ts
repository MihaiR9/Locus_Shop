import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Wine } from "@/lib/wines";

/**
 * Cart line — snapshot of wine fields at add-to-cart time.
 *
 * Why a snapshot vs. just `{ code: qty }`: the cart drawer is mounted
 * in the storefront layout and runs purely client-side; it can't await
 * Supabase queries. By snapshotting the display fields when the user
 * clicks "Adaugă", the drawer stays decoupled from the DB and renders
 * instantly from localStorage on hydrate.
 *
 * The snapshot is for UI ONLY. Pricing at checkout is re-validated
 * server-side against the live `products.price_cents` (Pas 4).
 */
export type CartLine = {
  code: string;
  qty: number;
  // Display snapshot:
  name: string;
  priceRon: number;
  gama: Wine["gama"];
  bottleColor: Wine["bottleColor"];
};

export type CartItems = Record<string, CartLine>;

type CartState = {
  items: CartItems;
  isOpen: boolean;
};

type CartActions = {
  /**
   * Add `qty` bottles of `wine` to the cart (default 1). Pass the full
   * Wine object so we can snapshot the display fields; the DB record
   * may change later but the cart keeps showing what the user actually
   * saw at the moment of action.
   */
  addItem: (wine: Wine, qty?: number) => void;
  removeItem: (code: string) => void;
  updateQty: (code: string, qty: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
};

type CartStore = CartState & CartActions;

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: {},
      isOpen: false,

      addItem: (wine, qty = 1) =>
        set((s) => {
          const existing = s.items[wine.code];
          const nextQty = Math.min(99, (existing?.qty ?? 0) + qty);
          return {
            items: {
              ...s.items,
              [wine.code]: {
                code: wine.code,
                qty: nextQty,
                // Always refresh the snapshot from the most recent Wine
                // object — the user may have added it from a page that
                // rendered the up-to-date price.
                name: wine.name,
                priceRon: wine.priceRon,
                gama: wine.gama,
                bottleColor: wine.bottleColor,
              },
            },
          };
        }),

      removeItem: (code) =>
        set((s) => {
          const next = { ...s.items };
          delete next[code];
          return { items: next };
        }),

      updateQty: (code, qty) =>
        set((s) => {
          if (qty <= 0) {
            const next = { ...s.items };
            delete next[code];
            return { items: next };
          }
          const existing = s.items[code];
          if (!existing) return {};
          return {
            items: { ...s.items, [code]: { ...existing, qty } },
          };
        }),

      clear: () => set({ items: {} }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
    }),
    {
      name: "locus-cart",
      // Bump when CartLine shape changes. Old persisted state with a
      // mismatched version gets discarded by `migrate` returning {}.
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items }),
      migrate: (persisted, version) => {
        // v1 stored items as Record<code, number>. Drop and start fresh
        // — we don't have enough info to reconstruct CartLine snapshots
        // from a bare qty.
        if (version < 2) return { items: {} };
        return persisted as { items: CartItems };
      },
    },
  ),
);

// ─── Selectors ──────────────────────────────────────────────────────

// All selectors guard against malformed entries — if persist hydration
// races with the consumer (or a stale tab writes invalid state), we
// return safe defaults instead of NaN / undefined-property crashes.

function isValidLine(x: unknown): x is CartLine {
  return (
    typeof x === "object" &&
    x !== null &&
    typeof (x as CartLine).qty === "number" &&
    typeof (x as CartLine).priceRon === "number" &&
    typeof (x as CartLine).code === "string"
  );
}

export function selectCount(s: CartStore): number {
  let n = 0;
  for (const k in s.items) {
    const it = s.items[k];
    if (isValidLine(it)) n += it.qty;
  }
  return n;
}

export function selectSubtotalRon(s: CartStore): number {
  let total = 0;
  for (const k in s.items) {
    const it = s.items[k];
    if (isValidLine(it)) total += it.priceRon * it.qty;
  }
  return total;
}

/** Stable list of cart lines — read snapshot fields directly. */
export function selectLines(s: CartStore): CartLine[] {
  return Object.values(s.items).filter(isValidLine);
}

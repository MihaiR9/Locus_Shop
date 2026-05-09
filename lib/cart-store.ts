import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { WINES } from "@/lib/wines";

export type CartItems = Record<string, number>;

type CartState = {
  items: CartItems;
  isOpen: boolean;
};

type CartActions = {
  addItem: (code: string) => void;
  removeItem: (code: string) => void;
  updateQty: (code: string, qty: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
};

type CartStore = CartState & CartActions;

/**
 * Cart store — single source of truth for line items + drawer open state.
 * Persisted to localStorage('locus-cart') for cross-session continuity
 * (matches the static prototype's key so existing testers don't lose state).
 * Drawer open flag is intentionally not persisted (closed on each load).
 */
export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: {},
      isOpen: false,

      addItem: (code) =>
        set((s) => ({
          items: { ...s.items, [code]: (s.items[code] ?? 0) + 1 },
        })),

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
          return { items: { ...s.items, [code]: qty } };
        }),

      clear: () => set({ items: {} }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
    }),
    {
      name: "locus-cart",
      storage: createJSONStorage(() => localStorage),
      // Keep only the line items in storage; drawer state stays transient.
      partialize: (s) => ({ items: s.items }),
    },
  ),
);

// ─── Selectors ──────────────────────────────────────────────────────
const WINE_BY_CODE = Object.fromEntries(WINES.map((w) => [w.code, w] as const));

export function selectCount(s: CartStore): number {
  return Object.values(s.items).reduce((acc, n) => acc + n, 0);
}

export function selectSubtotalRon(s: CartStore): number {
  let total = 0;
  for (const [code, qty] of Object.entries(s.items)) {
    const w = WINE_BY_CODE[code];
    if (w) total += w.priceRon * qty;
  }
  return total;
}

export function selectLines(s: CartStore) {
  return Object.entries(s.items)
    .map(([code, qty]) => {
      const wine = WINE_BY_CODE[code];
      return wine ? { wine, qty } : null;
    })
    .filter((x): x is { wine: (typeof WINES)[number]; qty: number } => x !== null);
}

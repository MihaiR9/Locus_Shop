import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ─── Types ──────────────────────────────────────────────────────────
export type ShipMethod = "curier" | "ridicare";

export type ShippingCurier = {
  method: "curier";
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  county: string;
  zip: string;
  note: string;
};
export type ShippingRidicare = {
  method: "ridicare";
  point: string;
  name: string;
  phone: string;
};
export type Shipping = ShippingCurier | ShippingRidicare;

export type BillType = "fizica" | "juridica";
export type BillingFizica = {
  type: "fizica";
  firstName: string;
  lastName: string;
  cnp: string;
  email: string;
  sameAsShipping: boolean;
};
export type BillingJuridica = {
  type: "juridica";
  company: string;
  cui: string;
  reg: string;
  iban: string;
  email: string;
  hq: string;
};
export type Billing = BillingFizica | BillingJuridica;

export type PaymentMethod = "card-online" | "card-livrare";

type CheckoutState = {
  shipping: Shipping | null;
  billing: Billing | null;
  payment: PaymentMethod;
  termsAccepted: boolean;
};

type CheckoutActions = {
  saveShipping: (s: Shipping) => void;
  saveBilling: (b: Billing) => void;
  setPayment: (p: PaymentMethod) => void;
  setTerms: (v: boolean) => void;
  reset: () => void;
};

type Store = CheckoutState & CheckoutActions;

const initial: CheckoutState = {
  shipping: null,
  billing: null,
  payment: "card-online",
  termsAccepted: false,
};

export const useCheckoutStore = create<Store>()(
  persist(
    (set) => ({
      ...initial,

      saveShipping: (s) => set({ shipping: s }),
      saveBilling: (b) => set({ billing: b }),
      setPayment: (p) => set({ payment: p }),
      setTerms: (v) => set({ termsAccepted: v }),
      reset: () => set(initial),
    }),
    {
      name: "locus-checkout",
      storage: createJSONStorage(() => localStorage),
      // Don't persist termsAccepted across sessions — make user re-tick.
      partialize: (s) => ({
        shipping: s.shipping,
        billing: s.billing,
        payment: s.payment,
      }),
    },
  ),
);

// Selectors with stable primitives only — avoid Zustand v5 + React 19 loops.
export function selectStepStatuses(s: Store) {
  return {
    s1: s.shipping !== null,
    s2: s.billing !== null,
    s3: true /* payment has default */,
  };
}

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ShippingMethodId } from "@/lib/shipping";

// ─── Types ──────────────────────────────────────────────────────────
export type ShipMethod = "curier" | "ridicare";

export type ShippingCurier = {
  method: "curier";
  /** Serviciul FanCourier ales. PayPoint și Sediu FAN nu sunt încă în contract. */
  serviceId: Extract<
    ShippingMethodId,
    "fancourier-standard" | "fancourier-fanbox"
  >;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  /** La FANbox/PayPoint/Office adresa e a punctului fix. Standard = adresa reală. */
  address: string;
  city: string;
  county: string;
  zip: string;
  note: string;
  /** ID FC pentru locker/PayPoint/office — obligatoriu pt cele 3 servicii. */
  pickupPointId?: string;
  pickupPointName?: string;
  pickupPointAddress?: string;
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
  /** Adresa fiscală (line1) — obligatoriu pentru factura ANAF. */
  address: string;
  city: string;
  county: string;
  zip?: string;
  cnp?: string;
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
  /** Sediu social — stradă și număr. FGO cere localitatea și județul separat. */
  hq: string;
  hqCity: string;
  hqCounty: string;
};
export type Billing = BillingFizica | BillingJuridica;

export type PaymentMethod = "card-online" | "card-livrare";

export type VoucherState = {
  /** Codul introdus (uppercase). Null = fără voucher aplicat. */
  code: string | null;
  /** Procent reducere (5-100). Null dacă voucherul e fixed_off. */
  percentOff: number | null;
  /** Reducere fixă în bani (RON). Null dacă e percent. */
  fixedOffRon: number | null;
};

type CheckoutState = {
  shipping: Shipping | null;
  billing: Billing | null;
  payment: PaymentMethod;
  termsAccepted: boolean;
  voucher: VoucherState | null;
};

type CheckoutActions = {
  saveShipping: (s: Shipping) => void;
  saveBilling: (b: Billing) => void;
  setPayment: (p: PaymentMethod) => void;
  setTerms: (v: boolean) => void;
  applyVoucher: (v: VoucherState) => void;
  clearVoucher: () => void;
  reset: () => void;
};

type Store = CheckoutState & CheckoutActions;

const initial: CheckoutState = {
  shipping: null,
  billing: null,
  payment: "card-online",
  termsAccepted: false,
  voucher: null,
};

export const useCheckoutStore = create<Store>()(
  persist(
    (set) => ({
      ...initial,

      saveShipping: (s) => set({ shipping: s }),
      saveBilling: (b) => set({ billing: b }),
      setPayment: (p) => set({ payment: p }),
      setTerms: (v) => set({ termsAccepted: v }),
      applyVoucher: (v) => set({ voucher: v }),
      clearVoucher: () => set({ voucher: null }),
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
        voucher: s.voucher,
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

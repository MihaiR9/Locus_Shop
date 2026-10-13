import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getShippingMethod, type ShippingMethodId } from "@/lib/shipping";
import { useCartStore } from "@/lib/cart-store";
import {
  cartLineToGtmItem,
  trackAddPaymentInfo,
  trackAddShippingInfo,
} from "@/lib/analytics/gtm";

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

// ─── GA4: add_shipping_info / add_payment_info ─────────────────────
const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  "card-online": "Card online",
  "card-livrare": "Card la livrare",
};

function shippingTier(s: Shipping): string {
  if (s.method === "ridicare") return "Ridicare personală";
  return getShippingMethod(s.serviceId)?.name ?? s.serviceId;
}

function cartItems() {
  return Object.values(useCartStore.getState().items).map((l) =>
    cartLineToGtmItem(l),
  );
}

/* Livrarea se salvează și automat, pentru clienții logați cu adresă
   salvată, iar formularul o poate salva de mai multe ori. Trimitem o dată
   per metodă, per încărcare de pagină. */
let lastShippingTier: string | null = null;

function trackShipping(s: Shipping) {
  const tier = shippingTier(s);
  if (tier === lastShippingTier) return;
  const items = cartItems();
  if (items.length === 0) return;
  lastShippingTier = tier;
  trackAddShippingInfo(items, tier);
}

/** Plata contează ca aleasă când clientul bifează termenii (ultimul pas). */
function trackPayment(p: PaymentMethod) {
  const items = cartItems();
  if (items.length > 0) trackAddPaymentInfo(items, PAYMENT_LABEL[p]);
}

export const useCheckoutStore = create<Store>()(
  persist(
    (set, get) => ({
      ...initial,

      saveShipping: (s) => {
        set({ shipping: s });
        trackShipping(s);
      },
      saveBilling: (b) => set({ billing: b }),
      setPayment: (p) => {
        set({ payment: p });
        if (get().termsAccepted) trackPayment(p);
      },
      setTerms: (v) => {
        set({ termsAccepted: v });
        if (v) trackPayment(get().payment);
      },
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

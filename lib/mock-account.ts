import type { Gama, BottleColor } from "@/lib/wines";

// Mock data layer for the customer account section. Swap each function
// for a real Supabase query when wiring auth (Pas 7 backend).

export type MockUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  marketingOptIn: boolean;
  createdAt: string;
};

export type MockAddress = {
  id: string;
  line1: string;
  line2?: string;
  city: string;
  county: string;
  zip: string;
  isDefault: boolean;
};

export type MockBillingProfile = {
  id: string;
  type: "fizica" | "juridica";
  // juridica
  company?: string;
  cui?: string;
  regNo?: string;
  iban?: string;
  hqAddress?: string;
  // fizica (used as label only — CNP not stored)
  fullName?: string;
  isDefault: boolean;
};

export type MockOrderItem = {
  code: string;
  name: string;
  gama: Gama;
  bottleColor: BottleColor;
  qty: number;
  unitPriceRon: number;
};

export type MockOrderStatus =
  | "pending_payment"
  | "paid"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type MockOrder = {
  orderNumber: string;
  status: MockOrderStatus;
  createdAt: string;
  paidAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  totalRon: number;
  subtotalRon: number;
  shippingRon: number;
  discountRon: number;
  paymentMethod: "card-online" | "card-livrare" | "ramburs";
  shippingMethod: "curier" | "ridicare";
  shippingCity?: string;
  trackingAwb?: string;
  items: MockOrderItem[];
};

export type MockReturnStatus =
  | "pending"
  | "approved"
  | "in_transit"
  | "completed"
  | "rejected";

export type MockReturn = {
  returnNumber: string;
  orderNumber: string;
  productCode: string;
  productName: string;
  productGama: Gama;
  productBottleColor: BottleColor;
  productState: "sigilat" | "deteriorat" | "neconform";
  resolution: "rambursare" | "inlocuire" | "voucher";
  reason: string;
  status: MockReturnStatus;
  createdAt: string;
  updatedAt?: string;
};

// ─── Static mock — no actual DB calls ────────────────────────────

export const MOCK_USER: MockUser = {
  id: "mock-user-001",
  email: "mihai.test@domeniul-locus.ro",
  firstName: "Mihai",
  lastName: "Roșcăneanu",
  phone: "0752 232 912",
  marketingOptIn: true,
  createdAt: "2026-04-20T14:00:00Z",
};

export const MOCK_ADDRESSES: MockAddress[] = [
  {
    id: "addr-001",
    line1: "Bulevardul Bucureștii Noi 25",
    line2: "Bloc Marmura, Sc 1, Et 1, Ap. D115",
    city: "București (Sectorul 1)",
    county: "București",
    zip: "012345",
    isDefault: true,
  },
  {
    id: "addr-002",
    line1: "Str. Morilor nr. 213",
    city: "Galați",
    county: "Galați",
    zip: "800001",
    isDefault: false,
  },
];

export const MOCK_BILLING_PROFILES: MockBillingProfile[] = [
  {
    id: "bill-001",
    type: "fizica",
    fullName: "Mihai Roșcăneanu",
    isDefault: true,
  },
];

export const MOCK_ORDERS: MockOrder[] = [
  {
    orderNumber: "LOC-2026-00012",
    status: "delivered",
    createdAt: "2026-05-02T10:14:00Z",
    paidAt: "2026-05-02T10:15:32Z",
    shippedAt: "2026-05-03T08:00:00Z",
    deliveredAt: "2026-05-05T14:30:00Z",
    totalRon: 277,
    subtotalRon: 277,
    shippingRon: 0,
    discountRon: 0,
    paymentMethod: "card-online",
    shippingMethod: "curier",
    shippingCity: "București",
    trackingAwb: "SAM2026000412381",
    items: [
      { code: "LC01", name: "Fetească Regală", gama: "cuvinte", bottleColor: "white", qty: 2, unitPriceRon: 79 },
      { code: "LS02", name: "Fetească Neagră", gama: "semne", bottleColor: "red", qty: 1, unitPriceRon: 119 },
    ],
  },
  {
    orderNumber: "LOC-2026-00009",
    status: "shipped",
    createdAt: "2026-05-08T16:42:00Z",
    paidAt: "2026-05-08T16:43:11Z",
    shippedAt: "2026-05-09T09:15:00Z",
    totalRon: 188,
    subtotalRon: 188,
    shippingRon: 0,
    discountRon: 0,
    paymentMethod: "card-online",
    shippingMethod: "curier",
    shippingCity: "București",
    trackingAwb: "SAM2026000487122",
    items: [
      { code: "LC04", name: "Riesling Italian", gama: "cuvinte", bottleColor: "white", qty: 1, unitPriceRon: 79 },
      { code: "LC02", name: "Fetească Neagră", gama: "cuvinte", bottleColor: "red", qty: 1, unitPriceRon: 89 },
    ],
  },
  {
    orderNumber: "LOC-2026-00003",
    status: "paid",
    createdAt: "2026-05-09T11:30:00Z",
    paidAt: "2026-05-09T11:31:45Z",
    totalRon: 327,
    subtotalRon: 327,
    shippingRon: 0,
    discountRon: 0,
    paymentMethod: "card-online",
    shippingMethod: "curier",
    shippingCity: "București",
    items: [
      { code: "LS01", name: "Fetească Regală", gama: "semne", bottleColor: "white", qty: 3, unitPriceRon: 109 },
    ],
  },
  {
    orderNumber: "LOC-2026-00001",
    status: "cancelled",
    createdAt: "2026-04-25T09:00:00Z",
    totalRon: 79,
    subtotalRon: 79,
    shippingRon: 0,
    discountRon: 0,
    paymentMethod: "card-online",
    shippingMethod: "curier",
    items: [
      { code: "LC01", name: "Fetească Regală", gama: "cuvinte", bottleColor: "white", qty: 1, unitPriceRon: 79 },
    ],
  },
];

export const MOCK_RETURNS: MockReturn[] = [
  {
    returnNumber: "RET-2026-001",
    orderNumber: "LOC-2026-00012",
    productCode: "LS02",
    productName: "Fetească Neagră",
    productGama: "semne",
    productBottleColor: "red",
    productState: "deteriorat",
    resolution: "inlocuire",
    reason:
      "Sticla a sosit cu eticheta umedă și dopul deplasat — pare că a stat în poziție culcată într-un ambalaj insuficient.",
    status: "approved",
    createdAt: "2026-05-06T11:20:00Z",
    updatedAt: "2026-05-07T09:14:00Z",
  },
];

// ─── Lookup helpers ──────────────────────────────────────────────
export function getMockOrder(orderNumber: string): MockOrder | undefined {
  return MOCK_ORDERS.find((o) => o.orderNumber === orderNumber);
}

export function getMockReturn(returnNumber: string): MockReturn | undefined {
  return MOCK_RETURNS.find((r) => r.returnNumber === returnNumber);
}

// ─── Return eligibility ──────────────────────────────────────────
// OUG 34/2014: 14 zile calendaristice de la primirea coletului. Sticlele
// deschise sunt exceptate (we can't tell from the order — assume
// undamaged). Cancelled / refunded orders are not eligible.

export type ReturnEligibility =
  | { eligible: true; daysLeft: number }
  | { eligible: false; reason: string };

export function returnEligibilityFor(order: MockOrder): ReturnEligibility {
  if (order.status === "cancelled") {
    return { eligible: false, reason: "Comanda a fost anulată — nu se poate returna." };
  }
  if (order.status === "refunded") {
    return { eligible: false, reason: "Comanda a fost deja returnată." };
  }
  if (order.status === "pending_payment") {
    return { eligible: false, reason: "Plata nu a fost încă procesată." };
  }
  if (!order.deliveredAt) {
    return { eligible: false, reason: "Returul devine disponibil după livrare." };
  }
  const delivered = new Date(order.deliveredAt).getTime();
  const now = Date.now();
  const daysSince = Math.floor((now - delivered) / (1000 * 60 * 60 * 24));
  const daysLeft = 14 - daysSince;
  if (daysLeft <= 0) {
    return { eligible: false, reason: "Termenul de 14 zile (OUG 34/2014) a expirat." };
  }
  return { eligible: true, daysLeft };
}

/**
 * Flat list of products eligible for a NEW return: deduped by
 * (orderNumber, productCode), only from delivered orders within the
 * 14-day window, AND not already in an open return request.
 */
export type EligibleReturnProduct = {
  orderNumber: string;
  deliveredAt: string;
  daysLeft: number;
  code: string;
  name: string;
  gama: Gama;
  bottleColor: BottleColor;
  qty: number;
  unitPriceRon: number;
};

/**
 * Grouped picker data: every order with its eligibility and items, each
 * marked as already-returned or not. Used by the return wizard step 1
 * to show: pick an order → pick which items to return (partial returns).
 */
export type ReturnPickerItem = {
  code: string;
  name: string;
  gama: Gama;
  bottleColor: BottleColor;
  qty: number;
  unitPriceRon: number;
  alreadyReturned: boolean;
};

export type ReturnPickerOrder = {
  order: MockOrder;
  eligibility: ReturnEligibility;
  items: ReturnPickerItem[];
};

export function getReturnPickerData(): {
  eligible: ReturnPickerOrder[];
  ineligible: ReturnPickerOrder[];
} {
  const alreadyReturned = new Set(
    MOCK_RETURNS.map((r) => `${r.orderNumber}::${r.productCode}`),
  );

  const eligible: ReturnPickerOrder[] = [];
  const ineligible: ReturnPickerOrder[] = [];

  // Skip orders that don't make sense in the picker (never reached delivery).
  const SKIP: MockOrderStatus[] = ["pending_payment", "cancelled", "refunded"];

  for (const order of MOCK_ORDERS) {
    if (SKIP.includes(order.status)) continue;

    const elig = returnEligibilityFor(order);
    const items: ReturnPickerItem[] = order.items.map((it) => ({
      ...it,
      alreadyReturned: alreadyReturned.has(`${order.orderNumber}::${it.code}`),
    }));

    const hasReturnableItem = items.some((i) => !i.alreadyReturned);

    if (elig.eligible && hasReturnableItem) {
      eligible.push({ order, eligibility: elig, items });
    } else {
      ineligible.push({ order, eligibility: elig, items });
    }
  }

  eligible.sort(
    (a, b) =>
      new Date(b.order.deliveredAt!).getTime() -
      new Date(a.order.deliveredAt!).getTime(),
  );
  ineligible.sort(
    (a, b) =>
      new Date(b.order.createdAt).getTime() -
      new Date(a.order.createdAt).getTime(),
  );

  return { eligible, ineligible };
}

export function getEligibleReturnProducts(): EligibleReturnProduct[] {
  // Build a set of already-returned (order, code) pairs so we don't
  // offer the same line twice (for now — partial-quantity returns
  // aren't supported in this UI).
  const alreadyReturned = new Set(
    MOCK_RETURNS.map((r) => `${r.orderNumber}::${r.productCode}`),
  );

  const out: EligibleReturnProduct[] = [];
  for (const order of MOCK_ORDERS) {
    const elig = returnEligibilityFor(order);
    if (!elig.eligible) continue;
    for (const item of order.items) {
      const key = `${order.orderNumber}::${item.code}`;
      if (alreadyReturned.has(key)) continue;
      out.push({
        orderNumber: order.orderNumber,
        deliveredAt: order.deliveredAt!, // safe: eligible implies delivered
        daysLeft: elig.daysLeft,
        code: item.code,
        name: item.name,
        gama: item.gama,
        bottleColor: item.bottleColor,
        qty: item.qty,
        unitPriceRon: item.unitPriceRon,
      });
    }
  }
  return out;
}

// ─── Status display ──────────────────────────────────────────────
export const STATUS_LABEL: Record<MockOrderStatus, string> = {
  pending_payment: "în așteptare",
  paid: "plătită",
  shipped: "expediată",
  delivered: "livrată",
  cancelled: "anulată",
  refunded: "returnată",
};

export const RETURN_STATUS_LABEL: Record<MockReturnStatus, string> = {
  pending: "în analiză",
  approved: "aprobat",
  in_transit: "în transport",
  completed: "finalizat",
  rejected: "respins",
};

export const PRODUCT_STATE_LABEL: Record<MockReturn["productState"], string> = {
  sigilat: "sticla sigilată (nedeschisă)",
  deteriorat: "sticla deteriorată la livrare",
  neconform: "vinul nu corespunde descrierii",
};

export const RESOLUTION_LABEL: Record<MockReturn["resolution"], string> = {
  rambursare: "rambursare integrală",
  inlocuire: "înlocuire (același vin)",
  voucher: "voucher pentru altă comandă",
};

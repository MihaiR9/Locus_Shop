import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type OrderListItem = {
  id: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string | null;
  totalCents: number;
  status: OrderStatus;
  paymentStatus: string;
  paymentMethod: string;
  shippingMethod: string;
  itemsCount: number;
  createdAt: string;
};

export type OrderListResult = {
  items: OrderListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export type OrderFilters = {
  status?: OrderStatus | "all";
  search?: string;
  page?: number;
};

const PAGE_SIZE = 25;

export async function listOrders(
  filters: OrderFilters = {},
): Promise<OrderListResult> {
  const supabase = await getSupabaseServerClient();
  const page = Math.max(1, filters.page ?? 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("orders")
    .select(
      "id, order_number, guest_email, total_cents, status, payment_status, payment_method, shipping_method, created_at, customers(email, name), order_items(qty)",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters.search && filters.search.trim()) {
    const q = filters.search.trim();
    // Match după număr comandă sau email guest
    query = query.or(`order_number.ilike.%${q}%,guest_email.ilike.%${q}%`);
  }

  const { data, error, count } = await query;
  if (error) {
    console.error("[listOrders]", error);
    return { items: [], totalCount: 0, page, pageSize: PAGE_SIZE };
  }

  const items: OrderListItem[] = (data ?? []).map((o) => {
    const cust = o.customers as
      | { email?: string; name?: string }
      | { email?: string; name?: string }[]
      | null;
    const c = Array.isArray(cust) ? cust[0] : cust;
    const itemsArr = (o.order_items as { qty: number }[] | null) ?? [];
    const itemsCount = itemsArr.reduce((s, it) => s + (it.qty ?? 0), 0);
    return {
      id: o.id,
      orderNumber: o.order_number,
      customerEmail: c?.email ?? o.guest_email ?? "—",
      customerName: c?.name ?? null,
      totalCents: o.total_cents,
      status: o.status as OrderStatus,
      paymentStatus: o.payment_status,
      paymentMethod: o.payment_method,
      shippingMethod: o.shipping_method,
      itemsCount,
      createdAt: o.created_at,
    };
  });

  return {
    items,
    totalCount: count ?? 0,
    page,
    pageSize: PAGE_SIZE,
  };
}

export type OrderItemDetail = {
  id: string;
  code: string;
  name: string;
  qty: number;
  unitPriceCents: number;
};

export type OrderEvent = {
  type: string;
  createdAt: string;
  payload: Record<string, unknown> | null;
};

export type OrderDetail = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: string;
  paymentMethod: string;
  shippingMethod: string;
  customerEmail: string;
  customerName: string | null;
  customerPhone: string | null;

  subtotalCents: number;
  shippingCents: number;
  discountCents: number;
  totalCents: number;

  shippingAddress: Record<string, unknown> | null;
  billing: Record<string, unknown> | null;

  stripeSessionId: string | null;
  stripePaymentIntent: string | null;
  awbNumber: string | null;
  smartbillInvoiceId: string | null;

  createdAt: string;
  paidAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;

  items: OrderItemDetail[];
  events: OrderEvent[];
};

export async function getOrderDetail(
  orderNumber: string,
): Promise<OrderDetail | null> {
  const supabase = await getSupabaseServerClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "*, customers(email, name, phone), order_items(id, code_snapshot, name_snapshot, qty, unit_price_cents), order_events(type, created_at, payload)",
    )
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (error) {
    console.error("[getOrderDetail]", orderNumber, error);
    return null;
  }
  if (!order) return null;

  const cust = order.customers as
    | { email?: string; name?: string; phone?: string }
    | { email?: string; name?: string; phone?: string }[]
    | null;
  const c = Array.isArray(cust) ? cust[0] : cust;

  const items = (order.order_items ?? [])
    .map(
      (
        it: {
          id: string;
          code_snapshot: string;
          name_snapshot: string;
          qty: number;
          unit_price_cents: number;
        },
      ) => ({
        id: it.id,
        code: it.code_snapshot,
        name: it.name_snapshot,
        qty: it.qty,
        unitPriceCents: it.unit_price_cents,
      }),
    )
    .sort((a: OrderItemDetail, b: OrderItemDetail) =>
      a.code.localeCompare(b.code),
    );

  const events = (order.order_events ?? [])
    .map(
      (
        e: {
          type: string;
          created_at: string;
          payload: Record<string, unknown> | null;
        },
      ) => ({
        type: e.type,
        createdAt: e.created_at,
        payload: e.payload,
      }),
    )
    .sort(
      (a: OrderEvent, b: OrderEvent) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  return {
    id: order.id,
    orderNumber: order.order_number,
    status: order.status as OrderStatus,
    paymentStatus: order.payment_status,
    paymentMethod: order.payment_method,
    shippingMethod: order.shipping_method,
    customerEmail: c?.email ?? order.guest_email ?? "—",
    customerName: c?.name ?? null,
    customerPhone: c?.phone ?? null,
    subtotalCents: order.subtotal_cents,
    shippingCents: order.shipping_cents,
    discountCents: order.discount_cents,
    totalCents: order.total_cents,
    shippingAddress: order.shipping_address as Record<string, unknown> | null,
    billing: order.billing as Record<string, unknown> | null,
    stripeSessionId: order.stripe_session_id ?? null,
    stripePaymentIntent: order.stripe_payment_intent ?? null,
    awbNumber: order.awb_number ?? null,
    smartbillInvoiceId: order.smartbill_invoice_id ?? null,
    createdAt: order.created_at,
    paidAt: order.paid_at ?? null,
    shippedAt: order.shipped_at ?? null,
    deliveredAt: order.delivered_at ?? null,
    items,
    events,
  };
}

export function formatRon(cents: number): string {
  return `${Math.round(cents / 100).toLocaleString("ro-RO")} lei`;
}

// ─── KPI-uri pentru header-ul de listă (Shopify-style) ─────────────
export type OrdersKpi = {
  label: string;
  value: number;
  trendPct: number | null;
  spark: number[];
};

export type OrdersKpiBundle = {
  orders: OrdersKpi;
  orderedItems: OrdersKpi;
  returnedItems: OrdersKpi;
  fulfilledOrders: OrdersKpi;
  deliveredOrders: OrdersKpi;
};

export async function getOrdersKpis(
  periodDays: number = 30,
): Promise<OrdersKpiBundle> {
  const supabase = await getSupabaseServerClient();

  const periodStart = new Date();
  periodStart.setDate(periodStart.getDate() - periodDays);
  periodStart.setHours(0, 0, 0, 0);
  const prevStart = new Date(periodStart);
  prevStart.setDate(prevStart.getDate() - periodDays);

  const [ordersCur, ordersPrev, itemsRes, returnsRes] = await Promise.all([
    supabase
      .from("orders")
      .select("id, status, created_at, shipped_at, delivered_at")
      .gte("created_at", periodStart.toISOString()),
    supabase
      .from("orders")
      .select("id, status")
      .gte("created_at", prevStart.toISOString())
      .lt("created_at", periodStart.toISOString()),
    supabase
      .from("order_items")
      .select("qty, orders!inner(created_at)")
      .gte("orders.created_at", periodStart.toISOString()),
    supabase
      .from("return_items")
      .select("qty, returns!inner(created_at)")
      .gte("returns.created_at", periodStart.toISOString()),
  ]);

  const ordersCurCount = ordersCur.data?.length ?? 0;
  const ordersPrevCount = ordersPrev.data?.length ?? 0;
  const orderedItemsCur = (itemsRes.data ?? []).reduce(
    (s, i) => s + (i.qty ?? 0),
    0,
  );
  const returnedItemsCur = (returnsRes.data ?? []).reduce(
    (s, i) => s + (i.qty ?? 0),
    0,
  );
  const fulfilledCur = (ordersCur.data ?? []).filter(
    (o) => o.status === "shipped" || o.status === "delivered",
  ).length;
  const deliveredCur = (ordersCur.data ?? []).filter(
    (o) => o.status === "delivered",
  ).length;

  const trend = (curr: number, prev: number): number | null => {
    if (prev === 0) return curr > 0 ? 100 : null;
    return Math.round(((curr - prev) / prev) * 100);
  };

  // Sparkline: comenzi per zi din perioada curentă
  const dayBuckets = new Array(periodDays).fill(0);
  for (const o of ordersCur.data ?? []) {
    const day = Math.floor(
      (new Date(o.created_at).getTime() - periodStart.getTime()) /
        (24 * 3600 * 1000),
    );
    if (day >= 0 && day < periodDays) dayBuckets[day]++;
  }

  return {
    orders: {
      label: "Comenzi",
      value: ordersCurCount,
      trendPct: trend(ordersCurCount, ordersPrevCount),
      spark: dayBuckets,
    },
    orderedItems: {
      label: "Sticle comandate",
      value: orderedItemsCur,
      trendPct: null,
      spark: dayBuckets,
    },
    returnedItems: {
      label: "Sticle returnate",
      value: returnedItemsCur,
      trendPct: null,
      spark: dayBuckets,
    },
    fulfilledOrders: {
      label: "Expediate",
      value: fulfilledCur,
      trendPct: null,
      spark: dayBuckets,
    },
    deliveredOrders: {
      label: "Livrate",
      value: deliveredCur,
      trendPct: null,
      spark: dayBuckets,
    },
  };
}

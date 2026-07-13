import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";

// Re-export pentru compatibilitate cu server components existente.
export {
  RETURN_STATUS_LABEL,
  RETURN_STATUS_TONE,
  PRODUCT_STATE_LABEL,
  RESOLUTION_LABEL,
  RESOLUTION_TONE,
} from "@/lib/admin/returns-constants";
export type {
  ReturnStatus,
  ProductState,
  Resolution,
} from "@/lib/admin/returns-constants";
import type {
  ReturnStatus,
  ProductState,
  Resolution,
} from "@/lib/admin/returns-constants";

export type ReturnItem = {
  id: string;
  productCode: string;
  productName: string;
  qty: number;
  unitPriceCents: number;
};

export type ReturnRow = {
  id: string;
  returnNumber: string;
  orderId: string;
  orderNumber: string | null;
  customerId: string;
  customerEmail: string | null;
  customerName: string | null;
  status: ReturnStatus;
  productState: ProductState;
  resolution: Resolution;
  reason: string | null;
  iban: string | null;
  itemsCount: number;
  itemsTotalCents: number;
  createdAt: string;
  updatedAt: string;
};

export type ReturnDetail = ReturnRow & {
  items: ReturnItem[];
  customerPhone: string | null;
  orderTotalCents: number | null;
  orderPaymentStatus: string | null;
  orderStatus: string | null;
  orderPaidAt: string | null;
  orderDeliveredAt: string | null;
};

export type ReturnsListResult = {
  items: ReturnRow[];
  kpis: {
    total: number;
    open: number;
    completed: number;
    rejected: number;
  };
};

export async function listReturns(
  status?: ReturnStatus | "all",
): Promise<ReturnsListResult> {
  const supabase = await getSupabaseServerClient();
  let q = supabase
    .from("returns")
    .select("*")
    .order("created_at", { ascending: false });
  if (status && status !== "all") q = q.eq("status", status);

  const { data, error } = await q;
  if (error) {
    console.error("[listReturns]", error.message, error.code);
    return {
      items: [],
      kpis: { total: 0, open: 0, completed: 0, rejected: 0 },
    };
  }

  // Fetch related orders + customers + items
  const orderIds = Array.from(new Set((data ?? []).map((r) => r.order_id)));
  const customerIds = Array.from(
    new Set((data ?? []).map((r) => r.customer_id)),
  );
  const returnIds = (data ?? []).map((r) => r.id);

  const [ordersRes, customersRes, itemsRes] = await Promise.all([
    orderIds.length > 0
      ? supabase
          .from("orders")
          .select("id, order_number")
          .in("id", orderIds)
      : Promise.resolve({ data: [] }),
    customerIds.length > 0
      ? supabase
          .from("customers")
          .select("id, email, name")
          .in("id", customerIds)
      : Promise.resolve({ data: [] }),
    returnIds.length > 0
      ? supabase
          .from("return_items")
          .select("id, return_id, product_code, product_name, qty, unit_price_cents")
          .in("return_id", returnIds)
      : Promise.resolve({ data: [] }),
  ]);

  const ordersMap = new Map<string, string>();
  (ordersRes.data ?? []).forEach((o) => {
    ordersMap.set(o.id, o.order_number);
  });

  const customersMap = new Map<
    string,
    { email: string; name: string | null }
  >();
  (customersRes.data ?? []).forEach((c) => {
    customersMap.set(c.id, { email: c.email, name: c.name });
  });

  const itemsByReturn = new Map<
    string,
    { count: number; total: number }
  >();
  (itemsRes.data ?? []).forEach((it) => {
    const cur = itemsByReturn.get(it.return_id) ?? { count: 0, total: 0 };
    cur.count += it.qty;
    cur.total += it.qty * it.unit_price_cents;
    itemsByReturn.set(it.return_id, cur);
  });

  const items: ReturnRow[] = (data ?? []).map((r) => {
    const customer = customersMap.get(r.customer_id);
    const stats = itemsByReturn.get(r.id) ?? { count: 0, total: 0 };
    return {
      id: r.id,
      returnNumber: r.return_number,
      orderId: r.order_id,
      orderNumber: ordersMap.get(r.order_id) ?? null,
      customerId: r.customer_id,
      customerEmail: customer?.email ?? null,
      customerName: customer?.name ?? null,
      status: r.status,
      productState: r.product_state,
      resolution: r.resolution,
      reason: r.reason,
      iban: r.iban,
      itemsCount: stats.count,
      itemsTotalCents: stats.total,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  });

  const all = data ?? [];
  return {
    items,
    kpis: {
      total: all.length,
      open: all.filter(
        (r) =>
          r.status === "pending" ||
          r.status === "approved" ||
          r.status === "in_transit",
      ).length,
      completed: all.filter((r) => r.status === "completed").length,
      rejected: all.filter((r) => r.status === "rejected").length,
    },
  };
}

export async function getReturnByNumber(
  returnNumber: string,
): Promise<ReturnDetail | null> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("returns")
    .select("*")
    .eq("return_number", returnNumber)
    .maybeSingle();

  if (error) {
    console.error("[getReturnByNumber]", error.message, error.code);
    return null;
  }
  if (!data) return null;

  const [orderRes, customerRes, itemsRes] = await Promise.all([
    supabase
      .from("orders")
      .select(
        "id, order_number, total_cents, status, payment_status, paid_at, delivered_at",
      )
      .eq("id", data.order_id)
      .maybeSingle(),
    supabase
      .from("customers")
      .select("id, email, name, phone")
      .eq("id", data.customer_id)
      .maybeSingle(),
    supabase
      .from("return_items")
      .select("id, product_code, product_name, qty, unit_price_cents")
      .eq("return_id", data.id),
  ]);

  const order = orderRes.data;
  const customer = customerRes.data;

  const returnItems: ReturnItem[] = (itemsRes.data ?? []).map((it) => ({
    id: it.id,
    productCode: it.product_code,
    productName: it.product_name,
    qty: it.qty,
    unitPriceCents: it.unit_price_cents,
  }));

  const itemsTotalCents = returnItems.reduce(
    (s, it) => s + it.qty * it.unitPriceCents,
    0,
  );

  return {
    id: data.id,
    returnNumber: data.return_number,
    orderId: data.order_id,
    orderNumber: order?.order_number ?? null,
    customerId: data.customer_id,
    customerEmail: customer?.email ?? null,
    customerName: customer?.name ?? null,
    customerPhone: customer?.phone ?? null,
    status: data.status,
    productState: data.product_state,
    resolution: data.resolution,
    reason: data.reason,
    iban: data.iban,
    itemsCount: returnItems.reduce((s, it) => s + it.qty, 0),
    itemsTotalCents,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    items: returnItems,
    orderTotalCents: order?.total_cents ?? null,
    orderPaymentStatus: order?.payment_status ?? null,
    orderStatus: order?.status ?? null,
    orderPaidAt: order?.paid_at ?? null,
    orderDeliveredAt: order?.delivered_at ?? null,
  };
}

import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Gama, BottleColor } from "@/lib/wines";
import { ronFromCents, type OrderRow } from "./orders";

export type ReturnStatus =
  | "pending"
  | "approved"
  | "in_transit"
  | "completed"
  | "rejected";

export type ReturnItemRow = {
  id: string;
  product_code: string;
  product_name: string;
  qty: number;
  unit_price_cents: number;
};

export type ReturnRow = {
  id: string;
  return_number: string;
  order_id: string;
  status: ReturnStatus;
  product_state: "sigilat" | "deteriorat" | "neconform";
  resolution: "rambursare" | "inlocuire" | "voucher";
  reason: string | null;
  created_at: string;
  updated_at: string | null;
  items: ReturnItemRow[];
  order: { order_number: string } | null;
};

export const RETURN_STATUS_LABEL: Record<ReturnStatus, string> = {
  pending: "în analiză",
  approved: "aprobat",
  in_transit: "în transport",
  completed: "finalizat",
  rejected: "respins",
};

export const PRODUCT_STATE_LABEL = {
  sigilat: "sticla sigilată (nedeschisă)",
  deteriorat: "sticla deteriorată la livrare",
  neconform: "vinul nu corespunde descrierii",
} as const;

export const RESOLUTION_LABEL = {
  rambursare: "rambursare integrală",
  inlocuire: "înlocuire (același vin)",
  voucher: "voucher pentru altă comandă",
} as const;

export async function listMyReturns(customerId: string): Promise<ReturnRow[]> {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("returns")
    .select(`
      id, return_number, order_id, status, product_state, resolution,
      reason, created_at, updated_at,
      items:return_items ( id, product_code, product_name, qty, unit_price_cents ),
      order:orders ( order_number )
    `)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });
  return (data ?? []) as unknown as ReturnRow[];
}

export async function getMyReturn(
  customerId: string,
  returnNumber: string,
): Promise<ReturnRow | null> {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("returns")
    .select(`
      id, return_number, order_id, status, product_state, resolution,
      reason, created_at, updated_at,
      items:return_items ( id, product_code, product_name, qty, unit_price_cents ),
      order:orders ( order_number )
    `)
    .eq("customer_id", customerId)
    .eq("return_number", returnNumber)
    .maybeSingle();
  return (data ?? null) as unknown as ReturnRow | null;
}

// ─── Eligibility — for the picker ───────────────────────────────

export type ReturnEligibility =
  | { eligible: true; daysLeft: number }
  | { eligible: false; reason: string };

export function returnEligibilityFor(order: OrderRow): ReturnEligibility {
  if (order.status === "cancelled") {
    return {
      eligible: false,
      reason: "Comanda a fost anulată — nu se poate returna.",
    };
  }
  if (order.status === "refunded") {
    return { eligible: false, reason: "Comanda a fost deja returnată." };
  }
  if (order.status === "pending_payment") {
    return { eligible: false, reason: "Plata nu a fost încă procesată." };
  }
  if (!order.delivered_at) {
    return {
      eligible: false,
      reason: "Returul devine disponibil după livrare.",
    };
  }
  const delivered = new Date(order.delivered_at).getTime();
  const now = Date.now();
  const daysSince = Math.floor((now - delivered) / (1000 * 60 * 60 * 24));
  const daysLeft = 14 - daysSince;
  if (daysLeft <= 0) {
    return {
      eligible: false,
      reason: "Termenul de 14 zile (OUG 34/2014) a expirat.",
    };
  }
  return { eligible: true, daysLeft };
}

export type ReturnPickerItem = {
  orderItemId: string;
  code: string;
  name: string;
  gama: Gama;
  bottleColor: BottleColor;
  qty: number;
  unitPriceRon: number;
  alreadyReturned: boolean;
};

export type ReturnPickerOrder = {
  order: OrderRow;
  eligibility: ReturnEligibility;
  items: ReturnPickerItem[];
};

export async function getReturnPickerData(
  customerId: string,
): Promise<{ eligible: ReturnPickerOrder[]; ineligible: ReturnPickerOrder[] }> {
  const supabase = await getSupabaseServerClient();

  const [{ data: ordersData }, { data: returnsData }] = await Promise.all([
    supabase
      .from("orders")
      .select(`
        id, order_number, status, payment_method, shipping_method,
        shipping_address, awb_number,
        subtotal_cents, shipping_cents, discount_cents, total_cents,
        created_at, paid_at, shipped_at, delivered_at,
        items:order_items (
          id,
          qty,
          unit_price_cents,
          code:code_snapshot,
          name:name_snapshot,
          product:products ( gama, bottle_color )
        )
      `)
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false }),
    supabase
      .from("returns")
      .select("id, order_id, items:return_items ( order_item_id )")
      .eq("customer_id", customerId),
  ]);

  const returnedOrderItemIds = new Set<string>(
    (returnsData ?? []).flatMap(
      (r: { items?: { order_item_id: string }[] }) =>
        (r.items ?? []).map((it) => it.order_item_id),
    ),
  );

  const eligible: ReturnPickerOrder[] = [];
  const ineligible: ReturnPickerOrder[] = [];

  const SKIP = ["pending_payment", "cancelled", "refunded"];

  for (const raw of (ordersData ?? []) as unknown as OrderRow[]) {
    if (SKIP.includes(raw.status)) continue;

    const elig = returnEligibilityFor(raw);
    const items: ReturnPickerItem[] = raw.items.map((it) => ({
      orderItemId: it.id,
      code: it.code,
      name: it.name,
      gama: (it.product?.gama as Gama) ?? "cuvinte",
      bottleColor: (it.product?.bottle_color as BottleColor) ?? "white",
      qty: it.qty,
      unitPriceRon: ronFromCents(it.unit_price_cents),
      alreadyReturned: returnedOrderItemIds.has(it.id),
    }));

    const hasReturnable = items.some((i) => !i.alreadyReturned);
    const group: ReturnPickerOrder = { order: raw, eligibility: elig, items };

    if (elig.eligible && hasReturnable) eligible.push(group);
    else ineligible.push(group);
  }

  return { eligible, ineligible };
}

import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Gama, BottleColor } from "@/lib/wines";

export type OrderItemRow = {
  id: string;
  code: string;
  name: string;
  qty: number;
  unit_price_cents: number;
  product?: {
    gama: Gama | null;
    bottle_color: BottleColor | null;
  } | null;
};

export type OrderRow = {
  id: string;
  order_number: string;
  status:
    | "pending_payment"
    | "paid"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";
  payment_method: "card-online" | "card-livrare" | "ramburs";
  payment_status: string | null;
  shipping_method: "curier" | "ridicare";
  shipping_address: { city?: string } | null;
  awb_number: string | null;
  subtotal_cents: number;
  shipping_cents: number;
  discount_cents: number;
  total_cents: number;
  created_at: string;
  paid_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  items: OrderItemRow[];
};

export async function listMyOrders(customerId: string): Promise<OrderRow[]> {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("orders")
    .select(`
      id, order_number, status, payment_status, payment_method, shipping_method,
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
    .order("created_at", { ascending: false });
  return (data ?? []) as unknown as OrderRow[];
}

export async function getMyOrder(
  customerId: string,
  orderNumber: string,
): Promise<OrderRow | null> {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("orders")
    .select(`
      id, order_number, status, payment_status, payment_method, shipping_method,
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
    .eq("order_number", orderNumber)
    .maybeSingle();
  return (data ?? null) as unknown as OrderRow | null;
}

export const STATUS_LABEL: Record<OrderRow["status"], string> = {
  pending_payment: "în așteptare",
  paid: "plătită · în pregătire",
  shipped: "expediată",
  delivered: "livrată",
  cancelled: "anulată",
  refunded: "returnată",
};

/**
 * Statusul arătat clientului. `status` singur nu spune ce așteaptă comanda:
 * o plată cu cardul neterminată și o plată la livrare sunt amândouă
 * `pending_payment`. `canRepay` vine din `repayableOrderNumbers`.
 * `tone` alimentează culoarea pastilei (`data-status`).
 */
export function customerStatus(
  order: Pick<OrderRow, "status" | "payment_method">,
  canRepay: boolean,
): { label: string; tone: string } {
  if (canRepay) return { label: "plată neefectuată", tone: "unpaid" };
  if (order.status === "pending_payment" && order.payment_method !== "card-online") {
    return { label: "confirmată · plata la livrare", tone: "pending_payment" };
  }
  return { label: STATUS_LABEL[order.status], tone: order.status };
}

export function ronFromCents(cents: number): number {
  return Math.round(cents) / 100;
}

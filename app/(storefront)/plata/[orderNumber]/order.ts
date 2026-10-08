import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export type PayableOrder = {
  id: string;
  orderNumber: string;
  totalCents: number;
  subtotalCents: number;
  shippingCents: number;
  discountCents: number;
  sgrCents: number;
  stripeSessionId: string | null;
  customerEmail: string | null;
  items: Array<{ name: string; code: string; qty: number; unitPriceCents: number }>;
};

export type PayableResult =
  | { state: "payable"; order: PayableOrder }
  | { state: "paid" | "unavailable" };

/**
 * O comandă se poate plăti din link doar dacă e cu card online, nu e deja
 * plătită și nu a fost anulată de tine din admin. Anularea automată la
 * expirarea sesiunii Stripe nu contează — linkul există tocmai pentru ea.
 */
export async function loadPayableOrder(orderNumber: string): Promise<PayableResult> {
  const supabase = getSupabaseAdminClient();

  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, order_number, status, payment_status, payment_method, total_cents, subtotal_cents, shipping_cents, discount_cents, sgr_cents, stripe_session_id, guest_email, billing",
    )
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (!order || order.payment_method !== "card-online") {
    return { state: "unavailable" };
  }
  if (order.payment_status === "succeeded" || order.status === "paid") {
    return { state: "paid" };
  }
  if (order.status !== "pending_payment" && order.status !== "cancelled") {
    return { state: "unavailable" };
  }

  const { count: manualCancels } = await supabase
    .from("order_events")
    .select("id", { count: "exact", head: true })
    .eq("order_id", order.id)
    .eq("type", "manual_cancel");
  if (manualCancels) return { state: "unavailable" };

  const { data: items } = await supabase
    .from("order_items")
    .select("name_snapshot, code_snapshot, qty, unit_price_cents")
    .eq("order_id", order.id);

  const billing = order.billing as Record<string, unknown> | null;

  return {
    state: "payable",
    order: {
      id: order.id,
      orderNumber: order.order_number,
      totalCents: order.total_cents,
      subtotalCents: order.subtotal_cents,
      shippingCents: order.shipping_cents,
      discountCents: order.discount_cents,
      sgrCents: order.sgr_cents ?? 0,
      stripeSessionId: order.stripe_session_id,
      customerEmail: (billing?.email as string | undefined) ?? order.guest_email,
      items: (items ?? []).map((it) => ({
        name: it.name_snapshot,
        code: it.code_snapshot,
        qty: it.qty,
        unitPriceCents: it.unit_price_cents,
      })),
    },
  };
}

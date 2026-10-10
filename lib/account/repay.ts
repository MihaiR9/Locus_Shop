import "server-only";
import { createPaymentLink, PAYMENT_LINK_TTL_MS } from "@/lib/payment-link";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { OrderRow } from "@/lib/account/orders";

/**
 * Comenzile din cont pe care clientul le mai poate plăti: card online,
 * neplătite, încă în așteptare sau anulate automat la expirarea sesiunii
 * Stripe, plasate de cel mult 7 zile (cât e valabil și linkul din reminder).
 * O anulare făcută de tine din admin (`manual_cancel`) închide plata.
 */
export async function repayableOrderNumbers(
  orders: OrderRow[],
): Promise<Set<string>> {
  const cutoff = Date.now() - PAYMENT_LINK_TTL_MS;
  const candidates = orders.filter(
    (o) =>
      o.payment_method === "card-online" &&
      o.payment_status !== "succeeded" &&
      (o.status === "pending_payment" || o.status === "cancelled") &&
      Date.parse(o.created_at) > cutoff,
  );
  if (candidates.length === 0) return new Set();

  // Evenimentele nu sunt vizibile clientului prin RLS — le citim pe server.
  const { data } = await getSupabaseAdminClient()
    .from("order_events")
    .select("order_id")
    .eq("type", "manual_cancel")
    .in(
      "order_id",
      candidates.map((o) => o.id),
    );
  const cancelledByAdmin = new Set((data ?? []).map((e) => e.order_id));

  return new Set(
    candidates
      .filter((o) => !cancelledByAdmin.has(o.id))
      .map((o) => o.order_number),
  );
}

/** Același link semnat ca în reminder: duce la /plata/<comandă>. */
export function repayUrl(orderNumber: string): string {
  return createPaymentLink(orderNumber).url;
}

"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/server";
import { createOrderCheckoutSession } from "@/lib/stripe/checkout-session";
import { verifyPaymentLink } from "@/lib/payment-link";
import { loadPayableOrder } from "./order";

export type PayState = { error?: string };

/**
 * Deschide plata pentru o comandă din linkul primit în reminder. Sesiunea
 * Stripe se creează abia la apăsarea butonului, nu la deschiderea
 * paginii — altfel scannerele de linkuri din clienții de email ar deschide
 * sesiuni care expiră și ar declanșa alerte false.
 */
export async function startPayment(
  _prev: PayState,
  formData: FormData,
): Promise<PayState> {
  const orderNumber = String(formData.get("orderNumber") ?? "");
  const exp = String(formData.get("exp") ?? "");
  const sig = String(formData.get("sig") ?? "");

  if (verifyPaymentLink(orderNumber, exp, sig) !== "valid") {
    return { error: "Linkul nu mai e valabil." };
  }

  const result = await loadPayableOrder(orderNumber);
  if (result.state === "paid") return { error: "Comanda e deja plătită." };
  if (result.state !== "payable") {
    return { error: "Comanda nu mai poate fi plătită." };
  }
  const order = result.order;

  let url: string | null = null;
  try {
    // A apăsat deja o dată și sesiunea e încă deschisă — o refolosim.
    if (order.stripeSessionId) {
      const existing = await getStripe().checkout.sessions.retrieve(
        order.stripeSessionId,
      );
      if (existing.status === "open") url = existing.url;
    }

    if (!url) {
      const outOfStock = await findOutOfStock(order.items);
      if (outOfStock) {
        return {
          error: `${outOfStock} nu mai e pe stoc. Scrie-ne la office@domeniul-locus.ro și găsim o soluție.`,
        };
      }

      const session = await createOrderCheckoutSession({
        orderId: order.id,
        orderNumber: order.orderNumber,
        lines: order.items,
        shippingCents: order.shippingCents,
        sgrCents: order.sgrCents,
        bottleCount: order.items.reduce((sum, it) => sum + it.qty, 0),
        discountCents: order.discountCents,
        discountName: "Reducere Domeniul Locus",
        customerEmail: order.customerEmail,
        idempotencyKey: `payment-link-${randomUUID()}`,
      });

      const supabase = getSupabaseAdminClient();
      await supabase
        .from("orders")
        .update({ stripe_session_id: session.id, status: "pending_payment" })
        .eq("id", order.id)
        .neq("payment_status", "succeeded");
      await supabase.from("order_events").insert({
        order_id: order.id,
        type: "payment_link_used",
        payload: { stripe_session_id: session.id },
      });
      url = session.url;
    }
  } catch (err) {
    console.error("[plata] Stripe session failed", orderNumber, err);
    return { error: "Plata online e momentan indisponibilă. Încearcă din nou." };
  }

  if (!url) return { error: "Plata online e momentan indisponibilă." };
  redirect(url);
}

async function findOutOfStock(
  items: Array<{ name: string; code: string; qty: number }>,
): Promise<string | null> {
  const supabase = getSupabaseAdminClient();
  const { data: products } = await supabase
    .from("products")
    .select("code, stock, active")
    .in(
      "code",
      items.map((it) => it.code),
    );
  const byCode = new Map((products ?? []).map((p) => [p.code, p]));
  for (const it of items) {
    const p = byCode.get(it.code);
    if (!p || !p.active || p.stock < it.qty) return it.name;
  }
  return null;
}

"use server";

import { revalidatePath } from "next/cache";
import Stripe from "stripe";
import { getCurrentAdmin } from "@/lib/auth/current-admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/server";

type Result = { ok: true } | { ok: false; error: string };

async function assertAdmin(): Promise<Result> {
  const admin = await getCurrentAdmin();
  if (!admin) return { ok: false, error: "Neautorizat." };
  return { ok: true };
}

/**
 * Marchează comanda expediată. Setează `status='shipped'` + `shipped_at=now()`.
 * Opțional acceptă un AWB — momentan input manual, până integrăm FanCourier API.
 */
export async function markShipped(
  orderNumber: string,
  awbNumber: string | null,
): Promise<Result> {
  const auth = await assertAdmin();
  if (!auth.ok) return auth;

  const supabase = await getSupabaseServerClient();

  const { data: order } = await supabase
    .from("orders")
    .select("id, status")
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (!order) return { ok: false, error: "Comanda nu există." };
  if (order.status !== "paid") {
    return {
      ok: false,
      error: `Nu pot expedia — statusul e "${order.status}" (trebuie "paid").`,
    };
  }

  const { error } = await supabase
    .from("orders")
    .update({
      status: "shipped",
      shipped_at: new Date().toISOString(),
      awb_number: awbNumber?.trim() || null,
    })
    .eq("id", order.id);

  if (error) return { ok: false, error: error.message };

  await supabase.from("order_events").insert({
    order_id: order.id,
    type: "marked_shipped",
    payload: { awb_number: awbNumber ?? null },
  });

  revalidatePath(`/admin/comenzi/${orderNumber}`);
  revalidatePath("/admin/comenzi");
  return { ok: true };
}

/**
 * Marchează comanda livrată.
 */
export async function markDelivered(orderNumber: string): Promise<Result> {
  const auth = await assertAdmin();
  if (!auth.ok) return auth;

  const supabase = await getSupabaseServerClient();

  const { data: order } = await supabase
    .from("orders")
    .select("id, status")
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (!order) return { ok: false, error: "Comanda nu există." };
  if (order.status !== "shipped") {
    return {
      ok: false,
      error: `Nu pot marca livrată — statusul e "${order.status}" (trebuie "shipped").`,
    };
  }

  const { error } = await supabase
    .from("orders")
    .update({ status: "delivered", delivered_at: new Date().toISOString() })
    .eq("id", order.id);

  if (error) return { ok: false, error: error.message };

  await supabase.from("order_events").insert({
    order_id: order.id,
    type: "marked_delivered",
    payload: {},
  });

  revalidatePath(`/admin/comenzi/${orderNumber}`);
  revalidatePath("/admin/comenzi");
  return { ok: true };
}

export type RefundMethod = "stripe" | "manual";
export type RefundManualChannel = "transfer" | "cash" | "altul";

/**
 * Refund cu 2 metode:
 *
 * - **stripe** — apelează Stripe Refund API. Banii se întorc automat pe cardul
 *   clientului în 5-10 zile. Comisionul de tranzacție NU se restituie
 *   (Stripe policy). Doar pentru comenzi cu `stripe_payment_intent`.
 *
 * - **manual** — admin face refund-ul fizic (transfer bancar sau cash) în afara
 *   sistemului. Server action-ul doar marchează comanda ca `refunded` + restore
 *   stoc. Util pentru:
 *     • plăți prin ramburs / card la livrare (Stripe nu a văzut banii)
 *     • cazuri când clientul acceptă alt canal (bypass comisionul Stripe)
 *
 * În ambele cazuri: full refund → status='refunded' + restore stoc.
 */
export async function refundOrder(
  orderNumber: string,
  args: {
    full: boolean;
    method: RefundMethod;
    manualChannel?: RefundManualChannel;
    manualNote?: string;
  },
): Promise<Result> {
  const auth = await assertAdmin();
  if (!auth.ok) return auth;

  const supabase = await getSupabaseServerClient();

  const { data: order } = await supabase
    .from("orders")
    .select("id, status, payment_status, stripe_payment_intent, total_cents, payment_method")
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (!order) return { ok: false, error: "Comanda nu există." };
  if (order.payment_status !== "succeeded") {
    return {
      ok: false,
      error: `Nu pot rambursa — payment_status="${order.payment_status}".`,
    };
  }

  const { full, method } = args;
  let refundId: string | null = null;
  let alreadyRefundedAtStripe = false;

  if (method === "stripe") {
    if (!order.stripe_payment_intent) {
      return {
        ok: false,
        error:
          "Comanda nu are payment intent Stripe (plătită prin ramburs / card livrare). Folosește refund manual.",
      };
    }
    try {
      const stripe = getStripe();
      const refund = await stripe.refunds.create({
        payment_intent: order.stripe_payment_intent,
        metadata: {
          order_id: order.id,
          order_number: orderNumber,
          kind: full ? "full" : "partial",
        },
      });
      refundId = refund.id;
    } catch (err) {
      const msg =
        err instanceof Stripe.errors.StripeError ? err.message : String(err);
      if (msg.toLowerCase().includes("already been refunded")) {
        alreadyRefundedAtStripe = true;
      } else {
        return { ok: false, error: msg };
      }
    }
  }
  // method === "manual" → nu apelăm Stripe. Admin face transferul offline.

  // Update DB (comun ambelor metode)
  await supabase
    .from("orders")
    .update({
      status: "refunded",
      payment_status: full ? "refunded" : "partial_refund",
    })
    .eq("id", order.id);

  await supabase.from("order_events").insert({
    order_id: order.id,
    type: full ? "refund_full" : "refund_partial",
    payload: {
      requested_by: "admin",
      method, // "stripe" | "manual"
      stripe_refund_id: refundId,
      manual_channel: method === "manual" ? args.manualChannel ?? null : null,
      manual_note: method === "manual" ? args.manualNote ?? null : null,
      resync: alreadyRefundedAtStripe || false,
    },
  });

  // Restore stoc la refund complet (indiferent de metodă)
  if (full) {
    const { error: restoreErr } = await supabase.rpc(
      "restore_stock_for_order",
      { p_order_id: order.id },
    );
    if (restoreErr) {
      console.error("[refundOrder] restore stoc failed", order.id, restoreErr);
      await supabase.from("order_events").insert({
        order_id: order.id,
        type: "stock_restore_failed",
        payload: { error: restoreErr.message ?? String(restoreErr) },
      });
    }
  }

  revalidatePath(`/admin/comenzi/${orderNumber}`);
  revalidatePath("/admin/comenzi");
  return { ok: true };
}

/**
 * Ștergere permanentă. Doar pentru statusuri fără fluxuri financiare deschise:
 * - pending_payment (nu s-au atins bani)
 * - cancelled
 * - refunded (fluxul financiar e închis)
 *
 * Pentru paid/shipped/delivered → user trebuie să anuleze / ramburseze întâi.
 */
export async function deleteOrder(orderNumber: string): Promise<Result> {
  const auth = await assertAdmin();
  if (!auth.ok) return auth;

  const supabase = await getSupabaseServerClient();

  const { data: order } = await supabase
    .from("orders")
    .select("id, status")
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (!order) return { ok: false, error: "Comanda nu există." };

  const deletable = ["pending_payment", "cancelled", "refunded"];
  if (!deletable.includes(order.status)) {
    return {
      ok: false,
      error: `Nu pot șterge — status="${order.status}". Rambursează sau anulează întâi.`,
    };
  }

  // Cascade delete pe order_items + order_events (setat la FK în schema).
  const { error } = await supabase.from("orders").delete().eq("id", order.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/comenzi");
  return { ok: true };
}

/**
 * Anulare comandă pending_payment. Doar dacă e încă `pending_payment`.
 */
export async function cancelOrder(orderNumber: string): Promise<Result> {
  const auth = await assertAdmin();
  if (!auth.ok) return auth;

  const supabase = await getSupabaseServerClient();

  const { data: order } = await supabase
    .from("orders")
    .select("id, status")
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (!order) return { ok: false, error: "Comanda nu există." };
  if (order.status !== "pending_payment") {
    return {
      ok: false,
      error: `Nu pot anula — status="${order.status}". Doar pending_payment.`,
    };
  }

  const { error } = await supabase
    .from("orders")
    .update({ status: "cancelled" })
    .eq("id", order.id);

  if (error) return { ok: false, error: error.message };

  await supabase.from("order_events").insert({
    order_id: order.id,
    type: "manual_cancel",
    payload: { cancelled_by: "admin" },
  });

  revalidatePath(`/admin/comenzi/${orderNumber}`);
  revalidatePath("/admin/comenzi");
  return { ok: true };
}

import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  sendOrderConfirmation,
  sendOrderNotificationToAdmin,
} from "@/lib/email/send";
import type { OrderEmailItem } from "@/lib/email/templates";

// Webhook handlers must read the RAW body to validate Stripe's signature.
// Next App Router gives us request.text() which is the raw string —
// don't accidentally JSON.parse it before constructEvent.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Stripe webhook receiver.
 *
 * Flow:
 *   1. Read raw body + Stripe signature header
 *   2. Verify with STRIPE_WEBHOOK_SECRET (rejects forged calls)
 *   3. Idempotency: insert event.id into processed_events; on conflict,
 *      return 200 immediately (Stripe will stop retrying)
 *   4. Dispatch on event.type
 *   5. Always return 200 after recording — Stripe retries 4xx/5xx with
 *      exponential backoff, so we only return 4xx for genuinely
 *      unrecoverable issues (signature mismatch, missing env)
 */
export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[stripe-webhook] STRIPE_WEBHOOK_SECRET missing");
    return new NextResponse("webhook misconfigured", { status: 500 });
  }

  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return new NextResponse("missing signature", { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, sig, secret);
  } catch (err) {
    console.error("[stripe-webhook] signature verification failed", err);
    return new NextResponse("invalid signature", { status: 400 });
  }

  const supabase = getSupabaseAdminClient();

  // Idempotency: try to record the event id; on duplicate, no-op.
  const { error: dupErr } = await supabase
    .from("processed_events")
    .insert({ event_id: event.id, source: "stripe" });
  if (dupErr) {
    // Postgres unique violation = 23505. Treat as "already handled".
    if ((dupErr as { code?: string }).code === "23505") {
      return NextResponse.json({ received: true, duplicate: true });
    }
    console.error("[stripe-webhook] idempotency insert failed", dupErr);
    return new NextResponse("internal error", { status: 500 });
  }

  // Dispatch
  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await handleSessionPaid(event);
        break;
      case "checkout.session.async_payment_failed":
        await handleSessionFailed(event);
        break;
      case "checkout.session.expired":
        await handleSessionExpired(event);
        break;
      case "charge.refunded":
        await handleChargeRefunded(event);
        break;
      default:
        // Unhandled event types are not errors — Stripe sends many.
        break;
    }
  } catch (err) {
    console.error("[stripe-webhook]", event.type, "handler failed", err);
    // We DID record the event already. Returning 500 will make Stripe
    // retry, but our processed_events row blocks duplicate handling.
    // To allow retry, we'd need to delete the row — skip for now.
    return new NextResponse("handler failed", { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleSessionPaid(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  const orderId = session.metadata?.order_id;
  if (!orderId) {
    console.warn("[stripe-webhook] session has no order_id metadata", session.id);
    return;
  }

  const supabase = getSupabaseAdminClient();

  await supabase
    .from("orders")
    .update({
      status: "paid",
      payment_status: "succeeded",
      stripe_payment_intent: typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id ?? null,
      paid_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  await supabase.from("order_events").insert({
    order_id: orderId,
    type: "payment_succeeded",
    payload: {
      stripe_event_id: event.id,
      stripe_session_id: session.id,
      amount_total: session.amount_total,
      currency: session.currency,
    },
  });

  // ── Send confirmation emails (Pas 6) ──────────────────────────
  // Fetch the order + line items for the email payload. We've just
  // written `paid` above, so this read sees fresh data.
  await sendOrderEmails(orderId);

  // TODO Pas 9: trigger Smartbill invoice + Sameday AWB
}

/**
 * Loads the order + items + customer details from DB, then fires the
 * customer confirmation + admin notification emails. Errors are logged
 * but DON'T re-throw — a Resend outage shouldn't undo a paid order.
 */
async function sendOrderEmails(orderId: string) {
  const supabase = getSupabaseAdminClient();

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .select(
      "order_number, total_cents, subtotal_cents, shipping_cents, discount_cents, payment_method, shipping_method, shipping_address, billing, guest_email",
    )
    .eq("id", orderId)
    .maybeSingle();

  if (orderErr || !order) {
    console.error("[email] order lookup failed", orderId, orderErr);
    return;
  }

  const { data: items } = await supabase
    .from("order_items")
    .select("name_snapshot, code_snapshot, qty, unit_price_cents")
    .eq("order_id", orderId);

  const emailItems: OrderEmailItem[] = (items ?? []).map((it) => ({
    name: it.name_snapshot,
    code: it.code_snapshot,
    qty: it.qty,
    unitPriceRon: Math.round(it.unit_price_cents / 100),
  }));

  const shipping = order.shipping_address as Record<string, unknown> | null;
  const billing = order.billing as Record<string, unknown> | null;

  const customerEmail =
    (billing?.email as string | undefined) ??
    (shipping?.email as string | undefined) ??
    order.guest_email ??
    null;

  const customerName =
    (billing?.firstName && billing?.lastName
      ? `${billing.firstName} ${billing.lastName}`
      : (shipping?.firstName && shipping?.lastName
        ? `${shipping.firstName} ${shipping.lastName}`
        : (shipping?.name as string | undefined))) || undefined;

  const shippingAddress =
    order.shipping_method === "curier" && shipping?.address && shipping?.city
      ? `${shipping.address}, ${shipping.city}`
      : undefined;

  const data = {
    orderNumber: order.order_number,
    customerName,
    items: emailItems,
    subtotalRon: Math.round(order.subtotal_cents / 100),
    shippingRon: Math.round(order.shipping_cents / 100),
    discountRon: Math.round(order.discount_cents / 100),
    totalRon: Math.round(order.total_cents / 100),
    shippingMethod: order.shipping_method as "curier" | "ridicare",
    shippingAddress,
    paymentMethod: order.payment_method,
  };

  // Customer email — only if we have one.
  if (customerEmail) {
    const r = await sendOrderConfirmation(customerEmail, data);
    if (r.ok) {
      console.info("[email] order confirmation sent", r.id);
    }
  } else {
    console.warn("[email] no customer email on order", orderId);
  }

  // Admin email — always
  const a = await sendOrderNotificationToAdmin({
    ...data,
    customerEmail,
    customerPhone:
      ((shipping?.phone as string | undefined) ??
        (billing?.phone as string | undefined)) ||
      null,
  });
  if (a.ok) {
    console.info("[email] admin notification sent", a.id);
  }
}

async function handleSessionFailed(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  const orderId = session.metadata?.order_id;
  if (!orderId) return;

  const supabase = getSupabaseAdminClient();
  await supabase
    .from("orders")
    .update({ payment_status: "failed" })
    .eq("id", orderId);
  await supabase.from("order_events").insert({
    order_id: orderId,
    type: "payment_failed",
    payload: { stripe_event_id: event.id, stripe_session_id: session.id },
  });
}

async function handleSessionExpired(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  const orderId = session.metadata?.order_id;
  if (!orderId) return;

  const supabase = getSupabaseAdminClient();
  // Mark cancelled — user abandoned the Stripe page or it timed out
  // (24h default). Their cart/checkout-store is already cleared, so
  // they'd start fresh anyway.
  await supabase
    .from("orders")
    .update({ status: "cancelled" })
    .eq("id", orderId)
    .eq("status", "pending_payment");
  await supabase.from("order_events").insert({
    order_id: orderId,
    type: "session_expired",
    payload: { stripe_event_id: event.id, stripe_session_id: session.id },
  });
}

async function handleChargeRefunded(event: Stripe.Event) {
  const charge = event.data.object as Stripe.Charge;
  const orderId = charge.metadata?.order_id;
  if (!orderId) return;

  const supabase = getSupabaseAdminClient();
  const isPartial = charge.amount_refunded < charge.amount;
  await supabase
    .from("orders")
    .update({
      status: "refunded",
      payment_status: isPartial ? "partial_refund" : "refunded",
    })
    .eq("id", orderId);
  await supabase.from("order_events").insert({
    order_id: orderId,
    type: isPartial ? "refund_partial" : "refund_full",
    payload: {
      stripe_event_id: event.id,
      charge_id: charge.id,
      amount_refunded: charge.amount_refunded,
    },
  });
}

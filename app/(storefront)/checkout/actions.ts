"use server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/supabase/database.types";
import { getStripe, getSiteUrl } from "@/lib/stripe/server";
import type {
  Billing,
  PaymentMethod,
  Shipping,
} from "@/lib/checkout-store";

export type CreateOrderInput = {
  /** UUID generated client-side; same key = same order (idempotent). */
  idempotencyKey: string;
  items: Array<{ code: string; qty: number }>;
  shipping: Shipping;
  billing: Billing;
  payment: PaymentMethod;
  /** Optional voucher code. Server re-validates against `coupons` table. */
  couponCode?: string | null;
};

export type CreateOrderResult =
  | {
      ok: true;
      orderId: string;
      orderNumber: string;
      totalCents: number;
      /** Set ONLY when payment === "card-online". Client redirects here. */
      stripeSessionUrl?: string;
    }
  | { ok: false; error: string };

const SHIP_FREE_AT_CENTS = 25000; // 250 lei
const SHIP_FEE_CENTS = 1900; //  19 lei

/**
 * Place an order: validates inputs, re-prices server-side from the live
 * `products` table, applies coupon, and inserts the row via the
 * `create_order` Postgres function (single transaction, idempotent).
 *
 * Pricing comes from DB (never trust the cart snapshot client-side).
 * Stripe Checkout Session attach happens in Pas 5; this action just
 * persists `pending_payment`.
 */
export async function createOrder(
  input: CreateOrderInput,
): Promise<CreateOrderResult> {
  // ── 1. Basic validation ─────────────────────────────────────────
  if (!input.idempotencyKey || input.idempotencyKey.length < 8) {
    return { ok: false, error: "Cheie de idempotență invalidă." };
  }
  if (!Array.isArray(input.items) || input.items.length === 0) {
    return { ok: false, error: "Coșul este gol." };
  }
  for (const it of input.items) {
    if (!it.code || typeof it.qty !== "number" || it.qty < 1 || it.qty > 99) {
      return { ok: false, error: `Articol invalid: ${it.code}` };
    }
  }
  if (input.payment !== "card-online" && input.payment !== "card-livrare") {
    return { ok: false, error: "Metodă de plată invalidă." };
  }

  const supabase = getSupabaseAdminClient();

  // ── 2. Re-fetch products from DB (source of truth for pricing) ──
  const codes = input.items.map((i) => i.code);
  const { data: products, error: prodError } = await supabase
    .from("products")
    .select("code, name, price_cents, active, stock")
    .in("code", codes);

  if (prodError) {
    console.error("[createOrder] product lookup failed", prodError);
    return { ok: false, error: "Nu am putut încărca produsele. Încearcă din nou." };
  }

  const byCode = new Map(products?.map((p) => [p.code, p]) ?? []);
  for (const it of input.items) {
    const p = byCode.get(it.code);
    if (!p) return { ok: false, error: `Vinul ${it.code} nu mai există în catalog.` };
    if (!p.active) return { ok: false, error: `Vinul ${p.name} nu mai este disponibil.` };
    if (p.stock < it.qty) {
      return {
        ok: false,
        error: `Stoc insuficient pentru ${p.name} (${p.stock} disponibile).`,
      };
    }
  }

  // ── 3. Compute totals server-side ───────────────────────────────
  let subtotalCents = 0;
  for (const it of input.items) {
    const p = byCode.get(it.code)!;
    subtotalCents += p.price_cents * it.qty;
  }

  // Shipping
  const shipMethod = input.shipping.method;
  let shippingCents = 0;
  if (shipMethod === "curier") {
    shippingCents = subtotalCents >= SHIP_FREE_AT_CENTS ? 0 : SHIP_FEE_CENTS;
  }

  // Coupon
  let discountCents = 0;
  if (input.couponCode && input.couponCode.trim().length > 0) {
    const code = input.couponCode.trim().toUpperCase();
    const { data: coupon } = await supabase
      .from("coupons")
      .select("code, percent_off, fixed_off_cents, min_amount_cents, expires_at, max_uses, used_count, active")
      .eq("code", code)
      .eq("active", true)
      .maybeSingle();

    if (!coupon) {
      return { ok: false, error: `Voucherul ${code} nu este valid.` };
    }
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return { ok: false, error: `Voucherul ${code} a expirat.` };
    }
    if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
      return { ok: false, error: `Voucherul ${code} și-a atins limita.` };
    }
    if (subtotalCents < coupon.min_amount_cents) {
      return {
        ok: false,
        error: `Voucherul ${code} se aplică la peste ${coupon.min_amount_cents / 100} lei.`,
      };
    }

    if (coupon.percent_off) {
      discountCents = Math.round((subtotalCents * coupon.percent_off) / 100);
    } else if (coupon.fixed_off_cents) {
      discountCents = Math.min(coupon.fixed_off_cents, subtotalCents);
    }
  }

  const totalCents = Math.max(0, subtotalCents - discountCents + shippingCents);

  // ── 4. Extract guest email from billing/shipping ────────────────
  const guestEmail =
    "email" in input.billing
      ? input.billing.email
      : "email" in input.shipping
        ? (input.shipping as { email: string }).email
        : null;

  // ── 5. Call the create_order Postgres function (atomic) ─────────
  const { data: rpcData, error: rpcError } = await supabase.rpc("create_order", {
    p_idempotency_key: input.idempotencyKey,
    // Cast to Json: items / shipping / billing are JSON-shaped already
    // (no Date / functions / undefined). Supabase JsonB columns expect
    // the generated `Json` type.
    p_items: input.items as unknown as Json,
    p_shipping: input.shipping as unknown as Json,
    p_billing: input.billing as unknown as Json,
    p_payment_method: input.payment,
    p_shipping_method: shipMethod,
    p_subtotal_cents: subtotalCents,
    p_shipping_cents: shippingCents,
    p_discount_cents: discountCents,
    p_total_cents: totalCents,
    p_guest_email: guestEmail,
    p_customer_id: null, // guest checkout for now; Pas 7 wires logged-in user
  });

  if (rpcError) {
    console.error("[createOrder] RPC failed", rpcError);
    return { ok: false, error: "Eroare la salvarea comenzii. Încearcă din nou." };
  }

  // RPC returns SETOF (id, order_number) — exactly one row.
  const row = Array.isArray(rpcData) ? rpcData[0] : rpcData;
  if (!row?.id || !row?.order_number) {
    return { ok: false, error: "Răspuns invalid de la server." };
  }
  const orderId = row.id as string;
  const orderNumber = row.order_number as string;

  // ── 6. For card-online: create Stripe Checkout Session ──────────
  // For card-livrare or ramburs: skip; order stays pending_payment until
  // marked manually after delivery.
  let stripeSessionUrl: string | undefined;
  if (input.payment === "card-online") {
    try {
      const stripe = getStripe();

      // Build line_items inline (price_data) — no need to pre-create
      // products in Stripe. Item totals already in cents (RON).
      const lineItems = input.items.map((it) => {
        const p = byCode.get(it.code)!;
        return {
          quantity: it.qty,
          price_data: {
            currency: "ron",
            unit_amount: p.price_cents,
            product_data: {
              name: p.name,
              metadata: { code: p.code },
            },
          },
        };
      });

      // Shipping as a separate line so the receipt is honest.
      if (shippingCents > 0) {
        lineItems.push({
          quantity: 1,
          price_data: {
            currency: "ron",
            unit_amount: shippingCents,
            product_data: {
              name: "Transport curier",
              metadata: { code: "SHIPPING" },
            },
          },
        });
      }

      // Discount via Stripe Coupon would be ideal, but for simplicity
      // we bake it into a negative line item via discounts[]. Stripe
      // doesn't allow negative price_data; we use `discounts` with
      // an inline coupon created on-the-fly.
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        // Default ui_mode is hosted (Stripe-hosted checkout page), which
        // is what we want — minimizes our PCI scope to SAQ-A.
        line_items: lineItems,
        ...(discountCents > 0 && {
          discounts: [
            {
              coupon: (
                await stripe.coupons.create({
                  amount_off: discountCents,
                  currency: "ron",
                  duration: "once",
                  name:
                    input.couponCode?.toUpperCase() ?? "Voucher Domeniul Locus",
                })
              ).id,
            },
          ],
        }),
        customer_email: guestEmail ?? undefined,
        success_url: `${getSiteUrl()}/checkout/success?id=${encodeURIComponent(orderNumber)}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${getSiteUrl()}/checkout?cancelled=${encodeURIComponent(orderNumber)}`,
        metadata: {
          order_id: orderId,
          order_number: orderNumber,
          idempotency_key: input.idempotencyKey,
        },
        payment_intent_data: {
          metadata: {
            order_id: orderId,
            order_number: orderNumber,
          },
        },
        // Stripe will retry idempotently on the same key — same order
        // creating two Stripe sessions would otherwise be possible.
        // (Note: this is Stripe's idempotency, separate from our DB key.)
      }, {
        idempotencyKey: `session-${input.idempotencyKey}`,
      });

      // Persist the Stripe session id on the order so the webhook can
      // reconcile (and we can show it in admin / customer history).
      await supabase
        .from("orders")
        .update({ stripe_session_id: session.id })
        .eq("id", orderId);

      stripeSessionUrl = session.url ?? undefined;
    } catch (err) {
      // Order is already created in DB. Surface the failure but don't
      // delete the order — admin can retry the Stripe attach later.
      console.error("[createOrder] Stripe session creation failed", err);
      return {
        ok: false,
        error: "Plata online e momentan indisponibilă. Comanda nu a fost trimisă.",
      };
    }
  }

  return {
    ok: true,
    orderId,
    orderNumber,
    totalCents,
    stripeSessionUrl,
  };
}

"use server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/auth/current-user";
import type { Json } from "@/lib/supabase/database.types";
import { getStripe, getSiteUrl } from "@/lib/stripe/server";
import { collectAttribution } from "@/lib/meta/attribution";
import {
  calculateShippingRon,
  getShippingMethod,
} from "@/lib/shipping";
import { SGR_PER_BOTTLE_RON, countBottles } from "@/lib/sgr";
import { calculateSetDiscountCents } from "@/lib/sets";
import { calculateExciseCents } from "@/lib/excise";
import { saveAccountFromOrder } from "@/lib/account/defaults";
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

  // Shipping — recalc server-side pe baza subtotal + județ + serviciu ales.
  // Client-side calc e doar pentru afișare; sursa de adevăr e aici.
  const shipMethod = input.shipping.method;
  let shippingCents = 0;
  let courierService: string | null = null;
  let pickupPointId: string | null = null;
  let pickupPointName: string | null = null;
  let pickupPointAddress: string | null = null;

  if (input.shipping.method === "curier") {
    const method = getShippingMethod(input.shipping.serviceId);
    if (!method) {
      return { ok: false, error: "Metodă de livrare invalidă." };
    }
    if (method.requiresPickupPoint && !input.shipping.pickupPointId) {
      return {
        ok: false,
        error: "Pentru serviciul ales trebuie să selectezi un punct de ridicare.",
      };
    }
    const calc = calculateShippingRon({
      methodId: input.shipping.serviceId,
      county: input.shipping.county,
      subtotalRon: subtotalCents / 100,
    });
    shippingCents = Math.round(calc.priceRon * 100);
    courierService = method.fanCourierService;
    pickupPointId = input.shipping.pickupPointId ?? null;
    pickupPointName = input.shipping.pickupPointName ?? null;
    pickupPointAddress = input.shipping.pickupPointAddress ?? null;
  }

  // Reducere de set — se acordă automat când coșul conține toate cele
  // trei vinuri ale unei game. Calculată aici, din prețurile din bază,
  // NU din ce trimite clientul: altfel oricine putea cere orice preț.
  //
  // Se cumulează cu un voucher: setul reduce pachetul, voucherul e o
  // reducere comercială separată. Dacă vrei să fie exclusive, mută
  // `discountCents` de mai jos într-o alegere de tip max().
  const priceByCode = new Map(
    (products ?? []).map((p) => [p.code, p.price_cents]),
  );
  const setResult = calculateSetDiscountCents(input.items, priceByCode);
  let discountCents = setResult.discountCents;

  // Coupon
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
      discountCents += Math.round((subtotalCents * coupon.percent_off) / 100);
    } else if (coupon.fixed_off_cents) {
      discountCents += coupon.fixed_off_cents;
    }
  }

  // Plasa de siguranță: reducerea cumulată nu poate depăși subtotalul,
  // altfel totalul ar ieși negativ și Stripe ar refuza sesiunea.
  discountCents = Math.min(discountCents, subtotalCents);

  // SGR — garanție returnare 0.5 lei/sticlă. NU intră în discount, NU are
  // TVA. Se adaugă peste (subtotal - discount + shipping).
  const bottleCount = countBottles(input.items);
  const sgrCents = Math.round(bottleCount * SGR_PER_BOTTLE_RON * 100);

  // Accize (11 lei/hL vin liniștit). INCLUSE în prețul afișat — nu se
  // adaugă la total. Le calculăm pentru a le salva pe comandă și a le
  // defalca pe factura fiscală.
  const exciseCents = calculateExciseCents(bottleCount);

  const totalCents = Math.max(
    0,
    subtotalCents - discountCents + shippingCents + sgrCents,
  );

  // ── 4. Extract guest email from billing/shipping (or use logged-in)
  const currentUser = await getCurrentUser();
  const guestEmail =
    currentUser?.email ??
    ("email" in input.billing
      ? input.billing.email
      : "email" in input.shipping
        ? (input.shipping as { email: string }).email
        : "");

  // ── 5. Call the create_order Postgres function (atomic) ─────────
  const { data: rpcData, error: rpcError } = await supabase.rpc("create_order", {
    p_idempotency_key: input.idempotencyKey,
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
    p_customer_id: (currentUser?.customerId ?? null) as unknown as string,
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

  // ── 5b. Semnale de atribuire pentru Meta CAPI + snapshot FanCourier ───
  // Cookie-urile pixelului există doar acum, în request-ul din browser;
  // evenimentul de conversie pleacă mai târziu din webhook-ul Stripe.
  // Le salvăm pe comandă ca puntea dintre cele două momente.
  // Fără consimțământ de marketing rămân null — vezi lib/meta/attribution.ts.
  //
  // Simultan salvăm serviciul FanCourier ales + punctul PUDO (dacă e cazul),
  // ca să le știm la generarea AWB-ului din admin.
  const attribution = await collectAttribution();
  const { error: attrErr } = await supabase
    .from("orders")
    .update({
      marketing_consent: attribution.marketingConsent,
      fbp: attribution.fbp,
      fbc: attribution.fbc,
      client_ip: attribution.clientIp,
      client_user_agent: attribution.clientUserAgent,
      courier_service: courierService,
      pickup_point_id: pickupPointId,
      pickup_point_name: pickupPointName,
      pickup_point_address: pickupPointAddress,
      sgr_cents: sgrCents,
      excise_cents: exciseCents,
    })
    .eq("id", orderId);

  if (attrErr) {
    // Nu blocăm comanda pentru atribuire — pierdem doar calitatea
    // potrivirii în Meta, nu vânzarea.
    console.error("[createOrder] salvare atribuire esuata", orderId, attrErr);
  }

  // ── 5c. Salvez pe cont datele pentru pre-fill la comenzile viitoare ──
  // Doar pentru user logat. Guest checkout → nu avem unde. Nu blocăm
  // comanda dacă eșuează.
  if (currentUser?.customerId) {
    try {
      await saveAccountFromOrder({
        customerId: currentUser.customerId,
        shipping: input.shipping,
        billing: input.billing,
      });
    } catch (err) {
      console.error("[createOrder] saveAccountFromOrder failed", err);
    }
  }

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

      // SGR — garanție returnare, obligatoriu legal, linie separată.
      if (sgrCents > 0) {
        lineItems.push({
          quantity: 1,
          price_data: {
            currency: "ron",
            unit_amount: sgrCents,
            product_data: {
              name: `Garanție SGR (${bottleCount} sticle × 0.5 lei)`,
              metadata: { code: `SGR-${bottleCount}` },
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
                  // Eticheta de pe bonul Stripe. Reflectă ce a produs
                  // reducerea, ca să nu apară „voucher" acolo unde de fapt
                  // clientul a beneficiat de prețul de set.
                  name:
                    input.couponCode?.toUpperCase() ??
                    (setResult.matches.length > 0
                      ? setResult.matches.map((m) => m.def.label).join(" + ")
                      : "Reducere Domeniul Locus"),
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

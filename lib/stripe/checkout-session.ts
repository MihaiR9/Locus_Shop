import "server-only";
import type Stripe from "stripe";
import { getStripe, getSiteUrl } from "@/lib/stripe/server";

type SessionParams = NonNullable<
  Parameters<Stripe["checkout"]["sessions"]["create"]>[0]
>;
type LineItem = NonNullable<SessionParams["line_items"]>[number];

/**
 * Cât stă deschisă pagina de plată Stripe. Când expiră, webhook-ul
 * `checkout.session.expired` trimite clientului un reminder cu link de
 * plată nou și ție o alertă — deci asta e și întârzierea reminderului.
 * Stripe acceptă între 30 de minute și 24 de ore.
 */
export const CHECKOUT_SESSION_TTL_MS = 3 * 60 * 60 * 1000;

export type CheckoutLine = {
  name: string;
  code: string;
  qty: number;
  unitPriceCents: number;
};

/**
 * Creează sesiunea Stripe Checkout pentru o comandă deja salvată în DB.
 * Folosită la checkout și din linkul de plată trimis după expirare, ca
 * ambele să construiască aceleași linii (produse, transport, SGR, reducere).
 */
export async function createOrderCheckoutSession(input: {
  orderId: string;
  orderNumber: string;
  lines: CheckoutLine[];
  shippingCents: number;
  sgrCents: number;
  bottleCount: number;
  discountCents: number;
  discountName: string;
  customerEmail?: string | null;
  metadata?: Record<string, string>;
  idempotencyKey: string;
}): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();

  const lineItems: LineItem[] =
    input.lines.map((l) => ({
      quantity: l.qty,
      price_data: {
        currency: "ron",
        unit_amount: l.unitPriceCents,
        product_data: { name: l.name, metadata: { code: l.code } },
      },
    }));

  // Shipping as a separate line so the receipt is honest.
  if (input.shippingCents > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: "ron",
        unit_amount: input.shippingCents,
        product_data: {
          name: "Transport curier",
          metadata: { code: "SHIPPING" },
        },
      },
    });
  }

  // SGR — garanție returnare, obligatoriu legal, linie separată.
  if (input.sgrCents > 0) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: "ron",
        unit_amount: input.sgrCents,
        product_data: {
          name: `Garanție SGR (${input.bottleCount} sticle × 0.5 lei)`,
          metadata: { code: `SGR-${input.bottleCount}` },
        },
      },
    });
  }

  // Stripe nu acceptă price_data negativ, așa că reducerea merge printr-un
  // cupon creat pe loc, cu eticheta care apare pe bonul Stripe.
  const discounts =
    input.discountCents > 0
      ? [
          {
            coupon: (
              await stripe.coupons.create({
                amount_off: input.discountCents,
                currency: "ron",
                duration: "once",
                name: input.discountName,
              })
            ).id,
          },
        ]
      : undefined;

  const orderNumber = encodeURIComponent(input.orderNumber);

  return stripe.checkout.sessions.create(
    {
      mode: "payment",
      // Hosted checkout — ține scope-ul PCI la SAQ-A.
      line_items: lineItems,
      discounts,
      customer_email: input.customerEmail || undefined,
      expires_at: Math.floor((Date.now() + CHECKOUT_SESSION_TTL_MS) / 1000),
      success_url: `${getSiteUrl()}/checkout/success?id=${orderNumber}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getSiteUrl()}/checkout?cancelled=${orderNumber}`,
      metadata: {
        ...input.metadata,
        order_id: input.orderId,
        order_number: input.orderNumber,
      },
      payment_intent_data: {
        metadata: {
          order_id: input.orderId,
          order_number: input.orderNumber,
        },
      },
    },
    { idempotencyKey: input.idempotencyKey },
  );
}

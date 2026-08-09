import Link from "next/link";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/server";
import { formatRon } from "@/lib/wines";
import { PurchaseTracker } from "@/components/checkout/purchase-tracker";
import type { GtmItem } from "@/lib/analytics/gtm";

export const metadata = {
  title: "Comandă confirmată · Domeniul Locus",
};

// Order details aren't cacheable across users — render fresh each request.
export const dynamic = "force-dynamic";

type Search = { id?: string; session_id?: string };

type OrderRow = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_cents: number;
  payment_method: string;
};

type ShippingAddress = {
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  county?: string;
  zip?: string;
  phone?: string;
};

type OrderDetails = {
  subtotal_cents: number;
  shipping_cents: number;
  discount_cents: number;
  shipping_method: string;
  shipping_address: ShippingAddress | null;
  courier_service: string | null;
  guest_email: string | null;
  created_at: string;
  fgo_invoice_status: string | null;
  customers: { email: string } | { email: string }[] | null;
};

type OrderItemRow = {
  code_snapshot: string;
  name_snapshot: string;
  qty: number;
  unit_price_cents: number;
};

const RO_DATETIME = new Intl.DateTimeFormat("ro-RO", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/**
 * Reconcile Stripe payment status with our DB. Stripe redirects the
 * user to success_url AS SOON AS the session is created with a valid
 * payment intent — which can race the `checkout.session.completed`
 * webhook by a few hundred ms. If the user lands here before the webhook
 * fires, we manually sync so the page shows the right state.
 *
 * Returns the (possibly updated) order row.
 */
async function reconcileWithStripe(
  orderNumber: string,
  sessionId: string,
): Promise<OrderRow | null> {
  const supabase = getSupabaseAdminClient();

  let { data: order } = await supabase
    .from("orders")
    .select("id, order_number, status, payment_status, total_cents, payment_method")
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (!order) return null;

  // Already reconciled by webhook — fast path.
  if (order.payment_status === "succeeded") return order as OrderRow;

  // Webhook hasn't fired yet; check Stripe directly.
  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    if (
      session.payment_status === "paid" &&
      session.metadata?.order_id === order.id
    ) {
      await supabase
        .from("orders")
        .update({
          status: "paid",
          payment_status: "succeeded",
          stripe_payment_intent:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id ?? null,
          paid_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      // Refresh
      const r = await supabase
        .from("orders")
        .select("id, order_number, status, payment_status, total_cents, payment_method")
        .eq("id", order.id)
        .maybeSingle();
      order = r.data ?? order;
    }
  } catch (err) {
    // If Stripe is down or session_id is bogus, just show what we have.
    console.error("[success] Stripe reconcile failed", err);
  }

  return order as OrderRow;
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const { id, session_id } = await searchParams;

  let order: OrderRow | null = null;
  if (id) {
    if (session_id) {
      order = await reconcileWithStripe(id, session_id);
    } else {
      const supabase = getSupabaseAdminClient();
      const { data } = await supabase
        .from("orders")
        .select("id, order_number, status, payment_status, total_cents, payment_method")
        .eq("order_number", id)
        .maybeSingle();
      order = data;
    }
  }

  const isPaid = order?.payment_status === "succeeded";
  const isPendingOnline =
    order?.payment_method === "card-online" &&
    order.payment_status === "pending";
  const isCash = order?.payment_method !== "card-online";

  // Fetch order items + extra order columns for the receipt panel below.
  // Runs whenever we have an order (not only when paid) so the pending /
  // cash states also get a full picture — only the GTM `purchase` event
  // stays gated on `isPaid`, since that's the one that must not double up
  // or fire for something that hasn't actually been charged.
  let items: OrderItemRow[] = [];
  let details: OrderDetails | null = null;
  if (order) {
    const supabase = getSupabaseAdminClient();
    const [{ data: itemsData }, { data: orderExtras }] = await Promise.all([
      supabase
        .from("order_items")
        .select("code_snapshot, name_snapshot, qty, unit_price_cents")
        .eq("order_id", order.id),
      supabase
        .from("orders")
        .select(
          "subtotal_cents, shipping_cents, discount_cents, shipping_method, shipping_address, courier_service, guest_email, created_at, fgo_invoice_status, customers(email)",
        )
        .eq("id", order.id)
        .maybeSingle(),
    ]);
    items = itemsData ?? [];
    details = (orderExtras as OrderDetails | null) ?? null;
  }

  const customer = Array.isArray(details?.customers)
    ? details?.customers[0]
    : details?.customers;
  const email = customer?.email ?? details?.guest_email ?? null;

  const ship = details?.shipping_address ?? null;
  const isFanbox = (details?.courier_service ?? "").includes("fanbox");
  const isPickup = details?.shipping_method === "ridicare";
  const shippingLabel = isPickup
    ? "ridicare personală"
    : isFanbox
      ? "livrare la easybox"
      : "livrare prin curier";

  const gtmItems: GtmItem[] =
    order && isPaid
      ? items.map((it) => ({
          item_id: it.code_snapshot,
          item_name: it.name_snapshot,
          price: it.unit_price_cents / 100,
          quantity: it.qty,
        }))
      : [];
  const gtmShippingRon = isPaid ? (details?.shipping_cents ?? 0) / 100 : 0;
  const gtmDiscountRon = isPaid ? (details?.discount_cents ?? 0) / 100 : 0;
  const gtmCouponCode: string | null = null; // TODO: adaugă orders.coupon_code când wire-uim reducerile la checkout

  const nextSteps = !order
    ? []
    : isPaid
      ? [
          {
            n: "01",
            title: "confirmare",
            text: email
              ? `Email trimis la ${email}.`
              : "Îți trimitem un email de confirmare.",
          },
          {
            n: "02",
            title: "factură",
            text:
              details?.fgo_invoice_status === "issued"
                ? "Emisă și atașată la email."
                : "Se emite automat, ajunge pe email.",
          },
          {
            n: "03",
            title: "expediere",
            text: isPickup
              ? "Te anunțăm când e gata de ridicat din Buciumeni."
              : "În 1–2 zile lucrătoare, cu tracking pe email.",
          },
          {
            n: "04",
            title: "livrare",
            text: isPickup
              ? "Ridici personal, cu programare în prealabil."
              : "2–4 zile lucrătoare de la expediere.",
          },
        ]
      : isPendingOnline
        ? [
            { n: "01", title: "plată", text: "Stripe confirmă în câteva secunde." },
            { n: "02", title: "confirmare", text: "Email de îndată ce plata e validată." },
            { n: "03", title: "factură", text: "Se emite automat după confirmare." },
            { n: "04", title: "expediere", text: "Pornește imediat ce comanda e plătită." },
          ]
        : [
            { n: "01", title: "confirmare", text: email ? `Email trimis la ${email}.` : "Îți trimitem un email de confirmare." },
            { n: "02", title: "contact curier", text: "Te sună înainte de livrare." },
            { n: "03", title: "plată", text: "La livrare, cash sau card." },
            { n: "04", title: "factură", text: "Emisă și trimisă după livrare." },
          ];

  return (
    <main className="cs-page">
      {order && isPaid && gtmItems.length > 0 && (
        <PurchaseTracker
          transactionId={order.order_number}
          value={order.total_cents / 100}
          shipping={gtmShippingRon}
          discount={gtmDiscountRon || undefined}
          couponCode={gtmCouponCode}
          items={gtmItems}
        />
      )}

      {!order ? (
        <div className="cs-empty">
          <div className="eyebrow" style={{ marginBottom: 18 }}>comandă</div>
          <h1 className="cs-empty-h1">comandă negăsită.</h1>
          <p className="cs-empty-p">
            Nu am găsit nicio comandă cu numărul cerut. Dacă ai plasat o
            comandă și nu vezi confirmarea, scrie-ne la{" "}
            <a href="mailto:contact@domeniul-locus.ro">contact@domeniul-locus.ro</a>.
          </p>
          <Link href="/" className="cs-cta">
            înapoi la domeniu
            <svg className="arrow" viewBox="0 0 24 12" aria-hidden="true">
              <use href="#arrow-right" />
            </svg>
          </Link>
        </div>
      ) : (
        <>
          <div className="cs-ticket">
            <span>Domeniul Locus</span>
            <span className="dot">·</span>
            <span>Buciumeni · 45.98°N 27.30°E</span>
            <span className="dot">·</span>
            <span>{RO_DATETIME.format(new Date(details?.created_at ?? Date.now()))}</span>
          </div>

          <header className="cs-hero">
            <div className="eyebrow">
              {isPaid ? "comandă plătită" : isPendingOnline ? "se procesează plata" : "comandă înregistrată"}
            </div>
            <h1 className="cs-h1">{isPaid || isCash ? "mulțumim." : "aproape gata."}</h1>
            <div className="cs-order-no">
              comanda <b>#{order.order_number}</b>
            </div>
            <p className="cs-lede">
              {isPaid && (
                <>
                  Plata de <strong>{formatRon(order.total_cents / 100)}</strong> a
                  fost confirmată. Vinul, ca și locul, are nevoie de timp — te
                  ținem la curent cu fiecare pas.
                </>
              )}
              {isPendingOnline && (
                <>
                  Plata se procesează — Stripe ne confirmă în câteva secunde.
                  Dacă ai văzut &bdquo;Payment successful&rdquo; pe pagina de
                  plată, totul e în regulă, doar așteaptă reîncărcarea. Total:{" "}
                  <strong>{formatRon(order.total_cents / 100)}</strong>.
                </>
              )}
              {isCash && (
                <>
                  Total <strong>{formatRon(order.total_cents / 100)}</strong>,
                  plată la livrare. Curierul te contactează cu detaliile
                  înainte să ajungă.
                </>
              )}
            </p>
          </header>

          <div className="cs-grid">
            <section className="cs-panel">
              <h2>esențial</h2>
              <div className="cs-rows">
                <div className="cs-row">
                  <span className="label">metodă plată</span>
                  <span className="value">
                    {order.payment_method === "card-online"
                      ? "card online"
                      : order.payment_method === "card-livrare"
                        ? "card la livrare"
                        : "ramburs la livrare"}
                  </span>
                </div>
                <div className="cs-row">
                  <span className="label">livrare</span>
                  <span className="value">{shippingLabel}</span>
                </div>
                {!isPickup && ship && (ship.address || ship.city) && (
                  <div className="cs-row cs-row--address">
                    <span className="label">adresă</span>
                    <span className="value">
                      {ship.firstName || ship.lastName ? (
                        <>
                          {ship.firstName} {ship.lastName}
                          <br />
                        </>
                      ) : null}
                      {ship.address && <>{ship.address}<br /></>}
                      {ship.city}
                      {ship.county ? `, ${ship.county}` : ""}
                      {ship.zip ? ` · ${ship.zip}` : ""}
                    </span>
                  </div>
                )}
                {isPickup && (
                  <div className="cs-row cs-row--address">
                    <span className="label">adresă</span>
                    <span className="value">Centrul de vinificație, Buciumeni.</span>
                  </div>
                )}
                {email && (
                  <div className="cs-row">
                    <span className="label">email</span>
                    <span className="value">{email}</span>
                  </div>
                )}
              </div>
            </section>

            <section className="cs-panel cs-panel--next">
              <h2>ce urmează</h2>
              <ol className="cs-next-list">
                {nextSteps.map((s) => (
                  <li key={s.n}>
                    <span className="n">{s.n}</span>
                    <span className="body">
                      <span className="t">{s.title}</span>
                      <span className="d">{s.text}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          {items.length > 0 && (
            <section className="cs-items">
              <h2>articole ({items.length})</h2>
              <div className="cs-item-rows">
                {items.map((it) => (
                  <div className="cs-item-row" key={it.code_snapshot}>
                    <span className="code">{it.code_snapshot}</span>
                    <span className="name">{it.name_snapshot}</span>
                    <span className="qty">× {it.qty}</span>
                    <span className="price">
                      {formatRon((it.unit_price_cents * it.qty) / 100)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="cs-item-totals">
                {details && (
                  <>
                    <div className="cs-trow muted">
                      <span>subtotal</span>
                      <span>{formatRon(details.subtotal_cents / 100)}</span>
                    </div>
                    <div className="cs-trow muted">
                      <span>transport</span>
                      <span>
                        {details.shipping_cents === 0
                          ? "gratuit"
                          : formatRon(details.shipping_cents / 100)}
                      </span>
                    </div>
                    {details.discount_cents > 0 && (
                      <div className="cs-trow muted discount">
                        <span>voucher</span>
                        <span>−{formatRon(details.discount_cents / 100)}</span>
                      </div>
                    )}
                  </>
                )}
                <div className="cs-trow total">
                  <span>total</span>
                  <span>{formatRon(order.total_cents / 100)}</span>
                </div>
              </div>
            </section>
          )}

          <div className="cs-actions">
            <Link href="/" className="cs-cta">
              înapoi la domeniu
              <svg className="arrow" viewBox="0 0 24 12" aria-hidden="true">
                <use href="#arrow-right" />
              </svg>
            </Link>
            <div className="symbol-row" aria-hidden="true">
              <svg><use href="#square" /></svg>
              <svg><use href="#diamond" /></svg>
              <svg><use href="#star8" /></svg>
              <svg><use href="#circle" /></svg>
            </div>
          </div>
        </>
      )}
    </main>
  );
}

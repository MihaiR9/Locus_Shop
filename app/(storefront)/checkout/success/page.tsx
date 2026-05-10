import Link from "next/link";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe/server";
import { formatRon } from "@/lib/wines";

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

  return (
    <main className="checkout-success">
      <div className="success-card">
        <div
          className="eyebrow"
          style={{ justifyContent: "center", marginBottom: 18 }}
        >
          {!order
            ? "comandă"
            : isPaid
              ? "comandă plătită"
              : isPendingOnline
                ? "se procesează plata"
                : "comandă înregistrată"}
        </div>
        <h1>
          {!order ? "comandă negăsită" : isPaid || isCash ? "mulțumim." : "aproape gata."}
        </h1>

        {order ? (
          <>
            <div className="order-no">#{order.order_number}</div>
            {isPaid && (
              <p>
                Plata de <strong>{formatRon(order.total_cents / 100)}</strong>{" "}
                a fost confirmată. Îți trimitem un email cu factura și detaliile
                de livrare. Vinul, ca și locul, are nevoie de timp.
              </p>
            )}
            {isPendingOnline && (
              <p>
                Plata se procesează — Stripe ne confirmă în câteva secunde. Dacă
                ai văzut "Payment successful" pe pagina de plată, totul e OK,
                doar așteaptă reload-ul. Total: <strong>{formatRon(order.total_cents / 100)}</strong>.
              </p>
            )}
            {isCash && (
              <p>
                Total: <strong>{formatRon(order.total_cents / 100)}</strong>.
                Plata se face la livrare. Curierul te va contacta cu detaliile.
                <br />
                Îți trimitem un email cu confirmarea.
              </p>
            )}
          </>
        ) : (
          <p>
            Nu am găsit nicio comandă cu numărul cerut. Dacă ai plasat o comandă
            și nu vezi confirmarea, contactează-ne la{" "}
            <a href="mailto:contact@domeniul-locus.ro">contact@domeniul-locus.ro</a>.
          </p>
        )}

        <Link href="/" className="btn">
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
    </main>
  );
}

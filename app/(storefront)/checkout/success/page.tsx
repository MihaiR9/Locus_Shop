import Link from "next/link";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatRon } from "@/lib/wines";

export const metadata = {
  title: "Comandă confirmată · Domeniul Locus",
};

// Order details aren't cacheable across users — render fresh each request.
export const dynamic = "force-dynamic";

type Search = { id?: string };

type OrderRow = {
  id: string;
  order_number: string;
  status: string;
  total_cents: number;
  payment_method: string;
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const { id } = await searchParams;

  let order: OrderRow | null = null;
  if (id) {
    const supabase = getSupabaseAdminClient();
    const { data } = await supabase
      .from("orders")
      .select("id, order_number, status, total_cents, payment_method")
      .eq("order_number", id)
      .maybeSingle();
    order = data;
  }

  return (
    <main className="checkout-success">
      <div className="success-card">
        <div className="eyebrow" style={{ justifyContent: "center", marginBottom: 18 }}>
          {order ? "comandă înregistrată" : "comandă"}
        </div>
        <h1>{order ? "mulțumim." : "comandă negăsită"}</h1>

        {order ? (
          <>
            <div className="order-no">#{order.order_number}</div>
            <p>
              Am primit comanda ta. Total:{" "}
              <strong>{formatRon(order.total_cents / 100)}</strong>.
              <br />
              {order.payment_method === "card-online"
                ? "Următorul pas: redirect către pagina de plată (în construcție — Faza 2)."
                : "Plata se face la livrare. Curierul te va contacta cu detaliile."}
              <br />
              <br />
              Îți trimitem un email cu confirmarea și detaliile de livrare.
              Vinul, ca și locul, are nevoie de timp.
            </p>
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

import type { Metadata } from "next";
import Link from "next/link";
import { formatRon } from "@/lib/wines";
import { verifyPaymentLink } from "@/lib/payment-link";
import { loadPayableOrder } from "./order";
import { PayButton } from "./pay-button";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Finalizează plata",
  robots: { index: false, follow: false },
};

type Params = { orderNumber: string };
type Search = { exp?: string; sig?: string };

export default async function PaymentLinkPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  const { orderNumber: raw } = await params;
  const { exp, sig } = await searchParams;
  const orderNumber = decodeURIComponent(raw);

  const link = verifyPaymentLink(orderNumber, exp, sig);
  if (link !== "valid") {
    return (
      <Notice title={link === "expired" ? "link expirat." : "link invalid."}>
        {link === "expired"
          ? "Linkul de plată a fost valabil 7 zile și nu mai poate fi folosit."
          : "Linkul de plată nu e valid."}{" "}
        Dacă vrei vinurile în continuare, poți plasa o comandă nouă sau ne
        poți scrie la{" "}
        <a href="mailto:office@domeniul-locus.ro">office@domeniul-locus.ro</a>.
      </Notice>
    );
  }

  const result = await loadPayableOrder(orderNumber);
  if (result.state === "paid") {
    return (
      <Notice title="deja plătită." href="/" cta="înapoi la domeniu">
        Comanda <b>#{orderNumber}</b> e plătită. Confirmarea a plecat pe email.
      </Notice>
    );
  }
  if (result.state !== "payable") {
    return (
      <Notice title="comandă închisă.">
        Comanda <b>#{orderNumber}</b> nu mai poate fi plătită. Scrie-ne la{" "}
        <a href="mailto:office@domeniul-locus.ro">office@domeniul-locus.ro</a>{" "}
        dacă vrei s-o reluăm.
      </Notice>
    );
  }

  const order = result.order;

  return (
    <main className="cs-page">
      <div className="cs-empty pay-link">
        <div className="eyebrow" style={{ marginBottom: 18 }}>
          comanda #{order.orderNumber}
        </div>
        <h1 className="cs-empty-h1">aproape gata.</h1>
        <p className="cs-empty-p">
          Comanda e salvată așa cum ai lăsat-o. Plata se face pe pagina
          securizată Stripe.
        </p>

        <ul className="pay-link-items">
          {order.items.map((it) => (
            <li key={it.code}>
              <span>
                {it.name} <small>{it.code} · ×{it.qty}</small>
              </span>
              <span>{formatRon((it.unitPriceCents * it.qty) / 100)}</span>
            </li>
          ))}
          <li>
            <span>Transport</span>
            <span>
              {order.shippingCents === 0
                ? "gratuit"
                : formatRon(order.shippingCents / 100)}
            </span>
          </li>
          {order.discountCents > 0 && (
            <li>
              <span>Reducere</span>
              <span>−{formatRon(order.discountCents / 100)}</span>
            </li>
          )}
          {order.sgrCents > 0 && (
            <li>
              <span>Garanție SGR</span>
              <span>{formatRon(order.sgrCents / 100)}</span>
            </li>
          )}
          <li className="pay-link-total">
            <span>Total</span>
            <span>{formatRon(order.totalCents / 100)}</span>
          </li>
        </ul>

        <PayButton
          orderNumber={order.orderNumber}
          exp={exp ?? ""}
          sig={sig ?? ""}
          label={`Plătește ${formatRon(order.totalCents / 100)}`}
        />
      </div>
    </main>
  );
}

function Notice({
  title,
  children,
  href = "/shop",
  cta = "vezi vinurile",
}: {
  title: string;
  children: React.ReactNode;
  href?: string;
  cta?: string;
}) {
  return (
    <main className="cs-page">
      <div className="cs-empty">
        <div className="eyebrow" style={{ marginBottom: 18 }}>plată</div>
        <h1 className="cs-empty-h1">{title}</h1>
        <p className="cs-empty-p">{children}</p>
        <Link href={href} className="cs-cta">
          {cta}
          <svg className="arrow" viewBox="0 0 24 12" aria-hidden="true">
            <use href="#arrow-right" />
          </svg>
        </Link>
      </div>
    </main>
  );
}

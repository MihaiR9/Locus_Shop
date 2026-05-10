import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BottleSvg } from "@/components/landing/bottle-svg";
import { formatRon } from "@/lib/wines";
import { getCurrentUser } from "@/lib/auth/current-user";
import {
  getMyOrder,
  ronFromCents,
  STATUS_LABEL,
} from "@/lib/account/orders";

const RO_DATETIME = new Intl.DateTimeFormat("ro-RO", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

type Params = { orderNumber: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { orderNumber } = await params;
  return { title: `Comanda ${orderNumber} · Cont` };
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { orderNumber } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/cont/login");

  const order = await getMyOrder(user.customerId, orderNumber);
  if (!order) notFound();

  const timeline = [
    { label: "creată", at: order.created_at },
    { label: "plată", at: order.paid_at },
    { label: "expediere", at: order.shipped_at },
    { label: "livrare", at: order.delivered_at },
  ];

  const paymentLabel =
    order.payment_method === "card-online"
      ? "card online"
      : order.payment_method === "card-livrare"
        ? "card la livrare"
        : "ramburs la livrare";

  const shippingLabel =
    order.shipping_method === "ridicare" ? "ridicare personală" : "curier";

  const shippingCity = order.shipping_address?.city;

  return (
    <>
      <div className="eyebrow">comandă · {STATUS_LABEL[order.status]}</div>

      <div className="order-detail-head">
        <div>
          <h1>{order.order_number}</h1>
          <div className="order-meta">
            <span>
              <strong>Plasată:</strong>{" "}
              {RO_DATETIME.format(new Date(order.created_at))}
            </span>
            <span>
              <strong>Plată:</strong> {paymentLabel}
            </span>
            <span>
              <strong>Livrare:</strong> {shippingLabel}
              {shippingCity ? ` · ${shippingCity}` : ""}
            </span>
            {order.awb_number && (
              <span>
                <strong>AWB:</strong> {order.awb_number}
              </span>
            )}
          </div>
        </div>
        <span className="status-pill" data-status={order.status}>
          {STATUS_LABEL[order.status]}
        </span>
      </div>

      <section className="order-timeline" aria-label="Parcurs comandă">
        <ol>
          {timeline.map((step) => (
            <li
              key={step.label}
              className={step.at ? "is-done" : "is-pending"}
            >
              <strong>{step.label}</strong>
              <span>
                {step.at ? RO_DATETIME.format(new Date(step.at)) : "—"}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="cont-section">
        <div className="cont-section-head">
          <h2>Articole ({order.items.length})</h2>
        </div>
        <div className="order-items-list">
          {order.items.map((item) => (
            <div key={item.id} className="order-item-row">
              <div className="img">
                <BottleSvg
                  color={item.product?.bottle_color ?? "white"}
                  gama={item.product?.gama ?? "cuvinte"}
                  code={item.code}
                />
              </div>
              <div className="body">
                <div className="meta">
                  {item.product?.gama ?? "—"} · {item.code} · cantitate{" "}
                  {item.qty}
                </div>
                <div className="name">{item.name}</div>
                <div
                  className="meta"
                  style={{
                    textTransform: "none",
                    letterSpacing: "0.04em",
                    fontSize: 11,
                    marginTop: 2,
                  }}
                >
                  {formatRon(ronFromCents(item.unit_price_cents))} / sticlă
                </div>
              </div>
              <div className="price">
                {formatRon(ronFromCents(item.unit_price_cents * item.qty))}
              </div>
            </div>
          ))}
        </div>

        <div className="order-totals-row">
          <span>Subtotal</span>
          <span>{formatRon(ronFromCents(order.subtotal_cents))}</span>
        </div>
        <div className="order-totals-row">
          <span>Transport</span>
          <span>
            {order.shipping_cents === 0
              ? "gratuit"
              : formatRon(ronFromCents(order.shipping_cents))}
          </span>
        </div>
        {order.discount_cents > 0 && (
          <div className="order-totals-row">
            <span>Voucher</span>
            <span>−{formatRon(ronFromCents(order.discount_cents))}</span>
          </div>
        )}
        <div className="order-total-final">
          <span>Total</span>
          <span>{formatRon(ronFromCents(order.total_cents))}</span>
        </div>
      </section>

      <section className="cont-section">
        <div className="cont-section-head">
          <h2>Acțiuni</h2>
        </div>

        <div className="order-actions">
          <button
            type="button"
            disabled
            title="Disponibil după integrarea Smartbill"
          >
            Descarcă factura
          </button>
          <Link href="/contact">Întrebare despre comandă</Link>
        </div>
      </section>
    </>
  );
}

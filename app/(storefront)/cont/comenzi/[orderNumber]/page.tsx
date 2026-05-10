import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BottleSvg } from "@/components/landing/bottle-svg";
import { formatRon } from "@/lib/wines";
import { getMockOrder, STATUS_LABEL } from "@/lib/mock-account";

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
  const order = getMockOrder(orderNumber);
  if (!order) notFound();

  // Timeline points: created → paid → shipped → delivered (each may be pending)
  const timeline = [
    { label: "creată", at: order.createdAt },
    { label: "plată", at: order.paidAt },
    { label: "expediere", at: order.shippedAt },
    { label: "livrare", at: order.deliveredAt },
  ];

  const paymentLabel =
    order.paymentMethod === "card-online"
      ? "card online"
      : order.paymentMethod === "card-livrare"
        ? "card la livrare"
        : "ramburs la livrare";

  const shippingLabel =
    order.shippingMethod === "ridicare" ? "ridicare personală" : "curier";

  return (
    <>
      <div className="eyebrow">comandă · {STATUS_LABEL[order.status]}</div>

      <div className="order-detail-head">
        <div>
          <h1>{order.orderNumber}</h1>
          <div className="order-meta">
            <span>
              <strong>Plasată:</strong> {RO_DATETIME.format(new Date(order.createdAt))}
            </span>
            <span>
              <strong>Plată:</strong> {paymentLabel}
            </span>
            <span>
              <strong>Livrare:</strong> {shippingLabel}
              {order.shippingCity ? ` · ${order.shippingCity}` : ""}
            </span>
            {order.trackingAwb && (
              <span>
                <strong>AWB:</strong> {order.trackingAwb}
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
                {step.at
                  ? RO_DATETIME.format(new Date(step.at))
                  : "—"}
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
            <div key={item.code} className="order-item-row">
              <div className="img">
                <BottleSvg
                  color={item.bottleColor}
                  gama={item.gama}
                  code={item.code}
                />
              </div>
              <div className="body">
                <div className="meta">
                  {item.gama} · {item.code} · cantitate {item.qty}
                </div>
                <div className="name">{item.name}</div>
                <div className="meta" style={{ textTransform: "none", letterSpacing: "0.04em", fontSize: 11, marginTop: 2 }}>
                  {formatRon(item.unitPriceRon)} / sticlă
                </div>
              </div>
              <div className="price">
                {formatRon(item.unitPriceRon * item.qty)}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "var(--font-mono), monospace",
            fontSize: 13,
            color: "var(--ink-soft)",
            padding: "8px 0",
          }}
        >
          <span>Subtotal</span>
          <span>{formatRon(order.subtotalRon)}</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "var(--font-mono), monospace",
            fontSize: 13,
            color: "var(--ink-soft)",
            padding: "8px 0",
          }}
        >
          <span>Transport</span>
          <span>{order.shippingRon === 0 ? "gratuit" : formatRon(order.shippingRon)}</span>
        </div>
        {order.discountRon > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontFamily: "var(--font-mono), monospace",
              fontSize: 13,
              color: "var(--ink-soft)",
              padding: "8px 0",
            }}
          >
            <span>Voucher</span>
            <span>−{formatRon(order.discountRon)}</span>
          </div>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            paddingTop: 16,
            marginTop: 8,
            borderTop: "1px solid var(--line)",
            fontFamily: "var(--font-serif), Georgia, serif",
            fontSize: 24,
            color: "var(--ink)",
          }}
        >
          <span>Total</span>
          <span>{formatRon(order.totalRon)}</span>
        </div>
      </section>

      <section className="cont-section">
        <div className="cont-section-head">
          <h2>Acțiuni</h2>
        </div>

        <div className="order-actions">
          <button type="button" disabled title="Disponibil după integrarea Smartbill">
            Descarcă factura
          </button>
          <Link href="/contact">
            Întrebare despre comandă
          </Link>
        </div>
      </section>
    </>
  );
}

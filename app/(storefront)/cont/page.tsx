import type { Metadata } from "next";
import Link from "next/link";
import { OrderCard } from "@/components/account/order-card";
import { MOCK_ORDERS, MOCK_USER } from "@/lib/mock-account";
import { formatRon } from "@/lib/wines";

export const metadata: Metadata = {
  title: "Cont · Acasă",
};

export default function ContDashboardPage() {
  const recent = MOCK_ORDERS.slice(0, 3);
  const totalSpentRon = MOCK_ORDERS
    .filter((o) => o.status !== "cancelled" && o.status !== "refunded")
    .reduce((s, o) => s + o.totalRon, 0);
  const ordersCount = MOCK_ORDERS.filter((o) => o.status !== "cancelled").length;
  const memberSince = new Date(MOCK_USER.createdAt).toLocaleDateString("ro-RO", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <div className="eyebrow">acasă cont</div>
      <h1>Selecția ta.</h1>
      <p className="lead-mono">
        Aici găsești comenzile, adresele salvate și preferințele de cont.
        Avem grijă să fie totul la îndemână — fără pași în plus.
      </p>

      <div className="cont-quick">
        <Link href="/cont/comenzi" className="cont-quick-tile">
          <span className="label">Comenzi</span>
          <span className="value">{ordersCount}</span>
          <svg
            className="arrow-svg"
            width="16"
            height="8"
            viewBox="0 0 24 12"
            aria-hidden="true"
          >
            <use href="#arrow-right" />
          </svg>
        </Link>
        <div className="cont-quick-tile">
          <span className="label">Total cheltuit</span>
          <span className="value">{formatRon(totalSpentRon)}</span>
          <span
            style={{
              marginTop: "auto",
              paddingTop: 16,
              fontFamily: "var(--font-mono), monospace",
              fontSize: 10,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "var(--ink-mute)",
            }}
          >
            din {memberSince}
          </span>
        </div>
        <Link href="/shop" className="cont-quick-tile">
          <span className="label">Comandă din nou</span>
          <span className="value">vinurile</span>
          <svg
            className="arrow-svg"
            width="16"
            height="8"
            viewBox="0 0 24 12"
            aria-hidden="true"
          >
            <use href="#arrow-right" />
          </svg>
        </Link>
      </div>

      <section className="cont-section">
        <div className="cont-section-head">
          <h2>Comenzi recente</h2>
          <Link href="/cont/comenzi" className="more">
            vezi toate →
          </Link>
        </div>
        {recent.length === 0 ? (
          <p
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 13,
              color: "var(--ink-soft)",
              padding: "24px 0",
            }}
          >
            Nu ai comenzi încă.{" "}
            <Link href="/shop" style={{ color: "var(--ink)" }}>
              Începe cu o sticlă
            </Link>
            .
          </p>
        ) : (
          <div>
            {recent.map((o) => (
              <OrderCard key={o.orderNumber} order={o} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { OrderCard } from "@/components/account/order-card";
import { getCurrentUser } from "@/lib/auth/current-user";
import { listMyOrders, ronFromCents } from "@/lib/account/orders";
import { listMyReturns } from "@/lib/account/returns";
import { formatRon } from "@/lib/wines";

export const metadata: Metadata = {
  title: "Cont · Acasă",
};

export default async function ContDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/cont/login");

  const [orders, returns] = await Promise.all([
    listMyOrders(user.customerId),
    listMyReturns(user.customerId),
  ]);

  const recent = orders.slice(0, 3);
  const totalSpentCents = orders
    .filter((o) => o.status !== "cancelled" && o.status !== "refunded")
    .reduce((s, o) => s + o.total_cents, 0);
  const ordersCount = orders.filter((o) => o.status !== "cancelled").length;
  const openReturnsCount = returns.filter(
    (r) => r.status !== "completed" && r.status !== "rejected",
  ).length;
  const memberSince = new Date(user.createdAt).toLocaleDateString("ro-RO", {
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
          <span className="value">
            {formatRon(ronFromCents(totalSpentCents))}
          </span>
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
        <Link href="/cont/retururi" className="cont-quick-tile">
          <span className="label">Retururi</span>
          <span className="value">
            {openReturnsCount > 0 ? openReturnsCount : "—"}
          </span>
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
            {openReturnsCount > 0 ? "în curs" : "niciun retur"}
          </span>
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
              <OrderCard key={o.id} order={o} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

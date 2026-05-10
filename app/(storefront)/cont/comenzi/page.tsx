import type { Metadata } from "next";
import { OrderCard } from "@/components/account/order-card";
import { MOCK_ORDERS } from "@/lib/mock-account";

export const metadata: Metadata = {
  title: "Comenzi · Cont",
};

export default function OrdersListPage() {
  const orders = [...MOCK_ORDERS].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <>
      <div className="eyebrow">istoric</div>
      <h1>Comenzile tale.</h1>
      <p className="lead-mono">
        Toate comenzile, ordonate de la cea mai recentă. Click pe oricare
        pentru detalii, factură și retur.
      </p>

      <section className="cont-section">
        <div className="cont-section-head">
          <h2>{orders.length} {orders.length === 1 ? "comandă" : "comenzi"}</h2>
        </div>
        {orders.length === 0 ? (
          <p
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 13,
              color: "var(--ink-soft)",
              padding: "24px 0",
            }}
          >
            Nu ai nicio comandă încă.
          </p>
        ) : (
          <div>
            {orders.map((o) => (
              <OrderCard key={o.orderNumber} order={o} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

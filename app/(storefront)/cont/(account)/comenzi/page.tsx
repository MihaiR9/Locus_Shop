import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { OrderCard } from "@/components/account/order-card";
import { getCurrentUser } from "@/lib/auth/current-user";
import { listMyOrders } from "@/lib/account/orders";

export const metadata: Metadata = {
  title: "Comenzi · Cont",
};

export default async function OrdersListPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/cont/login");

  const orders = await listMyOrders(user.customerId);

  return (
    <>
      <div className="eyebrow">istoric</div>
      <h1>Comenzile tale.</h1>
      <p className="lead-mono">
        Toate comenzile, ordonate de la cea mai recentă. Click pe oricare
        pentru detalii și status.
      </p>

      <section className="cont-section">
        <div className="cont-section-head">
          <h2>
            {orders.length} {orders.length === 1 ? "comandă" : "comenzi"}
          </h2>
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
            Nu ai nicio comandă încă.{" "}
            <a href="/shop" style={{ color: "var(--ink)" }}>
              Începe cu o sticlă
            </a>
            .
          </p>
        ) : (
          <div>
            {orders.map((o) => (
              <OrderCard key={o.id} order={o} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

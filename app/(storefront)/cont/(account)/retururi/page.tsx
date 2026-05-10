import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import {
  getReturnPickerData,
  listMyReturns,
  PRODUCT_STATE_LABEL,
  RETURN_STATUS_LABEL,
} from "@/lib/account/returns";

export const metadata: Metadata = {
  title: "Retururi · Cont",
};

const RO_DATE = new Intl.DateTimeFormat("ro-RO", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default async function ReturnsListPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/cont/login");

  const [returns, picker] = await Promise.all([
    listMyReturns(user.customerId),
    getReturnPickerData(user.customerId),
  ]);

  const eligibleCount = picker.eligible.reduce(
    (s, g) => s + g.items.filter((i) => !i.alreadyReturned).length,
    0,
  );

  return (
    <>
      <div className="eyebrow">retururi · OUG 34/2014</div>
      <h1>Retururile tale.</h1>
      <p className="lead-mono">
        Retururi în curs și istoricul lor. Termenul legal e de 14 zile
        calendaristice de la primirea coletului — sticlele nedeschise sunt
        eligibile, cele deschise nu intră în drept de retragere.
      </p>

      <section className="cont-section">
        <div className="cont-section-head">
          <h2>
            {returns.length} {returns.length === 1 ? "retur" : "retururi"}
          </h2>
          {eligibleCount > 0 && (
            <Link
              href="/cont/retururi/nou"
              className="more"
              style={{
                border: "1px solid var(--ink)",
                padding: "10px 18px",
                color: "var(--ink)",
              }}
            >
              + adaugă retur
            </Link>
          )}
        </div>

        {returns.length === 0 && eligibleCount === 0 && (
          <div className="return-empty">
            <h3>Niciun retur până acum.</h3>
            <p>
              Nu ai produse eligibile pentru retur acum (termenul de 14 zile
              de la livrare a expirat sau nu există comenzi recente).
              Pentru orice problemă cu o comandă, scrie-ne la{" "}
              <a
                href="mailto:contact@domeniul-locus.ro"
                style={{ color: "var(--ink)" }}
              >
                contact@domeniul-locus.ro
              </a>
              .
            </p>
          </div>
        )}

        {returns.length === 0 && eligibleCount > 0 && (
          <div className="return-empty">
            <h3>Niciun retur până acum.</h3>
            <p>
              Ai {eligibleCount}{" "}
              {eligibleCount === 1 ? "produs eligibil" : "produse eligibile"}{" "}
              pentru retur. Inițiezi cererea în 3 pași — selectezi comanda și
              produsele, alegi motivul, alegi rezolvarea.
            </p>
            <Link href="/cont/retururi/nou" className="btn">
              Adaugă cerere de retur
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
        )}

        {returns.length > 0 && (
          <div>
            {returns.map((r) => {
              const firstItem = r.items[0];
              const itemsLabel =
                r.items.length === 0
                  ? "—"
                  : r.items.length === 1
                    ? `${firstItem.qty} × ${firstItem.product_name}`
                    : `${firstItem.qty} × ${firstItem.product_name} + încă ${
                        r.items.length - 1
                      }`;
              return (
                <Link
                  key={r.return_number}
                  href={`/cont/retururi/${encodeURIComponent(r.return_number)}`}
                  className="return-row"
                >
                  <div className="body">
                    <div className="meta">
                      {r.return_number} ·{" "}
                      {RO_DATE.format(new Date(r.created_at))}
                      {r.order?.order_number
                        ? ` · ${r.order.order_number}`
                        : ""}
                    </div>
                    <div className="number">{itemsLabel}</div>
                    <div className="product">
                      {PRODUCT_STATE_LABEL[r.product_state]}
                    </div>
                  </div>
                  <span
                    className="status-pill"
                    data-status={
                      r.status === "rejected"
                        ? "cancelled"
                        : r.status === "completed"
                          ? "delivered"
                          : "shipped"
                    }
                  >
                    {RETURN_STATUS_LABEL[r.status]}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <p
        style={{
          marginTop: 32,
          fontFamily: "var(--font-mono), monospace",
          fontSize: 11,
          lineHeight: 1.7,
          color: "var(--ink-mute)",
        }}
      >
        Detalii complete în{" "}
        <Link href="/retur" style={{ color: "var(--ink-soft)" }}>
          Politica de retur
        </Link>
        . Sticlele deschise sau deteriorate după primire nu intră în dreptul
        de retragere de 14 zile (art. 16 OUG 34/2014).
      </p>
    </>
  );
}

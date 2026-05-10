import type { Metadata } from "next";
import Link from "next/link";
import { BottleSvg } from "@/components/landing/bottle-svg";
import {
  MOCK_RETURNS,
  PRODUCT_STATE_LABEL,
  RETURN_STATUS_LABEL,
  getEligibleReturnProducts,
} from "@/lib/mock-account";

export const metadata: Metadata = {
  title: "Retururi · Cont",
};

const RO_DATE = new Intl.DateTimeFormat("ro-RO", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default function ReturnsListPage() {
  const returns = [...MOCK_RETURNS].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const eligibleCount = getEligibleReturnProducts().length;

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
              Ai {eligibleCount} {eligibleCount === 1 ? "produs eligibil" : "produse eligibile"}{" "}
              pentru retur. Inițiezi cererea în 3 pași — selectezi produsul,
              alegi motivul, alegi rezolvarea.
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
            {returns.map((r) => (
              <Link
                key={r.returnNumber}
                href={`/cont/retururi/${encodeURIComponent(r.returnNumber)}`}
                className="return-row"
              >
                <div className="img">
                  <BottleSvg
                    color={r.productBottleColor}
                    gama={r.productGama}
                    code={r.productCode}
                  />
                </div>
                <div className="body">
                  <div className="meta">
                    {r.returnNumber} · {RO_DATE.format(new Date(r.createdAt))}
                  </div>
                  <div className="number">{r.productName}</div>
                  <div className="product">
                    {r.productGama} · {r.productCode} · {PRODUCT_STATE_LABEL[r.productState]}
                  </div>
                </div>
                <span className="status-pill" data-status={r.status === "rejected" ? "cancelled" : r.status === "completed" ? "delivered" : "shipped"}>
                  {RETURN_STATUS_LABEL[r.status]}
                </span>
              </Link>
            ))}
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

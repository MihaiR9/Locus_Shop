import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BottleSvg } from "@/components/landing/bottle-svg";
import {
  getMockReturn,
  PRODUCT_STATE_LABEL,
  RESOLUTION_LABEL,
  RETURN_STATUS_LABEL,
  type MockReturnStatus,
} from "@/lib/mock-account";

const RO_DATETIME = new Intl.DateTimeFormat("ro-RO", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

type Params = { returnId: string };
type SearchParams = Promise<{ "just-created"?: string }>;

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { returnId } = await params;
  return { title: `Retur ${returnId} · Cont` };
}

const TIMELINE: { key: MockReturnStatus; label: string }[] = [
  { key: "pending", label: "în analiză" },
  { key: "approved", label: "aprobat · AWB trimis" },
  { key: "in_transit", label: "în transport" },
  { key: "completed", label: "finalizat" },
];

const STATUS_ORDER: Record<MockReturnStatus, number> = {
  pending: 0,
  approved: 1,
  in_transit: 2,
  completed: 3,
  rejected: -1,
};

export default async function ReturnDetailPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: SearchParams;
}) {
  const { returnId } = await params;
  const sp = await searchParams;
  const justCreated = sp["just-created"] === "1";
  const ret = getMockReturn(returnId);

  // Just-created tickets aren't in MOCK_RETURNS yet — show confirmation view.
  if (!ret && justCreated) {
    return (
      <>
        <div className="eyebrow">retur · înregistrat</div>
        <h1>{returnId}</h1>
        <p className="lead-mono">
          Mulțumim — am primit cererea ta. O vom analiza și îți răspundem prin
          email în maxim 24h. Dacă e aprobată, primești și AWB-ul de retur tot
          pe email.
        </p>

        <section className="cont-section">
          <div className="return-empty">
            <h3>Cererea ta e în analiză.</h3>
            <p>
              Statusul curent: <strong>în analiză</strong>. Te ținem la curent
              pe email pentru fiecare schimbare. Poți reveni oricând în{" "}
              <Link
                href="/cont/retururi"
                style={{ color: "var(--ink-soft)" }}
              >
                Retururi
              </Link>{" "}
              ca să vezi statusul.
            </p>
            <Link href="/cont/retururi" className="btn">
              ← înapoi la retururi
            </Link>
          </div>
        </section>
      </>
    );
  }

  if (!ret) notFound();

  const currentIdx = STATUS_ORDER[ret.status];
  const isRejected = ret.status === "rejected";

  return (
    <>
      <div className="eyebrow">retur · {RETURN_STATUS_LABEL[ret.status]}</div>

      <div className="order-detail-head">
        <div>
          <h1>{ret.returnNumber}</h1>
          <div className="order-meta">
            <span>
              <strong>Comandă:</strong>{" "}
              <Link
                href={`/cont/comenzi/${encodeURIComponent(ret.orderNumber)}`}
                style={{ color: "var(--ink-soft)" }}
              >
                {ret.orderNumber}
              </Link>
            </span>
            <span>
              <strong>Trimisă:</strong>{" "}
              {RO_DATETIME.format(new Date(ret.createdAt))}
            </span>
            {ret.updatedAt && (
              <span>
                <strong>Actualizat:</strong>{" "}
                {RO_DATETIME.format(new Date(ret.updatedAt))}
              </span>
            )}
          </div>
        </div>
        <span
          className="status-pill"
          data-status={
            isRejected
              ? "cancelled"
              : ret.status === "completed"
                ? "delivered"
                : "shipped"
          }
        >
          {RETURN_STATUS_LABEL[ret.status]}
        </span>
      </div>

      {!isRejected && (
        <section className="order-timeline" aria-label="Parcurs retur">
          <ol>
            {TIMELINE.map((step, i) => (
              <li
                key={step.key}
                className={i <= currentIdx ? "is-done" : "is-pending"}
              >
                <strong>{step.label}</strong>
                <span>
                  {i === currentIdx
                    ? "în curs"
                    : i < currentIdx
                      ? "finalizat"
                      : "—"}
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="cont-section">
        <div className="cont-section-head">
          <h2>Produs</h2>
        </div>
        <div className="order-item-row">
          <div className="img">
            <BottleSvg
              color={ret.productBottleColor}
              gama={ret.productGama}
              code={ret.productCode}
            />
          </div>
          <div className="body">
            <div className="meta">
              {ret.productGama} · {ret.productCode}
            </div>
            <div className="name">{ret.productName}</div>
            <div
              className="meta"
              style={{
                textTransform: "none",
                letterSpacing: "0.04em",
                fontSize: 11,
                marginTop: 2,
              }}
            >
              stare: {PRODUCT_STATE_LABEL[ret.productState]}
            </div>
          </div>
        </div>
      </section>

      <section className="cont-section">
        <div className="cont-section-head">
          <h2>Detalii</h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 14,
            fontFamily: "var(--font-mono), monospace",
            fontSize: 13,
            lineHeight: 1.75,
            color: "var(--ink-soft)",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "var(--ink-mute)",
                marginBottom: 4,
              }}
            >
              Motiv invocat
            </div>
            {ret.reason}
          </div>
          <div>
            <div
              style={{
                fontSize: 10,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "var(--ink-mute)",
                marginBottom: 4,
              }}
            >
              Rezolvare cerută
            </div>
            {RESOLUTION_LABEL[ret.resolution]}
          </div>
        </div>
      </section>

      <div className="order-actions" style={{ marginTop: 24 }}>
        <Link href="/cont/retururi">← înapoi la retururi</Link>
        <Link href="/contact">Întrebare despre retur</Link>
      </div>
    </>
  );
}

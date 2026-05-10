import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import {
  getMyReturn,
  PRODUCT_STATE_LABEL,
  RESOLUTION_LABEL,
  RETURN_STATUS_LABEL,
  type ReturnStatus,
} from "@/lib/account/returns";
import { formatRon } from "@/lib/wines";
import { ronFromCents } from "@/lib/account/orders";

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

const TIMELINE: { key: ReturnStatus; label: string }[] = [
  { key: "pending", label: "în analiză" },
  { key: "approved", label: "aprobat · AWB trimis" },
  { key: "in_transit", label: "în transport" },
  { key: "completed", label: "finalizat" },
];

const STATUS_ORDER: Record<ReturnStatus, number> = {
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

  const user = await getCurrentUser();
  if (!user) redirect("/cont/login");

  const ret = await getMyReturn(user.customerId, returnId);

  if (!ret) {
    if (justCreated) {
      // Race window between insert + RLS read; show generic confirmation.
      return (
        <>
          <div className="eyebrow">retur · înregistrat</div>
          <h1>{returnId}</h1>
          <p className="lead-mono">
            Mulțumim — am primit cererea ta. O vom analiza și îți răspundem
            prin email în maxim 24h. Dacă e aprobată, primești și AWB-ul de
            retur tot pe email.
          </p>
        </>
      );
    }
    notFound();
  }

  const currentIdx = STATUS_ORDER[ret.status];
  const isRejected = ret.status === "rejected";

  return (
    <>
      <div className="eyebrow">retur · {RETURN_STATUS_LABEL[ret.status]}</div>

      <div className="order-detail-head">
        <div>
          <h1>{ret.return_number}</h1>
          <div className="order-meta">
            {ret.order?.order_number && (
              <span>
                <strong>Comandă:</strong>{" "}
                <Link
                  href={`/cont/comenzi/${encodeURIComponent(ret.order.order_number)}`}
                  style={{ color: "var(--ink-soft)" }}
                >
                  {ret.order.order_number}
                </Link>
              </span>
            )}
            <span>
              <strong>Trimisă:</strong>{" "}
              {RO_DATETIME.format(new Date(ret.created_at))}
            </span>
            {ret.updated_at && ret.updated_at !== ret.created_at && (
              <span>
                <strong>Actualizat:</strong>{" "}
                {RO_DATETIME.format(new Date(ret.updated_at))}
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
          <h2>
            Produse ({ret.items.length})
          </h2>
        </div>
        <div className="order-items-list">
          {ret.items.map((it) => (
            <div key={it.id} className="order-item-row">
              <div className="body">
                <div className="meta">{it.product_code} · cantitate {it.qty}</div>
                <div className="name">{it.product_name}</div>
                <div
                  className="meta"
                  style={{
                    textTransform: "none",
                    letterSpacing: "0.04em",
                    fontSize: 11,
                    marginTop: 2,
                  }}
                >
                  stare: {PRODUCT_STATE_LABEL[ret.product_state]}
                </div>
              </div>
              <div className="price">
                {formatRon(ronFromCents(it.unit_price_cents * it.qty))}
              </div>
            </div>
          ))}
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
          {ret.reason && (
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
          )}
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

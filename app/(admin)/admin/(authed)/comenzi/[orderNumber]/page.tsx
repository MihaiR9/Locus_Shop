import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { formatRon, getOrderDetail } from "@/lib/admin/orders-queries";
import {
  FulfillmentBadge,
  PaymentBadge,
} from "../../../_components/payment-fulfillment-badges";
import { formatRelDate } from "../../../_components/rel-date";
import { ActionsPanel } from "./actions-panel";

const RO_DATETIME = new Intl.DateTimeFormat("ro-RO", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const PAY_METHOD_LABEL: Record<string, string> = {
  "card-online": "Card online (Stripe)",
  "card-livrare": "Card la livrare",
  ramburs: "Ramburs la livrare",
};

const SHIP_METHOD_LABEL: Record<string, string> = {
  curier: "Curier",
  ridicare: "Ridicare personală",
};

const EVENT_LABEL: Record<string, string> = {
  payment_succeeded: "Plată confirmată",
  payment_failed: "Plată eșuată",
  session_expired: "Sesiune Stripe expirată",
  marked_shipped: "Marcată expediată",
  marked_delivered: "Marcată livrată",
  refund_requested: "Rambursare inițiată",
  refund_full: "Rambursare completă",
  refund_partial: "Rambursare parțială",
  stock_decrement_failed: "⚠ Decrement stoc eșuat",
  stock_restore_failed: "⚠ Restore stoc eșuat",
  manual_cancel: "Anulată manual",
};

type Params = { orderNumber: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { orderNumber } = await params;
  return { title: `${orderNumber} · Comenzi · Admin` };
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { orderNumber } = await params;
  const order = await getOrderDetail(orderNumber);
  if (!order) notFound();

  const ship = (order.shippingAddress ?? {}) as Record<string, string | undefined>;
  const bill = (order.billing ?? {}) as Record<string, string | undefined>;

  return (
    <>
      <div className="mb-2">
        <Link
          href="/admin/comenzi"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 transition-colors hover:text-zinc-900"
        >
          <ArrowLeft className="h-3 w-3" />
          Înapoi la comenzi
        </Link>
      </div>

      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="admin-page-title">{order.orderNumber}</h1>
            <PaymentBadge status={order.paymentStatus} />
            <FulfillmentBadge status={order.status} />
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            {formatRelDate(order.createdAt)} · {order.items.length}{" "}
            {order.items.length === 1 ? "articol" : "articole"} ·{" "}
            {PAY_METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod} ·{" "}
            {SHIP_METHOD_LABEL[order.shippingMethod] ?? order.shippingMethod}
          </p>
        </div>
        <div className="text-right">
          <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500">
            Total
          </div>
          <div className="text-xl font-semibold tracking-tight text-zinc-900">
            {formatRon(order.totalCents)}
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* LEFT: articole + sumar + adrese + timeline */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Articole */}
          <section className="rounded-xl border border-zinc-200 bg-white">
            <header className="border-b border-zinc-200 px-6 py-4">
              <h2 className="text-[13px] font-semibold text-zinc-900">
                Articole ({order.items.length})
              </h2>
            </header>
            <div className="divide-y divide-zinc-100">
              {order.items.map((it) => (
                <div
                  key={it.id}
                  className="flex items-center justify-between px-6 py-3"
                >
                  <div>
                    <div className="text-sm font-medium text-zinc-900">
                      {it.name}
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      {it.code} · {it.qty}× {formatRon(it.unitPriceCents)}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-zinc-900">
                    {formatRon(it.unitPriceCents * it.qty)}
                  </div>
                </div>
              ))}
            </div>
            <div className="divide-y divide-zinc-100 border-t border-zinc-200 bg-zinc-50/50">
              <div className="flex justify-between px-6 py-2 text-xs">
                <span className="text-zinc-500">Subtotal</span>
                <span className="text-zinc-900">
                  {formatRon(order.subtotalCents)}
                </span>
              </div>
              <div className="flex justify-between px-6 py-2 text-xs">
                <span className="text-zinc-500">Transport</span>
                <span className="text-zinc-900">
                  {order.shippingCents === 0
                    ? "gratuit"
                    : formatRon(order.shippingCents)}
                </span>
              </div>
              {order.discountCents > 0 && (
                <div className="flex justify-between px-6 py-2 text-xs">
                  <span className="text-zinc-500">Voucher</span>
                  <span className="text-zinc-900">
                    −{formatRon(order.discountCents)}
                  </span>
                </div>
              )}
              <div className="flex justify-between px-6 py-3 text-sm font-semibold">
                <span>Total</span>
                <span>{formatRon(order.totalCents)}</span>
              </div>
            </div>
          </section>

          {/* Adrese */}
          <section className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500">
                Livrare
              </div>
              {order.shippingMethod === "ridicare" ? (
                <div className="text-sm text-zinc-700">
                  Ridicare personală de la centrul de vinificație Buciumeni.
                </div>
              ) : (
                <div className="space-y-1 text-sm text-zinc-800">
                  <div className="font-medium">
                    {String(ship.firstName ?? "")} {String(ship.lastName ?? "")}
                  </div>
                  {ship.address && <div>{String(ship.address)}</div>}
                  {(ship.city || ship.county) && (
                    <div>
                      {String(ship.city ?? "")}
                      {ship.county ? `, ${String(ship.county)}` : ""}
                      {ship.zip ? ` · ${String(ship.zip)}` : ""}
                    </div>
                  )}
                  {ship.phone && (
                    <div className="text-zinc-600">{String(ship.phone)}</div>
                  )}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500">
                Facturare
              </div>
              {bill.type === "juridica" ? (
                <div className="space-y-1 text-sm text-zinc-800">
                  <div className="font-medium">{String(bill.company ?? "")}</div>
                  {bill.cui && <div>CUI {String(bill.cui)}</div>}
                  {bill.regNo && <div>Reg. {String(bill.regNo)}</div>}
                  {bill.hqAddress && (
                    <div className="text-zinc-600">
                      {String(bill.hqAddress)}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-1 text-sm text-zinc-800">
                  <div className="font-medium">
                    {String(bill.firstName ?? "")} {String(bill.lastName ?? "")}
                  </div>
                  {bill.email && (
                    <div className="text-zinc-600">{String(bill.email)}</div>
                  )}
                  {bill.phone && (
                    <div className="text-zinc-600">{String(bill.phone)}</div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Timeline evenimente */}
          <section className="rounded-xl border border-zinc-200 bg-white">
            <header className="border-b border-zinc-200 px-6 py-4">
              <h2 className="text-[13px] font-semibold text-zinc-900">
                Istoric
              </h2>
            </header>
            {order.events.length === 0 ? (
              <div className="px-6 py-8 text-center text-xs text-zinc-500">
                Nu există evenimente încă.
              </div>
            ) : (
              <ol className="divide-y divide-zinc-100">
                {order.events.map((e, idx) => (
                  <li
                    key={`${e.type}-${e.createdAt}-${idx}`}
                    className="flex items-start justify-between gap-4 px-6 py-3"
                  >
                    <div className="min-w-0">
                      <div className="text-sm text-zinc-900">
                        {EVENT_LABEL[e.type] ?? e.type}
                      </div>
                      {e.payload && Object.keys(e.payload).length > 0 && (
                        <div className="mt-0.5 truncate text-[11px] font-mono text-zinc-500">
                          {JSON.stringify(e.payload)}
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 text-[11px] text-zinc-500">
                      {RO_DATETIME.format(new Date(e.createdAt))}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        {/* RIGHT: client + acțiuni + ID-uri externe */}
        <div className="flex flex-col gap-6">
          <section className="rounded-xl border border-zinc-200 bg-white p-5">
            <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500">
              Client
            </div>
            <div className="space-y-1 text-sm text-zinc-800">
              {order.customerName && (
                <div className="font-medium">{order.customerName}</div>
              )}
              <div className="text-zinc-700">{order.customerEmail}</div>
              {order.customerPhone && (
                <div className="text-zinc-600">{order.customerPhone}</div>
              )}
            </div>
          </section>

          <ActionsPanel
            orderNumber={order.orderNumber}
            status={order.status}
            existingAwb={order.awbNumber}
            paymentStatus={order.paymentStatus}
            paymentMethod={order.paymentMethod}
          />

          <section className="rounded-xl border border-zinc-200 bg-white p-5">
            <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500">
              ID-uri externe
            </div>
            <dl className="space-y-2 text-xs">
              <div>
                <dt className="text-zinc-500">Stripe Session</dt>
                <dd className="mt-0.5 font-mono text-zinc-700">
                  {order.stripeSessionId ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">Stripe Payment Intent</dt>
                <dd className="mt-0.5 font-mono text-zinc-700">
                  {order.stripePaymentIntent ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">AWB FanCourier</dt>
                <dd className="mt-0.5 font-mono text-zinc-700">
                  {order.awbNumber ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">Factură FGO</dt>
                <dd className="mt-0.5 font-mono text-zinc-700">
                  {order.smartbillInvoiceId ?? "—"}
                </dd>
              </div>
            </dl>
          </section>
        </div>
      </div>
    </>
  );
}

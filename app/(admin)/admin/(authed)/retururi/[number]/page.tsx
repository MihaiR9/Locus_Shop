import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  Mail,
  Phone,
  Landmark,
} from "lucide-react";
import {
  getReturnByNumber,
  RETURN_STATUS_LABEL,
  RETURN_STATUS_TONE,
  PRODUCT_STATE_LABEL,
  RESOLUTION_LABEL,
  RESOLUTION_TONE,
} from "@/lib/admin/returns-queries";
import { formatRon } from "@/lib/admin/products-queries";
import { formatRelDate } from "../../../_components/rel-date";
import { ReturnActions } from "./actions-panel";

type Params = { number: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { number } = await params;
  return { title: `${number} · Retur · Admin` };
}

export default async function ReturnDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { number } = await params;
  const ret = await getReturnByNumber(number);
  if (!ret) notFound();

  return (
    <>
      <Link
        href="/admin/retururi"
        className="mb-3 inline-flex items-center gap-1.5 text-xs text-zinc-500 transition-colors hover:text-zinc-900"
      >
        <ArrowLeft className="h-3 w-3" />
        Înapoi la retururi
      </Link>

      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="admin-page-title font-mono">{ret.returnNumber}</h1>
            <span
              className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium ${RETURN_STATUS_TONE[ret.status]}`}
            >
              {RETURN_STATUS_LABEL[ret.status]}
            </span>
            <span
              className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium ${RESOLUTION_TONE[ret.resolution]}`}
            >
              {RESOLUTION_LABEL[ret.resolution]}
            </span>
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
            <span>Cerut {formatRelDate(ret.createdAt)}</span>
            {ret.updatedAt !== ret.createdAt && (
              <span>· Actualizat {formatRelDate(ret.updatedAt)}</span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11px] text-zinc-500">Valoare retur</div>
          <div className="text-lg font-semibold text-zinc-900">
            {formatRon(ret.itemsTotalCents)}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          {/* Produse */}
          <Card>
            <SectionHead
              title={`Produse (${ret.itemsCount})`}
              hint={PRODUCT_STATE_LABEL[ret.productState]}
            />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100 text-left text-[11px] uppercase tracking-[0.06em] text-zinc-500">
                    <th className="py-2.5 pl-5 font-medium">Cod</th>
                    <th className="py-2.5 font-medium">Nume</th>
                    <th className="py-2.5 text-right font-medium">Cantitate</th>
                    <th className="py-2.5 text-right font-medium">
                      Preț unitar
                    </th>
                    <th className="py-2.5 pr-5 text-right font-medium">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ret.items.map((it) => (
                    <tr
                      key={it.id}
                      className="border-b border-zinc-100 last:border-0"
                    >
                      <td className="py-2.5 pl-5 font-mono text-xs text-zinc-700">
                        {it.productCode}
                      </td>
                      <td className="py-2.5 text-zinc-900">{it.productName}</td>
                      <td className="py-2.5 text-right text-zinc-700">
                        {it.qty}
                      </td>
                      <td className="py-2.5 text-right text-zinc-700">
                        {formatRon(it.unitPriceCents)}
                      </td>
                      <td className="py-2.5 pr-5 text-right font-medium text-zinc-900">
                        {formatRon(it.qty * it.unitPriceCents)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-zinc-50">
                    <td colSpan={4} className="py-2.5 pl-5 text-xs text-zinc-500">
                      Total sticle: {ret.itemsCount}
                    </td>
                    <td className="py-2.5 pr-5 text-right text-sm font-semibold text-zinc-900">
                      {formatRon(ret.itemsTotalCents)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>

          {/* Motiv */}
          {ret.reason && (
            <Card>
              <SectionHead title="Motiv retur (de la client)" />
              <div className="p-5 pt-0">
                <p className="whitespace-pre-line text-sm text-zinc-700">
                  {ret.reason}
                </p>
              </div>
            </Card>
          )}

          {/* Comanda */}
          <Card>
            <SectionHead title="Comandă asociată" />
            <div className="p-5 pt-0">
              {ret.orderNumber ? (
                <Link
                  href={`/admin/comenzi/${ret.orderNumber}`}
                  className="inline-flex items-center gap-2 text-sm text-zinc-900 hover:underline"
                >
                  <span className="font-mono font-medium">
                    {ret.orderNumber}
                  </span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              ) : (
                <span className="text-sm text-zinc-500">
                  Comanda a fost ștearsă
                </span>
              )}
              <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-2 text-xs text-zinc-600">
                <div>
                  <span className="text-zinc-500">Total comandă: </span>
                  <span className="text-zinc-800">
                    {ret.orderTotalCents !== null
                      ? formatRon(ret.orderTotalCents)
                      : "—"}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500">Plată: </span>
                  <span className="text-zinc-800">
                    {ret.orderPaymentStatus ?? "—"}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500">Livrată: </span>
                  <span className="text-zinc-800">
                    {ret.orderDeliveredAt
                      ? new Date(ret.orderDeliveredAt).toLocaleDateString(
                          "ro-RO",
                        )
                      : "—"}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500">Fulfillment: </span>
                  <span className="text-zinc-800">
                    {ret.orderStatus ?? "—"}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          {/* Client */}
          <Card>
            <SectionHead title="Client" />
            <div className="grid gap-2 p-5 pt-0 text-xs">
              {ret.customerEmail && (
                <Link
                  href={`/admin/clienti/${encodeURIComponent(ret.customerEmail)}`}
                  className="inline-flex items-center gap-1.5 text-zinc-900 hover:underline"
                >
                  <Mail className="h-3 w-3 text-zinc-500" />
                  {ret.customerName ?? ret.customerEmail}
                </Link>
              )}
              {ret.customerEmail && (
                <span className="text-zinc-500">{ret.customerEmail}</span>
              )}
              {ret.customerPhone && (
                <span className="inline-flex items-center gap-1.5 text-zinc-700">
                  <Phone className="h-3 w-3 text-zinc-500" />
                  {ret.customerPhone}
                </span>
              )}
            </div>
          </Card>

          {/* IBAN pentru rambursare */}
          {ret.resolution === "rambursare" && (
            <Card>
              <SectionHead title="IBAN rambursare" />
              <div className="p-5 pt-0">
                {ret.iban ? (
                  <div className="rounded-md bg-zinc-50 p-3">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-zinc-500">
                      <Landmark className="h-3 w-3" />
                      IBAN client
                    </div>
                    <div className="mt-1 font-mono text-sm font-semibold tracking-wider text-zinc-900">
                      {ret.iban}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500">
                    Clientul nu a completat IBAN. Contactează-l pentru date
                    bancare.
                  </p>
                )}
                <p className="mt-2 text-[11px] text-zinc-500">
                  Pentru refund Stripe, mergi la{" "}
                  {ret.orderNumber ? (
                    <Link
                      href={`/admin/comenzi/${ret.orderNumber}`}
                      className="underline hover:text-zinc-900"
                    >
                      comanda {ret.orderNumber}
                    </Link>
                  ) : (
                    "comandă"
                  )}
                  .
                </p>
              </div>
            </Card>
          )}

          {/* Actions */}
          <ReturnActions
            returnNumber={ret.returnNumber}
            status={ret.status}
            orderNumber={ret.orderNumber}
            resolution={ret.resolution}
          />
        </div>
      </div>
    </>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
      {children}
    </div>
  );
}

function SectionHead({
  title,
  hint,
}: {
  title: string;
  hint?: string;
}) {
  return (
    <div className="border-b border-zinc-100 px-5 py-3.5">
      <h2 className="text-[13px] font-semibold text-zinc-900">{title}</h2>
      {hint && <p className="mt-0.5 text-[11px] text-zinc-500">{hint}</p>}
    </div>
  );
}

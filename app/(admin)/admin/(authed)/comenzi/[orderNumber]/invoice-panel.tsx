"use client";

import { useState, useTransition } from "react";
import { FileText, ExternalLink, Mail, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  generateInvoice,
  cancelInvoice,
  resendInvoiceEmail,
} from "./invoice-actions";

type Props = {
  orderNumber: string;
  orderStatus: string;
  invoiceNumber: string | null;
  invoiceSeries: string | null;
  invoiceLink: string | null;
  invoiceCreatedAt: string | null;
  invoiceStatus: string | null;
  hasBilling: boolean;
};

export function InvoicePanel({
  orderNumber,
  orderStatus,
  invoiceNumber,
  invoiceSeries,
  invoiceLink,
  invoiceCreatedAt,
  invoiceStatus,
  hasBilling,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [emailFlash, setEmailFlash] = useState(false);

  const hasInvoice = !!invoiceNumber && invoiceStatus !== "cancelled";
  const canGenerate =
    !hasInvoice &&
    hasBilling &&
    (orderStatus === "paid" ||
      orderStatus === "shipped" ||
      orderStatus === "delivered");

  function runGenerate() {
    setError(null);
    startTransition(async () => {
      const res = await generateInvoice(orderNumber);
      if (!res.ok) setError(res.error);
    });
  }

  function runCancel() {
    setError(null);
    startTransition(async () => {
      const res = await cancelInvoice(orderNumber);
      if (!res.ok) setError(res.error);
      else setConfirmCancel(false);
    });
  }

  function runResendEmail() {
    setError(null);
    setEmailFlash(false);
    startTransition(async () => {
      const res = await resendInvoiceEmail(orderNumber);
      if (!res.ok) setError(res.error);
      else {
        setEmailFlash(true);
        setTimeout(() => setEmailFlash(false), 2000);
      }
    });
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white">
      <header className="border-b border-zinc-200 px-6 py-4">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-zinc-500" />
          <h2 className="text-[13px] font-semibold text-zinc-900">
            Factură · FGO
          </h2>
        </div>
      </header>

      <div className="flex flex-col gap-4 p-6">
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        {hasInvoice && (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3">
            <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-emerald-700">
              Factură emisă
            </div>
            <div className="mt-1 flex items-center justify-between gap-2">
              <div className="font-mono text-sm text-emerald-900">
                {invoiceSeries} {invoiceNumber}
              </div>
              {invoiceCreatedAt && (
                <div className="text-[11px] text-emerald-700">
                  {new Date(invoiceCreatedAt).toLocaleString("ro-RO")}
                </div>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {invoiceLink && (
                <a
                  href={invoiceLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-emerald-300 bg-white px-3 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-100"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Deschide PDF
                </a>
              )}
              <button
                type="button"
                onClick={runResendEmail}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 rounded-md border border-emerald-300 bg-white px-3 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
              >
                <Mail className="h-3.5 w-3.5" />
                {emailFlash ? "✓ trimis" : "Retrimite email"}
              </button>
              {confirmCancel ? (
                <div className="flex w-full flex-col gap-2 rounded-md border border-amber-200 bg-amber-50 p-2">
                  <p className="text-[11px] text-amber-800">
                    Anularea marchează factura ca anulată în FGO și pe cont.
                    Continuăm?
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={isPending}
                      onClick={runCancel}
                    >
                      Da, anulează
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isPending}
                      onClick={() => setConfirmCancel(false)}
                    >
                      Renunță
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmCancel(true)}
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 rounded-md border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Anulează factură
                </button>
              )}
            </div>
          </div>
        )}

        {canGenerate && (
          <Button type="button" onClick={runGenerate} disabled={isPending}>
            <FileText className="mr-2 h-4 w-4" />
            {isPending ? "Se emite…" : "Emite factură + trimite email"}
          </Button>
        )}

        {!canGenerate && !hasInvoice && (
          <p className="text-xs text-zinc-500">
            {!hasBilling
              ? "Comanda nu are date de facturare complete — nu se poate emite factura."
              : orderStatus === "pending_payment"
                ? "Factura se poate emite după ce comanda e plătită."
                : orderStatus === "cancelled" || orderStatus === "refunded"
                  ? "Comanda e anulată sau rambursată — factura nu se mai emite."
                  : `Status "${orderStatus}" nu permite emiterea de factură.`}
          </p>
        )}

        {invoiceStatus === "cancelled" && invoiceNumber && (
          <p className="text-[11px] text-zinc-500">
            Factura {invoiceSeries} {invoiceNumber} a fost anulată. Poți emite
            una nouă.
          </p>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Truck,
  PackageCheck,
  RotateCcw,
  XCircle,
  Trash2,
  CreditCard,
  Banknote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  cancelOrder,
  deleteOrder,
  markDelivered,
  markShipped,
  refundOrder,
  type RefundManualChannel,
} from "./actions";

type Props = {
  orderNumber: string;
  status: string;
  existingAwb: string | null;
  paymentStatus: string;
  paymentMethod: string;
};

export function ActionsPanel({
  orderNumber,
  status,
  existingAwb,
  paymentStatus,
  paymentMethod,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [awb, setAwb] = useState(existingAwb ?? "");
  const [refundStep, setRefundStep] = useState<
    "idle" | "choose" | "confirmManual"
  >("idle");
  const [manualChannel, setManualChannel] =
    useState<RefundManualChannel>("transfer");
  const [manualNote, setManualNote] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const isCardOnline = paymentMethod === "card-online";

  function run(fn: () => Promise<{ ok: true } | { ok: false; error: string }>) {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) setError(res.error);
    });
  }

  function runDelete() {
    setError(null);
    startTransition(async () => {
      const res = await deleteOrder(orderNumber);
      if (!res.ok) setError(res.error);
      else router.push("/admin/comenzi");
    });
  }

  const canShip = status === "paid";
  const canMarkDelivered = status === "shipped";
  const canRefund =
    (status === "paid" || status === "shipped" || status === "delivered") &&
    paymentStatus === "succeeded";
  const canCancel = status === "pending_payment";
  const canDelete = ["pending_payment", "cancelled", "refunded"].includes(status);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white">
      <header className="border-b border-zinc-200 px-6 py-4">
        <h2 className="text-[13px] font-semibold text-zinc-900">Acțiuni</h2>
        <p className="mt-0.5 text-xs text-zinc-500">
          Marchează progresul comenzii sau pornește refund.
        </p>
      </header>

      <div className="flex flex-col gap-4 p-6">
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        {canShip && (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-zinc-700">
              Număr AWB (FanCourier)
            </label>
            <input
              type="text"
              value={awb}
              onChange={(e) => setAwb(e.target.value)}
              disabled={isPending}
              placeholder="ex: FC12345678"
              className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none"
            />
            <Button
              type="button"
              disabled={isPending}
              onClick={() => run(() => markShipped(orderNumber, awb || null))}
            >
              <Truck className="mr-2 h-4 w-4" />
              Marchează expediată
            </Button>
          </div>
        )}

        {canMarkDelivered && (
          <Button
            type="button"
            disabled={isPending}
            onClick={() => run(() => markDelivered(orderNumber))}
          >
            <PackageCheck className="mr-2 h-4 w-4" />
            Marchează livrată
          </Button>
        )}

        {canRefund && (
          <div className="flex flex-col gap-2">
            {refundStep === "idle" && (
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => setRefundStep("choose")}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Rambursare
              </Button>
            )}

            {refundStep === "choose" && (
              <div className="flex flex-col gap-2 rounded-md border border-zinc-200 bg-zinc-50 p-3">
                <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-600">
                  Cum rambursezi?
                </div>
                <button
                  type="button"
                  disabled={isPending || !isCardOnline}
                  onClick={() =>
                    run(() =>
                      refundOrder(orderNumber, { full: true, method: "stripe" }),
                    )
                  }
                  className="flex items-start gap-3 rounded-md border border-zinc-200 bg-white p-3 text-left transition-colors hover:border-zinc-300 disabled:opacity-50"
                  title={
                    !isCardOnline
                      ? "Comanda nu e plătită prin card online (Stripe)"
                      : undefined
                  }
                >
                  <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-zinc-700" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-zinc-900">
                      Prin Stripe (automat)
                    </div>
                    <div className="mt-0.5 text-[11px] text-zinc-500">
                      Banii ajung la client în 5-10 zile. Comisionul de tranzacție
                      (~1.4% + 1 leu) NU se restituie.
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setRefundStep("confirmManual")}
                  className="flex items-start gap-3 rounded-md border border-zinc-200 bg-white p-3 text-left transition-colors hover:border-zinc-300 disabled:opacity-50"
                >
                  <Banknote className="mt-0.5 h-4 w-4 shrink-0 text-zinc-700" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-zinc-900">
                      Manual (transfer / cash)
                    </div>
                    <div className="mt-0.5 text-[11px] text-zinc-500">
                      Rambursezi tu în afara Stripe. Sistemul doar închide
                      comanda + repune stocul.
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setRefundStep("idle")}
                  className="mt-1 text-[11px] text-zinc-500 hover:text-zinc-900"
                >
                  Renunță
                </button>
              </div>
            )}

            {refundStep === "confirmManual" && (
              <div className="flex flex-col gap-3 rounded-md border border-amber-200 bg-amber-50 p-3">
                <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-amber-800">
                  Refund manual
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-zinc-700">
                    Canal folosit
                  </label>
                  <select
                    value={manualChannel}
                    onChange={(e) =>
                      setManualChannel(e.target.value as RefundManualChannel)
                    }
                    className="rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-sm focus:border-zinc-400 focus:outline-none"
                  >
                    <option value="transfer">Transfer bancar</option>
                    <option value="cash">Cash / la mână</option>
                    <option value="altul">Altul</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-zinc-700">
                    Notă (opțional)
                  </label>
                  <input
                    type="text"
                    value={manualNote}
                    onChange={(e) => setManualNote(e.target.value)}
                    placeholder="ex: OP nr. 12345 din 2026-07-13"
                    className="rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs focus:border-zinc-400 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-amber-800">
                  Confirm doar după ce ai făcut efectiv transferul. Sistemul
                  marchează comanda ca rambursată + repune stocul.
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={isPending}
                    onClick={() =>
                      run(() =>
                        refundOrder(orderNumber, {
                          full: true,
                          method: "manual",
                          manualChannel,
                          manualNote: manualNote.trim() || undefined,
                        }),
                      )
                    }
                  >
                    Am făcut transferul, închide comanda
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isPending}
                    onClick={() => setRefundStep("choose")}
                  >
                    Înapoi
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {canCancel && (
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => run(() => cancelOrder(orderNumber))}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Anulează comanda
          </Button>
        )}

        {!canShip && !canMarkDelivered && !canRefund && !canCancel && !canDelete && (
          <p className="text-xs text-zinc-500">
            Nici o acțiune disponibilă la acest status.
          </p>
        )}

        {/* Integrări viitoare */}
        <div className="border-t border-zinc-100 pt-4">
          <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500">
            Integrări viitoare
          </div>
          <div className="flex flex-col gap-2">
            <Button variant="outline" disabled title="Vine cu integrarea FGO">
              Generează factură FGO
            </Button>
            <Button
              variant="outline"
              disabled
              title="Vine cu integrarea FanCourier API"
            >
              Generează AWB FanCourier
            </Button>
          </div>
        </div>

        {/* Zonă de pericol */}
        {canDelete && (
          <div className="border-t border-red-100 pt-4">
            <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-red-500">
              Zonă de pericol
            </div>
            {confirmingDelete ? (
              <div className="flex flex-col gap-2">
                <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-800">
                  Ștergere permanentă. Comanda + articolele + istoricul
                  dispar din DB. <strong>Ireversibil.</strong>
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={isPending}
                    onClick={runDelete}
                  >
                    Da, șterge
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isPending}
                    onClick={() => setConfirmingDelete(false)}
                  >
                    Renunță
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => setConfirmingDelete(true)}
                className="text-red-700 hover:bg-red-50 hover:text-red-800"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Șterge comanda
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

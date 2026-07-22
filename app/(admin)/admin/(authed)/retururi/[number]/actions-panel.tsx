"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  Truck,
  PackageCheck,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  RETURN_STATUS_LABEL,
  type ReturnStatus,
  type Resolution,
} from "@/lib/admin/returns-constants";
import { updateReturnStatus, deleteReturn } from "../actions";

type Props = {
  returnNumber: string;
  status: ReturnStatus;
  orderNumber: string | null;
  resolution: Resolution;
};

const STATUS_ORDER: ReturnStatus[] = [
  "pending",
  "approved",
  "in_transit",
  "completed",
];

export function ReturnActions({
  returnNumber,
  status: initialStatus,
  orderNumber,
  resolution,
}: Props) {
  const [status, setStatus] = useState<ReturnStatus>(initialStatus);
  const [savedFlash, setSavedFlash] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isPending, startTransition] = useTransition();

  function doUpdate(newStatus: ReturnStatus) {
    setError(null);
    startTransition(async () => {
      const res = await updateReturnStatus(returnNumber, newStatus);
      if (res.ok) {
        setStatus(newStatus);
        setSavedFlash(true);
        setTimeout(() => setSavedFlash(false), 1500);
      } else {
        setError(res.error);
      }
    });
  }

  function runDelete() {
    setError(null);
    startTransition(async () => {
      const res = await deleteReturn(returnNumber);
      if (!res.ok) setError(res.error);
    });
  }

  const currentIndex = STATUS_ORDER.indexOf(status);
  const nextStatus =
    currentIndex >= 0 && currentIndex < STATUS_ORDER.length - 1
      ? STATUS_ORDER[currentIndex + 1]
      : null;

  const isTerminal = status === "completed" || status === "rejected";

  return (
    <div className="flex flex-col gap-4">
      {/* Status workflow */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-100 px-5 py-3.5">
          <h2 className="text-[13px] font-semibold text-zinc-900">
            Status curent
          </h2>
        </div>
        <div className="p-5 pt-4">
          <StatusStepper status={status} />

          {!isTerminal && (
            <div className="mt-4 flex flex-col gap-2">
              {nextStatus && (
                <Button
                  onClick={() => doUpdate(nextStatus)}
                  disabled={isPending}
                  size="sm"
                  className="w-full"
                >
                  {nextStatus === "approved" && (
                    <>
                      <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                      Aprobă cererea
                    </>
                  )}
                  {nextStatus === "in_transit" && (
                    <>
                      <Truck className="mr-1.5 h-3.5 w-3.5" />
                      Marchează în transport
                    </>
                  )}
                  {nextStatus === "completed" && (
                    <>
                      <PackageCheck className="mr-1.5 h-3.5 w-3.5" />
                      Marchează finalizat
                    </>
                  )}
                </Button>
              )}

              <Button
                onClick={() => doUpdate("rejected")}
                variant="outline"
                size="sm"
                disabled={isPending}
                className="w-full text-red-700 hover:bg-red-50 hover:text-red-800"
              >
                <XCircle className="mr-1.5 h-3.5 w-3.5" />
                Respinge cererea
              </Button>
            </div>
          )}

          {isTerminal && (
            <p className="mt-3 rounded-md bg-zinc-50 px-3 py-2 text-[11px] text-zinc-500">
              Cerere finalizată. Poți doar șterge sau vedea istoric.
            </p>
          )}

          {status === "approved" && resolution === "rambursare" && orderNumber && (
            <div className="mt-3 rounded-md bg-blue-50 px-3 py-2 text-[11px] text-blue-800">
              Pentru rambursare, mergi la{" "}
              <Link
                href={`/admin/comenzi/${orderNumber}`}
                className="font-medium underline"
              >
                comanda {orderNumber}
              </Link>{" "}
              și folosește flow-ul de refund (Stripe sau manual).
            </div>
          )}

          {status === "approved" && resolution === "inlocuire" && (
            <div className="mt-3 rounded-md bg-blue-50 px-3 py-2 text-[11px] text-blue-800">
              Pregătește o nouă comandă cu aceleași produse. Notează AWB-ul
              nou pe email către client.
            </div>
          )}

          {status === "approved" && resolution === "voucher" && (
            <div className="mt-3 rounded-md bg-blue-50 px-3 py-2 text-[11px] text-blue-800">
              Creează un cupon în{" "}
              <Link href="/admin/reduceri/nou" className="font-medium underline">
                Reduceri
              </Link>{" "}
              cu valoarea returnului și trimite-l pe email clientului.
            </div>
          )}

          {error && <p className="mt-2 text-[11px] text-red-600">{error}</p>}
          {savedFlash && (
            <p className="mt-2 text-[11px] text-emerald-600">✓ salvat</p>
          )}
        </div>
      </div>

      {/* Delete zone */}
      <div className="rounded-xl border border-red-200 bg-white shadow-sm">
        <div className="border-b border-red-100 px-5 py-3.5">
          <h2 className="text-[13px] font-semibold text-red-700">
            Zonă de pericol
          </h2>
        </div>
        <div className="p-5 pt-0">
          {confirmingDelete ? (
            <div className="flex flex-col gap-2">
              <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-800">
                Ștergere permanentă a cererii + a produselor asociate.
                Comanda originală nu e afectată.
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={isPending}
                  onClick={runDelete}
                >
                  Da, șterge
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
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
              size="sm"
              onClick={() => setConfirmingDelete(true)}
              className="w-full text-red-700 hover:bg-red-50 hover:text-red-800"
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Șterge cererea
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusStepper({ status }: { status: ReturnStatus }) {
  if (status === "rejected") {
    return (
      <div className="flex items-center gap-2 rounded-md bg-zinc-100 p-3">
        <XCircle className="h-4 w-4 text-zinc-500" />
        <span className="text-sm font-medium text-zinc-700">
          Cerere respinsă
        </span>
      </div>
    );
  }

  const currentIndex = STATUS_ORDER.indexOf(status);
  return (
    <div className="flex items-center gap-1">
      {STATUS_ORDER.map((s, i) => {
        const isCompleted = i <= currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <div key={s} className="flex flex-1 items-center gap-1">
            <div
              className={`flex flex-1 flex-col items-center gap-1 ${
                isCompleted ? "text-emerald-700" : "text-zinc-400"
              }`}
            >
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold ${
                  isCurrent
                    ? "bg-emerald-600 text-white ring-2 ring-emerald-200"
                    : isCompleted
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-zinc-100 text-zinc-500"
                }`}
              >
                {i + 1}
              </div>
              <span className="text-[10px] font-medium">
                {RETURN_STATUS_LABEL[s]}
              </span>
            </div>
            {i < STATUS_ORDER.length - 1 && (
              <div
                className={`mt-3 h-px flex-1 ${
                  i < currentIndex ? "bg-emerald-300" : "bg-zinc-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

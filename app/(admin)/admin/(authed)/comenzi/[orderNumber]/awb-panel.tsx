"use client";

import { useState, useTransition } from "react";
import { Printer, Truck, XCircle, Package, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateAwb, cancelAwb } from "./awb-actions";
import type { FanCourierService } from "@/lib/fancourier/types";

type Props = {
  orderNumber: string;
  orderStatus: string;
  shippingMethod: string;
  awbNumber: string | null;
  awbCreatedAt: string | null;
  courierService: string | null;
  pickupPointName: string | null;
  pickupPointAddress: string | null;
};

/** Serviciile FC activate în contract Romvintec (aug 2026). CollectPoint și
 *  livrare la sediu FAN necesită acte adiționale suplimentare. */
const FC_SERVICES: FanCourierService[] = ["Standard", "FANbox"];

/** Default dimensiuni cutie pentru 6 sticle 0.75 L. Adminul poate ajusta. */
const DEFAULT_DIMS = { length: 30, width: 20, height: 25 };
/** 1 sticlă (cu vin) = 1.5 kg → 6 sticle = 9 kg + ~1 kg cutie/protecție. */
const DEFAULT_WEIGHT_KG = 10;

export function AwbPanel({
  orderNumber,
  orderStatus,
  shippingMethod,
  awbNumber,
  awbCreatedAt,
  courierService,
  pickupPointName,
  pickupPointAddress,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  // Form state
  const [weightKg, setWeightKg] = useState(DEFAULT_WEIGHT_KG);
  const [length, setLength] = useState(DEFAULT_DIMS.length);
  const [width, setWidth] = useState(DEFAULT_DIMS.width);
  const [height, setHeight] = useState(DEFAULT_DIMS.height);
  const [parcels, setParcels] = useState(1);
  const [service, setService] = useState<FanCourierService>(
    (courierService as FanCourierService) ?? "Standard",
  );

  const isRidicare = shippingMethod === "ridicare";
  const canGenerate =
    !isRidicare &&
    !awbNumber &&
    (orderStatus === "paid" || orderStatus === "shipped");

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await generateAwb(orderNumber, {
        weightKg,
        dimensions: { length, width, height },
        parcels,
        serviceOverride: service,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setShowForm(false);
    });
  }

  function runCancel() {
    setError(null);
    startTransition(async () => {
      const res = await cancelAwb(orderNumber);
      if (!res.ok) setError(res.error);
      else setConfirmCancel(false);
    });
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white">
      <header className="border-b border-zinc-200 px-6 py-4">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-zinc-500" />
          <h2 className="text-[13px] font-semibold text-zinc-900">
            AWB · FanCourier
          </h2>
        </div>
      </header>

      <div className="flex flex-col gap-4 p-6">
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Info snapshot */}
        <dl className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <dt className="text-zinc-500">Serviciu ales</dt>
            <dd className="mt-0.5 font-medium text-zinc-800">
              {courierService ?? "—"}
            </dd>
          </div>
          {pickupPointName && (
            <div>
              <dt className="text-zinc-500">Punct ridicare</dt>
              <dd className="mt-0.5 text-zinc-800">
                {pickupPointName}
                {pickupPointAddress && (
                  <div className="text-[11px] text-zinc-500">
                    {pickupPointAddress}
                  </div>
                )}
              </dd>
            </div>
          )}
        </dl>

        {/* AWB existent */}
        {awbNumber && (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3">
            <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-emerald-700">
              AWB emis
            </div>
            <div className="mt-1 flex items-center justify-between gap-2">
              <div className="font-mono text-sm text-emerald-900">
                {awbNumber}
              </div>
              {awbCreatedAt && (
                <div className="text-[11px] text-emerald-700">
                  {new Date(awbCreatedAt).toLocaleString("ro-RO")}
                </div>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={`/api/admin/awb-label?awb=${encodeURIComponent(awbNumber)}&format=pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-emerald-300 bg-white px-3 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-100"
              >
                <Printer className="h-3.5 w-3.5" />
                Descarcă etichetă (PDF)
              </a>
              <a
                href={`https://www.fancourier.ro/awb-tracking/?awb=${encodeURIComponent(awbNumber)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-emerald-300 bg-white px-3 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-100"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Tracking public
              </a>
              {confirmCancel ? (
                <div className="flex w-full flex-col gap-2 rounded-md border border-amber-200 bg-amber-50 p-2">
                  <p className="text-[11px] text-amber-800">
                    Ștergerea AWB-ului la FanCourier funcționează doar dacă
                    NU a plecat încă cu curierul. Continuăm?
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={isPending}
                      onClick={runCancel}
                    >
                      Da, șterge AWB
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
                  Anulează AWB
                </button>
              )}
            </div>
          </div>
        )}

        {/* Formular generare */}
        {canGenerate && !showForm && (
          <Button type="button" onClick={() => setShowForm(true)}>
            <Truck className="mr-2 h-4 w-4" />
            Generează AWB
          </Button>
        )}

        {canGenerate && showForm && (
          <div className="flex flex-col gap-3 rounded-md border border-zinc-200 bg-zinc-50 p-4">
            <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-600">
              Confirmă detalii expediere
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-[11px] text-zinc-600">Serviciu FC</span>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value as FanCourierService)}
                  disabled={isPending}
                  className="rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm"
                >
                  {FC_SERVICES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[11px] text-zinc-600">Colete</span>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={parcels}
                  onChange={(e) => setParcels(Number(e.target.value))}
                  disabled={isPending}
                  className="rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[11px] text-zinc-600">Greutate (kg)</span>
                <input
                  type="number"
                  min={0.1}
                  step={0.1}
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  disabled={isPending}
                  className="rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm"
                />
              </label>
              <div />
              <label className="flex flex-col gap-1">
                <span className="text-[11px] text-zinc-600">Lungime (cm)</span>
                <input
                  type="number"
                  min={1}
                  value={length}
                  onChange={(e) => setLength(Number(e.target.value))}
                  disabled={isPending}
                  className="rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[11px] text-zinc-600">Lățime (cm)</span>
                <input
                  type="number"
                  min={1}
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  disabled={isPending}
                  className="rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[11px] text-zinc-600">Înălțime (cm)</span>
                <input
                  type="number"
                  min={1}
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  disabled={isPending}
                  className="rounded-md border border-zinc-300 bg-white px-2 py-1.5 text-sm"
                />
              </label>
            </div>

            <p className="text-[11px] text-zinc-500">
              Adresa destinatarului + numele se iau din datele comenzii. Costul
              real îl vezi în FanCourier după emitere.
            </p>

            <div className="flex gap-2">
              <Button type="button" disabled={isPending} onClick={submit}>
                <Truck className="mr-2 h-4 w-4" />
                {isPending ? "Se emite…" : "Emite AWB"}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => setShowForm(false)}
              >
                Renunță
              </Button>
            </div>
          </div>
        )}

        {!canGenerate && !awbNumber && (
          <p className="text-xs text-zinc-500">
            {isRidicare
              ? "Comanda e cu ridicare personală — nu se emite AWB."
              : orderStatus === "pending_payment"
                ? "AWB-ul se poate emite doar după ce comanda e plătită."
                : orderStatus === "cancelled" || orderStatus === "refunded"
                  ? `Comanda e ${orderStatus === "cancelled" ? "anulată" : "rambursată"} — AWB indisponibil.`
                  : `Status "${orderStatus}" nu permite emiterea de AWB.`}
          </p>
        )}
      </div>
    </div>
  );
}

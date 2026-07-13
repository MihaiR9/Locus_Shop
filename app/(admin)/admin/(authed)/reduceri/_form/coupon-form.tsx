"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { createCoupon, deleteCoupon, updateCoupon } from "../actions";

export type CouponFormValues = {
  code: string;
  discountType: "percent" | "fixed";
  percentOff: number | null;
  fixedOffRon: number | null;
  minAmountRon: number;
  expiresAt: string | null;
  maxUses: number | null;
  usedCount: number;
  active: boolean;
};

type Props = {
  mode: "create" | "edit";
  initial: CouponFormValues;
};

export function CouponForm({ mode, initial }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [discountType, setDiscountType] = useState(initial.discountType);
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(formRef.current!);
    startTransition(async () => {
      const res =
        mode === "create"
          ? await createCoupon(fd)
          : await updateCoupon(initial.code, fd);
      if (!res.ok) setError(res.error);
      else {
        setSavedFlash(true);
        setTimeout(() => setSavedFlash(false), 2000);
      }
    });
  }

  function runDelete() {
    setError(null);
    startTransition(async () => {
      const res = await deleteCoupon(initial.code);
      if (!res.ok) setError(res.error);
    });
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className="mx-auto flex w-full max-w-2xl flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <Link
          href="/admin/reduceri"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 transition-colors hover:text-zinc-900"
        >
          <ArrowLeft className="h-3 w-3" />
          Înapoi la reduceri
        </Link>
        <div className="flex items-center gap-3">
          {error && <span className="text-xs text-red-600">{error}</span>}
          {savedFlash && !error && (
            <span className="text-xs text-emerald-600">✓ salvat</span>
          )}
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending
              ? "Salvez..."
              : mode === "create"
                ? "Creează cupon"
                : "Salvează"}
          </Button>
        </div>
      </div>

      {/* Bază */}
      <Card>
        <div className="grid gap-3 p-5">
          <div className="grid gap-1.5">
            <Label htmlFor="code">Cod cupon</Label>
            <Input
              id="code"
              name="code"
              defaultValue={initial.code}
              required
              placeholder="ex: BUNVENIT10"
              className="font-mono uppercase tracking-wider"
            />
            <p className="text-[11px] text-zinc-500">
              3-40 caractere: litere mari, cifre, cratime sau underscore.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="active"
              name="active"
              defaultChecked={initial.active}
              className="rounded border-zinc-300"
            />
            <Label htmlFor="active" className="cursor-pointer">
              Activ (poate fi folosit la checkout)
            </Label>
          </div>
        </div>
      </Card>

      {/* Discount */}
      <Card>
        <SectionHead title="Tip de reducere" />
        <div className="grid gap-3 p-5 pt-0">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDiscountType("percent")}
              className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                discountType === "percent"
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              Procent (%)
            </button>
            <button
              type="button"
              onClick={() => setDiscountType("fixed")}
              className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                discountType === "fixed"
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              Sumă fixă (lei)
            </button>
          </div>
          <input
            type="hidden"
            name="discount_type"
            value={discountType}
          />

          {discountType === "percent" ? (
            <div className="grid gap-1.5">
              <Label htmlFor="percent_off">Procent reducere (%)</Label>
              <Input
                id="percent_off"
                name="percent_off"
                type="number"
                step="1"
                min="1"
                max="100"
                defaultValue={initial.percentOff ?? ""}
                placeholder="ex: 10"
                required={discountType === "percent"}
              />
              <p className="text-[11px] text-zinc-500">
                Valoare între 1 și 100.
              </p>
            </div>
          ) : (
            <div className="grid gap-1.5">
              <Label htmlFor="fixed_off_ron">Sumă fixă (lei)</Label>
              <Input
                id="fixed_off_ron"
                name="fixed_off_ron"
                type="number"
                step="0.01"
                min="0.01"
                defaultValue={initial.fixedOffRon ?? ""}
                placeholder="ex: 20"
                required={discountType === "fixed"}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Condiții */}
      <Card>
        <SectionHead title="Condiții și limite" />
        <div className="grid gap-3 p-5 pt-0 md:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="min_amount_ron">Coș minim (lei)</Label>
            <Input
              id="min_amount_ron"
              name="min_amount_ron"
              type="number"
              step="0.01"
              min="0"
              defaultValue={initial.minAmountRon ?? 0}
              placeholder="0"
            />
            <p className="text-[11px] text-zinc-500">
              Cuponul se aplică doar peste subtotalul ăsta. 0 = fără minim.
            </p>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="max_uses">Utilizări maxime</Label>
            <Input
              id="max_uses"
              name="max_uses"
              type="number"
              step="1"
              min="1"
              defaultValue={initial.maxUses ?? ""}
              placeholder="Nelimitat"
            />
            <p className="text-[11px] text-zinc-500">
              Lasă gol = fără limită. Folosit deja de{" "}
              <span className="font-mono">{initial.usedCount}</span> ori.
            </p>
          </div>
          <div className="grid gap-1.5 md:col-span-2">
            <Label htmlFor="expires_at">Expiră la</Label>
            <Input
              id="expires_at"
              name="expires_at"
              type="datetime-local"
              defaultValue={
                initial.expiresAt
                  ? new Date(initial.expiresAt).toISOString().slice(0, 16)
                  : ""
              }
            />
            <p className="text-[11px] text-zinc-500">
              Lasă gol = nu expiră niciodată.
            </p>
          </div>
        </div>
      </Card>

      {/* Delete zone */}
      {mode === "edit" && (
        <Card>
          <SectionHead title="Zonă de pericol" tone="danger" />
          <div className="p-5 pt-0">
            {confirmingDelete ? (
              <div className="flex flex-col gap-2">
                <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-800">
                  Ștergere permanentă a cuponului. Comenzile deja plasate cu el
                  rămân neafectate.
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
                className="text-red-700 hover:bg-red-50 hover:text-red-800"
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Șterge cuponul
              </Button>
            )}
          </div>
        </Card>
      )}
    </form>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white">{children}</div>
  );
}

function SectionHead({
  title,
  tone,
}: {
  title: string;
  tone?: "danger";
}) {
  return (
    <div className="border-b border-zinc-100 px-5 py-3.5">
      <h2
        className={
          tone === "danger"
            ? "text-[13px] font-semibold text-red-700"
            : "text-[13px] font-semibold text-zinc-900"
        }
      >
        {title}
      </h2>
    </div>
  );
}

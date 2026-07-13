"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Upload, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { createProduct, deleteProduct, updateProduct } from "../actions";

export type ProductFormValues = {
  code: string;
  slug: string;
  name: string;
  gama: "cuvinte" | "semne" | "pauze";
  type: "alb" | "rosu" | "rose";
  sweetness: "sec" | "demisec" | "dulce";
  bottleColor: "white" | "red" | "rose";
  abv: number;
  priceRon: number;
  stock: number;
  year: number | null;
  active: boolean;
  short: string;
  notes: string;
  taste: string;
  pair: string;
  glass: string;
  decant: string;
  ageNote: string;
  grape: string;
  servingTemp: string;
  heroImage: string | null;
};

type CollectionOption = {
  id: string;
  name: string;
  slug: string;
};

type Props = {
  mode: "create" | "edit";
  initial: ProductFormValues;
  collections: CollectionOption[];
  selectedCollectionIds: string[];
};

export function ProductForm({
  mode,
  initial,
  collections,
  selectedCollectionIds,
}: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [preview, setPreview] = useState<string | null>(initial.heroImage);
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [selectedCollections, setSelectedCollections] = useState<Set<string>>(
    new Set(selectedCollectionIds),
  );

  function toggleCollection(id: string) {
    setSelectedCollections((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(formRef.current!);
    // Sync selected collections
    fd.delete("collection_ids");
    selectedCollections.forEach((id) => fd.append("collection_ids", id));

    startTransition(async () => {
      const res =
        mode === "create"
          ? await createProduct(fd)
          : await updateProduct(initial.code, fd);
      if (!res.ok) setError(res.error);
      else {
        setSavedFlash(true);
        setTimeout(() => setSavedFlash(false), 2000);
      }
    });
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setPreview(URL.createObjectURL(f));
  }

  function runDelete() {
    setError(null);
    startTransition(async () => {
      const res = await deleteProduct(initial.code);
      if (!res.ok) setError(res.error);
    });
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className="mx-auto flex w-full max-w-3xl flex-col gap-3"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/produse"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 transition-colors hover:text-zinc-900"
        >
          <ArrowLeft className="h-3 w-3" />
          Înapoi la produse
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
                ? "Creează produs"
                : "Salvează"}
          </Button>
        </div>
      </div>

      {/* Bază — nume + descrieri scurte */}
      <Card>
        <div className="grid gap-3 p-5">
          <div className="grid gap-1.5">
            <Label htmlFor="name">Nume</Label>
            <Input
              id="name"
              name="name"
              defaultValue={initial.name}
              required
              placeholder="ex: Fetească Regală"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="short">Descriere scurtă</Label>
            <textarea
              id="short"
              name="short"
              defaultValue={initial.short}
              rows={2}
              className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="notes">Notă degustare (afișat pe card)</Label>
            <textarea
              id="notes"
              name="notes"
              defaultValue={initial.notes}
              rows={3}
              className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none"
            />
          </div>
        </div>
      </Card>

      {/* Identificatori + Status */}
      <Card>
        <SectionHead title="Identificatori și status" />
        <div className="grid gap-3 p-5 pt-0 md:grid-cols-3">
          <div className="grid gap-1.5">
            <Label htmlFor="code">Cod (SKU)</Label>
            <Input
              id="code"
              name="code"
              defaultValue={initial.code}
              required
              placeholder="LC01"
              className="font-mono uppercase"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="slug">Slug (URL)</Label>
            <Input
              id="slug"
              name="slug"
              defaultValue={initial.slug}
              placeholder="feteasca-regala-cuvinte"
            />
          </div>
          <SelectField
            label="Gamă principală"
            name="gama"
            defaultValue={initial.gama}
            options={[
              { value: "cuvinte", label: "Cuvinte" },
              { value: "semne", label: "Semne" },
              { value: "pauze", label: "Pauze" },
            ]}
          />
          <div className="md:col-span-3">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                name="active"
                defaultChecked={initial.active}
                className="rounded border-zinc-300"
              />
              <span className="text-sm">Activ (vizibil pe site)</span>
            </label>
            <p className="mt-1 text-[11px] text-zinc-500">
              Codul are format 2 litere + 2 cifre. Prima literă = L, a doua = C/S/P (gamă).
            </p>
          </div>
        </div>
      </Card>

      {/* Media */}
      <Card>
        <SectionHead
          title="Imagine principală"
          hint="Recomandat 1200×1200px, PNG cu fundal transparent."
        />
        <div className="p-5 pt-0">
          <div className="flex items-start gap-4">
            <div className="relative flex h-36 w-36 shrink-0 items-center justify-center overflow-hidden rounded-md border border-dashed border-zinc-300 bg-zinc-50">
              {preview ? (
                <Image
                  src={preview}
                  alt="preview"
                  fill
                  sizes="144px"
                  className="object-contain"
                  unoptimized
                />
              ) : (
                <span className="text-[10px] text-zinc-400">fără imagine</span>
              )}
            </div>
            <label className="cursor-pointer">
              <input
                type="file"
                name="hero_image"
                accept="image/*"
                onChange={onFileChange}
                className="hidden"
              />
              <span className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50">
                <Upload className="h-3.5 w-3.5" />
                {preview ? "Schimbă imagine" : "Adaugă imagine"}
              </span>
            </label>
          </div>
        </div>
      </Card>

      {/* Preț + stoc */}
      <Card>
        <SectionHead title="Preț și stoc" />
        <div className="grid gap-3 p-5 pt-0 md:grid-cols-3">
          <div className="grid gap-1.5">
            <Label htmlFor="price_ron">Preț (lei)</Label>
            <Input
              id="price_ron"
              name="price_ron"
              type="number"
              step="0.01"
              min="0"
              defaultValue={initial.priceRon}
              required
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="stock">Stoc (sticle)</Label>
            <Input
              id="stock"
              name="stock"
              type="number"
              step="1"
              min="0"
              defaultValue={initial.stock}
              required
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="year">An recoltă</Label>
            <Input
              id="year"
              name="year"
              type="number"
              step="1"
              defaultValue={initial.year ?? ""}
            />
          </div>
        </div>
      </Card>

      {/* Detalii vin */}
      <Card>
        <SectionHead title="Detalii vin" />
        <div className="grid gap-3 p-5 pt-0 md:grid-cols-3">
          <SelectField
            label="Tip"
            name="type"
            defaultValue={initial.type}
            options={[
              { value: "alb", label: "Alb" },
              { value: "rosu", label: "Roșu" },
              { value: "rose", label: "Rosé" },
            ]}
          />
          <SelectField
            label="Dulceață"
            name="sweetness"
            defaultValue={initial.sweetness}
            options={[
              { value: "sec", label: "Sec" },
              { value: "demisec", label: "Demisec" },
              { value: "dulce", label: "Dulce" },
            ]}
          />
          <SelectField
            label="Culoare sticlă"
            name="bottle_color"
            defaultValue={initial.bottleColor}
            options={[
              { value: "white", label: "Albă" },
              { value: "red", label: "Roșie" },
              { value: "rose", label: "Rosé" },
            ]}
          />
          <div className="grid gap-1.5">
            <Label htmlFor="abv">Alcool (% VOL)</Label>
            <Input
              id="abv"
              name="abv"
              type="number"
              step="0.1"
              min="0"
              max="30"
              defaultValue={initial.abv}
              required
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="grape">Soi / grape</Label>
            <Input
              id="grape"
              name="grape"
              defaultValue={initial.grape}
              placeholder="ex: Fetească Regală 100%"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="serving_temp">Temperatură servire</Label>
            <Input
              id="serving_temp"
              name="serving_temp"
              defaultValue={initial.servingTemp}
              placeholder="ex: 8–10°C"
            />
          </div>
        </div>
      </Card>

      {/* Copywriting PDP */}
      <Card>
        <SectionHead title="Copywriting PDP (pagină produs)" />
        <div className="grid gap-3 p-5 pt-0">
          <TextArea
            label="Gust (paragraf lung)"
            name="taste"
            defaultValue={initial.taste}
            rows={3}
          />
          <TextArea
            label="Asocieri (pairing)"
            name="pair"
            defaultValue={initial.pair}
            rows={2}
          />
          <div className="grid gap-3 md:grid-cols-3">
            <TextArea label="Pahar" name="glass" defaultValue={initial.glass} rows={2} />
            <TextArea label="Decantare" name="decant" defaultValue={initial.decant} rows={2} />
            <TextArea
              label="Învechire"
              name="age_note"
              defaultValue={initial.ageNote}
              rows={2}
            />
          </div>
        </div>
      </Card>

      {/* Colecții */}
      <Card>
        <SectionHead
          title="Colecții"
          hint="Bifează colecțiile în care apare produsul."
        />
        <div className="grid gap-1 p-5 pt-0 md:grid-cols-3">
          {collections.length === 0 ? (
            <p className="col-span-full text-xs text-zinc-500">
              Nu ai colecții încă.{" "}
              <Link
                href="/admin/colectii/nou"
                className="underline hover:text-zinc-900"
              >
                Crează una
              </Link>
            </p>
          ) : (
            collections.map((c) => (
              <label
                key={c.id}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-zinc-50"
              >
                <input
                  type="checkbox"
                  checked={selectedCollections.has(c.id)}
                  onChange={() => toggleCollection(c.id)}
                  className="rounded border-zinc-300"
                />
                <span className="text-sm">{c.name}</span>
              </label>
            ))
          )}
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
                  Ștergere permanentă a produsului + poze + link-uri colecții.
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
                Șterge produsul
              </Button>
            )}
          </div>
        </Card>
      )}
    </form>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-zinc-200 bg-white">{children}</div>;
}

function SectionHead({
  title,
  hint,
  tone,
}: {
  title: string;
  hint?: string;
  tone?: "danger";
}) {
  return (
    <div className="border-b border-zinc-100 px-6 py-4">
      <h2
        className={
          tone === "danger"
            ? "text-[13px] font-semibold text-red-700"
            : "text-[13px] font-semibold text-zinc-900"
        }
      >
        {title}
      </h2>
      {hint && <p className="mt-0.5 text-[11px] text-zinc-500">{hint}</p>}
    </div>
  );
}

function SelectField({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm focus:border-zinc-400 focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextArea({
  label,
  name,
  defaultValue,
  rows,
}: {
  label: string;
  name: string;
  defaultValue: string;
  rows: number;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <textarea
        id={name}
        name={name}
        defaultValue={defaultValue}
        rows={rows}
        className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none"
      />
    </div>
  );
}

"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { deleteCollection, updateCollection } from "../actions";

type Props = {
  slug: string;
  name: string;
  description: string | null;
  active: boolean;
  heroImage: string | null;
};

export function CollectionEditForm({
  slug,
  name,
  description,
  active,
  heroImage,
}: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [preview, setPreview] = useState<string | null>(heroImage);
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(formRef.current!);
    startTransition(async () => {
      const res = await updateCollection(slug, fd);
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
    const url = URL.createObjectURL(f);
    setPreview(url);
  }

  function runDelete() {
    setError(null);
    startTransition(async () => {
      const res = await deleteCollection(slug);
      if (!res.ok) setError(res.error);
    });
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-6">
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="name">Nume</Label>
            <Input
              id="name"
              name="name"
              defaultValue={name}
              required
              placeholder="ex: Cuvinte"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="slug">Slug (URL)</Label>
            <Input
              id="slug"
              name="slug"
              defaultValue={slug}
              placeholder="ex: cuvinte"
            />
            <p className="text-[11px] text-zinc-500">
              Apare în URL public: /colectii/<code className="rounded bg-zinc-100 px-1">
                {slug}
              </code>
            </p>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="description">Descriere</Label>
            <textarea
              id="description"
              name="description"
              defaultValue={description ?? ""}
              rows={4}
              placeholder="Text scurt afișat pe pagina publică a colecției."
              className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="active"
              name="active"
              type="checkbox"
              defaultChecked={active}
              className="rounded border-zinc-300"
            />
            <Label htmlFor="active" className="cursor-pointer">
              Publicată (vizibilă pe site)
            </Label>
          </div>
        </div>
      </div>

      {/* Hero image */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <div className="mb-3">
          <Label>Imagine hero</Label>
          <p className="mt-0.5 text-[11px] text-zinc-500">
            Afișată sus pe pagina colecției. Recomandat 1600×900px.
          </p>
        </div>

        <div className="flex items-start gap-4">
          <div className="relative flex h-32 w-48 shrink-0 items-center justify-center overflow-hidden rounded-md border border-dashed border-zinc-300 bg-zinc-50">
            {preview ? (
              <Image
                src={preview}
                alt="preview"
                fill
                sizes="192px"
                className="object-cover"
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

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="text-xs">
          {error && <span className="text-red-600">{error}</span>}
          {savedFlash && !error && (
            <span className="text-emerald-600">✓ salvat</span>
          )}
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Salvez..." : "Salvează"}
          </Button>
        </div>
      </div>

      {/* Delete zone */}
      <div className="rounded-xl border border-red-200 bg-red-50/50 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-red-800">
              Șterge colecția
            </div>
            <div className="mt-0.5 text-[11px] text-red-700">
              Ștergerea nu afectează produsele — doar legăturile M2M dispar.
            </div>
          </div>
          {confirmingDelete ? (
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
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setConfirmingDelete(true)}
              className="text-red-700 hover:bg-red-100 hover:text-red-800"
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Șterge
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}

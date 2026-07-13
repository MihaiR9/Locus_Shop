"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { createCollection } from "../actions";

export function NewCollectionForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(formRef.current!);
    startTransition(async () => {
      const res = await createCollection(fd);
      if (!res.ok) setError(res.error);
    });
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setPreview(URL.createObjectURL(f));
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
              required
              placeholder="ex: Cadouri de sărbători"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="slug">Slug (opțional)</Label>
            <Input
              id="slug"
              name="slug"
              placeholder="ex: cadouri (auto-generat dacă lași gol)"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="description">Descriere</Label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Text pentru pagina publică."
              className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="active"
              name="active"
              type="checkbox"
              defaultChecked
              className="rounded border-zinc-300"
            />
            <Label htmlFor="active" className="cursor-pointer">
              Publicată (vizibilă pe site)
            </Label>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <Label>Imagine hero (opțional)</Label>
        <div className="mt-3 flex items-start gap-4">
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
              Adaugă imagine
            </span>
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs">
          {error && <span className="text-red-600">{error}</span>}
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Se creează..." : "Creează colecția"}
        </Button>
      </div>
    </form>
  );
}

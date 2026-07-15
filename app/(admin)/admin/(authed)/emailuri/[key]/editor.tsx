"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  RotateCcw,
  Save,
  Info,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { BlockDef } from "@/lib/email/schema";
import {
  saveEmailTemplate,
  resetEmailTemplate,
  previewEmailTemplate,
} from "../actions";

type Props = {
  templateKey: string;
  name: string;
  description: string;
  destination: "client" | "admin";
  variables: readonly string[];
  blocksSchema: readonly BlockDef[];
  initialSubject: string;
  initialBlocks: Record<string, string>;
  defaultSubject: string;
  isCustomized: boolean;
};

export function EmailEditor({
  templateKey,
  name,
  description,
  destination,
  variables,
  blocksSchema,
  initialSubject,
  initialBlocks,
  defaultSubject,
  isCustomized: initialCustomized,
}: Props) {
  const [subject, setSubject] = useState(initialSubject);
  const [blocks, setBlocks] = useState<Record<string, string>>(initialBlocks);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewSubject, setPreviewSubject] = useState<string>(initialSubject);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [isCustomized, setIsCustomized] = useState(initialCustomized);
  const [isSaving, startSave] = useTransition();
  const [isResetting, startReset] = useTransition();
  const debounceRef = useRef<number | null>(null);

  // Rerandează preview când se schimbă subject / blocks (debounced 300ms).
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    setPreviewLoading(true);
    debounceRef.current = window.setTimeout(async () => {
      const res = await previewEmailTemplate(templateKey, subject, blocks);
      if (res.ok) {
        setPreviewHtml(res.html);
        setPreviewSubject(res.subject);
      } else {
        setPreviewHtml(`<div style="padding:20px;color:red;font-family:monospace;">Preview failed: ${res.error}</div>`);
      }
      setPreviewLoading(false);
    }, 300);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [templateKey, subject, blocks]);

  function setBlockValue(key: string, value: string) {
    setBlocks((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    setError(null);
    startSave(async () => {
      const res = await saveEmailTemplate(templateKey, subject, blocks);
      if (res.ok) {
        setSavedFlash(true);
        setIsCustomized(true);
        setTimeout(() => setSavedFlash(false), 2000);
      } else {
        setError(res.error);
      }
    });
  }

  function handleReset() {
    setError(null);
    startReset(async () => {
      const res = await resetEmailTemplate(templateKey);
      if (res.ok) {
        // Reset local state to defaults
        setSubject(defaultSubject);
        const defaults: Record<string, string> = {};
        blocksSchema.forEach((b) => (defaults[b.key] = b.defaultValue));
        setBlocks(defaults);
        setIsCustomized(false);
        setConfirmingReset(false);
        setSavedFlash(true);
        setTimeout(() => setSavedFlash(false), 2000);
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <>
      <Link
        href="/admin/emailuri"
        className="mb-3 inline-flex items-center gap-1.5 text-xs text-zinc-500 transition-colors hover:text-zinc-900"
      >
        <ArrowLeft className="h-3 w-3" />
        Înapoi la emailuri
      </Link>

      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="admin-page-title">{name}</h1>
            {isCustomized && (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                Personalizat
              </span>
            )}
          </div>
          <p className="admin-page-sub">
            {description} · Destinatar:{" "}
            <span className="font-medium">
              {destination === "client" ? "client" : "admin"}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {error && <span className="text-xs text-red-600">{error}</span>}
          {savedFlash && !error && (
            <span className="text-xs text-emerald-600">✓ salvat</span>
          )}
          {confirmingReset ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmingReset(false)}
                disabled={isResetting}
              >
                Renunță
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleReset}
                disabled={isResetting}
              >
                Da, resetează
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmingReset(true)}
              disabled={isSaving || !isCustomized}
              title={!isCustomized ? "Deja la default" : "Revino la textul din cod"}
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              Reset la default
            </Button>
          )}
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            <Save className="mr-1.5 h-3.5 w-3.5" />
            {isSaving ? "Salvez..." : "Salvează"}
          </Button>
        </div>
      </div>

      {variables.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5">
          <Info className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
          <span className="text-[11px] text-zinc-600">
            Variabile disponibile (folosește cu <code className="rounded bg-white px-1 py-0.5 font-mono text-[10px]">{`{{nume}}`}</code>):
          </span>
          {variables.map((v) => (
            <code
              key={v}
              className="rounded bg-white px-1.5 py-0.5 font-mono text-[10px] text-zinc-700"
            >
              {`{{${v}}}`}
            </code>
          ))}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* LEFT — Editor */}
        <div className="flex flex-col gap-4">
          {/* Subject */}
          <Card>
            <SectionHead title="Subiect email" />
            <div className="p-4">
              <div className="grid gap-1.5">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={defaultSubject}
                />
                <p className="text-[11px] text-zinc-500">
                  Apare în inbox-ul destinatarului. Preview:{" "}
                  <span className="font-medium text-zinc-700">
                    {previewSubject}
                  </span>
                </p>
              </div>
            </div>
          </Card>

          {/* Blocks */}
          <Card>
            <SectionHead
              title="Conținut editabil"
              hint={`${blocksSchema.length} blocuri`}
            />
            <div className="grid gap-4 p-4">
              {blocksSchema.map((b) => (
                <div key={b.key} className="grid gap-1.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <Label htmlFor={b.key}>{b.label}</Label>
                    <span className="font-mono text-[10px] text-zinc-400">
                      {b.key}
                    </span>
                  </div>
                  {b.kind === "textarea" ? (
                    <textarea
                      id={b.key}
                      value={blocks[b.key] ?? ""}
                      onChange={(e) => setBlockValue(b.key, e.target.value)}
                      rows={3}
                      className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none"
                      placeholder={b.defaultValue}
                    />
                  ) : (
                    <Input
                      id={b.key}
                      value={blocks[b.key] ?? ""}
                      onChange={(e) => setBlockValue(b.key, e.target.value)}
                      placeholder={b.defaultValue}
                    />
                  )}
                  {b.hint && (
                    <p className="text-[11px] text-zinc-500">{b.hint}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* RIGHT — Preview */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          <Card>
            <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
              <div>
                <h2 className="text-[13px] font-semibold text-zinc-900">
                  Preview
                </h2>
                <p className="mt-0.5 text-[11px] text-zinc-500">
                  Cu date sample. Se actualizează la fiecare modificare.
                </p>
              </div>
              {previewLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
              )}
            </div>
            <div className="bg-zinc-100 p-4">
              {previewHtml ? (
                <iframe
                  srcDoc={previewHtml}
                  title="Email preview"
                  className="h-[700px] w-full rounded-md border border-zinc-200 bg-white"
                  sandbox="allow-same-origin"
                />
              ) : (
                <div className="flex h-[700px] items-center justify-center rounded-md border border-dashed border-zinc-300 bg-white text-xs text-zinc-500">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Se generează preview...
                </div>
              )}
            </div>
          </Card>
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

function SectionHead({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
      <h2 className="text-[13px] font-semibold text-zinc-900">{title}</h2>
      {hint && <span className="text-[11px] text-zinc-500">{hint}</span>}
    </div>
  );
}

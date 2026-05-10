"use client";

import { useState, useTransition } from "react";
import { requestAccountDeletion } from "./actions";

export function GdprActions() {
  const [, startTransition] = useTransition();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function onDelete() {
    if (
      !confirm(
        "Sigur vrei să ceri ștergerea contului? Comenzile finalizate sunt anonimizate, dar datele trebuie păstrate 10 ani conform legii fiscale. Vei primi confirmare pe email.",
      )
    ) {
      return;
    }
    setPending(true);
    startTransition(async () => {
      const res = await requestAccountDeletion();
      setPending(false);
      setMessage(res.ok ? res.message ?? "Înregistrat." : res.error);
      setTimeout(() => setMessage(null), 6000);
    });
  }

  return (
    <>
      {message && (
        <div
          role="status"
          aria-live="polite"
          style={{
            marginBottom: 12,
            padding: "12px 16px",
            border: "1px solid var(--vie)",
            background: "color-mix(in srgb, var(--vie) 8%, transparent)",
            color: "var(--ink)",
            fontFamily: "var(--font-mono), monospace",
            fontSize: 12,
            lineHeight: 1.6,
          }}
        >
          {message}
        </div>
      )}
      <div className="order-actions">
        <a href="/api/account/export" download>
          Descarcă datele mele (export JSON)
        </a>
        <button type="button" onClick={onDelete} disabled={pending}>
          {pending ? "se trimite…" : "Cere ștergerea contului"}
        </button>
      </div>
    </>
  );
}

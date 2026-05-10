"use client";

import { useState, useTransition, type FormEvent } from "react";
import { addAddress, deleteAddress, updateAddress } from "./actions";

export type AddressRow = {
  id: string;
  line1: string;
  line2: string | null;
  city: string;
  county: string;
  zip: string | null;
  is_default: boolean;
};

const EMPTY = {
  line1: "",
  line2: "",
  city: "",
  county: "",
  zip: "",
  isDefault: false,
};

export function AddressesSection({ initial }: { initial: AddressRow[] }) {
  const [, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function startNew() {
    setForm({ ...EMPTY, isDefault: initial.length === 0 });
    setEditingId("new");
    setMessage(null);
  }
  function startEdit(a: AddressRow) {
    setForm({
      line1: a.line1,
      line2: a.line2 ?? "",
      city: a.city,
      county: a.county,
      zip: a.zip ?? "",
      isDefault: a.is_default,
    });
    setEditingId(a.id);
    setMessage(null);
  }
  function cancel() {
    setEditingId(null);
    setForm(EMPTY);
  }
  function flash(msg: string) {
    setMessage(msg);
    setTimeout(() => setMessage(null), 4000);
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setMessage(null);

    startTransition(async () => {
      const res =
        editingId === "new"
          ? await addAddress(form)
          : await updateAddress(editingId!, form);
      setPending(false);
      if (!res.ok) return setMessage(res.error);
      flash(res.message ?? "Salvat.");
      cancel();
    });
  }

  function onDelete(id: string) {
    if (!confirm("Sigur ștergi această adresă?")) return;
    startTransition(async () => {
      const res = await deleteAddress(id);
      if (!res.ok) return setMessage(res.error);
      flash(res.message ?? "Șters.");
    });
  }

  return (
    <section className="cont-section">
      <div className="cont-section-head">
        <h2>
          {initial.length === 0
            ? "Nicio adresă"
            : `${initial.length} ${initial.length === 1 ? "adresă salvată" : "adrese salvate"}`}
        </h2>
        {editingId === null && (
          <button
            type="button"
            className="more"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
            onClick={startNew}
          >
            + adaugă adresă
          </button>
        )}
      </div>

      {message && (
        <div
          role="status"
          aria-live="polite"
          style={{
            marginBottom: 16,
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

      {editingId !== null && (
        <form
          onSubmit={onSubmit}
          style={{
            border: "1px solid var(--ink)",
            background: "var(--surface)",
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-serif), Georgia, serif",
              fontSize: 22,
              fontWeight: 400,
              color: "var(--ink)",
              letterSpacing: "-0.005em",
              marginBottom: 4,
            }}
          >
            {editingId === "new" ? "Adresă nouă" : "Editare adresă"}
          </h3>

          <Field
            id="addr-l1"
            label="Stradă, număr"
            value={form.line1}
            onChange={(v) => setForm({ ...form, line1: v })}
            placeholder="Bd. Bucureștii Noi 25"
            required
          />
          <Field
            id="addr-l2"
            label="Bloc, scară, apartament (opțional)"
            value={form.line2}
            onChange={(v) => setForm({ ...form, line2: v })}
            placeholder="Bloc Marmura, Sc 1, Et 1, Ap. D115"
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 120px",
              gap: 12,
            }}
          >
            <Field
              id="addr-city"
              label="Oraș"
              value={form.city}
              onChange={(v) => setForm({ ...form, city: v })}
              placeholder="București"
              required
            />
            <Field
              id="addr-county"
              label="Județ"
              value={form.county}
              onChange={(v) => setForm({ ...form, county: v })}
              placeholder="București"
              required
            />
            <Field
              id="addr-zip"
              label="Cod poștal"
              value={form.zip}
              onChange={(v) => setForm({ ...form, zip: v })}
              placeholder="012345"
            />
          </div>

          <label
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              fontFamily: "var(--font-mono), monospace",
              fontSize: 12,
              color: "var(--ink-soft)",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) =>
                setForm({ ...form, isDefault: e.target.checked })
              }
            />
            folosește ca implicită la livrare
          </label>

          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button
              type="submit"
              disabled={pending}
              style={{
                padding: "12px 22px",
                background: "var(--ink)",
                color: "var(--bg)",
                border: "1px solid var(--ink)",
                fontFamily: "var(--font-mono), monospace",
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                cursor: pending ? "progress" : "pointer",
              }}
            >
              {pending ? "se salvează…" : "salvează"}
            </button>
            <button
              type="button"
              onClick={cancel}
              style={{
                padding: "12px 22px",
                background: "transparent",
                color: "var(--ink)",
                border: "1px solid var(--line)",
                fontFamily: "var(--font-mono), monospace",
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              anulează
            </button>
          </div>
        </form>
      )}

      {initial.length > 0 && (
        <div className="address-list">
          {initial.map((a) => (
            <article key={a.id} className="address-card">
              <div className="lines">
                <strong>{a.line1}</strong>
                {a.line2 && (
                  <>
                    {a.line2}
                    <br />
                  </>
                )}
                {a.city}, {a.county}
                {a.zip ? ` · ${a.zip}` : ""}
              </div>
              <div className="badges">
                <span className="badge">livrare</span>
                {a.is_default && (
                  <span className="badge is-default">implicită</span>
                )}
              </div>
              <div className="actions">
                <button
                  type="button"
                  className="icon-btn"
                  aria-label="Editează adresa"
                  title="Editează"
                  onClick={() => startEdit(a)}
                >
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M11.5 2.5l2 2L5 13l-3 0.5 0.5-3z" />
                    <path d="M10 4l2 2" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="icon-btn"
                  aria-label="Șterge adresa"
                  title="Șterge"
                  onClick={() => onDelete(a.id)}
                >
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M3 4 H13" />
                    <path d="M5 4 V14 H11 V4" />
                    <path d="M6 4 V2 H10 V4" />
                  </svg>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label
        htmlFor={id}
        style={{
          fontFamily: "var(--font-mono), monospace",
          fontSize: 10,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "var(--ink-mute)",
        }}
      >
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        style={{
          fontFamily: "var(--font-mono), monospace",
          fontSize: 13,
          color: "var(--ink)",
          background: "var(--bg)",
          border: "1px solid var(--line)",
          padding: "12px 14px",
          borderRadius: 0,
        }}
      />
    </div>
  );
}

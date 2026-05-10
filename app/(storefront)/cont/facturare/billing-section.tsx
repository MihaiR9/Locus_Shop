"use client";

import { useState, type FormEvent } from "react";
import type { MockBillingProfile } from "@/lib/mock-account";

type Props = {
  initial: MockBillingProfile[];
};

const EMPTY_FORM = {
  company: "",
  cui: "",
  regNo: "",
  iban: "",
  hqAddress: "",
};

export function BillingSection({ initial }: Props) {
  const [profiles, setProfiles] = useState<MockBillingProfile[]>(initial);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function startNew() {
    setForm(EMPTY_FORM);
    setEditingId("new");
    setMessage(null);
  }

  function startEdit(p: MockBillingProfile) {
    setForm({
      company: p.company ?? "",
      cui: p.cui ?? "",
      regNo: p.regNo ?? "",
      iban: p.iban ?? "",
      hqAddress: p.hqAddress ?? "",
    });
    setEditingId(p.id);
    setMessage(null);
  }

  function cancel() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);

    if (form.company.trim().length < 2) {
      setMessage("Denumirea firmei e obligatorie.");
      return;
    }
    if (!/^(RO)?\d{2,10}$/i.test(form.cui.replace(/\s+/g, ""))) {
      setMessage("CUI invalid (ex: RO12345678 sau 12345678).");
      return;
    }

    setPending(true);
    // TODO: real server action — Supabase + validare ANAF
    setTimeout(() => {
      setPending(false);
      if (editingId === "new") {
        const newProfile: MockBillingProfile = {
          id: `bill-${Date.now()}`,
          type: "juridica",
          company: form.company,
          cui: form.cui,
          regNo: form.regNo,
          iban: form.iban,
          hqAddress: form.hqAddress,
          isDefault: profiles.filter((p) => p.type === "juridica").length === 0,
        };
        setProfiles([...profiles, newProfile]);
        setMessage("Firmă adăugată.");
      } else if (editingId) {
        setProfiles(
          profiles.map((p) =>
            p.id === editingId
              ? {
                  ...p,
                  company: form.company,
                  cui: form.cui,
                  regNo: form.regNo,
                  iban: form.iban,
                  hqAddress: form.hqAddress,
                }
              : p,
          ),
        );
        setMessage("Date actualizate.");
      }
      cancel();
      setTimeout(() => setMessage(null), 3000);
    }, 400);
  }

  const companies = profiles.filter((p) => p.type === "juridica");

  return (
    <section className="cont-section">
      <div className="cont-section-head">
        <h2>
          {companies.length > 0
            ? `${companies.length} ${companies.length === 1 ? "firmă salvată" : "firme salvate"}`
            : "Nicio firmă"}
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
            + adaugă firmă
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
            gap: 14,
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
            {editingId === "new" ? "Firmă nouă" : "Editare firmă"}
          </h3>

          <Field
            id="bf-company"
            label="Denumire firmă"
            value={form.company}
            onChange={(v) => setForm({ ...form, company: v })}
            placeholder="SC Exemplu SRL"
            required
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            <Field
              id="bf-cui"
              label="CUI"
              value={form.cui}
              onChange={(v) => setForm({ ...form, cui: v })}
              placeholder="RO12345678"
              required
            />
            <Field
              id="bf-reg"
              label="Nr. Reg. Com. (opțional)"
              value={form.regNo}
              onChange={(v) => setForm({ ...form, regNo: v })}
              placeholder="J40/1234/2020"
            />
          </div>
          <Field
            id="bf-iban"
            label="IBAN (opțional)"
            value={form.iban}
            onChange={(v) => setForm({ ...form, iban: v.toUpperCase() })}
            placeholder="RO49 AAAA 1B31 0075 9384 0000"
          />
          <Field
            id="bf-hq"
            label="Sediu social"
            value={form.hqAddress}
            onChange={(v) => setForm({ ...form, hqAddress: v })}
            placeholder="Str. Exemplu nr. 1, București"
            required
          />

          <p
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 11,
              lineHeight: 1.7,
              color: "var(--ink-mute)",
              margin: 0,
            }}
          >
            Datele se validează la ANAF la salvare. Le folosim doar pentru
            facturile fiscale (e-Factura).
          </p>

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

      {companies.length === 0 && editingId === null && (
        <div className="return-empty">
          <h3>Nu ai date de firmă salvate.</h3>
          <p>
            Adaugă datele firmei o singură dată — la următoarele comenzi le
            avem deja completate. Plata, factura și e-Factura ANAF se emit
            automat după plasarea comenzii.
          </p>
          <button
            type="button"
            className="btn"
            onClick={startNew}
            style={{ background: "transparent", cursor: "pointer" }}
          >
            Adaugă firmă
            <svg
              className="arrow-svg"
              width="16"
              height="8"
              viewBox="0 0 24 12"
              aria-hidden="true"
            >
              <use href="#arrow-right" />
            </svg>
          </button>
        </div>
      )}

      {companies.length > 0 && (
        <div className="address-list">
          {companies.map((p) => (
            <article key={p.id} className="address-card">
              <div className="lines">
                <strong>{p.company}</strong>
                CUI {p.cui}
                {p.regNo ? ` · ${p.regNo}` : ""}
                {p.hqAddress && (
                  <>
                    <br />
                    {p.hqAddress}
                  </>
                )}
                {p.iban && (
                  <>
                    <br />
                    IBAN {p.iban}
                  </>
                )}
              </div>
              <div className="badges">
                <span className="badge">juridică</span>
                {p.isDefault && (
                  <span className="badge is-default">implicită</span>
                )}
              </div>
              <div className="actions">
                <button
                  type="button"
                  className="icon-btn"
                  aria-label="Editează firma"
                  title="Editează"
                  onClick={() => startEdit(p)}
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

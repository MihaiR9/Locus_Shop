"use client";

import { useState, type FormEvent } from "react";
import type { MockUser } from "@/lib/mock-account";

export function ProfileForm({ user }: { user: MockUser }) {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [phone, setPhone] = useState(user.phone);
  const [marketing, setMarketing] = useState(user.marketingOptIn);
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setSaved(false);
    // TODO: real server action — supabase.from('customers').update(...)
    setTimeout(() => {
      setPending(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 500);
  }

  return (
    <form
      onSubmit={onSubmit}
      style={{ display: "flex", flexDirection: "column", gap: 24 }}
    >
      <div className="profile-grid">
        <div className="profile-field">
          <label htmlFor="profile-fn">Prenume</label>
          <input
            id="profile-fn"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="given-name"
          />
        </div>
        <div className="profile-field">
          <label htmlFor="profile-ln">Nume</label>
          <input
            id="profile-ln"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            autoComplete="family-name"
          />
        </div>
        <div className="profile-field">
          <label htmlFor="profile-email">Email (read-only)</label>
          <input
            id="profile-email"
            type="email"
            value={user.email}
            readOnly
            disabled
          />
        </div>
        <div className="profile-field">
          <label htmlFor="profile-phone">Telefon</label>
          <input
            id="profile-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
          />
        </div>
      </div>

      <label className="profile-toggle">
        <input
          type="checkbox"
          checked={marketing}
          onChange={(e) => setMarketing(e.target.checked)}
        />
        Vreau să primesc newsletter (notițe rare din vie și pivniță)
      </label>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button
          type="submit"
          className="submit"
          disabled={pending}
          style={{
            padding: "16px 28px",
            background: "var(--ink)",
            color: "var(--bg)",
            border: "1px solid var(--ink)",
            fontFamily: "var(--font-mono), monospace",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            cursor: pending ? "progress" : "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          {pending ? "se salvează…" : "Salvează modificări"}
        </button>
        {saved && (
          <span
            role="status"
            aria-live="polite"
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 11,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--vie)",
            }}
          >
            ✓ salvat
          </span>
        )}
      </div>
    </form>
  );
}

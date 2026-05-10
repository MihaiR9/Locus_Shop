"use client";

import { useState, useTransition, type FormEvent } from "react";
import {
  updateName,
  updatePhone,
  updateMarketing,
  requestEmailChange,
  requestPasswordChange,
} from "./actions";

type Field = "email" | "password" | "phone" | "name";

type SettingsUser = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  marketingOptIn: boolean;
};

export function SettingsForm({ user }: { user: SettingsUser }) {
  const [, startTransition] = useTransition();
  const [editing, setEditing] = useState<Field | null>(null);
  const [emailNew, setEmailNew] = useState("");
  const [pwdCurrent, setPwdCurrent] = useState("");
  const [pwdNew, setPwdNew] = useState("");
  const [pwdConfirm, setPwdConfirm] = useState("");
  const [phone, setPhone] = useState(user.phone);
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [marketing, setMarketing] = useState(user.marketingOptIn);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function reset() {
    setEditing(null);
    setEmailNew("");
    setPwdCurrent("");
    setPwdNew("");
    setPwdConfirm("");
  }

  function flash(msg: string) {
    setMessage(msg);
    setTimeout(() => setMessage(null), 5000);
  }

  function onSubmit(field: Field, e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setPending(true);

    startTransition(async () => {
      let res:
        | { ok: true; message?: string }
        | { ok: false; error: string }
        | null = null;

      if (field === "name") {
        res = await updateName({ firstName, lastName });
      } else if (field === "email") {
        res = await requestEmailChange(emailNew);
      } else if (field === "password") {
        res = await requestPasswordChange();
      } else if (field === "phone") {
        res = await updatePhone(phone);
      }

      setPending(false);
      if (!res) return;
      if (!res.ok) {
        setMessage(res.error);
        return;
      }
      flash(res.message ?? "Salvat.");
      reset();
    });
  }

  return (
    <div>
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

      {/* Name */}
      <div className="settings-group">
        <div>
          <div className="label">Nume</div>
          <div className="value">
            {user.firstName} {user.lastName}
          </div>
        </div>
        {editing === "name" ? (
          <button
            type="button"
            className="change-btn"
            onClick={() => reset()}
          >
            anulează
          </button>
        ) : (
          <button
            type="button"
            className="change-btn"
            onClick={() => setEditing("name")}
          >
            schimbă
          </button>
        )}
        {editing === "name" && (
          <form
            onSubmit={(e) => onSubmit("name", e)}
            style={{
              gridColumn: "1 / -1",
              display: "grid",
              gridTemplateColumns: "1fr 1fr auto",
              gap: 12,
              marginTop: 8,
            }}
          >
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="given-name"
              placeholder="Prenume"
              style={inputStyle}
              required
            />
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
              placeholder="Nume"
              style={inputStyle}
              required
            />
            <button type="submit" className="change-btn" disabled={pending}>
              {pending ? "..." : "salvează"}
            </button>
          </form>
        )}
      </div>

      {/* Email */}
      <div className="settings-group">
        <div>
          <div className="label">Adresă email</div>
          <div className="value">{user.email}</div>
        </div>
        {editing === "email" ? (
          <button
            type="button"
            className="change-btn"
            onClick={() => reset()}
          >
            anulează
          </button>
        ) : (
          <button
            type="button"
            className="change-btn"
            onClick={() => setEditing("email")}
          >
            schimbă
          </button>
        )}
        {editing === "email" && (
          <form
            onSubmit={(e) => onSubmit("email", e)}
            style={{
              gridColumn: "1 / -1",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginTop: 8,
            }}
          >
            <input
              type="email"
              value={emailNew}
              onChange={(e) => setEmailNew(e.target.value)}
              autoComplete="email"
              placeholder="email nou"
              style={inputStyle}
              required
            />
            <p className="settings-note" style={{ padding: 0 }}>
              Vei primi un link de confirmare pe adresa nouă. Schimbarea
              devine activă doar după ce confirmi.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" className="change-btn" disabled={pending}>
                {pending ? "se trimite…" : "trimite link confirmare"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Password */}
      <div className="settings-group">
        <div>
          <div className="label">Parolă</div>
          <div className="value">••••••••</div>
        </div>
        {editing === "password" ? (
          <button
            type="button"
            className="change-btn"
            onClick={() => reset()}
          >
            anulează
          </button>
        ) : (
          <button
            type="button"
            className="change-btn"
            onClick={() => setEditing("password")}
          >
            schimbă
          </button>
        )}
        {editing === "password" && (
          <form
            onSubmit={(e) => onSubmit("password", e)}
            style={{
              gridColumn: "1 / -1",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginTop: 8,
            }}
          >
            <input
              type="password"
              value={pwdCurrent}
              onChange={(e) => setPwdCurrent(e.target.value)}
              autoComplete="current-password"
              placeholder="parolă curentă"
              style={inputStyle}
              required
            />
            <input
              type="password"
              value={pwdNew}
              onChange={(e) => setPwdNew(e.target.value)}
              autoComplete="new-password"
              placeholder="parolă nouă (min. 8 caractere)"
              style={inputStyle}
              required
              minLength={8}
            />
            <input
              type="password"
              value={pwdConfirm}
              onChange={(e) => setPwdConfirm(e.target.value)}
              autoComplete="new-password"
              placeholder="confirmă parola nouă"
              style={inputStyle}
              required
              minLength={8}
            />
            <p className="settings-note" style={{ padding: 0 }}>
              Pentru siguranță, îți trimitem un email de confirmare pe{" "}
              <strong>{user.email}</strong>. Schimbarea devine activă după
              click.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" className="change-btn" disabled={pending}>
                {pending ? "se trimite…" : "schimbă parola"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Phone */}
      <div className="settings-group">
        <div>
          <div className="label">Telefon</div>
          <div className="value">{user.phone}</div>
        </div>
        {editing === "phone" ? (
          <button
            type="button"
            className="change-btn"
            onClick={() => reset()}
          >
            anulează
          </button>
        ) : (
          <button
            type="button"
            className="change-btn"
            onClick={() => setEditing("phone")}
          >
            schimbă
          </button>
        )}
        {editing === "phone" && (
          <form
            onSubmit={(e) => onSubmit("phone", e)}
            style={{
              gridColumn: "1 / -1",
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 12,
              marginTop: 8,
            }}
          >
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              placeholder="telefon"
              style={inputStyle}
              required
            />
            <button type="submit" className="change-btn" disabled={pending}>
              {pending ? "..." : "salvează"}
            </button>
          </form>
        )}
      </div>

      {/* Marketing toggle */}
      <div className="settings-group">
        <div>
          <div className="label">Newsletter</div>
          <div
            className="value"
            style={{ fontSize: 14, fontFamily: "var(--font-mono), monospace" }}
          >
            <label
              style={{
                display: "inline-flex",
                gap: 10,
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={marketing}
                onChange={(e) => {
                  const next = e.target.checked;
                  setMarketing(next);
                  startTransition(async () => {
                    const res = await updateMarketing(next);
                    if (!res.ok) {
                      setMarketing(!next);
                      setMessage(res.error);
                      return;
                    }
                    flash(res.message ?? "Salvat.");
                  });
                }}
              />
              {marketing ? "abonat" : "dezabonat"}
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono), monospace",
  fontSize: 13,
  color: "var(--ink)",
  background: "var(--bg)",
  border: "1px solid var(--line)",
  padding: "12px 14px",
  borderRadius: 0,
};

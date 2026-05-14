"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GoogleButton, PhoneButton } from "@/components/auth/google-button";
import {
  loginWithEmail,
  startGoogleOAuth,
  startPhoneOtp,
  verifyPhoneOtp,
} from "@/app/(auth)/cont/auth-actions";

type Method = "email" | "phone";
type Stage = "input" | "phone-code" | "email-sent" | "phone-done";

export function LoginForm() {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [method, setMethod] = useState<Method>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [normalizedPhone, setNormalizedPhone] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<Stage>("input");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noAccount, setNoAccount] = useState(false);

  function reset() {
    setStage("input");
    setError(null);
    setNoAccount(false);
    setCode("");
  }

  function onEmail(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setNoAccount(false);
    setPending(true);
    startTransition(async () => {
      const res = await loginWithEmail(email);
      setPending(false);
      if (!res.ok) {
        if (res.code === "no_account") setNoAccount(true);
        return setError(res.error);
      }
      setStage("email-sent");
    });
  }

  function startPhone() {
    setMethod("phone");
    setError(null);
    setStage("input");
  }

  function backToEmail() {
    setMethod("email");
    setError(null);
    setStage("input");
  }

  function onPhone(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    startTransition(async () => {
      const res = await startPhoneOtp(phone);
      setPending(false);
      if (!res.ok) return setError(res.error);
      if (res.phone) setNormalizedPhone(res.phone);
      setStage("phone-code");
    });
  }

  function onCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    startTransition(async () => {
      const res = await verifyPhoneOtp({ phone: normalizedPhone, code });
      setPending(false);
      if (!res.ok) return setError(res.error);
      setStage("phone-done");
      router.push("/cont");
      router.refresh();
    });
  }

  function onGoogle() {
    setError(null);
    setPending(true);
    startTransition(async () => {
      const res = await startGoogleOAuth();
      if ("error" in res) {
        setPending(false);
        return setError(res.error);
      }
      window.location.href = res.url;
    });
  }

  // ─── Email sent confirmation ────────────────────────────────
  if (stage === "email-sent") {
    return (
      <div className="cont-login-success" style={{ textAlign: "center", alignItems: "center" }}>
        <div className="eyebrow" style={{ alignSelf: "center" }}>link trimis</div>
        <h2
          style={{
            fontFamily: "var(--font-serif), Georgia, serif",
            fontSize: "clamp(28px, 3.4vw, 36px)",
            fontWeight: 400,
            lineHeight: 1.1,
            letterSpacing: "-0.01em",
            color: "var(--ink)",
          }}
        >
          Verifică emailul.
        </h2>
        <p
          style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: 13,
            lineHeight: 1.85,
            color: "var(--ink-soft)",
          }}
        >
          Ți-am trimis un link la <strong>{email}</strong>. Click pe el și
          ești conectat. Linkul expiră în 15 minute.
        </p>
        <button
          type="button"
          onClick={() => {
            reset();
            setEmail("");
          }}
          style={{ ...resetLinkStyle, alignSelf: "center" }}
        >
          Trimite altă adresă
        </button>
      </div>
    );
  }

  if (stage === "phone-done") {
    return (
      <div className="cont-login-success" style={{ textAlign: "center", alignItems: "center" }}>
        <div className="eyebrow" style={{ alignSelf: "center" }}>conectat</div>
        <h2
          style={{
            fontFamily: "var(--font-serif), Georgia, serif",
            fontSize: "clamp(28px, 3.4vw, 36px)",
            fontWeight: 400,
            lineHeight: 1.1,
            letterSpacing: "-0.01em",
            color: "var(--ink)",
          }}
        >
          Bun venit.
        </h2>
        <p
          style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: 13,
            lineHeight: 1.85,
            color: "var(--ink-soft)",
          }}
        >
          Te-am conectat cu <strong>{phone}</strong>. Mergi la{" "}
          <a href="/cont" style={{ color: "var(--ink)" }}>contul tău</a>.
        </p>
      </div>
    );
  }

  // ─── Phone code entry ───────────────────────────────────────
  if (stage === "phone-code") {
    return (
      <form className="cont-login-form" onSubmit={onCode} noValidate>
        <p
          style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: 13,
            lineHeight: 1.85,
            color: "var(--ink-soft)",
            textAlign: "center",
            marginBottom: 4,
          }}
        >
          Ți-am trimis un cod de 6 cifre la <strong>{phone}</strong>.
        </p>
        <div className="auth-field">
          <label htmlFor="login-code">Cod SMS</label>
          <input
            id="login-code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            placeholder="123456"
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            disabled={pending}
            style={{ letterSpacing: "0.4em", fontSize: 18, textAlign: "center" }}
          />
        </div>
        {error && <div className="auth-error">{error}</div>}
        <button type="submit" disabled={pending || code.length !== 6}>
          {pending ? "se verifică…" : "verifică și conectează"}
          {!pending && (
            <svg className="arrow-svg" width="16" height="8" viewBox="0 0 24 12" aria-hidden="true">
              <use href="#arrow-right" />
            </svg>
          )}
        </button>
        <button type="button" onClick={reset} style={{ ...resetLinkStyle, alignSelf: "center" }}>
          Schimbă numărul
        </button>
      </form>
    );
  }

  // ─── Phone number entry ─────────────────────────────────────
  if (method === "phone") {
    return (
      <>
        <form className="cont-login-form" onSubmit={onPhone} noValidate>
          <div className="auth-field">
            <label htmlFor="login-phone">Număr de telefon</label>
            <input
              id="login-phone"
              type="tel"
              name="phone"
              placeholder="0752 232 912"
              required
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={pending}
            />
          </div>
          {error && <div className="auth-error">{error}</div>}
          <button type="submit" disabled={pending || !phone.trim()}>
            {pending ? "se trimite…" : "trimite cod prin SMS"}
            {!pending && (
              <svg className="arrow-svg" width="16" height="8" viewBox="0 0 24 12" aria-hidden="true">
                <use href="#arrow-right" />
              </svg>
            )}
          </button>
        </form>
        <button
          type="button"
          onClick={backToEmail}
          style={{ ...resetLinkStyle, alignSelf: "center", marginTop: 16 }}
        >
          ← înapoi la email
        </button>
      </>
    );
  }

  // ─── Default: email primary ─────────────────────────────────
  return (
    <>
      <form className="cont-login-form" onSubmit={onEmail} noValidate>
        <div className="auth-field">
          <label htmlFor="login-email">Adresă email</label>
          <input
            id="login-email"
            type="email"
            name="email"
            placeholder="adresa ta de email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (noAccount) {
                setNoAccount(false);
                setError(null);
              }
            }}
            disabled={pending}
          />
        </div>
        {noAccount ? (
          <div className="auth-no-account">
            <p>Nu există cont cu adresa <strong>{email}</strong>.</p>
            <Link
              href={`/cont/signup?email=${encodeURIComponent(email)}`}
              className="auth-no-account-cta"
            >
              Creează cont nou
              <svg className="arrow-svg" width="16" height="8" viewBox="0 0 24 12" aria-hidden="true">
                <use href="#arrow-right" />
              </svg>
            </Link>
          </div>
        ) : error ? (
          <div className="auth-error">{error}</div>
        ) : null}
        <button type="submit" disabled={pending || !email.trim() || noAccount}>
          {pending ? "se trimite…" : "Continuă"}
          {!pending && (
            <svg className="arrow-svg" width="16" height="8" viewBox="0 0 24 12" aria-hidden="true">
              <use href="#arrow-right" />
            </svg>
          )}
        </button>
      </form>

      <div className="auth-divider">Sau rapid cu</div>

      <div className="auth-social-row">
        <GoogleButton label="Google" onClick={onGoogle} />
        <PhoneButton label="Telefon" onClick={startPhone} />
      </div>
    </>
  );
}

const resetLinkStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  padding: 0,
  cursor: "pointer",
  fontFamily: "var(--font-mono), monospace",
  fontSize: 11,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: "var(--ink-soft)",
  textDecoration: "underline",
  textUnderlineOffset: 4,
  alignSelf: "flex-start",
};

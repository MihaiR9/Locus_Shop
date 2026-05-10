"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { GoogleButton } from "@/components/auth/google-button";

type Method = "email" | "google" | "phone";

/**
 * Signup form (front-only stub).
 * Real wiring lands in Pas 7 backend:
 *  - email   → supabase.auth.signInWithOtp({ email, options: { data: {firstName, lastName, phone, marketing} } })
 *              + insert into customers on first auth callback
 *  - google  → supabase.auth.signInWithOAuth({ provider: "google" })
 *  - phone   → supabase.auth.signInWithOtp({ phone })
 */
export function SignupForm() {
  const [method, setMethod] = useState<Method>("email");

  // email path
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneOnEmail, setPhoneOnEmail] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [marketing, setMarketing] = useState(true);

  // phone path
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [phoneStage, setPhoneStage] = useState<"input" | "code">("input");

  // shared
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successFor, setSuccessFor] = useState<Method | null>(null);

  function switchMethod(m: Method) {
    setMethod(m);
    setError(null);
    setSuccessFor(null);
    setPhoneStage("input");
    setCode("");
  }

  function onEmail(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (firstName.trim().length < 2) return setError("Prenumele e prea scurt.");
    if (lastName.trim().length < 2) return setError("Numele e prea scurt.");
    if (!email.includes("@")) return setError("Adresă de email invalidă.");
    if (phoneOnEmail) {
      const clean = phoneOnEmail.replace(/\s+/g, "");
      if (!/^(\+?40)?0?7\d{8}$/.test(clean)) {
        return setError("Telefonul e invalid (ex: 0752 232 912). Lasă gol dacă nu vrei.");
      }
    }
    if (!acceptedTerms) return setError("Trebuie să accepți Termenii și Politica de confidențialitate.");

    setPending(true);
    // TODO: supabase.auth.signInWithOtp({ email, options: { data: { firstName, lastName, phone, marketing } } })
    setTimeout(() => {
      setPending(false);
      setSuccessFor("email");
    }, 600);
  }

  function onPhone(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const clean = phone.replace(/\s+/g, "");
    if (!/^(\+?40)?0?7\d{8}$/.test(clean)) {
      return setError("Număr de telefon invalid (ex: 0752 232 912).");
    }
    setPending(true);
    // TODO: supabase.auth.signInWithOtp({ phone })
    setTimeout(() => {
      setPending(false);
      setPhoneStage("code");
    }, 500);
  }

  function onPhoneCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!/^\d{6}$/.test(code)) return setError("Codul are 6 cifre.");
    setPending(true);
    // TODO: supabase.auth.verifyOtp({ phone, token: code, type: "sms" })
    setTimeout(() => {
      setPending(false);
      setSuccessFor("phone");
    }, 500);
  }

  function onGoogle() {
    // TODO: supabase.auth.signInWithOAuth({ provider: "google" })
    alert(
      "Crearea contului cu Google va fi activă după setarea OAuth în Supabase (Pas 7 backend).",
    );
  }

  // ─── Success states ──────────────────────────────────────────
  if (successFor === "email") {
    return (
      <div className="cont-login-success">
        <div className="eyebrow">cont creat · verifică emailul</div>
        <h1
          style={{
            fontFamily: "var(--font-serif), Georgia, serif",
            fontSize: "clamp(32px, 4vw, 48px)",
            fontWeight: 400,
            lineHeight: 1,
            letterSpacing: "-0.015em",
            color: "var(--ink)",
          }}
        >
          Ești la un click distanță.
        </h1>
        <p
          style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: 13,
            lineHeight: 1.85,
            color: "var(--ink-soft)",
          }}
        >
          Ți-am trimis un link de confirmare la <strong>{email}</strong>.
          Click pe el și contul devine activ. Linkul expiră în 15 minute.
        </p>
      </div>
    );
  }
  if (successFor === "phone") {
    return (
      <div className="cont-login-success">
        <div className="eyebrow">cont creat · conectat</div>
        <h1
          style={{
            fontFamily: "var(--font-serif), Georgia, serif",
            fontSize: "clamp(32px, 4vw, 48px)",
            fontWeight: 400,
            lineHeight: 1,
            letterSpacing: "-0.015em",
            color: "var(--ink)",
          }}
        >
          Bun venit.
        </h1>
        <p
          style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: 13,
            lineHeight: 1.85,
            color: "var(--ink-soft)",
          }}
        >
          Te-am conectat cu <strong>{phone}</strong>. Mergi la{" "}
          <a href="/cont" style={{ color: "var(--ink)" }}>
            contul tău
          </a>
          .
        </p>
      </div>
    );
  }

  // ─── Form ────────────────────────────────────────────────────
  return (
    <>
      <div className="auth-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={method === "email"}
          className={`auth-tab ${method === "email" ? "is-active" : ""}`}
          onClick={() => switchMethod("email")}
        >
          Email
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={method === "google"}
          className={`auth-tab ${method === "google" ? "is-active" : ""}`}
          onClick={() => switchMethod("google")}
        >
          Google
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={method === "phone"}
          className={`auth-tab ${method === "phone" ? "is-active" : ""}`}
          onClick={() => switchMethod("phone")}
        >
          Telefon
        </button>
      </div>

      {method === "email" && (
        <form className="cont-login-form" onSubmit={onEmail} noValidate>
          <div className="auth-grid-2">
            <div className="auth-field">
              <label htmlFor="su-fn">Prenume</label>
              <input
                id="su-fn"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
                required
                disabled={pending}
              />
            </div>
            <div className="auth-field">
              <label htmlFor="su-ln">Nume</label>
              <input
                id="su-ln"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
                required
                disabled={pending}
              />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="su-email">Adresă email</label>
            <input
              id="su-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="adresa ta de email"
              autoComplete="email"
              required
              disabled={pending}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="su-phone">Telefon (opțional)</label>
            <input
              id="su-phone"
              type="tel"
              value={phoneOnEmail}
              onChange={(e) => setPhoneOnEmail(e.target.value)}
              placeholder="0752 232 912"
              autoComplete="tel"
              disabled={pending}
            />
          </div>

          <label className="auth-checkbox">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              required
            />
            <span>
              Sunt de acord cu{" "}
              <Link href="/termeni" target="_blank">
                Termenii
              </Link>{" "}
              și{" "}
              <Link href="/confidentialitate" target="_blank">
                Politica de confidențialitate
              </Link>
              . Confirm că am peste 18 ani.
            </span>
          </label>

          <label className="auth-checkbox">
            <input
              type="checkbox"
              checked={marketing}
              onChange={(e) => setMarketing(e.target.checked)}
            />
            <span>
              Vreau să primesc newsletter (notițe rare din vie și pivniță).
              Te poți dezabona oricând cu un click.
            </span>
          </label>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" disabled={pending}>
            {pending ? "se creează…" : "creează cont"}
            {!pending && (
              <svg
                className="arrow-svg"
                width="16"
                height="8"
                viewBox="0 0 24 12"
                aria-hidden="true"
              >
                <use href="#arrow-right" />
              </svg>
            )}
          </button>
        </form>
      )}

      {method === "google" && (
        <div className="cont-login-form">
          <GoogleButton label="Creează cont cu Google" onClick={onGoogle} />
          <p
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 11,
              lineHeight: 1.7,
              color: "var(--ink-mute)",
              marginTop: 4,
            }}
          >
            Folosim doar email-ul și numele din Google. Continuând, accepți
            automat{" "}
            <Link href="/termeni" style={{ color: "var(--ink-soft)" }}>
              Termenii
            </Link>{" "}
            și{" "}
            <Link href="/confidentialitate" style={{ color: "var(--ink-soft)" }}>
              Politica
            </Link>
            . Confirmi că ai peste 18 ani.
          </p>
        </div>
      )}

      {method === "phone" && phoneStage === "input" && (
        <form className="cont-login-form" onSubmit={onPhone} noValidate>
          <div className="auth-field">
            <label htmlFor="su-tel">Număr de telefon</label>
            <input
              id="su-tel"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0752 232 912"
              autoComplete="tel"
              required
              disabled={pending}
            />
          </div>

          <p
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 11,
              lineHeight: 1.7,
              color: "var(--ink-mute)",
              margin: 0,
            }}
          >
            Continuând, accepți{" "}
            <Link href="/termeni" style={{ color: "var(--ink-soft)" }}>
              Termenii
            </Link>{" "}
            și{" "}
            <Link href="/confidentialitate" style={{ color: "var(--ink-soft)" }}>
              Politica
            </Link>
            . Confirmi că ai peste 18 ani. Costul SMS-ului e suportat de
            operatorul tău.
          </p>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" disabled={pending || !phone.trim()}>
            {pending ? "se trimite…" : "trimite cod prin SMS"}
            {!pending && (
              <svg
                className="arrow-svg"
                width="16"
                height="8"
                viewBox="0 0 24 12"
                aria-hidden="true"
              >
                <use href="#arrow-right" />
              </svg>
            )}
          </button>
        </form>
      )}

      {method === "phone" && phoneStage === "code" && (
        <form className="cont-login-form" onSubmit={onPhoneCode} noValidate>
          <p
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 13,
              lineHeight: 1.85,
              color: "var(--ink-soft)",
              marginBottom: 4,
            }}
          >
            Ți-am trimis un cod de 6 cifre la <strong>{phone}</strong>.
          </p>
          <div className="auth-field">
            <label htmlFor="su-code">Cod SMS</label>
            <input
              id="su-code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              placeholder="123456"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              disabled={pending}
              style={{
                letterSpacing: "0.4em",
                fontSize: 18,
                textAlign: "center",
              }}
            />
          </div>
          {error && <div className="auth-error">{error}</div>}
          <button type="submit" disabled={pending || code.length !== 6}>
            {pending ? "se verifică…" : "verifică și creează cont"}
            {!pending && (
              <svg
                className="arrow-svg"
                width="16"
                height="8"
                viewBox="0 0 24 12"
                aria-hidden="true"
              >
                <use href="#arrow-right" />
              </svg>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setPhoneStage("input");
              setCode("");
              setError(null);
            }}
            style={{
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
            }}
          >
            Schimbă numărul
          </button>
        </form>
      )}
    </>
  );
}

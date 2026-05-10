"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GoogleButton, PhoneButton } from "@/components/auth/google-button";
import {
  signupWithEmail,
  startGoogleOAuth,
  startPhoneOtp,
  verifyPhoneOtp,
} from "@/app/(auth)/cont/auth-actions";

type Method = "email" | "phone";
type Stage = "form" | "phone-input" | "phone-code" | "email-sent" | "phone-done";

export function SignupForm() {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [method, setMethod] = useState<Method>("email");
  const [stage, setStage] = useState<Stage>("form");

  // email path
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneOnEmail, setPhoneOnEmail] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [marketing, setMarketing] = useState(true);

  // phone path
  const [phone, setPhone] = useState("");
  const [normalizedPhone, setNormalizedPhone] = useState("");
  const [code, setCode] = useState("");

  // shared
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onEmail(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (phoneOnEmail) {
      const clean = phoneOnEmail.replace(/\s+/g, "");
      if (!/^(\+?40)?0?7\d{8}$/.test(clean)) {
        return setError("Telefonul e invalid (ex: 0752 232 912). Lasă gol dacă nu vrei.");
      }
    }
    if (!acceptedTerms) return setError("Trebuie să accepți Termenii și Politica de confidențialitate.");

    setPending(true);
    startTransition(async () => {
      const res = await signupWithEmail({
        email,
        firstName,
        lastName,
        phone: phoneOnEmail,
        marketing,
      });
      setPending(false);
      if (!res.ok) return setError(res.error);
      setStage("email-sent");
    });
  }

  function startPhone() {
    setMethod("phone");
    setStage("phone-input");
    setError(null);
  }

  function backToEmail() {
    setMethod("email");
    setStage("form");
    setError(null);
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

  function onPhoneCode(e: FormEvent<HTMLFormElement>) {
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

  // ─── Success states ──────────────────────────────────────────
  if (stage === "email-sent") {
    return (
      <div className="cont-login-success" style={{ textAlign: "center", alignItems: "center" }}>
        <div className="eyebrow" style={{ alignSelf: "center" }}>
          cont creat · verifică emailul
        </div>
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
          Ești la un click distanță.
        </h2>
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

  if (stage === "phone-done") {
    return (
      <div className="cont-login-success" style={{ textAlign: "center", alignItems: "center" }}>
        <div className="eyebrow" style={{ alignSelf: "center" }}>cont creat · conectat</div>
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

  // ─── Phone code stage ───────────────────────────────────────
  if (stage === "phone-code") {
    return (
      <form className="cont-login-form" onSubmit={onPhoneCode} noValidate>
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
            style={{ letterSpacing: "0.4em", fontSize: 18, textAlign: "center" }}
          />
        </div>
        {error && <div className="auth-error">{error}</div>}
        <button type="submit" disabled={pending || code.length !== 6}>
          {pending ? "se verifică…" : "verifică și creează cont"}
          {!pending && (
            <svg className="arrow-svg" width="16" height="8" viewBox="0 0 24 12" aria-hidden="true">
              <use href="#arrow-right" />
            </svg>
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            setStage("phone-input");
            setCode("");
            setError(null);
          }}
          style={resetLinkStyle}
        >
          Schimbă numărul
        </button>
      </form>
    );
  }

  // ─── Phone number entry ─────────────────────────────────────
  if (stage === "phone-input") {
    return (
      <>
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
            <Link href="/termeni" style={{ color: "var(--ink-soft)" }}>Termenii</Link>{" "}
            și{" "}
            <Link href="/confidentialitate" style={{ color: "var(--ink-soft)" }}>Politica</Link>
            . Confirmi că ai peste 18 ani.
          </p>

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

  // ─── Default: full email signup form ────────────────────────
  return (
    <>
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
            <Link href="/termeni" target="_blank">Termenii</Link>{" "}
            și{" "}
            <Link href="/confidentialitate" target="_blank">Politica de confidențialitate</Link>
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
          {pending ? "se creează…" : "Creează cont"}
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

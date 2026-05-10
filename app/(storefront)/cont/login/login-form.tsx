"use client";

import { useState, type FormEvent } from "react";
import { GoogleButton } from "@/components/auth/google-button";

type Method = "email" | "google" | "phone";

/**
 * Login form (front-only stub).
 * Real wiring lands in Pas 7 backend:
 *  - email   → supabase.auth.signInWithOtp({ email })
 *  - google  → supabase.auth.signInWithOAuth({ provider: "google" })
 *  - phone   → supabase.auth.signInWithOtp({ phone })
 */
export function LoginForm() {
  const [method, setMethod] = useState<Method>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<"input" | "code" | "sent">("input");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setStage("input");
    setError(null);
    setCode("");
  }

  function switchMethod(m: Method) {
    setMethod(m);
    reset();
  }

  function onEmail(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.includes("@")) {
      setError("Adresă de email invalidă.");
      return;
    }
    setError(null);
    setPending(true);
    // TODO: supabase.auth.signInWithOtp({ email })
    setTimeout(() => {
      setPending(false);
      setStage("sent");
    }, 500);
  }

  function onPhone(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const clean = phone.replace(/\s+/g, "");
    if (!/^(\+?40)?0?7\d{8}$/.test(clean)) {
      setError("Număr de telefon invalid (ex: 0752 232 912).");
      return;
    }
    setError(null);
    setPending(true);
    // TODO: supabase.auth.signInWithOtp({ phone })
    setTimeout(() => {
      setPending(false);
      setStage("code");
    }, 500);
  }

  function onCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setError("Codul are 6 cifre.");
      return;
    }
    setError(null);
    setPending(true);
    // TODO: supabase.auth.verifyOtp({ phone, token: code, type: "sms" })
    setTimeout(() => {
      setPending(false);
      setStage("sent");
    }, 500);
  }

  function onGoogle() {
    // TODO: supabase.auth.signInWithOAuth({ provider: "google" })
    alert(
      "Conectarea cu Google va fi activă după setarea OAuth în Supabase (Pas 7 backend).",
    );
  }

  if (stage === "sent" && method === "email") {
    return (
      <div className="cont-login-success">
        <div className="eyebrow">link trimis</div>
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
          Verifică emailul.
        </h1>
        <p
          style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: 13,
            lineHeight: 1.85,
            color: "var(--ink-soft)",
          }}
        >
          Ți-am trimis un link la <strong>{email}</strong>. Click pe el și ești
          conectat. Linkul expiră în 15 minute. Dacă nu îl găsești, verifică
          folderul de spam.
        </p>
        <button
          type="button"
          onClick={() => {
            reset();
            setEmail("");
          }}
          style={resetLinkStyle}
        >
          Trimite altă adresă
        </button>
      </div>
    );
  }

  if (stage === "sent" && method === "phone") {
    return (
      <div className="cont-login-success">
        <div className="eyebrow">conectat</div>
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
              onChange={(e) => setEmail(e.target.value)}
              disabled={pending}
            />
          </div>
          {error && <div className="auth-error">{error}</div>}
          <button type="submit" disabled={pending || !email.trim()}>
            {pending ? "se trimite…" : "trimite link de conectare"}
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
          <GoogleButton label="Continuă cu Google" onClick={onGoogle} />
          <p
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 11,
              lineHeight: 1.7,
              color: "var(--ink-mute)",
              marginTop: 4,
            }}
          >
            Folosim doar adresa de email și numele din contul tău Google.
            Nu postăm nimic.
          </p>
        </div>
      )}

      {method === "phone" && stage === "input" && (
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

      {method === "phone" && stage === "code" && (
        <form className="cont-login-form" onSubmit={onCode} noValidate>
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
            onClick={reset}
            style={resetLinkStyle}
          >
            Schimbă numărul
          </button>
        </form>
      )}
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

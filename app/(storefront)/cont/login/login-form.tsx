"use client";

import { useState, type FormEvent } from "react";

/**
 * Magic-link login form (front-only stub).
 * Real wiring (supabase.auth.signInWithOtp) lands in Pas 7 backend.
 */
export function LoginForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) return;
    setPending(true);
    // Simulate Resend/Supabase round-trip with a tiny delay.
    setTimeout(() => {
      setPending(false);
      setSubmitted(true);
    }, 500);
  }

  if (submitted) {
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
            setSubmitted(false);
            setEmail("");
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
          }}
        >
          Trimite altă adresă
        </button>
      </div>
    );
  }

  return (
    <form className="cont-login-form" onSubmit={onSubmit} noValidate>
      <input
        type="email"
        name="email"
        placeholder="adresa ta de email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={pending}
      />
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
  );
}

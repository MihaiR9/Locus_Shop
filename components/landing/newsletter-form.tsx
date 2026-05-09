"use client";

import { useState, type FormEvent } from "react";

export function NewsletterForm() {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Real wiring (Resend + DB) lands in Phase 1.5 alongside compliance.
    // For now: just acknowledge so the form feels alive.
    setSubmitted(true);
  }

  return (
    <form className="newsletter-form" onSubmit={onSubmit} noValidate>
      <label htmlFor="newsletter-email" style={{ position: "absolute", left: -9999, top: "auto" }}>
        Email
      </label>
      <input
        id="newsletter-email"
        type="email"
        placeholder="adresa ta de email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={submitted}
      />
      <button type="submit" disabled={submitted}>
        {submitted ? "mulțumim ✓" : "Abonează-te"}
        {!submitted && (
          <svg className="arrow-svg" viewBox="0 0 24 12" aria-hidden="true">
            <use href="#arrow-right" />
          </svg>
        )}
      </button>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { subscribeNewsletter, type NewsletterResult } from "@/app/actions/newsletter";

const INITIAL: NewsletterResult = { ok: false, error: "" };

export function NewsletterForm() {
  const [state, formAction, pending] = useActionState<NewsletterResult, FormData>(
    subscribeNewsletter,
    INITIAL,
  );

  // After a successful submit, replace the form with a confirmation.
  if (state.ok) {
    return (
      <div
        className="newsletter-form"
        role="status"
        aria-live="polite"
        style={{ alignItems: "center", color: "var(--pamant)" }}
      >
        <span>mulțumim ✓ — ți-am trimis un email de confirmare.</span>
      </div>
    );
  }

  return (
    <form className="newsletter-form" action={formAction} noValidate>
      <label
        htmlFor="newsletter-email"
        style={{ position: "absolute", left: -9999, top: "auto" }}
      >
        Email
      </label>
      <input
        id="newsletter-email"
        name="email"
        type="email"
        placeholder="adresa ta de email"
        required
        disabled={pending}
        autoComplete="email"
      />
      <button type="submit" disabled={pending}>
        {pending ? "se trimite…" : "Abonează-te"}
        {!pending && (
          <svg className="arrow-svg" viewBox="0 0 24 12" aria-hidden="true">
            <use href="#arrow-right" />
          </svg>
        )}
      </button>
      {!state.ok && state.error && (
        <div
          role="alert"
          style={{
            position: "absolute",
            marginTop: 50,
            fontSize: 11,
            color: "rgba(235,225,218,0.85)",
            fontFamily: "var(--font-mono), monospace",
          }}
        >
          {state.error}
        </div>
      )}
    </form>
  );
}

"use client";

import { useActionState, useState } from "react";
import { submitContact, type ContactState } from "./actions";

const INITIAL: ContactState = { ok: false };

const REASONS = [
  { value: "comanda", label: "O comandă (suport, modificare)" },
  { value: "horeca", label: "Parteneriat HoReCa" },
  { value: "presa", label: "Presă" },
  { value: "altceva", label: "Altceva" },
];

export function ContactForm() {
  const [state, formAction, pending] = useActionState<ContactState, FormData>(
    submitContact,
    INITIAL,
  );

  // formKey forces form remount on "Trimite alt mesaj" → clears native inputs
  // and resets useActionState's external view of the form's identity.
  const [formKey, setFormKey] = useState(0);

  if (state.ok) {
    return (
      <div className="contact-success">
        <div className="eyebrow">Confirmat</div>
        <h3>Mesaj trimis.</h3>
        <p>
          Revenim în maxim 48 de ore. Verifică-ți și folderul de spam — uneori
          răspunsurile noastre ajung acolo.
        </p>
        <div className="contact-success-actions">
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              setFormKey((k) => k + 1);
              // Force re-render with fresh action state by reloading the page —
              // simplest way to reset useActionState in React 19. Avoids
              // the perma-success-flag trap.
              window.location.reload();
            }}
          >
            <span>Trimite alt mesaj</span>
            <svg className="arrow-svg" viewBox="0 0 24 12" aria-hidden="true">
              <use href="#arrow-right" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <form key={formKey} action={formAction} className="contact-form" noValidate>
      <div className="contact-form-row">
        <div className="contact-field">
          <label className="contact-label" htmlFor="contact-name">
            Nume<span className="req">*</span>
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            className="contact-input"
            placeholder="numele tău"
            required
            autoComplete="name"
          />
        </div>
        <div className="contact-field">
          <label className="contact-label" htmlFor="contact-email">
            Email<span className="req">*</span>
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            className="contact-input"
            placeholder="adresa@email.ro"
            required
            autoComplete="email"
          />
        </div>
      </div>

      <div className="contact-form-row">
        <div className="contact-field">
          <label className="contact-label" htmlFor="contact-phone">
            Telefon (opțional)
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            className="contact-input"
            placeholder="07xx xxx xxx"
            autoComplete="tel"
          />
        </div>
        <div className="contact-field">
          <label className="contact-label" htmlFor="contact-reason">
            Motiv<span className="req">*</span>
          </label>
          <select
            id="contact-reason"
            name="reason"
            className="contact-select"
            required
            defaultValue=""
          >
            <option value="" disabled>
              alege un motiv
            </option>
            {REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="contact-field">
        <label className="contact-label" htmlFor="contact-message">
          Mesaj<span className="req">*</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          className="contact-textarea"
          placeholder="scrie aici ce vrei să ne spui — fără grabă"
          required
          minLength={10}
          rows={6}
        />
      </div>

      {state.error && <p className="contact-error">{state.error}</p>}

      <button type="submit" className="contact-submit" disabled={pending}>
        {pending ? "Se trimite…" : "Trimite mesajul"}
        <svg className="arrow-svg" viewBox="0 0 24 12" aria-hidden="true">
          <use href="#arrow-right" />
        </svg>
      </button>
    </form>
  );
}

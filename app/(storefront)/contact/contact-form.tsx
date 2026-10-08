"use client";

import { useActionState, useEffect, useRef, useState } from "react";
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
          <span className="contact-label" id="contact-reason-label">
            Motiv<span className="req">*</span>
          </span>
          <ReasonSelect />
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

function ReasonSelect() {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const selected = REASONS.find((r) => r.value === value);

  function openList() {
    const index = REASONS.findIndex((r) => r.value === value);
    setActive(index === -1 ? 0 : index);
    setOpen(true);
  }

  function choose(index: number) {
    setValue(REASONS[index].value);
    setOpen(false);
    buttonRef.current?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((i) => Math.min(i + 1, REASONS.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((i) => Math.max(i - 1, 0));
        break;
      case "Home":
        e.preventDefault();
        setActive(0);
        break;
      case "End":
        e.preventDefault();
        setActive(REASONS.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        choose(active);
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  }

  return (
    <div className="contact-select" ref={rootRef}>
      <input type="hidden" name="reason" value={value} />
      <button
        ref={buttonRef}
        type="button"
        id="contact-reason"
        className="contact-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="contact-reason-list"
        aria-labelledby="contact-reason-label contact-reason"
        aria-activedescendant={open ? `contact-reason-${active}` : undefined}
        data-placeholder={selected ? undefined : ""}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
      >
        {selected ? selected.label : "alege un motiv"}
      </button>
      {open && (
        <ul
          id="contact-reason-list"
          role="listbox"
          aria-labelledby="contact-reason-label"
          className="contact-select-list"
        >
          {REASONS.map((r, i) => (
            <li
              key={r.value}
              id={`contact-reason-${i}`}
              role="option"
              aria-selected={r.value === value}
              data-active={i === active ? "" : undefined}
              className="contact-select-option"
              onPointerEnter={() => setActive(i)}
              onClick={() => choose(i)}
            >
              {r.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

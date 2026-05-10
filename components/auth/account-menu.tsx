"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/**
 * Account icon dropdown for the site header. Click → toggle.
 * Shows two CTAs: "Intră în cont" (login) + "Cont nou" (signup).
 *
 * When Supabase Auth is wired up (Pas 7 backend), this becomes a
 * client-only check on the session and renders different links for
 * logged-in users (Comenzi, Setări, Ieșire).
 */
export function AccountMenu() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // Close on outside click + Escape.
  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={wrapRef}
      className={`account-dropdown-wrap ${open ? "is-open" : ""}`}
    >
      <button
        type="button"
        className="account-btn"
        aria-label="Contul meu"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          aria-hidden="true"
        >
          <circle cx="8" cy="6" r="2.5" />
          <path d="M3 14 C3.5 11 5.5 10 8 10 C10.5 10 12.5 11 13 14" />
        </svg>
      </button>

      <div className="account-dropdown" role="menu" aria-hidden={!open}>
        <div className="account-dropdown-msg">
          Intră în contul tău Locus și vezi comenzile, retururile și
          adresele salvate.
        </div>
        <Link
          href="/cont/login"
          className="account-dropdown-cta primary"
          role="menuitem"
          onClick={() => setOpen(false)}
        >
          Intră în cont
        </Link>
        <Link
          href="/cont/signup"
          className="account-dropdown-cta secondary"
          role="menuitem"
          onClick={() => setOpen(false)}
        >
          Cont nou
        </Link>
      </div>
    </div>
  );
}

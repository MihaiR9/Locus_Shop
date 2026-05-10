"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { logoutAction } from "@/app/(auth)/cont/auth-actions";

type SessionUser = { firstName: string; fullName: string };

/**
 * Account icon dropdown for the site header. Click → toggle.
 *
 * Two states:
 *  - logged out: "Intră în cont" + "Cont nou" CTAs (eMAG-style)
 *  - logged in:  greeting + Comenzi / Retururi / Adrese / Setări / Ieșire
 *
 * The session is resolved server-side in the storefront layout and passed
 * down as `sessionUser`. No client-side getUser() roundtrip on every page.
 */
export function AccountMenu({ sessionUser }: { sessionUser: SessionUser | null }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

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
        aria-label={sessionUser ? "Contul tău" : "Conectează-te"}
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
        {sessionUser ? (
          <>
            <div className="account-dropdown-msg">
              Bună,{" "}
              <strong style={{ color: "var(--ink)" }}>
                {sessionUser.firstName || sessionUser.fullName || "client"}
              </strong>
              .
            </div>
            <Link
              href="/cont"
              className="account-dropdown-cta primary"
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              Contul meu
            </Link>
            <Link
              href="/cont/comenzi"
              className="account-dropdown-cta secondary"
              role="menuitem"
              onClick={() => setOpen(false)}
              style={{ letterSpacing: "0.16em" }}
            >
              Comenzi
            </Link>
            <Link
              href="/cont/setari"
              className="account-dropdown-cta secondary"
              role="menuitem"
              onClick={() => setOpen(false)}
              style={{ letterSpacing: "0.16em" }}
            >
              Setări
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="account-dropdown-cta secondary"
                role="menuitem"
                style={{
                  width: "100%",
                  letterSpacing: "0.16em",
                  background: "transparent",
                }}
              >
                Ieșire
              </button>
            </form>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}

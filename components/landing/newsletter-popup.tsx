"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { subscribeNewsletter, type NewsletterResult } from "@/app/actions/newsletter";

/**
 * Pop-up de abonare cu reducere la prima comandă.
 *
 * Reguli de bun-simț, ca să nu alunge oamenii:
 *  - apare o singură dată, după 18s SAU la 55% din pagină (ce vine primul)
 *  - refuzul se ține minte 30 de zile; abonarea, un an
 *  - nu apare deloc peste age gate sau peste bannerul de cookies —
 *    trei ferestre suprapuse la prima vizită sunt un motiv de plecare
 *  - se închide cu Escape, cu click în afară sau din buton
 */

const KEY = "locus-nl-popup";
const DISMISS_DAYS = 30;
const SUBSCRIBED_DAYS = 365;
const DELAY_MS = 18000;
const SCROLL_RATIO = 0.55;

const INITIAL: NewsletterResult = { ok: false, error: "" };

function remembered(): boolean {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return false;
    const until = Number(raw);
    return Number.isFinite(until) && Date.now() < until;
  } catch {
    return false;
  }
}

function remember(days: number) {
  try {
    localStorage.setItem(KEY, String(Date.now() + days * 864e5));
  } catch {
    // localStorage blocat (mod privat) — pop-up-ul va reapărea, acceptabil
  }
}

export function NewsletterPopup() {
  const [open, setOpen] = useState(false);
  const openedRef = useRef(false);
  const [state, formAction, pending] = useActionState<NewsletterResult, FormData>(
    subscribeNewsletter,
    INITIAL,
  );

  const retryRef = useRef<number | null>(null);

  /**
   * Cere deschiderea pop-up-ului.
   *
   * Dacă age gate-ul sau bannerul de cookies sunt încă pe ecran, NU
   * renunțăm — reîncercăm din două în două secunde. Prima versiune ieșea
   * definitiv, așa că la o primă vizită (unde bannerul e mereu prezent la
   * secunda 18) pop-up-ul nu apărea niciodată.
   */
  const show = useCallback(() => {
    if (openedRef.current || remembered()) return;

    if (document.querySelector(".age-gate, .cookie-banner")) {
      if (retryRef.current === null) {
        retryRef.current = window.setInterval(() => {
          if (openedRef.current || remembered()) {
            window.clearInterval(retryRef.current!);
            retryRef.current = null;
            return;
          }
          if (!document.querySelector(".age-gate, .cookie-banner")) {
            window.clearInterval(retryRef.current!);
            retryRef.current = null;
            openedRef.current = true;
            setOpen(true);
          }
        }, 2000);
      }
      return;
    }

    openedRef.current = true;
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    remember(DISMISS_DAYS);
  }, []);

  useEffect(() => {
    if (remembered()) return;

    const timer = window.setTimeout(show, DELAY_MS);
    const onScroll = () => {
      const seen = (window.scrollY + window.innerHeight) / document.body.scrollHeight;
      if (seen > SCROLL_RATIO) show();
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      if (retryRef.current !== null) {
        window.clearInterval(retryRef.current);
        retryRef.current = null;
      }
    };
  }, [show]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  // Abonare reușită → ținem minte un an și închidem după confirmare.
  useEffect(() => {
    if (!state.ok) return;
    remember(SUBSCRIBED_DAYS);
    const t = window.setTimeout(() => setOpen(false), 2600);
    return () => window.clearTimeout(t);
  }, [state.ok]);

  if (!open) return null;

  return (
    <div
      className="nl-pop-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="nlPopTitle"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="nl-pop">
        <button type="button" className="nl-pop-close" onClick={close} aria-label="Închide">
          ×
        </button>

        <div className="nl-pop-visual" aria-hidden="true">
          <Image
            src="/photos/products/cuvinte-feteasca-regala-nobg.png"
            alt=""
            width={941}
            height={1672}
            sizes="240px"
          />
        </div>

        <div className="nl-pop-body">
          {state.ok ? (
            <div role="status" aria-live="polite">
              <span className="nl-pop-badge">✓</span>
              <h2 className="nl-pop-title">Gata.</h2>
              <p className="nl-pop-text">
                Ți-am trimis un email de confirmare. Codul de reducere ajunge
                imediat după ce confirmi adresa.
              </p>
            </div>
          ) : (
            <>
              <span className="nl-pop-badge">−10%</span>
              <h2 className="nl-pop-title" id="nlPopTitle">
                La prima ta comandă.
              </h2>
              <p className="nl-pop-text">
                Lasă-ne adresa de email și îți trimitem codul. Pe lângă el,
                notițe din vie și invitații la degustări — doar când avem ce
                povesti.
              </p>

              <form className="nl-pop-form" action={formAction} noValidate>
                <label className="sr-only" htmlFor="nlPopEmail">
                  Adresa de email
                </label>
                <input
                  id="nlPopEmail"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="adresa ta de email"
                />
                <button type="submit" disabled={pending}>
                  {pending ? "Se trimite…" : "Trimite-mi codul"}
                </button>
              </form>

              {state.error ? (
                <p className="nl-pop-error" role="alert">
                  {state.error}
                </p>
              ) : null}

              <p className="nl-pop-fine">
                Te poți dezabona oricând. Nu vindem datele nimănui. Trebuie să
                ai 18 ani împliniți pentru a comanda.
              </p>
              <button type="button" className="nl-pop-decline" onClick={close}>
                Nu acum, mulțumesc
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { BottleSvg } from "@/components/landing/bottle-svg";
import { useCartStore } from "@/lib/cart-store";
import { formatRon } from "@/lib/wines";

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const close = useCartStore((s) => s.close);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);
  // Stable primitive (the items object ref doesn't change unless mutated),
  // then derive everything via useMemo. Avoids the useSyncExternalStore
  // loop that React 19 + Zustand v5 hits if the selector returns a new
  // array/object reference each time.
  const items = useCartStore((s) => s.items);
  const lines = useMemo(() => Object.values(items), [items]);
  const subtotal = useMemo(
    () => lines.reduce((sum, l) => sum + l.priceRon * l.qty, 0),
    [lines],
  );

  // ESC closes drawer + lock body scroll while open.
  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, close]);

  const empty = lines.length === 0;

  return (
    <aside
      className={`cart-drawer ${isOpen ? "is-open" : ""}`}
      aria-hidden={!isOpen}
      aria-label="Coșul tău"
    >
      <div
        className="cart-backdrop"
        onClick={close}
        role="presentation"
      />
      <div
        className="cart-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
      >
        <header className="cart-head">
          <div>
            <div className="eyebrow">coșul tău</div>
            <h3 id="cart-title" className="cart-title">
              Selecția ta
            </h3>
          </div>
          <button
            type="button"
            className="cart-close"
            onClick={close}
            aria-label="Închide coșul"
          >
            <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
              <path d="M2 2 L10 10 M10 2 L2 10" />
            </svg>
          </button>
        </header>

        <div className="cart-body">
          {empty ? (
            <div className="cart-empty">
              <p>
                Coșul e încă gol.
                <br />
                Începe cu o sticlă.
              </p>
              <button type="button" className="btn-ghost" onClick={close}>
                <span>Vezi vinurile</span>
                <svg className="arrow-svg" viewBox="0 0 24 12" aria-hidden="true">
                  <use href="#arrow-right" />
                </svg>
              </button>
            </div>
          ) : (
            <ul className="cart-items">
              {lines.map((line) => (
                <li key={line.code} className="cart-item">
                  <div className="cart-item-img">
                    <BottleSvg
                      color={line.bottleColor}
                      gama={line.gama}
                      code={line.code}
                    />
                  </div>
                  <div className="cart-item-body">
                    <div className="cart-item-meta">
                      {line.gama} · {line.code}
                    </div>
                    <div className="cart-item-name">{line.name}</div>
                    <div className="cart-item-price">
                      {formatRon(line.priceRon)}{" "}
                      <span className="per">/ sticlă</span>
                    </div>
                    <div className="qty">
                      <button
                        type="button"
                        onClick={() => updateQty(line.code, line.qty - 1)}
                        aria-label={`Scade cantitatea pentru ${line.name}`}
                      >
                        −
                      </button>
                      <span aria-live="polite">{line.qty}</span>
                      <button
                        type="button"
                        onClick={() => updateQty(line.code, line.qty + 1)}
                        aria-label={`Crește cantitatea pentru ${line.name}`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="cart-item-remove"
                    onClick={() => removeItem(line.code)}
                    aria-label={`Elimină ${line.name} din coș`}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {!empty && (
          <footer className="cart-foot">
            <div className="cart-row">
              <span>Subtotal</span>
              <span>{formatRon(subtotal)}</span>
            </div>
            <div className="cart-row">
              <span>Transport</span>
              <span>se calculează la checkout</span>
            </div>
            <div className="cart-row cart-total">
              <span>Total</span>
              <span>{formatRon(subtotal)}</span>
            </div>
            <Link href="/checkout" className="cart-checkout" onClick={close}>
              Către checkout
              <svg className="arrow-svg" viewBox="0 0 24 12" aria-hidden="true">
                <use href="#arrow-right" />
              </svg>
            </Link>
            <p className="cart-note">
              Livrare în 2–4 zile lucrătoare. Conține sulfiți. Consumul excesiv
              de alcool dăunează sănătății.
            </p>
          </footer>
        )}
      </div>
    </aside>
  );
}

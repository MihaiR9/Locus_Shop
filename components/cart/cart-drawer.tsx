"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { BottleSvg } from "@/components/landing/bottle-svg";
import { selectLines, useCartStore } from "@/lib/cart-store";
import { formatRon, metaLine, WINES } from "@/lib/wines";

const WINE_BY_CODE = Object.fromEntries(WINES.map((w) => [w.code, w] as const));

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const close = useCartStore((s) => s.close);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);
  // Select primitiva stabilă (items obj e same-ref în Zustand cât timp nu se modifică),
  // apoi derivăm lines + subtotal cu useMemo. Asta evită loop-ul din React 19 +
  // useSyncExternalStore care apare când selectorul creează obiecte noi.
  const items = useCartStore((s) => s.items);
  const lines = useMemo(() => selectLines({ items, isOpen: false } as never), [items]);
  const subtotal = useMemo(() => {
    let total = 0;
    for (const [code, qty] of Object.entries(items)) {
      const w = WINE_BY_CODE[code];
      if (w) total += w.priceRon * qty;
    }
    return total;
  }, [items]);

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
              {lines.map(({ wine, qty }) => (
                <li key={wine.code} className="cart-item">
                  <div className="cart-item-img">
                    <BottleSvg color={wine.bottleColor} gama={wine.gama} code={wine.code} />
                  </div>
                  <div className="cart-item-body">
                    <div className="cart-item-meta">
                      {wine.gama} · {wine.code}
                    </div>
                    <div className="cart-item-name">{wine.name}</div>
                    <div className="cart-item-meta cart-item-meta--lower">
                      {metaLine(wine)} · {wine.abv.toString().replace(".", ",")}%
                    </div>
                    <div className="cart-item-price">
                      {formatRon(wine.priceRon)} <span className="per">/ sticlă</span>
                    </div>
                    <div className="qty">
                      <button
                        type="button"
                        onClick={() => updateQty(wine.code, qty - 1)}
                        aria-label={`Scade cantitatea pentru ${wine.name}`}
                      >
                        −
                      </button>
                      <span aria-live="polite">{qty}</span>
                      <button
                        type="button"
                        onClick={() => updateQty(wine.code, qty + 1)}
                        aria-label={`Crește cantitatea pentru ${wine.name}`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="cart-item-remove"
                    onClick={() => removeItem(wine.code)}
                    aria-label={`Elimină ${wine.name} din coș`}
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

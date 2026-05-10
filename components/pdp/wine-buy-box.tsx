"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/cart-store";
import { abvLabel, metaLine, type Wine } from "@/lib/wines";

export function WineBuyBox({ wine }: { wine: Wine }) {
  const [qty, setQty] = useState(1);
  const [pulsing, setPulsing] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const open = useCartStore((s) => s.open);

  function dec() {
    setQty((q) => Math.max(1, q - 1));
  }
  function inc() {
    setQty((q) => Math.min(99, q + 1));
  }

  function addToCart() {
    addItem(wine, qty);
    open();
    setPulsing(true);
    window.setTimeout(() => setPulsing(false), 600);
  }

  return (
    <div className="buy">
      <div className="meta-line">
        <span>{wine.gama} · {wine.code}</span>
        <span className="dot" aria-hidden="true" />
        <span>Cod {wine.code}</span>
        <span className="dot" aria-hidden="true" />
        <span>Recoltă {wine.year}</span>
      </div>

      <h1 className="h1">{wine.name}</h1>

      <div className="specs">
        <div className="spec">
          <div className="spec-label">Culoare · Vinificat</div>
          <div className="spec-value">{metaLine(wine)}</div>
        </div>
        <div className="spec">
          <div className="spec-label">Alcool</div>
          <div className="spec-value">{abvLabel(wine)}</div>
        </div>
        <div className="spec">
          <div className="spec-label">Apelațiune</div>
          <div className="spec-value">
            DOC-CMD
            <br />
            <span className="spec-value-sub">Panciu · CMD</span>
          </div>
        </div>
        <div className="spec">
          <div className="spec-label">Volum</div>
          <div className="spec-value">
            750 <span className="spec-value-sub">ml</span>
          </div>
        </div>
      </div>

      <div className="price-row">
        <span className="price">{wine.priceRon}</span>
        <span className="price-currency">lei / sticlă</span>
        <span className="price-sub">TVA inclus</span>
      </div>

      <p className="short-note">{wine.short}</p>

      <div className="qty-add">
        <div className="qty-input">
          <button type="button" onClick={dec} aria-label="Scade cantitatea">
            −
          </button>
          <span aria-live="polite">{qty}</span>
          <button type="button" onClick={inc} aria-label="Crește cantitatea">
            +
          </button>
        </div>
        <button
          type="button"
          className={`add-cart ${pulsing ? "is-pulse" : ""}`}
          onClick={addToCart}
        >
          Adaugă în coș
          <svg width="16" height="8" viewBox="0 0 24 12" aria-hidden="true">
            <use href="#arrow-right" />
          </svg>
        </button>
      </div>

      <div className="extras">
        <span>Livrare 2–4 zile</span>
        <span>Plata la livrare disponibilă</span>
        <span>Pachet cadou opțional</span>
      </div>
    </div>
  );
}

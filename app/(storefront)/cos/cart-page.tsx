"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ProductBottle } from "@/components/landing/product-bottle";
import { useCartStore } from "@/lib/cart-store";
import { useCheckoutStore } from "@/lib/checkout-store";
import { formatRon, type Wine } from "@/lib/wines";
import {
  FREE_SHIPPING_THRESHOLD_RON,
  getReferencePrice,
  getShippingMethods,
} from "@/lib/shipping";
import { SGR_PER_BOTTLE_RON, calculateSgrRon, countBottles } from "@/lib/sgr";
import { calculateSetDiscountCents, SET_DISCOUNT_PCT } from "@/lib/sets";
import { applyVoucherAction } from "./actions";

type Props = {
  catalog: Wine[];
};

export function CartPage({ catalog }: Props) {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const addItem = useCartStore((s) => s.addItem);

  const voucher = useCheckoutStore((s) => s.voucher);
  const applyVoucher = useCheckoutStore((s) => s.applyVoucher);
  const clearVoucher = useCheckoutStore((s) => s.clearVoucher);

  const [voucherInput, setVoucherInput] = useState(voucher?.code ?? "");
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [voucherOk, setVoucherOk] = useState<string | null>(null);
  const [voucherPending, startVoucherTransition] = useTransition();

  const lines = useMemo(() => Object.values(items), [items]);
  const subtotal = useMemo(
    () => lines.reduce((sum, l) => sum + l.priceRon * l.qty, 0),
    [lines],
  );
  const totalBottles = countBottles(lines);
  const sgrRon = calculateSgrRon(totalBottles);

  // Reducerea de set, calculată cu aceeași funcție ca pe server —
  // coșul, checkout-ul și suma încasată de Stripe trebuie să spună toate
  // același lucru.
  const setDiscount = useMemo(() => {
    const priceByCode = new Map(
      lines.map((l) => [l.code, Math.round(l.priceRon * 100)]),
    );
    const res = calculateSetDiscountCents(
      lines.map((l) => ({ code: l.code, qty: l.qty })),
      priceByCode,
    );
    return { ron: res.discountCents / 100, matches: res.matches };
  }, [lines]);

  const voucherRon = useMemo(() => {
    if (!voucher) return 0;
    if (voucher.percentOff) {
      return Math.round(subtotal * voucher.percentOff) / 100;
    }
    return Math.min(voucher.fixedOffRon ?? 0, subtotal);
  }, [voucher, subtotal]);

  const discountRon = Math.min(setDiscount.ron + voucherRon, subtotal);

  const remainingForFreeShipping = Math.max(
    0,
    FREE_SHIPPING_THRESHOLD_RON - subtotal,
  );
  const shippingIsFree = subtotal >= FREE_SHIPPING_THRESHOLD_RON;
  const progressPct = shippingIsFree
    ? 100
    : Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD_RON) * 100);

  /**
   * Transportul nu e încă decis în coș — metoda și județul se aleg la
   * pasul următor. Afișăm totuși o valoare, pentru că un coș care ascunde
   * costul livrării până la ultimul pas e exact felul în care se pierd
   * comenzile.
   *
   * „De la" înseamnă cea mai IEFTINĂ opțiune, nu cea mai scumpă. Prima
   * versiune arăta tariful de curier la ușă (32 lei), deci speria omul cu
   * maximul deși putea plăti 18 cu FANbox.
   */
  const shippingOptions = useMemo(
    () =>
      getShippingMethods()
        .map((m) => ({ name: m.name, priceRon: getReferencePrice(m.id) }))
        .sort((a, b) => a.priceRon - b.priceRon),
    [],
  );
  const shippingEstimateRon = shippingOptions[0]?.priceRon ?? 0;
  const shippingRon = shippingIsFree ? 0 : shippingEstimateRon;

  const total = Math.max(0, subtotal - discountRon) + sgrRon + shippingRon;

  // Sugerăm vinuri NU sunt în coș, ordonate după preț (max 3 recomandări).
  const suggestions = useMemo(() => {
    const inCart = new Set(lines.map((l) => l.code));
    return catalog
      .filter((w) => !inCart.has(w.code))
      .slice(0, 3);
  }, [catalog, lines]);

  const empty = lines.length === 0;

  function submitVoucher() {
    const code = voucherInput.trim().toUpperCase();
    setVoucherError(null);
    setVoucherOk(null);
    if (!code) {
      clearVoucher();
      return;
    }
    startVoucherTransition(async () => {
      const res = await applyVoucherAction(code, Math.round(subtotal * 100));
      if (!res.ok) {
        setVoucherError(res.error);
        clearVoucher();
        return;
      }
      // Nu știm exact dacă e percent sau fixed doar din răspuns — deducem
      // proporția din discountCents/subtotal ca aproximare pentru UI.
      applyVoucher({
        code: res.code,
        percentOff: null,
        fixedOffRon: res.discountCents / 100,
      });
      setVoucherOk(`Aplicat: −${formatRon(res.discountCents / 100)}`);
    });
  }

  function removeVoucher() {
    setVoucherInput("");
    setVoucherError(null);
    setVoucherOk(null);
    clearVoucher();
  }

  return (
    <div className="cart-page-grid">
      {/* LEFT: items + bundles */}
      <div className="cart-page-left">
        {empty ? (
          <section className="cart-page-empty">
            <p>
              Coșul e încă gol.
              <br />
              Începe cu o sticlă.
            </p>
            <Link href="/shop" className="btn btn-solid">
              Vezi vinurile
              <svg className="arrow" viewBox="0 0 24 12" aria-hidden="true">
                <use href="#arrow-right" />
              </svg>
            </Link>
          </section>
        ) : (
          <section className="cart-page-items">
            <header className="cart-page-section-head">
              <h2 className="h3">Selecția ta</h2>
              <span className="count">
                {totalBottles} {totalBottles === 1 ? "sticlă" : "sticle"}
              </span>
            </header>

            {/* Setul nu e un produs separat — e o stare a coșului. Când
                toate cele trei vinuri ale unei game sunt prezente, o
                spunem explicit, ca reducerea din sumar să aibă un motiv
                vizibil. */}
            {setDiscount.matches.map((m) => (
              <div className="cart-set-flag" key={m.def.key}>
                <span className="cart-set-mark" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <use href="#star8" />
                  </svg>
                </span>
                <span className="cart-set-text">
                  <strong>
                    {m.def.label}
                    {m.count > 1 ? ` ×${m.count}` : ""}
                  </strong>
                  <span>
                    {m.def.note} · {SET_DISCOUNT_PCT}% aplicat automat
                  </span>
                </span>
              </div>
            ))}
            <ul className="cart-page-list">
              {lines.map((line) => (
                <li key={line.code} className="cart-page-item">
                  <div className="cart-page-item-img">
                    <ProductBottle
                      code={line.code}
                      name={line.name}
                      gama={line.gama}
                      color={line.bottleColor}
                      size={140}
                    />
                  </div>
                  <div className="cart-page-item-body">
                    <div className="cart-page-item-meta">
                      {line.gama} · {line.code}
                    </div>
                    <div className="cart-page-item-name">{line.name}</div>
                    <div className="cart-page-item-price">
                      {formatRon(line.priceRon)}
                      <span className="per"> / sticlă</span>
                    </div>
                  </div>
                  <div className="cart-page-item-actions">
                    <div className="qty">
                      <button
                        type="button"
                        onClick={() => updateQty(line.code, line.qty - 1)}
                        aria-label="Scade"
                      >
                        −
                      </button>
                      <span aria-live="polite">{line.qty}</span>
                      <button
                        type="button"
                        onClick={() => updateQty(line.code, line.qty + 1)}
                        aria-label="Crește"
                      >
                        +
                      </button>
                    </div>
                    <div className="cart-page-item-total">
                      {formatRon(line.priceRon * line.qty)}
                    </div>
                    <button
                      type="button"
                      className="cart-page-item-remove"
                      onClick={() => removeItem(line.code)}
                    >
                      șterge
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {!empty && suggestions.length > 0 && (
          <section className="cart-page-bundles">
            <header className="cart-page-section-head">
              <div>
                <div className="eyebrow">merge cu selecția ta</div>
                <h2 className="h3">Adaugă un vin.</h2>
              </div>
            </header>
            <div className="cart-page-bundle-grid">
              {suggestions.map((w) => (
                <article key={w.code} className="cart-page-bundle-card">
                  <div className="cart-page-bundle-img">
                    <ProductBottle
                      code={w.code}
                      name={w.name}
                      gama={w.gama}
                      color={w.bottleColor}
                      size={90}
                    />
                  </div>
                  <div className="cart-page-bundle-body">
                    <div className="cart-page-bundle-meta">
                      {w.gama} · {w.code}
                    </div>
                    <div className="cart-page-bundle-name">{w.name}</div>
                    <div className="cart-page-bundle-price">
                      {formatRon(w.priceRon)}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="cart-page-bundle-add"
                    onClick={() => addItem(w)}
                    aria-label={`Adaugă ${w.name}`}
                  >
                    + adaugă
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* RIGHT: summary */}
      <aside className="cart-page-summary" aria-label="Sumar comandă">
        {!empty && (
          <div className="cart-page-summary-block">
            {/* Progress bar transport gratuit */}
            <div className="cart-page-progress">
              {shippingIsFree ? (
                <div className="cart-page-progress-msg is-success">
                  ✓ Ai transport gratuit.
                </div>
              ) : (
                <div className="cart-page-progress-msg">
                  Mai adaugă{" "}
                  <strong>{formatRon(remainingForFreeShipping)}</strong> pentru
                  transport <strong>gratuit</strong>.
                </div>
              )}
              <div
                className="cart-page-progress-bar"
                role="progressbar"
                aria-valuenow={Math.round(progressPct)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="cart-page-progress-fill"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="cart-page-progress-note">
                {formatRon(subtotal)} din {formatRon(FREE_SHIPPING_THRESHOLD_RON)}
              </div>
            </div>

            {/* Voucher */}
            <div className="cart-page-voucher">
              <label htmlFor="voucher-input">Cod voucher</label>
              <div className="cart-page-voucher-row">
                <input
                  id="voucher-input"
                  className="input"
                  placeholder="ex: LOCUS10"
                  value={voucherInput}
                  onChange={(e) => setVoucherInput(e.target.value)}
                  disabled={voucherPending}
                />
                {voucher ? (
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={removeVoucher}
                    disabled={voucherPending}
                  >
                    scoate
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={submitVoucher}
                    disabled={voucherPending}
                  >
                    {voucherPending ? "…" : "aplică"}
                  </button>
                )}
              </div>
              {voucherError && (
                <p className="cart-page-voucher-msg is-error">{voucherError}</p>
              )}
              {voucherOk && !voucherError && (
                <p className="cart-page-voucher-msg is-success">{voucherOk}</p>
              )}
            </div>

            {/* Totals */}
            <dl className="cart-page-totals">
              <div>
                <dt>Subtotal</dt>
                <dd>{formatRon(subtotal)}</dd>
              </div>
              {setDiscount.matches.map((m) => (
                <div key={m.def.key}>
                  <dt>
                    {m.def.label}
                    {m.count > 1 ? ` ×${m.count}` : ""} · −{SET_DISCOUNT_PCT}%
                  </dt>
                  <dd>−{formatRon(m.discountCents / 100)}</dd>
                </div>
              ))}
              {voucherRon > 0 && (
                <div>
                  <dt>Reducere{voucher ? ` (${voucher.code})` : ""}</dt>
                  <dd>−{formatRon(voucherRon)}</dd>
                </div>
              )}
              <div>
                <dt>
                  Garanție SGR
                  <span className="cart-page-hint">
                    ({SGR_PER_BOTTLE_RON} lei × {totalBottles} sticle)
                  </span>
                </dt>
                <dd>+{formatRon(sgrRon)}</dd>
              </div>
              <div>
                <dt>Transport</dt>
                <dd>
                  {shippingIsFree ? "gratuit" : `de la ${formatRon(shippingEstimateRon)}`}
                </dd>
              </div>
              <div className="cart-page-totals-note">
                {shippingIsFree
                  ? "Transport gratuit — indiferent de metoda aleasă la pasul următor."
                  : `${shippingOptions
                      .map((o) => `${o.name.replace(/\s*\(.*\)/, "")} ${o.priceRon} lei`)
                      .join(" · ")}. Alegi metoda la pasul următor.`}
              </div>
              <div className="cart-page-totals-grand">
                <dt>{shippingIsFree ? "Total" : "Total estimat"}</dt>
                <dd>{formatRon(total)}</dd>
              </div>
            </dl>

            <button
              type="button"
              className="btn btn-solid cart-page-continue"
              onClick={() => router.push("/checkout")}
            >
              Continuă la detalii comandă
              <svg className="arrow" viewBox="0 0 24 12" aria-hidden="true">
                <use href="#arrow-right" />
              </svg>
            </button>

            <p className="cart-page-foot-note">
              Garanția SGR (0.5 lei/sticlă) e obligatorie legal. O recuperezi
              când returnezi sticla la orice punct RetuRO. Conține sulfiți.
              Consumul excesiv de alcool dăunează sănătății.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}

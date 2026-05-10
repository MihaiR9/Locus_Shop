"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BottleSvg } from "@/components/landing/bottle-svg";
import { useCartStore } from "@/lib/cart-store";
import { useCheckoutStore } from "@/lib/checkout-store";
import { formatRon, WINES } from "@/lib/wines";

const WINE_BY_CODE = Object.fromEntries(WINES.map((w) => [w.code, w] as const));
const SHIP_FREE_AT = 250;
const SHIP_FEE = 19;
const COUPONS: Record<string, number> = { LOCUS10: 10, PARTENER15: 15 };

export function OrderSummary() {
  const router = useRouter();

  // Stable primitives only — see CartDrawer for the same Zustand v5 / React 19 pattern.
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clear);
  const shipping = useCheckoutStore((s) => s.shipping);
  const billing = useCheckoutStore((s) => s.billing);
  const termsAccepted = useCheckoutStore((s) => s.termsAccepted);
  const reset = useCheckoutStore((s) => s.reset);

  const [coupon, setCoupon] = useState("");
  const [couponPct, setCouponPct] = useState<number | null>(null);
  const [couponErr, setCouponErr] = useState(false);
  const orderRef = useRef<string | null>(null);

  const lines = useMemo(() => {
    return Object.entries(items)
      .map(([code, qty]) => {
        const w = WINE_BY_CODE[code];
        return w ? { wine: w, qty } : null;
      })
      .filter((x): x is { wine: (typeof WINES)[number]; qty: number } => x !== null);
  }, [items]);

  const subtotal = useMemo(
    () => lines.reduce((s, l) => s + l.wine.priceRon * l.qty, 0),
    [lines],
  );

  const totalQty = useMemo(
    () => Object.values(items).reduce((s, n) => s + n, 0),
    [items],
  );

  const shippingFee = useMemo(() => {
    if (!shipping) return null;
    if (shipping.method === "ridicare") return 0;
    return subtotal >= SHIP_FREE_AT ? 0 : SHIP_FEE;
  }, [shipping, subtotal]);

  const discount = couponPct ? Math.round((subtotal * couponPct) / 100) : 0;
  const total = Math.max(0, subtotal - discount + (shippingFee ?? 0));

  const canPlace =
    lines.length > 0 && shipping !== null && billing !== null && termsAccepted;

  function applyCoupon() {
    const code = coupon.trim().toUpperCase();
    if (!code) return;
    if (COUPONS[code]) {
      setCouponPct(COUPONS[code]);
      setCouponErr(false);
    } else {
      setCouponPct(null);
      setCouponErr(true);
    }
  }

  function placeOrder() {
    if (!canPlace) return;
    const orderId =
      "LC-" + Date.now().toString(36).toUpperCase().slice(-6);
    orderRef.current = orderId;
    // Persist last order id so /success can show it after redirect.
    sessionStorage.setItem("locus-last-order", orderId);
    clearCart();
    reset();
    router.push("/checkout/success?id=" + encodeURIComponent(orderId));
  }

  return (
    <aside className="summary" aria-label="Sumar comandă">
      {/* LEFT: items + coupon */}
      <div className="summary-items-block">
        <div className="summary-head">
          <h2>comanda ta.</h2>
          <span className="count">
            {totalQty} {totalQty === 1 ? "sticlă" : "sticle"}
          </span>
        </div>

        <div className="sum-items">
          {lines.length === 0 ? (
            <div className="sum-empty">
              Coșul este gol.
              <br />
              <Link href="/shop">Alege un vin</Link>
            </div>
          ) : (
            lines.map(({ wine, qty }) => (
              <div key={wine.code} className="sum-item">
                <div className="sum-img">
                  <BottleSvg color={wine.bottleColor} gama={wine.gama} code={wine.code} />
                  <span className="qty">{qty}</span>
                </div>
                <div className="sum-body">
                  <div className="sum-name">{wine.name}</div>
                  <div className="sum-meta">
                    {wine.code} · {wine.gama}
                  </div>
                </div>
                <div className="sum-price">
                  {formatRon(wine.priceRon * qty)}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="sum-coupon">
          <input
            className="input"
            placeholder="Cod voucher"
            value={coupon}
            onChange={(e) => {
              setCoupon(e.target.value);
              setCouponErr(false);
            }}
            style={couponErr ? { borderColor: "#a23" } : undefined}
          />
          <button type="button" onClick={applyCoupon}>
            aplică
          </button>
        </div>
      </div>

      {/* RIGHT: totals + submit */}
      <div className="summary-total-block">
        <div className="sum-rows">
          <div className="sum-row">
            <span>Subtotal</span>
            <span>{formatRon(subtotal)}</span>
          </div>
          <div className="sum-row">
            <span>Transport</span>
            {shippingFee === null ? (
              <span className="muted">se calculează la pasul 1</span>
            ) : shippingFee === 0 ? (
              <span>
                {shipping?.method === "ridicare"
                  ? "gratuit · ridicare"
                  : "gratuit · peste 250 lei"}
              </span>
            ) : (
              <span>{formatRon(shippingFee)} · curier</span>
            )}
          </div>
          {couponPct !== null && (
            <div className="sum-row">
              <span>Voucher ({couponPct}%)</span>
              <span>−{formatRon(discount)}</span>
            </div>
          )}
        </div>

        <div className="sum-total">
          <div className="label">Total</div>
          <div className="val">
            {formatRon(total).replace(" lei", "")}
            <span className="currency">lei</span>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-solid place-order"
          disabled={!canPlace}
          onClick={placeOrder}
        >
          Plasează comanda
          <svg className="arrow" viewBox="0 0 24 12" aria-hidden="true">
            <use href="#arrow-right" />
          </svg>
        </button>

        <p className="sum-foot-note">
          Livrare 2–4 zile · gratis peste 250 lei. Conține sulfiți.
          Consumul excesiv de alcool dăunează sănătății.
        </p>
      </div>
    </aside>
  );
}

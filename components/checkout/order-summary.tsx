"use client";

import Link from "next/link";
import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BottleSvg } from "@/components/landing/bottle-svg";
import { useCartStore } from "@/lib/cart-store";
import { useCheckoutStore } from "@/lib/checkout-store";
import { formatRon } from "@/lib/wines";
import { createOrder } from "@/app/(storefront)/checkout/actions";

const SHIP_FREE_AT = 250;
const SHIP_FEE = 19;
const COUPONS: Record<string, number> = { LOCUS10: 10, PARTENER15: 15 };

export function OrderSummary() {
  const router = useRouter();

  // Stable primitives only — same pattern as CartDrawer.
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clear);
  const shipping = useCheckoutStore((s) => s.shipping);
  const billing = useCheckoutStore((s) => s.billing);
  const termsAccepted = useCheckoutStore((s) => s.termsAccepted);
  const reset = useCheckoutStore((s) => s.reset);

  const [coupon, setCoupon] = useState("");
  const [couponPct, setCouponPct] = useState<number | null>(null);
  const [couponErr, setCouponErr] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  // Idempotency key — generated once per OrderSummary mount. If user
  // double-clicks the submit button or the network retries, the server
  // returns the SAME order instead of inserting twice.
  const idempotencyKeyRef = useRef<string>(
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );

  // CartLine snapshots already carry name/price/gama/bottleColor —
  // no DB join needed. Pricing at place-order time will be re-validated
  // server-side against products.price_cents (Pas 4).
  const lines = useMemo(() => Object.values(items), [items]);

  const subtotal = useMemo(
    () => lines.reduce((s, l) => s + l.priceRon * l.qty, 0),
    [lines],
  );

  const totalQty = useMemo(
    () => lines.reduce((s, l) => s + l.qty, 0),
    [lines],
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
    if (!canPlace || !shipping || !billing) return;
    setPlaceError(null);

    startTransition(async () => {
      const result = await createOrder({
        idempotencyKey: idempotencyKeyRef.current,
        items: lines.map((l) => ({ code: l.code, qty: l.qty })),
        shipping,
        billing,
        payment: useCheckoutStore.getState().payment,
        couponCode: couponPct !== null ? coupon.trim().toUpperCase() : null,
      });

      if (!result.ok) {
        setPlaceError(result.error);
        return;
      }

      // Success — clear local state, persist last order # for /success
      // page (it'll re-fetch the order from DB to render the recap).
      sessionStorage.setItem("locus-last-order", result.orderNumber);
      clearCart();
      reset();
      router.push(
        "/checkout/success?id=" + encodeURIComponent(result.orderNumber),
      );
    });
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
            lines.map((line) => (
              <div key={line.code} className="sum-item">
                <div className="sum-img">
                  <BottleSvg
                    color={line.bottleColor}
                    gama={line.gama}
                    code={line.code}
                  />
                  <span className="qty">{line.qty}</span>
                </div>
                <div className="sum-body">
                  <div className="sum-name">{line.name}</div>
                  <div className="sum-meta">
                    {line.code} · {line.gama}
                  </div>
                </div>
                <div className="sum-price">
                  {formatRon(line.priceRon * line.qty)}
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

        {placeError && (
          <p
            role="alert"
            style={{
              marginTop: 12,
              fontSize: 12,
              color: "#a23",
              fontFamily: "var(--font-mono), monospace",
            }}
          >
            {placeError}
          </p>
        )}

        <button
          type="button"
          className="btn btn-solid place-order"
          disabled={!canPlace || isPending}
          onClick={placeOrder}
        >
          {isPending ? "Se procesează…" : "Plasează comanda"}
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

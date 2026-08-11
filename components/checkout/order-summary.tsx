"use client";

import Link from "next/link";
import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import { useCheckoutStore } from "@/lib/checkout-store";
import { calculateShippingRon, getShippingMethod } from "@/lib/shipping";
import { calculateSgrRon, countBottles, SGR_PER_BOTTLE_RON } from "@/lib/sgr";
import { calculateSetDiscountCents, SET_DISCOUNT_PCT } from "@/lib/sets";
import { formatRon } from "@/lib/wines";
import { createOrder } from "@/app/(storefront)/checkout/actions";
import { applyVoucherAction } from "@/app/(storefront)/cos/actions";

/**
 * OrderSummary — aside sticky din partea dreaptă a /checkout.
 * Rutare: „← înapoi la coș" pentru edit rapid al items, apoi listă
 * produse compactă, sum-rows (subtotal / voucher / SGR / transport),
 * voucher input, total mare Cormorant, CTA „Plasează comanda".
 */

function formatMoneyRo(n: number): { whole: string; cents: string } {
  const whole = Math.floor(n);
  const cents = Math.round((n - whole) * 100)
    .toString()
    .padStart(2, "0");
  return {
    whole: whole.toLocaleString("ro-RO"),
    cents,
  };
}

export function OrderSummary() {
  const router = useRouter();

  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clear);
  const shipping = useCheckoutStore((s) => s.shipping);
  const billing = useCheckoutStore((s) => s.billing);
  const terms = useCheckoutStore((s) => s.termsAccepted);
  const voucher = useCheckoutStore((s) => s.voucher);
  const applyVoucher = useCheckoutStore((s) => s.applyVoucher);
  const clearVoucher = useCheckoutStore((s) => s.clearVoucher);
  const resetCheckout = useCheckoutStore((s) => s.reset);

  const [voucherInput, setVoucherInput] = useState(voucher?.code ?? "");
  const [voucherMsg, setVoucherMsg] = useState<{ text: string; kind: "ok" | "err" } | null>(
    voucher ? { text: `Aplicat (${voucher.code})`, kind: "ok" } : null,
  );
  const [voucherPending, startVoucherTransition] = useTransition();

  const [placeError, setPlaceError] = useState<string | null>(null);
  const [placing, startPlacingTransition] = useTransition();
  const idemRef = useRef<string>(
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );

  const lines = useMemo(() => Object.values(items), [items]);
  const subtotalRon = useMemo(
    () => lines.reduce((s, l) => s + l.priceRon * l.qty, 0),
    [lines],
  );
  const totalBottles = countBottles(lines);
  const sgrRon = calculateSgrRon(totalBottles);

  const shippingCalc = useMemo(() => {
    if (!shipping) return null;
    if (shipping.method === "ridicare")
      return { priceRon: 0, freeApplied: false, methodName: "Ridicare Locus" };
    const m = getShippingMethod(shipping.serviceId);
    const c = calculateShippingRon({
      methodId: shipping.serviceId,
      county: shipping.county,
      subtotalRon,
    });
    return { priceRon: c.priceRon, freeApplied: c.freeApplied, methodName: m?.name ?? "Curier" };
  }, [shipping, subtotalRon]);

  const shippingRon = shippingCalc?.priceRon ?? null;

  // Reducerea de set — aceeași funcție pe care o folosește serverul în
  // `createOrder`, ca sumarul să nu promită alt total decât cel încasat.
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
    if (voucher.percentOff) return Math.round(subtotalRon * voucher.percentOff) / 100;
    return Math.min(voucher.fixedOffRon ?? 0, subtotalRon);
  }, [voucher, subtotalRon]);

  const discountRon = Math.min(setDiscount.ron + voucherRon, subtotalRon);

  const totalRon =
    Math.max(0, subtotalRon - discountRon) + sgrRon + (shippingRon ?? 0);
  const totalMoney = formatMoneyRo(totalRon);

  const canPlace =
    lines.length > 0 && shipping !== null && billing !== null && terms;

  function submitVoucher() {
    const code = voucherInput.trim().toUpperCase();
    setVoucherMsg(null);
    if (!code) {
      clearVoucher();
      setVoucherMsg({ text: "Introdu un cod.", kind: "err" });
      return;
    }
    startVoucherTransition(async () => {
      const res = await applyVoucherAction(code, Math.round(subtotalRon * 100));
      if (!res.ok) {
        clearVoucher();
        setVoucherMsg({ text: res.error, kind: "err" });
        return;
      }
      applyVoucher({
        code: res.code,
        percentOff: null,
        fixedOffRon: res.discountCents / 100,
      });
      setVoucherMsg({
        text: `Voucher aplicat: −${formatRon(res.discountCents / 100)}`,
        kind: "ok",
      });
    });
  }

  function placeOrder() {
    if (!canPlace || !shipping || !billing) return;
    setPlaceError(null);
    startPlacingTransition(async () => {
      const result = await createOrder({
        idempotencyKey: idemRef.current,
        items: lines.map((l) => ({ code: l.code, qty: l.qty })),
        shipping,
        billing,
        payment: useCheckoutStore.getState().payment,
        couponCode: voucher?.code ?? null,
      });
      if (!result.ok) {
        setPlaceError(result.error);
        return;
      }
      sessionStorage.setItem("locus-last-order", result.orderNumber);
      clearCart();
      resetCheckout();
      if (result.stripeSessionUrl) {
        window.location.href = result.stripeSessionUrl;
        return;
      }
      router.push("/checkout/success?id=" + encodeURIComponent(result.orderNumber));
    });
  }

  return (
    <aside className="co-summary" aria-label="Sumar comandă">
      <Link href="/cos" className="co-summary-back">
        <span className="arrow">→</span> înapoi la coș
      </Link>
      <div className="co-summary-title">Sumar comandă</div>

      <div className="co-sum-rows">
        <div className="co-srow">
          <span className="label">
            Subtotal ({totalBottles} {totalBottles === 1 ? "sticlă" : "sticle"})
          </span>
          <span className="value">{formatRon(subtotalRon)}</span>
        </div>

        {setDiscount.matches.map((m) => (
          <div className="co-srow discount" key={m.def.key}>
            <span className="label">
              {m.def.label}
              {m.count > 1 ? ` ×${m.count}` : ""} · −{SET_DISCOUNT_PCT}%
            </span>
            <span className="value">−{formatRon(m.discountCents / 100)}</span>
          </div>
        ))}

        {voucher && voucherRon > 0 && (
          <div className="co-srow discount">
            <span className="label">Voucher ({voucher.code})</span>
            <span className="value">−{formatRon(voucherRon)}</span>
          </div>
        )}

        <div className="co-srow">
          <span className="label">
            Garanție SGR
            <span
              className="hint"
              title={`${SGR_PER_BOTTLE_RON} lei/sticlă — obligatorie prin lege, returnabilă la orice punct RetuRO.`}
            >
              i
            </span>
          </span>
          <span className="value">{formatRon(sgrRon)}</span>
        </div>

        <div className={`co-srow ${shippingRon === null ? "muted" : ""}`}>
          <span className="label">Transport</span>
          <span className="value">
            {shippingRon === null
              ? "alege metoda la pas 1"
              : shippingRon === 0
                ? shipping?.method === "ridicare"
                  ? "gratuit · ridicare"
                  : shippingCalc?.freeApplied
                    ? "gratuit · peste 250 lei"
                    : "gratuit"
                : formatRon(shippingRon)}
          </span>
        </div>

        <div className="co-voucher">
          <input
            type="text"
            placeholder="cod voucher"
            value={voucherInput}
            onChange={(e) => setVoucherInput(e.target.value)}
            disabled={voucherPending}
          />
          {voucher ? (
            <button
              type="button"
              disabled={voucherPending}
              onClick={() => {
                setVoucherInput("");
                clearVoucher();
                setVoucherMsg(null);
              }}
            >
              Scoate
            </button>
          ) : (
            <button type="button" onClick={submitVoucher} disabled={voucherPending}>
              {voucherPending ? "…" : "Aplică"}
            </button>
          )}
        </div>
        {voucherMsg && (
          <div className={`co-voucher-msg ${voucherMsg.kind}`}>{voucherMsg.text}</div>
        )}
      </div>

      <div className="co-sum-total">
        <span className="label">Total</span>
        <span className="value">
          {totalMoney.whole}
          <span className="suffix">,{totalMoney.cents} lei</span>
        </span>
      </div>

      {placeError && (
        <div style={{
          padding: "0 20px 12px",
          fontFamily: "var(--font-mono), monospace",
          fontSize: 11,
          color: "#8C3B2E",
        }}>
          {placeError}
        </div>
      )}

      <button
        type="button"
        className="co-cta"
        disabled={!canPlace || placing}
        onClick={placeOrder}
      >
        {placing ? "Se procesează…" : "Plasează comanda"}
      </button>

      <div className="co-summary-legal">
        <p>
          <strong>Garanție SGR</strong> — {SGR_PER_BOTTLE_RON} lei/sticlă, inclusă
          în total. Se recuperează la returnarea ambalajului la orice punct de
          colectare RetuRO.
        </p>
        <p>Conține sulfiți. Consumul excesiv de alcool dăunează sănătății.</p>
      </div>
    </aside>
  );
}

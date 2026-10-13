"use client";

import { useEffect, useRef } from "react";
import { trackPurchase, hasPurchaseBeenTracked } from "@/lib/analytics/gtm";
import type { PurchasePayload } from "@/lib/analytics/purchase";
import { useCartStore } from "@/lib/cart-store";

type Props = {
  purchase: PurchasePayload;
  clearCartOnFire?: boolean;
};

/**
 * Tracker invizibil pentru pagina de succes — trimite `purchase` o singură
 * dată per order_number (guard prin sessionStorage). Ordinea invocării:
 * 1. `hasPurchaseBeenTracked` marchează order-ul în sessionStorage
 * 2. Dacă e prima dată → `trackPurchase` face push în dataLayer
 * 3. Opțional: golește coșul (default true — după plată e stăpân serverul,
 *    coșul local nu mai reprezintă adevărul).
 *
 * De ce component separat: `success/page.tsx` e Server Component (fetch DB).
 * dataLayer push-ul rulează în browser.
 */
export function PurchaseTracker({ purchase, clearCartOnFire = true }: Props) {
  const firedRef = useRef(false);
  const clear = useCartStore((s) => s.clear);

  useEffect(() => {
    if (firedRef.current) return;
    if (!purchase.transactionId) return;
    if (hasPurchaseBeenTracked(purchase.transactionId)) return;
    firedRef.current = true;

    trackPurchase({
      transactionId: purchase.transactionId,
      value: purchase.value,
      tax: purchase.tax,
      shipping: purchase.shipping,
      couponCode: purchase.coupon,
      items: purchase.items,
    });

    if (clearCartOnFire) clear();
  }, [purchase, clearCartOnFire, clear]);

  return null;
}

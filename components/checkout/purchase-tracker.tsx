"use client";

import { useEffect, useRef } from "react";
import {
  trackPurchase,
  hasPurchaseBeenTracked,
  type GtmItem,
} from "@/lib/analytics/gtm";
import { useCartStore } from "@/lib/cart-store";

type Props = {
  transactionId: string;
  value: number;
  shipping?: number;
  discount?: number;
  couponCode?: string | null;
  items: GtmItem[];
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
export function PurchaseTracker({
  transactionId,
  value,
  shipping,
  discount,
  couponCode,
  items,
  clearCartOnFire = true,
}: Props) {
  const firedRef = useRef(false);
  const clear = useCartStore((s) => s.clear);

  useEffect(() => {
    if (firedRef.current) return;
    if (!transactionId) return;
    if (hasPurchaseBeenTracked(transactionId)) return;
    firedRef.current = true;

    trackPurchase({
      transactionId,
      value,
      shipping,
      discount,
      couponCode: couponCode ?? undefined,
      items,
    });

    if (clearCartOnFire) clear();
  }, [transactionId, value, shipping, discount, couponCode, items, clearCartOnFire, clear]);

  return null;
}

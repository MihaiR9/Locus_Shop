"use client";

import { useActionState } from "react";
import { startPayment, type PayState } from "./actions";

export function PayButton({
  orderNumber,
  exp,
  sig,
  label,
}: {
  orderNumber: string;
  exp: string;
  sig: string;
  label: string;
}) {
  const [state, formAction, pending] = useActionState<PayState, FormData>(
    startPayment,
    {},
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="orderNumber" value={orderNumber} />
      <input type="hidden" name="exp" value={exp} />
      <input type="hidden" name="sig" value={sig} />
      {state.error && <p className="pay-link-error">{state.error}</p>}
      <button type="submit" className="cs-cta" disabled={pending}>
        {pending ? "Se deschide plata…" : label}
        <svg className="arrow" viewBox="0 0 24 12" aria-hidden="true">
          <use href="#arrow-right" />
        </svg>
      </button>
    </form>
  );
}

"use client";

import { useCheckoutStore, type PaymentMethod } from "@/lib/checkout-store";

/**
 * StepPayment — pasul 3 „Plată".
 * 2 metode radio (card online / card la livrare) + checkbox termeni.
 * Pasul rămâne mereu expandat — nu are colaps, e ultima acțiune înainte
 * de „Plasează comanda" (CTA din sumar).
 */

const OPTIONS: Array<{
  value: PaymentMethod;
  name: string;
  desc: string;
  badge: string;
}> = [
  {
    value: "card-online",
    name: "Card online",
    desc: "Stripe Checkout — 3-D Secure, procesare securizată",
    badge: "SSL",
  },
  {
    value: "card-livrare",
    name: "Card bancar la livrare",
    desc: "POS la curier, în momentul predării coletului",
    badge: "POS",
  },
];

export function StepPayment() {
  const payment = useCheckoutStore((s) => s.payment);
  const setPayment = useCheckoutStore((s) => s.setPayment);
  const terms = useCheckoutStore((s) => s.termsAccepted);
  const setTerms = useCheckoutStore((s) => s.setTerms);

  return (
    <section className="co-step" aria-labelledby="co-step-3">
      <header className="co-step-head">
        <div className="co-badge">03</div>
        <h2 className="co-step-title" id="co-step-3">Plată</h2>
        {terms && <span className="co-status">salvat</span>}
      </header>

      <div className="co-pay-list" role="radiogroup" aria-label="Metodă de plată">
        {OPTIONS.map((o) => (
          <label key={o.value} className="co-pay-row">
            <input
              type="radio"
              name="co-payment"
              value={o.value}
              checked={payment === o.value}
              onChange={() => setPayment(o.value)}
            />
            <span>
              <span className="co-pay-name">{o.name}</span>
              <br />
              <span className="co-pay-desc">{o.desc}</span>
            </span>
            <span className="co-pay-badge">{o.badge}</span>
          </label>
        ))}
      </div>

      <div className="co-check-row">
        <input
          id="co-terms"
          type="checkbox"
          checked={terms}
          onChange={(e) => setTerms(e.target.checked)}
        />
        <label htmlFor="co-terms">
          Sunt de acord cu <a href="/termeni" style={{ textDecoration: "underline" }}>termenii și condițiile</a> și confirm că am peste 18 ani.
        </label>
      </div>
    </section>
  );
}

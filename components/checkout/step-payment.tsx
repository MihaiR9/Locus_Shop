"use client";

import { useCheckoutStore, type PaymentMethod } from "@/lib/checkout-store";

const OPTIONS: Array<{
  value: PaymentMethod;
  name: string;
  meta: string;
  icons: string[];
}> = [
  {
    value: "card-online",
    name: "Card online",
    meta: "Procesat securizat prin Stripe · 3-D Secure",
    icons: ["visa", "mc", "amex"],
  },
  {
    value: "card-livrare",
    name: "Card bancar la livrare",
    meta: "Plătești cu cardul, la curier sau în punctul de ridicare",
    icons: ["POS"],
  },
];

export function StepPayment() {
  const payment = useCheckoutStore((s) => s.payment);
  const setPayment = useCheckoutStore((s) => s.setPayment);
  const terms = useCheckoutStore((s) => s.termsAccepted);
  const setTerms = useCheckoutStore((s) => s.setTerms);

  return (
    <section className="step-card is-saved" id="step-3">
      <header className="step-head">
        <div className="step-head-title">
          <span className="checkout-step-num" aria-hidden="true">3</span>
          <h2 className="h3">Cum vrei să achiți.</h2>
        </div>
        <span className="step-secured" aria-label="Plată securizată">
          <svg viewBox="0 0 12 14" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
            <path d="M2 7 V4.5 A4 4 0 0 1 10 4.5 V7" />
            <rect x="1.5" y="7" width="9" height="6" />
          </svg>
          Plată securizată
        </span>
      </header>

      <div className="pay-list" role="radiogroup" aria-label="Mod de plată">
        {OPTIONS.map((o) => (
          <label
            key={o.value}
            className={`pay-row ${payment === o.value ? "is-selected" : ""}`}
          >
            <input
              type="radio"
              name="payment"
              value={o.value}
              checked={payment === o.value}
              onChange={() => setPayment(o.value)}
            />
            <div>
              <div className="pay-name">{o.name}</div>
              <div className="pay-meta">{o.meta}</div>
            </div>
            <div className="pay-icons">
              {o.icons.map((i) => (
                <span key={i}>{i}</span>
              ))}
            </div>
          </label>
        ))}
      </div>

      <div className="field-row" style={{ marginTop: 18 }}>
        <input
          type="checkbox"
          id="terms"
          checked={terms}
          onChange={(e) => setTerms(e.target.checked)}
        />
        <label htmlFor="terms">
          Sunt de acord cu termenii și prelucrarea datelor. Confirm că am peste 18 ani.
        </label>
      </div>
    </section>
  );
}

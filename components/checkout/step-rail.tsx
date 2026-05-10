"use client";

import { useCheckoutStore } from "@/lib/checkout-store";

const STEPS = [
  { n: 1, label: "livrare" },
  { n: 2, label: "facturare" },
  { n: 3, label: "plată" },
];

export function StepRail() {
  const shipping = useCheckoutStore((s) => s.shipping);
  const billing = useCheckoutStore((s) => s.billing);

  const done = {
    1: shipping !== null,
    2: billing !== null,
    3: false,
  };
  const active = !done[1] ? 1 : !done[2] ? 2 : 3;

  return (
    <nav className="step-rail" aria-label="Pași checkout">
      {STEPS.map((s, i) => (
        <span key={s.n} className="step-rail-group">
          {i > 0 && <span className="sep" aria-hidden="true" />}
          <span
            className={`step ${active === s.n ? "is-active" : ""} ${
              done[s.n as 1 | 2 | 3] ? "is-done" : ""
            }`}
          >
            <span className="num">{s.n}</span>
            <span className="label">{s.label}</span>
          </span>
        </span>
      ))}
    </nav>
  );
}

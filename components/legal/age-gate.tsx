"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useConsentStore } from "@/lib/consent-store";

/**
 * Age gate — blocks the site until the visitor confirms they are 18+.
 * Renders nothing while the store is hydrating so SSR HTML stays clean.
 *
 * On "Da": writes the locus-age-verified cookie (30 days) + appends an
 * audit entry to localStorage. On "Nu": switches to a refusal screen
 * with brand-voice copy and a link to the alcohol awareness program
 * (no external redirect — clearer UX, GDPR-friendlier).
 */
export function AgeGate() {
  const hydrated = useConsentStore((s) => s.hydrated);
  const ageVerified = useConsentStore((s) => s.ageVerified);
  const ageRefused = useConsentStore((s) => s.ageRefused);
  const verifyAge = useConsentStore((s) => s.verifyAge);
  const refuseAge = useConsentStore((s) => s.refuseAge);
  const hydrate = useConsentStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Lock body scroll while the gate is shown.
  useEffect(() => {
    if (!hydrated) return;
    if (ageVerified) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [hydrated, ageVerified]);

  if (!hydrated || ageVerified) return null;

  if (ageRefused) {
    return (
      <div className="age-gate" role="dialog" aria-modal="true" aria-labelledby="age-refused-title">
        <div className="age-gate-card">
          <div className="eyebrow">acces restricționat</div>
          <h2 id="age-refused-title">Ne pare rău.</h2>
          <p>
            Conținutul acestui site se adresează exclusiv persoanelor majore.
            Te rugăm să revii când vei avea vârsta legală pentru consum de
            alcool. Pentru informații despre consumul responsabil, vezi{" "}
            <a
              href="https://www.alcoolresponsabil.ro/"
              target="_blank"
              rel="noopener noreferrer"
            >
              alcoolresponsabil.ro
            </a>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="age-gate" role="dialog" aria-modal="true" aria-labelledby="age-gate-title">
      <div className="age-gate-card">
        <div className="eyebrow">domeniul locus</div>
        <h2 id="age-gate-title">Ai 18 ani?</h2>
        <p>
          Site-ul vinde produse care conțin alcool. Pentru a continua, te rugăm
          să confirmi că ai vârsta legală.
        </p>
        <div className="age-gate-actions">
          <button
            type="button"
            className="age-gate-btn age-gate-btn-primary"
            onClick={verifyAge}
          >
            Da, am 18 ani
          </button>
          <button
            type="button"
            className="age-gate-btn age-gate-btn-ghost"
            onClick={refuseAge}
          >
            Nu
          </button>
        </div>
        <p className="age-gate-warn">
          Consumul excesiv de alcool dăunează sănătății. Citește{" "}
          <Link href="/termeni">Termenii și condițiile</Link> și{" "}
          <Link href="/confidentialitate">Politica de confidențialitate</Link>.
        </p>
      </div>
    </div>
  );
}

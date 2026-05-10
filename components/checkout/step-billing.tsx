"use client";

import { useEffect, useState } from "react";
import {
  useCheckoutStore,
  type Billing,
  type BillType,
} from "@/lib/checkout-store";

export function StepBilling() {
  const saved = useCheckoutStore((s) => s.billing);
  const saveBilling = useCheckoutStore((s) => s.saveBilling);

  const [type, setType] = useState<BillType>(saved?.type ?? "fizica");

  const [f, setF] = useState(() =>
    saved?.type === "fizica"
      ? saved
      : {
          type: "fizica" as const,
          firstName: "",
          lastName: "",
          cnp: "",
          email: "",
          sameAsShipping: true,
        },
  );

  const [j, setJ] = useState(() =>
    saved?.type === "juridica"
      ? saved
      : {
          type: "juridica" as const,
          company: "",
          cui: "",
          reg: "",
          iban: "",
          email: "",
          hq: "",
        },
  );

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!saved) return;
    if (saved.type === "fizica") setF(saved);
    else setJ(saved);
    setType(saved.type);
  }, [saved]);

  function handleSave() {
    setError(null);
    if (type === "fizica") {
      if (!f.firstName.trim() || !f.lastName.trim() || !f.email.trim()) {
        setError("Completează prenume, nume și email.");
        return;
      }
      if (!/^\S+@\S+\.\S+$/.test(f.email)) {
        setError("Email invalid.");
        return;
      }
      saveBilling(f as Billing);
    } else {
      if (!j.company.trim() || !j.cui.trim() || !j.email.trim() || !j.hq.trim()) {
        setError("Completează firmă, CUI, email și sediu.");
        return;
      }
      if (!/^\S+@\S+\.\S+$/.test(j.email)) {
        setError("Email invalid.");
        return;
      }
      saveBilling(j as Billing);
    }
  }

  const isSaved = saved !== null;

  return (
    <section className={`step-card ${isSaved ? "is-saved" : ""}`} id="step-2">
      <header className="step-head">
        <div className="step-head-title">
          <span className="step-num" aria-hidden="true">02</span>
          <h2 className="h3">Pe numele cui emitem factura.</h2>
        </div>
        <span className="step-status">{isSaved ? "salvat" : "incomplet"}</span>
      </header>

      <div className="radio-group" role="radiogroup" aria-label="Tip persoană">
        <input
          type="radio" name="billType" id="bill-fizica" value="fizica"
          checked={type === "fizica"} onChange={() => setType("fizica")}
        />
        <label htmlFor="bill-fizica">Persoană fizică</label>
        <input
          type="radio" name="billType" id="bill-juridica" value="juridica"
          checked={type === "juridica"} onChange={() => setType("juridica")}
        />
        <label htmlFor="bill-juridica">Persoană juridică</label>
      </div>

      {type === "fizica" ? (
        <div>
          <div className="grid-2">
            <div className="field">
              <label htmlFor="bill-first">Prenume <span className="req">*</span></label>
              <input
                className="input" id="bill-first" autoComplete="given-name"
                value={f.firstName}
                onChange={(e) => setF({ ...f, firstName: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="bill-last">Nume <span className="req">*</span></label>
              <input
                className="input" id="bill-last" autoComplete="family-name"
                value={f.lastName}
                onChange={(e) => setF({ ...f, lastName: e.target.value })}
              />
            </div>
          </div>
          <div className="grid-2">
            <div className="field">
              <label htmlFor="bill-cnp">CNP (opțional)</label>
              <input
                className="input" id="bill-cnp" inputMode="numeric" maxLength={13}
                value={f.cnp}
                onChange={(e) => setF({ ...f, cnp: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="bill-email-f">Email <span className="req">*</span></label>
              <input
                className="input" id="bill-email-f" type="email" autoComplete="email"
                value={f.email}
                onChange={(e) => setF({ ...f, email: e.target.value })}
              />
            </div>
          </div>
          <div className="field-row">
            <input
              type="checkbox" id="bill-same"
              checked={f.sameAsShipping}
              onChange={(e) => setF({ ...f, sameAsShipping: e.target.checked })}
            />
            <label htmlFor="bill-same">Folosește adresa de livrare ca adresă de facturare</label>
          </div>
        </div>
      ) : (
        <div>
          <div className="field">
            <label htmlFor="bill-company">Denumire firmă <span className="req">*</span></label>
            <input
              className="input" id="bill-company" autoComplete="organization"
              value={j.company}
              onChange={(e) => setJ({ ...j, company: e.target.value })}
            />
          </div>
          <div className="grid-2">
            <div className="field">
              <label htmlFor="bill-cui">CUI <span className="req">*</span></label>
              <input
                className="input" id="bill-cui" placeholder="RO12345678"
                value={j.cui}
                onChange={(e) => setJ({ ...j, cui: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="bill-reg">Nr. registru comerț</label>
              <input
                className="input" id="bill-reg" placeholder="J40/1234/2020"
                value={j.reg}
                onChange={(e) => setJ({ ...j, reg: e.target.value })}
              />
            </div>
          </div>
          <div className="grid-2">
            <div className="field">
              <label htmlFor="bill-iban">IBAN (opțional)</label>
              <input
                className="input" id="bill-iban"
                placeholder="RO00 BANK 0000 0000 0000 0000"
                value={j.iban}
                onChange={(e) => setJ({ ...j, iban: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="bill-email-j">Email facturare <span className="req">*</span></label>
              <input
                className="input" id="bill-email-j" type="email" autoComplete="email"
                value={j.email}
                onChange={(e) => setJ({ ...j, email: e.target.value })}
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="bill-hq">Adresă sediu social <span className="req">*</span></label>
            <input
              className="input" id="bill-hq" autoComplete="street-address"
              value={j.hq}
              onChange={(e) => setJ({ ...j, hq: e.target.value })}
            />
          </div>
        </div>
      )}

      {error && <p className="step-error">{error}</p>}

      <div className="step-actions">
        <span className="save-note">
          Salvăm datele local — vor apărea precompletate la următoarea comandă.
        </span>
        <button type="button" className="btn btn-solid" onClick={handleSave}>
          {isSaved ? "Actualizează" : "Salvează datele"}
          <svg className="arrow" viewBox="0 0 24 12" aria-hidden="true">
            <use href="#arrow-right" />
          </svg>
        </button>
      </div>
    </section>
  );
}

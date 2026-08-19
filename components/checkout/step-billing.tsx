"use client";

import { useEffect, useState } from "react";
import {
  useCheckoutStore,
  type Billing,
  type BillType,
} from "@/lib/checkout-store";
import type { AccountDefaults, SavedBilling } from "@/lib/account/defaults";

/**
 * StepBilling — pasul 2 „Date facturare".
 * Similar cu StepShipping: tabs (fizică/juridică) mereu vizibile, 3 stări
 * per tab (saved/picker/form). Persistă în checkoutStore, salvează
 * profilul pe cont după plasarea comenzii.
 */

type Mode = "saved" | "picker" | "form";

type Props = {
  defaults: AccountDefaults | null;
};

function splitName(full: string | null): { firstName: string; lastName: string } {
  if (!full) return { firstName: "", lastName: "" };
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

type FizicaForm = {
  type: "fizica";
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  county: string;
  zip: string;
  sameAsShipping: boolean;
};

type JuridicaForm = {
  type: "juridica";
  company: string;
  cui: string;
  reg: string;
  iban: string;
  email: string;
  hq: string;
  hqCity: string;
  hqCounty: string;
};

export function StepBilling({ defaults }: Props) {
  const saved = useCheckoutStore((s) => s.billing);
  const saveBilling = useCheckoutStore((s) => s.saveBilling);

  const savedFizica = defaults?.billingProfiles.filter((b) => b.type === "fizica") ?? [];
  const savedJuridica = defaults?.billingProfiles.filter((b) => b.type === "juridica") ?? [];

  const defaultBilling =
    defaults?.billingProfiles.find((b) => b.isDefault) ??
    defaults?.billingProfiles[0] ??
    null;

  const [tab, setTab] = useState<BillType>(
    saved?.type ?? defaultBilling?.type ?? "fizica",
  );

  const hasSavedForTab =
    tab === "fizica" ? savedFizica.length > 0 : savedJuridica.length > 0;
  /* Dacă user-ul a salvat deja ceva în Zustand pentru tab-ul curent, avem
     date de afișat → mode='saved'. Altfel, cădem pe profilul din cont, iar
     dacă nici acolo nu avem nimic → form gol. */
  const hasZustandForTab =
    saved !== null && ((tab === "fizica" && saved.type === "fizica") ||
      (tab === "juridica" && saved.type === "juridica"));
  const [mode, setMode] = useState<Mode>(
    hasZustandForTab || hasSavedForTab ? "saved" : "form",
  );
  useEffect(() => {
    setMode(hasZustandForTab || hasSavedForTab ? "saved" : "form");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const initialFizica: FizicaForm = (() => {
    if (saved?.type === "fizica") {
      const s = saved as FizicaForm;
      return {
        type: "fizica",
        firstName: s.firstName,
        lastName: s.lastName,
        email: s.email,
        address: s.address ?? "",
        city: s.city ?? "",
        county: s.county ?? "",
        zip: s.zip ?? "",
        sameAsShipping: s.sameAsShipping,
      };
    }
    const first = savedFizica[0];
    if (first) {
      const { firstName, lastName } = splitName(first.label ?? defaults?.customerName ?? null);
      // Reutilizăm coloana hq_address pentru adresa fizica (nu adăugăm alt câmp în DB).
      const savedAddr = first.hqAddress ?? "";
      return {
        type: "fizica",
        firstName,
        lastName,
        email: defaults?.customerEmail ?? "",
        address: savedAddr,
        city: "",
        county: "",
        zip: "",
        sameAsShipping: !savedAddr,
      };
    }
    const { firstName, lastName } = splitName(defaults?.customerName ?? null);
    return {
      type: "fizica",
      firstName,
      lastName,
      email: defaults?.customerEmail ?? "",
      address: "",
      city: "",
      county: "",
      zip: "",
      sameAsShipping: true,
    };
  })();

  const initialJuridica: JuridicaForm = (() => {
    if (saved?.type === "juridica") return saved as JuridicaForm;
    const first = savedJuridica[0];
    if (first) {
      return {
        type: "juridica",
        company: first.company ?? "",
        cui: first.cui ?? "",
        reg: first.regNo ?? "",
        iban: first.iban ?? "",
        email: defaults?.customerEmail ?? "",
        hq: first.hqAddress ?? "",
        hqCity: first.hqCity ?? "",
        hqCounty: first.hqCounty ?? "",
      };
    }
    return {
      type: "juridica",
      company: "",
      cui: "",
      reg: "",
      iban: "",
      email: defaults?.customerEmail ?? "",
      hq: "",
      hqCity: "",
      hqCounty: "",
    };
  })();

  const [f, setF] = useState<FizicaForm>(initialFizica);
  const [j, setJ] = useState<JuridicaForm>(initialJuridica);

  const [selectedFizicaId, setSelectedFizicaId] = useState<string | null>(
    savedFizica.find((b) => b.isDefault)?.id ?? savedFizica[0]?.id ?? null,
  );
  const [selectedJuridicaId, setSelectedJuridicaId] = useState<string | null>(
    savedJuridica.find((b) => b.isDefault)?.id ?? savedJuridica[0]?.id ?? null,
  );

  const [error, setError] = useState<string | null>(null);

  // În saved mode: persistă automat profilul selectat
  useEffect(() => {
    if (mode !== "saved") return;
    if (tab === "fizica") {
      const b = savedFizica.find((x) => x.id === selectedFizicaId);
      if (b) {
        const { firstName, lastName } = splitName(b.label ?? defaults?.customerName ?? null);
        const s: FizicaForm = {
          type: "fizica",
          firstName,
          lastName,
          email: defaults?.customerEmail ?? f.email,
          address: b.hqAddress ?? "",
          city: "",
          county: "",
          zip: "",
          sameAsShipping: !b.hqAddress,
        };
        setF(s);
        saveBilling(s as Billing);
      }
    } else {
      const b = savedJuridica.find((x) => x.id === selectedJuridicaId);
      if (b) {
        const s: JuridicaForm = {
          type: "juridica",
          company: b.company ?? "",
          cui: b.cui ?? "",
          reg: b.regNo ?? "",
          iban: b.iban ?? "",
          email: defaults?.customerEmail ?? j.email,
          hq: b.hqAddress ?? "",
          hqCity: b.hqCity ?? "",
          hqCounty: b.hqCounty ?? "",
        };
        setJ(s);
        saveBilling(s as Billing);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, tab, selectedFizicaId, selectedJuridicaId]);

  function handleSaveForm() {
    setError(null);
    if (tab === "fizica") {
      if (!f.firstName.trim() || !f.lastName.trim() || !f.email.trim()) {
        setError("Completează prenume, nume și email.");
        return;
      }
      if (!/^\S+@\S+\.\S+$/.test(f.email)) {
        setError("Email invalid.");
        return;
      }
      /* Adresa e obligatorie pe factură. Dacă user-ul a bifat „folosește
         adresa de livrare", copiem din shipping (dacă există). */
      let finalAddress = f.address.trim();
      let finalCity = f.city.trim();
      let finalCounty = f.county.trim();
      let finalZip = f.zip.trim();
      if (f.sameAsShipping) {
        const shp = useCheckoutStore.getState().shipping;
        if (shp && shp.method === "curier") {
          finalAddress = shp.address;
          finalCity = shp.city;
          finalCounty = shp.county;
          finalZip = shp.zip;
        }
      }
      if (!finalAddress || !finalCity || !finalCounty) {
        setError(
          f.sameAsShipping
            ? "Salvează întâi adresa la pasul 1, sau debifează opțiunea și completează aici."
            : "Adresa, localitatea și județul sunt obligatorii pe factură.",
        );
        return;
      }
      const finalF: FizicaForm = {
        ...f,
        address: finalAddress,
        city: finalCity,
        county: finalCounty,
        zip: finalZip,
      };
      setF(finalF);
      saveBilling(finalF as Billing);
    } else {
      /* Localitatea și județul sunt obligatorii, nu decorative: FGO le cere
         pe câmpuri distincte când Tara=RO, iar factura pleacă mai departe
         la ANAF prin e-Factura. */
      if (
        !j.company.trim() ||
        !j.cui.trim() ||
        !j.email.trim() ||
        !j.hq.trim() ||
        !j.hqCity.trim() ||
        !j.hqCounty.trim()
      ) {
        setError("Completează firmă, CUI, email și adresa completă a sediului.");
        return;
      }
      if (!/^\S+@\S+\.\S+$/.test(j.email)) {
        setError("Email invalid.");
        return;
      }
      saveBilling(j as Billing);
    }
    /* După orice save reușit, treci la vederea colapsată. Nu depindem de
       hasSavedForTab (care privește doar profilurile de pe cont) — aici
       am completat manual + persistat în Zustand, deci avem date. */
    setMode("saved");
  }

  const isSaved = saved !== null;
  const activeSavedBilling: SavedBilling | null =
    tab === "fizica"
      ? savedFizica.find((x) => x.id === selectedFizicaId) ?? null
      : savedJuridica.find((x) => x.id === selectedJuridicaId) ?? null;

  return (
    <section className="co-step" aria-labelledby="co-step-2">
      <header className="co-step-head">
        <div className="co-badge">02</div>
        <h2 className="co-step-title" id="co-step-2">Date facturare</h2>
        {isSaved && mode === "saved" && (
          <span className="co-status">salvat</span>
        )}
      </header>

      <div className="co-tabs" role="tablist" aria-label="Tip persoană">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "fizica"}
          className={`co-tab ${tab === "fizica" ? "is-active" : ""}`}
          onClick={() => setTab("fizica")}
        >
          Persoană fizică
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "juridica"}
          className={`co-tab ${tab === "juridica" ? "is-active" : ""}`}
          onClick={() => setTab("juridica")}
        >
          Persoană juridică
        </button>
      </div>

      {/* SAVED — construit din datele curente (formul intern), indiferent
          dacă vin dintr-un profil salvat pe cont sau dintr-un save manual. */}
      {mode === "saved" && (
        <div className="co-saved">
          <span className="co-saved-icon" aria-hidden="true">🧾</span>
          <div className="co-saved-main">
            {tab === "fizica" ? (
              <>
                <div className="co-saved-name">
                  {`${f.firstName} ${f.lastName}`.trim() || "Persoană fizică"}
                </div>
                <div className="co-saved-line">{f.email || "—"}</div>
                {f.address && (
                  <div className="co-saved-line">
                    {f.address}
                    {f.city ? `, ${f.city}` : ""}
                    {f.county ? `, ${f.county}` : ""}
                    {f.zip ? ` · ${f.zip}` : ""}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="co-saved-name">{j.company || "Firmă"}</div>
                <div className="co-saved-line">
                  CUI {j.cui || "—"}
                  {j.reg ? ` · ${j.reg}` : ""}
                </div>
                {j.hq && (
                  <div className="co-saved-line muted">
                    {j.hq}
                    {j.hqCity ? `, ${j.hqCity}` : ""}
                    {j.hqCounty ? `, ${j.hqCounty}` : ""}
                  </div>
                )}
              </>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <button
              type="button"
              className="co-chip"
              onClick={() => setMode("form")}
            >
              Modifică
            </button>
            {hasSavedForTab && (
              <button
                type="button"
                className="co-chip ghost"
                onClick={() => setMode("picker")}
              >
                Alege alt profil
              </button>
            )}
          </div>
        </div>
      )}

      {/* PICKER */}
      {mode === "picker" && (
        <div className="co-picker">
          {(tab === "fizica" ? savedFizica : savedJuridica).map((b) => {
            const isSel =
              tab === "fizica"
                ? b.id === selectedFizicaId
                : b.id === selectedJuridicaId;
            return (
              <button
                type="button"
                key={b.id}
                className="co-picker-item"
                onClick={() => {
                  if (tab === "fizica") setSelectedFizicaId(b.id);
                  else setSelectedJuridicaId(b.id);
                }}
              >
                <input type="radio" name={`co-bill-${tab}`} checked={isSel} readOnly 
              suppressHydrationWarning
            />
                <div>
                  <div className="co-picker-name">
                    {b.type === "fizica"
                      ? b.label ?? "Persoană fizică"
                      : b.company ?? b.label ?? "Firmă"}
                    {b.isDefault ? " — preferat" : ""}
                  </div>
                  <div className="co-picker-line">
                    {b.type === "fizica"
                      ? defaults?.customerEmail ?? "Persoană fizică"
                      : `CUI ${b.cui ?? "—"}${b.regNo ? ` · ${b.regNo}` : ""}`}
                  </div>
                </div>
              </button>
            );
          })}
          <button
            type="button"
            className="co-picker-add"
            onClick={() => {
              if (tab === "fizica") {
                setF({
                  type: "fizica",
                  firstName: "",
                  lastName: "",
                  email: defaults?.customerEmail ?? "",
                  address: "",
                  city: "",
                  county: "",
                  zip: "",
                  sameAsShipping: true,
                });
              } else {
                setJ({
                  type: "juridica",
                  company: "",
                  cui: "",
                  reg: "",
                  iban: "",
                  email: defaults?.customerEmail ?? "",
                  hq: "",
                  hqCity: "",
                  hqCounty: "",
                });
              }
              setMode("form");
            }}
          >
            <span className="plus">+</span> adaugă profil nou
          </button>
          <div className="co-picker-footer">
            <button
              type="button"
              className="co-chip ghost"
              onClick={() => setMode("saved")}
            >
              Anulează
            </button>
            <button
              type="button"
              className="co-chip"
              onClick={() => setMode("saved")}
            >
              Folosește profilul
            </button>
          </div>
        </div>
      )}

      {/* FORM */}
      {mode === "form" && tab === "fizica" && (
        <form className="co-form" onSubmit={(e) => e.preventDefault()} noValidate>
          <div className="co-field">
            <label htmlFor="co-bf-first">
              Prenume<span className="req">*</span>
            </label>
            <input
              id="co-bf-first"
              type="text"
              value={f.firstName}
              onChange={(e) => setF({ ...f, firstName: e.target.value })}
            />
          </div>
          <div className="co-field">
            <label htmlFor="co-bf-last">
              Nume<span className="req">*</span>
            </label>
            <input
              id="co-bf-last"
              type="text"
              value={f.lastName}
              onChange={(e) => setF({ ...f, lastName: e.target.value })}
            />
          </div>
          <div className="co-field span-2">
            <label htmlFor="co-bf-email">
              Email<span className="req">*</span>
            </label>
            <input
              id="co-bf-email"
              type="email"
              value={f.email}
              onChange={(e) => setF({ ...f, email: e.target.value })}
              suppressHydrationWarning
            />
          </div>
          <div className="co-check-row">
            <input
              id="co-bf-same"
              type="checkbox"
              checked={f.sameAsShipping}
              onChange={(e) => setF({ ...f, sameAsShipping: e.target.checked })}
            />
            <label htmlFor="co-bf-same">
              Folosește adresa de livrare (pasul 1) și pentru factură
            </label>
          </div>

          {!f.sameAsShipping && (
            <>
              <div className="co-field span-2">
                <label htmlFor="co-bf-address">
                  Adresă facturare<span className="req">*</span>
                </label>
                <input
                  id="co-bf-address"
                  type="text"
                  autoComplete="street-address"
                  value={f.address}
                  onChange={(e) => setF({ ...f, address: e.target.value })}
                  placeholder="Stradă, număr, bloc, apartament"
                  suppressHydrationWarning
                />
              </div>
              <div className="co-field">
                <label htmlFor="co-bf-city">
                  Localitate<span className="req">*</span>
                </label>
                <input
                  id="co-bf-city"
                  type="text"
                  autoComplete="address-level2"
                  value={f.city}
                  onChange={(e) => setF({ ...f, city: e.target.value })}
                  suppressHydrationWarning
                />
              </div>
              <div className="co-field">
                <label htmlFor="co-bf-county">
                  Județ<span className="req">*</span>
                </label>
                <input
                  id="co-bf-county"
                  type="text"
                  autoComplete="address-level1"
                  value={f.county}
                  onChange={(e) => setF({ ...f, county: e.target.value })}
                  suppressHydrationWarning
                />
              </div>
              <div className="co-field">
                <label htmlFor="co-bf-zip">
                  Cod poștal <span className="opt">(opțional)</span>
                </label>
                <input
                  id="co-bf-zip"
                  type="text"
                  autoComplete="postal-code"
                  value={f.zip}
                  onChange={(e) => setF({ ...f, zip: e.target.value })}
                  suppressHydrationWarning
                />
              </div>
            </>
          )}

          {error && <p className="co-error">{error}</p>}

          <div className="co-form-actions">
            {hasSavedForTab && (
              <button
                type="button"
                className="co-chip ghost"
                onClick={() => setMode("saved")}
              >
                Anulează
              </button>
            )}
            <button type="button" className="co-chip" onClick={handleSaveForm}>
              Salvează profilul
            </button>
          </div>
        </form>
      )}

      {mode === "form" && tab === "juridica" && (
        <form className="co-form" onSubmit={(e) => e.preventDefault()} noValidate>
          <div className="co-field span-2">
            <label htmlFor="co-bj-company">
              Denumire firmă<span className="req">*</span>
            </label>
            <input
              id="co-bj-company"
              type="text"
              value={j.company}
              onChange={(e) => setJ({ ...j, company: e.target.value })}
              autoComplete="organization"
            />
          </div>
          <div className="co-field">
            <label htmlFor="co-bj-cui">
              CUI<span className="req">*</span>
            </label>
            <input
              id="co-bj-cui"
              type="text"
              value={j.cui}
              onChange={(e) => setJ({ ...j, cui: e.target.value })}
              placeholder="RO12345678"
            />
          </div>
          <div className="co-field">
            <label htmlFor="co-bj-reg">
              Nr. reg. comerțului <span className="opt">(opțional)</span>
            </label>
            <input
              id="co-bj-reg"
              type="text"
              value={j.reg}
              onChange={(e) => setJ({ ...j, reg: e.target.value })}
              placeholder="J40/1234/2020"
            />
          </div>
          <div className="co-field">
            <label htmlFor="co-bj-iban">
              IBAN <span className="opt">(opțional)</span>
            </label>
            <input
              id="co-bj-iban"
              type="text"
              value={j.iban}
              onChange={(e) => setJ({ ...j, iban: e.target.value })}
              placeholder="RO49 AAAA 1B31 0075 9384 0000"
            />
          </div>
          <div className="co-field">
            <label htmlFor="co-bj-email">
              Email facturare<span className="req">*</span>
            </label>
            <input
              id="co-bj-email"
              type="email"
              value={j.email}
              onChange={(e) => setJ({ ...j, email: e.target.value })}
            />
          </div>
          <div className="co-field span-2">
            <label htmlFor="co-bj-hq">
              Adresă sediu social<span className="req">*</span>
            </label>
            <input
              id="co-bj-hq"
              type="text"
              value={j.hq}
              onChange={(e) => setJ({ ...j, hq: e.target.value })}
              placeholder="Stradă, număr, bloc, apartament"
              autoComplete="street-address"
            />
          </div>
          <div className="co-field">
            <label htmlFor="co-bj-city">
              Localitate<span className="req">*</span>
            </label>
            <input
              id="co-bj-city"
              type="text"
              autoComplete="address-level2"
              value={j.hqCity}
              onChange={(e) => setJ({ ...j, hqCity: e.target.value })}
            />
          </div>
          <div className="co-field">
            <label htmlFor="co-bj-county">
              Județ<span className="req">*</span>
            </label>
            <input
              id="co-bj-county"
              type="text"
              autoComplete="address-level1"
              value={j.hqCounty}
              onChange={(e) => setJ({ ...j, hqCounty: e.target.value })}
            />
          </div>

          {error && <p className="co-error">{error}</p>}

          <div className="co-form-actions">
            {hasSavedForTab && (
              <button
                type="button"
                className="co-chip ghost"
                onClick={() => setMode("saved")}
              >
                Anulează
              </button>
            )}
            <button type="button" className="co-chip" onClick={handleSaveForm}>
              Salvează profilul
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

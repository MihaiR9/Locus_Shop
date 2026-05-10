"use client";

import { useEffect, useState } from "react";
import {
  useCheckoutStore,
  type Shipping,
  type ShipMethod,
} from "@/lib/checkout-store";

const COUNTIES = [
  "Alba", "Arad", "Argeș", "Bacău", "Bihor", "Bistrița-Năsăud", "Botoșani",
  "Brașov", "Brăila", "București", "Buzău", "Caraș-Severin", "Călărași",
  "Cluj", "Constanța", "Covasna", "Dâmbovița", "Dolj", "Galați", "Giurgiu",
  "Gorj", "Harghita", "Hunedoara", "Ialomița", "Iași", "Ilfov", "Maramureș",
  "Mehedinți", "Mureș", "Neamț", "Olt", "Prahova", "Sălaj", "Satu Mare",
  "Sibiu", "Suceava", "Teleorman", "Timiș", "Tulcea", "Vaslui", "Vâlcea",
  "Vrancea",
];

const PICKUP_POINTS = [
  { value: "buciumeni", label: "Buciumeni — Domeniul Locus (sediu)" },
  { value: "bucuresti", label: "București — Sector 1, Str. Mihai Eminescu 87" },
  { value: "iasi", label: "Iași — Centru, Bd. Ștefan cel Mare 12" },
  { value: "cluj", label: "Cluj-Napoca — Centru, Str. Memorandumului 4" },
];

export function StepShipping() {
  const saved = useCheckoutStore((s) => s.shipping);
  const saveShipping = useCheckoutStore((s) => s.saveShipping);

  const [method, setMethod] = useState<ShipMethod>(
    saved?.method ?? "curier",
  );

  // Curier fields
  const [c, setC] = useState(() =>
    saved?.method === "curier"
      ? saved
      : {
          method: "curier" as const,
          firstName: "",
          lastName: "",
          phone: "",
          email: "",
          address: "",
          city: "",
          county: "",
          zip: "",
          note: "",
        },
  );

  // Ridicare fields
  const [r, setR] = useState(() =>
    saved?.method === "ridicare"
      ? saved
      : {
          method: "ridicare" as const,
          point: "",
          name: "",
          phone: "",
        },
  );

  const [error, setError] = useState<string | null>(null);

  // Re-sync local state if user comes back to /checkout after a session
  useEffect(() => {
    if (!saved) return;
    if (saved.method === "curier") setC(saved);
    else setR(saved);
    setMethod(saved.method);
  }, [saved]);

  function handleSave() {
    setError(null);
    if (method === "curier") {
      const required: Array<keyof typeof c> = [
        "firstName", "lastName", "phone", "email", "address", "city", "county",
      ];
      const missing = required.find((k) => !String(c[k] ?? "").trim());
      if (missing) {
        setError("Completează câmpurile marcate.");
        return;
      }
      if (!/^\S+@\S+\.\S+$/.test(c.email)) {
        setError("Email invalid.");
        return;
      }
      saveShipping(c as Shipping);
    } else {
      if (!r.point || !r.name.trim() || !r.phone.trim()) {
        setError("Completează toate câmpurile.");
        return;
      }
      saveShipping(r as Shipping);
    }
  }

  const isSaved = saved !== null;

  return (
    <section className={`step-card ${isSaved ? "is-saved" : ""}`} id="step-1">
      <header className="step-head">
        <div className="step-head-title">
          <span className="checkout-step-num" aria-hidden="true">1</span>
          <h2 className="h3">Cum primești sticlele.</h2>
        </div>
        <span className="step-status">{isSaved ? "salvat" : "incomplet"}</span>
      </header>

      <div className="tabs" role="tablist" aria-label="Mod livrare">
        <button
          type="button"
          className={method === "curier" ? "is-active" : ""}
          role="tab"
          aria-selected={method === "curier"}
          onClick={() => setMethod("curier")}
        >
          Curier
        </button>
        <button
          type="button"
          className={method === "ridicare" ? "is-active" : ""}
          role="tab"
          aria-selected={method === "ridicare"}
          onClick={() => setMethod("ridicare")}
        >
          Ridicare personală
        </button>
      </div>

      {method === "curier" ? (
        <form noValidate onSubmit={(e) => e.preventDefault()}>
          <div className="grid-2">
            <div className="field">
              <label htmlFor="ship-first">Prenume <span className="req">*</span></label>
              <input
                className="input" id="ship-first" autoComplete="given-name"
                value={c.firstName}
                onChange={(e) => setC({ ...c, firstName: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="ship-last">Nume <span className="req">*</span></label>
              <input
                className="input" id="ship-last" autoComplete="family-name"
                value={c.lastName}
                onChange={(e) => setC({ ...c, lastName: e.target.value })}
              />
            </div>
          </div>
          <div className="grid-2">
            <div className="field">
              <label htmlFor="ship-phone">Telefon <span className="req">*</span></label>
              <input
                className="input" id="ship-phone" type="tel" autoComplete="tel"
                placeholder="07xx xxx xxx"
                value={c.phone}
                onChange={(e) => setC({ ...c, phone: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="ship-email">Email <span className="req">*</span></label>
              <input
                className="input" id="ship-email" type="email" autoComplete="email"
                placeholder="nume@exemplu.ro"
                value={c.email}
                onChange={(e) => setC({ ...c, email: e.target.value })}
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="ship-address">
              Adresă (stradă, număr, bloc, scară, ap.) <span className="req">*</span>
            </label>
            <input
              className="input" id="ship-address" autoComplete="street-address"
              value={c.address}
              onChange={(e) => setC({ ...c, address: e.target.value })}
            />
          </div>
          <div className="grid-3">
            <div className="field">
              <label htmlFor="ship-city">Localitate <span className="req">*</span></label>
              <input
                className="input" id="ship-city" autoComplete="address-level2"
                value={c.city}
                onChange={(e) => setC({ ...c, city: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="ship-county">Județ <span className="req">*</span></label>
              <select
                className="select" id="ship-county" autoComplete="address-level1"
                value={c.county}
                onChange={(e) => setC({ ...c, county: e.target.value })}
              >
                <option value="">Alege județul</option>
                {COUNTIES.map((co) => (
                  <option key={co} value={co}>{co}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="ship-zip">Cod poștal</label>
              <input
                className="input" id="ship-zip" autoComplete="postal-code"
                value={c.zip}
                onChange={(e) => setC({ ...c, zip: e.target.value })}
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="ship-note">Observații pentru curier (opțional)</label>
            <textarea
              className="textarea" id="ship-note"
              placeholder="Ex: vă rog sunați înainte de a urca; după ora 17:00."
              value={c.note}
              onChange={(e) => setC({ ...c, note: e.target.value })}
            />
          </div>
        </form>
      ) : (
        <div>
          <div className="field">
            <label htmlFor="pickup-point">Punct de ridicare <span className="req">*</span></label>
            <select
              className="select" id="pickup-point"
              value={r.point}
              onChange={(e) => setR({ ...r, point: e.target.value })}
            >
              <option value="">Alege punctul</option>
              {PICKUP_POINTS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <div className="grid-2">
            <div className="field">
              <label htmlFor="pickup-name">Nume contact <span className="req">*</span></label>
              <input
                className="input" id="pickup-name" autoComplete="name"
                value={r.name}
                onChange={(e) => setR({ ...r, name: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="pickup-phone">Telefon <span className="req">*</span></label>
              <input
                className="input" id="pickup-phone" type="tel" autoComplete="tel"
                placeholder="07xx xxx xxx"
                value={r.phone}
                onChange={(e) => setR({ ...r, phone: e.target.value })}
              />
            </div>
          </div>
          <p className="step-note">
            Te anunțăm prin SMS și email când comanda este pregătită — în general,
            în 24–48h pentru sediul Buciumeni și 2–4 zile pentru celelalte puncte.
            Adu un act de identitate la ridicare.
          </p>
        </div>
      )}

      {error && <p className="step-error">{error}</p>}

      <div className="step-actions">
        <span className="save-note">Datele rămân pe acest dispozitiv. Nu trimitem nimic încă.</span>
        <button type="button" className="btn btn-solid" onClick={handleSave}>
          {isSaved ? "Actualizează" : "Salvează și continuă"}
          <svg className="arrow" viewBox="0 0 24 12" aria-hidden="true">
            <use href="#arrow-right" />
          </svg>
        </button>
      </div>
    </section>
  );
}

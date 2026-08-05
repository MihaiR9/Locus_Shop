"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useCheckoutStore,
  type ShippingCurier,
} from "@/lib/checkout-store";
import { SHIPPING_METHODS, type ShippingMethodId } from "@/lib/shipping";
import { PickupPointSelect } from "./pickup-point-select";

const COUNTIES = [
  "Alba", "Arad", "Argeș", "Bacău", "Bihor", "Bistrița-Năsăud", "Botoșani",
  "Brașov", "Brăila", "București", "Buzău", "Caraș-Severin", "Călărași",
  "Cluj", "Constanța", "Covasna", "Dâmbovița", "Dolj", "Galați", "Giurgiu",
  "Gorj", "Harghita", "Hunedoara", "Ialomița", "Iași", "Ilfov", "Maramureș",
  "Mehedinți", "Mureș", "Neamț", "Olt", "Prahova", "Sălaj", "Satu Mare",
  "Sibiu", "Suceava", "Teleorman", "Timiș", "Tulcea", "Vaslui", "Vâlcea",
  "Vrancea",
];

type FcServiceId = ShippingCurier["serviceId"];

/** Mapare de la id-ul metodei → tipul PUDO cerut de API-ul FC. */
const PICKUP_TYPE_MAP: Record<FcServiceId, "fanbox" | null> = {
  "fancourier-standard": null,
  "fancourier-fanbox": "fanbox",
};

export function StepShipping() {
  const saved = useCheckoutStore((s) => s.shipping);
  const saveShipping = useCheckoutStore((s) => s.saveShipping);

  const [methodId, setMethodId] = useState<ShippingMethodId>(
    saved?.method === "curier" ? saved.serviceId : "fancourier-standard",
  );

  const fcServiceId = methodId as FcServiceId;
  const pickupType = PICKUP_TYPE_MAP[fcServiceId];

  // Form curier (singurul rămas — livrare la ușă sau FANbox)
  const [c, setC] = useState<Omit<ShippingCurier, "method" | "serviceId">>(() =>
    saved?.method === "curier"
      ? {
          firstName: saved.firstName,
          lastName: saved.lastName,
          phone: saved.phone,
          email: saved.email,
          address: saved.address,
          city: saved.city,
          county: saved.county,
          zip: saved.zip,
          note: saved.note,
          pickupPointId: saved.pickupPointId,
          pickupPointName: saved.pickupPointName,
          pickupPointAddress: saved.pickupPointAddress,
        }
      : {
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

  const [error, setError] = useState<string | null>(null);

  // Re-sync când vine saved din altă rută
  useEffect(() => {
    if (!saved || saved.method !== "curier") return;
    setMethodId(saved.serviceId);
    setC({
      firstName: saved.firstName,
      lastName: saved.lastName,
      phone: saved.phone,
      email: saved.email,
      address: saved.address,
      city: saved.city,
      county: saved.county,
      zip: saved.zip,
      note: saved.note,
      pickupPointId: saved.pickupPointId,
      pickupPointName: saved.pickupPointName,
      pickupPointAddress: saved.pickupPointAddress,
    });
  }, [saved]);

  const selectedMethod = useMemo(
    () => SHIPPING_METHODS.find((m) => m.id === methodId),
    [methodId],
  );

  function handleSave() {
    setError(null);
    // Curier
    const commonRequired: Array<keyof typeof c> = [
      "firstName",
      "lastName",
      "phone",
      "email",
      "city",
      "county",
    ];
    const missing = commonRequired.find((k) => !String(c[k] ?? "").trim());
    if (missing) {
      setError("Completează câmpurile marcate.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(c.email)) {
      setError("Email invalid.");
      return;
    }
    // Adresa e obligatorie doar la Standard (livrare la ușă).
    if (fcServiceId === "fancourier-standard" && !c.address.trim()) {
      setError("Adresa e obligatorie pentru livrare la ușă.");
      return;
    }
    // Punct fix obligatoriu la FANbox/PayPoint/Office
    if (selectedMethod?.requiresPickupPoint && !c.pickupPointId) {
      setError("Alege un punct de ridicare.");
      return;
    }
    saveShipping({
      method: "curier",
      serviceId: fcServiceId,
      ...c,
    });
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

      {/* Radio grid cu metodele FanCourier active */}
      <div className="ship-methods" role="radiogroup" aria-label="Mod livrare">
        {SHIPPING_METHODS.map((m) => (
          <label
            key={m.id}
            className={`ship-method-card ${methodId === m.id ? "is-active" : ""}`}
          >
            <input
              type="radio"
              name="ship-method"
              value={m.id}
              checked={methodId === m.id}
              onChange={() => setMethodId(m.id)}
            />
            <div className="ship-method-body">
              <div className="ship-method-head">
                <span className="ship-method-name">{m.name}</span>
                <span className="ship-method-duration">{m.duration}</span>
              </div>
              <p className="ship-method-desc">{m.description}</p>
            </div>
          </label>
        ))}
      </div>

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

          <div className="grid-2">
            <div className="field">
              <label htmlFor="ship-county">Județ <span className="req">*</span></label>
              <select
                className="select" id="ship-county" autoComplete="address-level1"
                value={c.county}
                onChange={(e) => setC({ ...c, county: e.target.value, pickupPointId: undefined, pickupPointName: undefined, pickupPointAddress: undefined })}
              >
                <option value="">Alege județul</option>
                {COUNTIES.map((co) => (
                  <option key={co} value={co}>{co}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="ship-city">Localitate <span className="req">*</span></label>
              <input
                className="input" id="ship-city" autoComplete="address-level2"
                value={c.city}
                onChange={(e) => setC({ ...c, city: e.target.value, pickupPointId: undefined, pickupPointName: undefined, pickupPointAddress: undefined })}
              />
            </div>
          </div>

          {fcServiceId === "fancourier-standard" ? (
            <>
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
              <div className="grid-2">
                <div className="field">
                  <label htmlFor="ship-zip">Cod poștal</label>
                  <input
                    className="input" id="ship-zip" autoComplete="postal-code"
                    value={c.zip}
                    onChange={(e) => setC({ ...c, zip: e.target.value })}
                  />
                </div>
              </div>
            </>
          ) : pickupType ? (
            <PickupPointSelect
              type={pickupType}
              county={c.county}
              locality={c.city}
              value={
                c.pickupPointId
                  ? {
                      id: c.pickupPointId,
                      name: c.pickupPointName ?? "",
                      address: c.pickupPointAddress ?? "",
                    }
                  : null
              }
              onChange={(p) =>
                setC({
                  ...c,
                  pickupPointId: p?.id,
                  pickupPointName: p?.name,
                  pickupPointAddress: p?.address,
                })
              }
            />
          ) : null}

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

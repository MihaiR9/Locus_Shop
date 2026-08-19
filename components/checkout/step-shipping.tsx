"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useCheckoutStore,
  type ShippingCurier,
} from "@/lib/checkout-store";
import { type ShippingMethodId } from "@/lib/shipping";
import type { AccountDefaults } from "@/lib/account/defaults";
import { PickupPointSelect } from "./pickup-point-select";
import { localitiesInCounty, usePickupPoints } from "./use-pickup-points";

/**
 * StepShipping — pasul 1 „Livrare".
 *
 * Tabs mereu vizibile: „Livrare prin curier" | „Locker FANbox".
 *
 * Nu oferim ridicare de la cramă. Eticheta veche spunea „Ridicare
 * personală (FANbox)", ceea ce suna a ridicare de la sediu — dar FANbox e
 * un locker FanCourier, deci tot livrare e, doar că într-un alt punct.
 * Sub tab-ul curent, 3 stări:
 *   - saved  → card cu date preluate din cont (dacă există) + „alege alta"
 *   - picker → listă radio cu adrese/FANbox-uri salvate + „adaugă"
 *   - form   → form gol (guest sau user care adaugă nou)
 *
 * Salvarea se face în checkoutStore, snapshot pentru order + auto-save
 * pe cont la finalizare (vezi lib/account/defaults saveAccountFromOrder).
 */

const COUNTIES = [
  "Alba", "Arad", "Argeș", "Bacău", "Bihor", "Bistrița-Năsăud", "Botoșani",
  "Brașov", "Brăila", "București", "Buzău", "Caraș-Severin", "Călărași",
  "Cluj", "Constanța", "Covasna", "Dâmbovița", "Dolj", "Galați", "Giurgiu",
  "Gorj", "Harghita", "Hunedoara", "Ialomița", "Iași", "Ilfov", "Maramureș",
  "Mehedinți", "Mureș", "Neamț", "Olt", "Prahova", "Sălaj", "Satu Mare",
  "Sibiu", "Suceava", "Teleorman", "Timiș", "Tulcea", "Vaslui", "Vâlcea",
  "Vrancea",
];

type TabId = "curier" | "fanbox";
type Mode = "saved" | "picker" | "form";

const TAB_TO_SERVICE: Record<TabId, ShippingMethodId> = {
  curier: "fancourier-standard",
  fanbox: "fancourier-fanbox",
};

type Props = {
  defaults: AccountDefaults | null;
};

function splitName(full: string | null): { firstName: string; lastName: string } {
  if (!full) return { firstName: "", lastName: "" };
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

type FormState = Omit<ShippingCurier, "method" | "serviceId">;

const EMPTY_FORM: FormState = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  county: "",
  zip: "",
  note: "",
};

export function StepShipping({ defaults }: Props) {
  const saved = useCheckoutStore((s) => s.shipping);
  const saveShipping = useCheckoutStore((s) => s.saveShipping);

  const [tab, setTab] = useState<TabId>(
    saved?.method === "curier" && saved.serviceId === "fancourier-fanbox"
      ? "fanbox"
      : "curier",
  );
  const serviceId = TAB_TO_SERVICE[tab];

  /* Pe tab-ul FANbox, localitatea o alegi dintr-o listă construită din
     chiar punctele FanCourier: un oraș fără locker n-are ce căuta acolo.
     Pe livrarea la ușă rămâne text liber — acolo se livrează oriunde, iar
     lista completă de localități ar veni din alt endpoint. */
  const pickupPoints = usePickupPoints("fanbox", tab === "fanbox");

  const hasSavedForCurier = !!defaults && defaults.addresses.length > 0;
  const hasSavedForFanbox = !!defaults && !!defaults.favoritePickupPoint;
  const hasSavedForTab = tab === "curier" ? hasSavedForCurier : hasSavedForFanbox;

  /* Semnal „am date pentru tab-ul curent" — fie din Zustand (user a
     salvat manual), fie din cont (defaults). */
  const zSavedMatchesTab =
    saved !== null &&
    saved.method === "curier" &&
    (tab === "curier"
      ? saved.serviceId === "fancourier-standard"
      : saved.serviceId === "fancourier-fanbox");

  // Mode per tab
  const [mode, setMode] = useState<Mode>(
    zSavedMatchesTab || hasSavedForTab ? "saved" : "form",
  );
  useEffect(() => {
    setMode(zSavedMatchesTab || hasSavedForTab ? "saved" : "form");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  // Preselect din defaults
  const initialForm: FormState = (() => {
    if (saved?.method === "curier") {
      return {
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
      };
    }
    const { firstName, lastName } = splitName(defaults?.customerName ?? null);
    return {
      ...EMPTY_FORM,
      firstName,
      lastName,
      phone: defaults?.customerPhone ?? "",
      email: defaults?.customerEmail ?? "",
    };
  })();

  const [form, setForm] = useState<FormState>(initialForm);

  const fanboxLocalities = useMemo(
    () => localitiesInCounty(pickupPoints.points, form.county),
    [pickupPoints.points, form.county],
  );
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    defaults?.addresses.find((a) => a.isDefault)?.id ??
      defaults?.addresses[0]?.id ??
      null,
  );

  const [error, setError] = useState<string | null>(null);

  // Efectiv: adresa curentă din saved-view (curier) sau pickup favorit (fanbox)
  const savedAddress =
    tab === "curier"
      ? defaults?.addresses.find((a) => a.id === selectedAddressId) ??
        defaults?.addresses.find((a) => a.isDefault) ??
        defaults?.addresses[0] ??
        null
      : null;
  const savedPickup = tab === "fanbox" ? defaults?.favoritePickupPoint ?? null : null;

  // Persist când mode==='saved' — automat cu adresa selectată
  useEffect(() => {
    if (mode !== "saved") return;
    if (tab === "curier" && savedAddress && defaults) {
      const { firstName, lastName } = splitName(defaults.customerName);
      const s: ShippingCurier = {
        method: "curier",
        serviceId,
        firstName,
        lastName,
        phone: defaults.customerPhone ?? "",
        email: defaults.customerEmail,
        address: savedAddress.line1,
        city: savedAddress.city,
        county: savedAddress.county,
        zip: savedAddress.zip ?? "",
        note: form.note,
      };
      saveShipping(s);
      setForm({ ...form, ...s });
    } else if (tab === "fanbox" && savedPickup && defaults) {
      const { firstName, lastName } = splitName(defaults.customerName);
      const s: ShippingCurier = {
        method: "curier",
        serviceId,
        firstName,
        lastName,
        phone: defaults.customerPhone ?? "",
        email: defaults.customerEmail,
        address: "",
        city: "",
        county: "",
        zip: "",
        note: form.note,
        pickupPointId: savedPickup.id,
        pickupPointName: savedPickup.name,
        pickupPointAddress: savedPickup.address,
      };
      saveShipping(s);
      setForm({ ...form, ...s });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, tab, selectedAddressId]);

  function handleSaveForm() {
    setError(null);
    const commonReq: Array<keyof FormState> = [
      "firstName",
      "lastName",
      "phone",
      "email",
      "city",
      "county",
    ];
    for (const k of commonReq) {
      if (!String(form[k] ?? "").trim()) {
        setError("Completează câmpurile marcate.");
        return;
      }
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setError("Email invalid.");
      return;
    }
    if (tab === "curier" && !form.address.trim()) {
      setError("Adresa e obligatorie pentru livrare la ușă.");
      return;
    }
    if (tab === "fanbox" && !form.pickupPointId) {
      setError("Alege un locker FANbox.");
      return;
    }
    saveShipping({
      method: "curier",
      serviceId,
      ...form,
    });
    /* După orice save reușit, treci la vederea colapsată — chiar dacă
       nu avem încă un profil pe cont, avem date în Zustand → afișăm card. */
    setMode("saved");
  }

  const isSaved = saved !== null && saved.method === "curier";

  return (
    <section className="co-step" aria-labelledby="co-step-1">
      <header className="co-step-head">
        <div className="co-badge">01</div>
        <h2 className="co-step-title" id="co-step-1">Livrare</h2>
        {isSaved && mode === "saved" && (
          <span className="co-status">salvat</span>
        )}
      </header>

      <div className="co-tabs" role="tablist" aria-label="Metodă livrare">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "curier"}
          className={`co-tab ${tab === "curier" ? "is-active" : ""}`}
          onClick={() => setTab("curier")}
        >
          Livrare prin curier
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "fanbox"}
          className={`co-tab ${tab === "fanbox" ? "is-active" : ""}`}
          onClick={() => setTab("fanbox")}
        >
          Locker FANbox
        </button>
      </div>

      {/* SAVED VIEW curier — construit din form (Zustand cel mai recent) */}
      {mode === "saved" && tab === "curier" && (form.address || savedAddress) && (
        <div className="co-saved">
          <span className="co-saved-icon" aria-hidden="true">📍</span>
          <div className="co-saved-main">
            <div className="co-saved-name">
              {`${form.firstName} ${form.lastName}`.trim() || "Adresă salvată"}
            </div>
            <div className="co-saved-line">{form.phone || "—"}</div>
            <div className="co-saved-line">{form.address}</div>
            <div className="co-saved-line muted">
              {form.city}
              {form.county ? `, ${form.county}` : ""}
              {form.zip ? ` · ${form.zip}` : ""}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <button
              type="button"
              className="co-chip"
              onClick={() => setMode("form")}
            >
              Modifică
            </button>
            {hasSavedForCurier && (
              <button
                type="button"
                className="co-chip ghost"
                onClick={() => setMode("picker")}
              >
                Alege altă adresă
              </button>
            )}
          </div>
        </div>
      )}

      {mode === "saved" && tab === "fanbox" && (form.pickupPointId || savedPickup) && (
        <div className="co-saved">
          <span className="co-saved-icon" aria-hidden="true">❤</span>
          <div className="co-saved-main">
            <div className="co-saved-name">
              {form.pickupPointName || savedPickup?.name || "Punct FANbox"}
            </div>
            <div className="co-saved-line">
              {form.pickupPointAddress || savedPickup?.address || ""}
            </div>
            <div className="co-saved-line muted">
              {`${form.firstName} ${form.lastName}`.trim()}
              {form.phone ? ` · ${form.phone}` : ""}
            </div>
          </div>
          <button
            type="button"
            className="co-chip"
            onClick={() => setMode("form")}
          >
            Alege alt punct
          </button>
        </div>
      )}

      {/* PICKER (curier) */}
      {mode === "picker" && tab === "curier" && defaults && (
        <div className="co-picker">
          {defaults.addresses.map((a) => {
            const isSel = a.id === selectedAddressId;
            return (
              <button
                type="button"
                key={a.id}
                className="co-picker-item"
                onClick={() => setSelectedAddressId(a.id)}
              >
                <input
                  type="radio"
                  name="co-addr-pick"
                  checked={isSel}
                  readOnly
                
              suppressHydrationWarning
            />
                <div>
                  <div className="co-picker-name">
                    {defaults.customerName ?? "Adresă"}
                    {a.isDefault ? " — preferată" : ""}
                  </div>
                  <div className="co-picker-line">
                    {a.line1}, {a.city}, {a.county}
                    {a.zip ? ` · ${a.zip}` : ""}
                  </div>
                </div>
              </button>
            );
          })}
          <button
            type="button"
            className="co-picker-add"
            onClick={() => {
              setForm({
                ...form,
                address: "",
                city: "",
                county: "",
                zip: "",
              });
              setMode("form");
            }}
          >
            <span className="plus">+</span> adaugă adresă nouă
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
              Folosește adresa
            </button>
          </div>
        </div>
      )}

      {/* FORM */}
      {mode === "form" && (
        <div>
          <form
            className={tab === "fanbox" ? "co-form" : "co-form"}
            onSubmit={(e) => e.preventDefault()}
            noValidate
          >
            <div className="co-field">
              <label htmlFor="co-first">
                Prenume<span className="req">*</span>
              </label>
              <input
                id="co-first"
                type="text"
                autoComplete="given-name"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                placeholder="Mihai"
              />
            </div>
            <div className="co-field">
              <label htmlFor="co-last">
                Nume<span className="req">*</span>
              </label>
              <input
                id="co-last"
                type="text"
                autoComplete="family-name"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                placeholder="Roscăneanu"
              />
            </div>
            <div className="co-field">
              <label htmlFor="co-phone">
                Telefon<span className="req">*</span>
              </label>
              <input
                id="co-phone"
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="07xx xxx xxx"
              />
            </div>
            <div className="co-field">
              <label htmlFor="co-email">
                Email<span className="req">*</span>
              </label>
              <input
                id="co-email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="tu@exemplu.ro"
              />
            </div>
            <div className="co-field">
              <label htmlFor="co-county">
                Județ<span className="req">*</span>
              </label>
              <select
                id="co-county"
                autoComplete="address-level1"
                value={form.county}
                onChange={(e) =>
                  setForm({
                    ...form,
                    county: e.target.value,
                    pickupPointId: undefined,
                    pickupPointName: undefined,
                    pickupPointAddress: undefined,
                  })
                }
              >
                <option value="">Alege județul</option>
                {COUNTIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="co-field">
              <label htmlFor="co-city">
                Localitate<span className="req">*</span>
              </label>
              {fanboxLocalities.length > 0 ? (
                <select
                  id="co-city"
                  autoComplete="address-level2"
                  value={
                    /* Dacă localitatea rămasă din tab-ul de curier nu are
                       locker, nu o afișăm ca selectată — ar arăta ales ceva
                       ce nu e în listă. */
                    fanboxLocalities.includes(form.city) ? form.city : ""
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      city: e.target.value,
                      pickupPointId: undefined,
                      pickupPointName: undefined,
                      pickupPointAddress: undefined,
                    })
                  }
                >
                  <option value="">Alege localitatea</option>
                  {fanboxLocalities.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              ) : (
                <input
                  id="co-city"
                  type="text"
                  autoComplete="address-level2"
                  value={form.city}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      city: e.target.value,
                      pickupPointId: undefined,
                      pickupPointName: undefined,
                      pickupPointAddress: undefined,
                    })
                  }
                  placeholder="București"
                />
              )}
              {tab === "fanbox" && (
                <p className="step-note" style={{ marginTop: 6 }}>
                  {pickupPoints.status === "loading"
                    ? "Se încarcă localitățile cu lockere FANbox…"
                    : pickupPoints.status === "ok" && !form.county
                      ? "Alege întâi județul, ca să-ți arătăm doar localitățile cu lockere."
                      : pickupPoints.status === "ok" && fanboxLocalities.length === 0
                        ? "Nu există lockere FANbox în județul ales. Comută pe livrare prin curier."
                        : null}
                </p>
              )}
            </div>

            {tab === "curier" ? (
              <>
                <div className="co-field span-2">
                  <label htmlFor="co-address">
                    Adresă<span className="req">*</span>
                  </label>
                  <input
                    id="co-address"
                    type="text"
                    autoComplete="street-address"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Stradă, număr, bloc, apartament"
                  />
                </div>
                <div className="co-field">
                  <label htmlFor="co-zip">
                    Cod poștal <span className="opt">(opțional)</span>
                  </label>
                  <input
                    id="co-zip"
                    type="text"
                    autoComplete="postal-code"
                    value={form.zip}
                    onChange={(e) => setForm({ ...form, zip: e.target.value })}
                    placeholder="020956"
                  />
                </div>
              </>
            ) : (
              <div className="co-field span-2">
                <PickupPointSelect
                  type="fanbox"
                  county={form.county}
                  locality={form.city}
                  value={
                    form.pickupPointId
                      ? {
                          id: form.pickupPointId,
                          name: form.pickupPointName ?? "",
                          address: form.pickupPointAddress ?? "",
                        }
                      : null
                  }
                  onChange={(p) =>
                    setForm({
                      ...form,
                      pickupPointId: p?.id,
                      pickupPointName: p?.name,
                      pickupPointAddress: p?.address,
                    })
                  }
                />
              </div>
            )}

            <div className="co-field span-2">
              <label htmlFor="co-note">
                Observații <span className="opt">(opțional)</span>
              </label>
              <textarea
                id="co-note"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="Interfon, program, alte detalii utile curierului"
              />
            </div>

            {error && <p className="co-error">{error}</p>}

            <div className="co-form-actions">
              {(hasSavedForTab || isSaved) && (
                <button
                  type="button"
                  className="co-chip ghost"
                  onClick={() => setMode(hasSavedForTab ? "saved" : "form")}
                >
                  Anulează
                </button>
              )}
              <button
                type="button"
                className="co-chip"
                onClick={handleSaveForm}
              >
                Salvează adresa
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

"use client";

import { useState } from "react";

type FormData = {
  name: string;
  company: string;
  cui: string;
  type: string;
  email: string;
  phone: string;
  city: string;
  volume: string;
  message: string;
};

const TYPES = [
  { value: "restaurant", label: "Restaurant" },
  { value: "hotel", label: "Hotel / pensiune" },
  { value: "vinoteca", label: "Vinotecă / magazin specializat" },
  { value: "retail", label: "Retail / supermarket" },
  { value: "cadouri", label: "Cadouri corporate" },
  { value: "altele", label: "Altele" },
];

const VOLUMES = [
  { value: "<50", label: "Sub 50 sticle / lună" },
  { value: "50-200", label: "50–200 sticle / lună" },
  { value: "200-500", label: "200–500 sticle / lună" },
  { value: "500+", label: "Peste 500 sticle / lună" },
  { value: "unic", label: "Comandă unică / cadou corporate" },
];

const empty: FormData = {
  name: "",
  company: "",
  cui: "",
  type: "",
  email: "",
  phone: "",
  city: "",
  volume: "",
  message: "",
};

export function PartnerForm() {
  const [data, setData] = useState<FormData>(empty);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof FormData>(k: K, v: FormData[K]) {
    setData((d) => ({ ...d, [k]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!data.name.trim() || !data.company.trim() || !data.email.trim() || !data.type) {
      setError("Completează numele, firma, emailul și tipul partenerului.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(data.email)) {
      setError("Email invalid.");
      return;
    }

    // TODO Faza 2: înlocuiește cu Server Action care trimite email prin Resend
    // către b2b@locus.ro și salvează lead-ul în Supabase tabel `partner_leads`.
    console.log("[partner lead]", data);

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="partner-form-success">
        <div className="eyebrow">cerere primită</div>
        <h3>Mulțumim, {data.name.split(" ")[0]}.</h3>
        <p>
          Am primit cererea ta. Un membru al echipei te contactează în maxim
          48h pe email-ul <strong>{data.email}</strong> cu o ofertă personalizată
          și catalogul B2B complet.
        </p>
        <p className="partner-form-success-note">
          Pentru urgențe, scrie direct la{" "}
          <a href="mailto:b2b@locus.ro">b2b@locus.ro</a>.
        </p>
      </div>
    );
  }

  return (
    <form className="partner-form" onSubmit={handleSubmit} noValidate>
      <div className="grid-2">
        <div className="field">
          <label htmlFor="p-name">Nume contact <span className="req">*</span></label>
          <input
            className="input" id="p-name" autoComplete="name"
            value={data.name}
            onChange={(e) => update("name", e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="p-company">Denumire firmă <span className="req">*</span></label>
          <input
            className="input" id="p-company" autoComplete="organization"
            value={data.company}
            onChange={(e) => update("company", e.target.value)}
          />
        </div>
      </div>

      <div className="grid-2">
        <div className="field">
          <label htmlFor="p-cui">CUI</label>
          <input
            className="input" id="p-cui" placeholder="RO12345678"
            value={data.cui}
            onChange={(e) => update("cui", e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="p-type">Tip partener <span className="req">*</span></label>
          <select
            className="select" id="p-type"
            value={data.type}
            onChange={(e) => update("type", e.target.value)}
          >
            <option value="">Alege categoria</option>
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid-2">
        <div className="field">
          <label htmlFor="p-email">Email <span className="req">*</span></label>
          <input
            className="input" id="p-email" type="email" autoComplete="email"
            value={data.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="p-phone">Telefon</label>
          <input
            className="input" id="p-phone" type="tel" autoComplete="tel"
            placeholder="07xx xxx xxx"
            value={data.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
        </div>
      </div>

      <div className="grid-2">
        <div className="field">
          <label htmlFor="p-city">Oraș / județ</label>
          <input
            className="input" id="p-city"
            placeholder="București · Galați · Cluj…"
            value={data.city}
            onChange={(e) => update("city", e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="p-volume">Volum estimat</label>
          <select
            className="select" id="p-volume"
            value={data.volume}
            onChange={(e) => update("volume", e.target.value)}
          >
            <option value="">—</option>
            {VOLUMES.map((v) => (
              <option key={v.value} value={v.value}>{v.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor="p-message">Câteva detalii (opțional)</label>
        <textarea
          className="textarea" id="p-message" rows={5}
          placeholder="Ex: lista de vinuri preferate, regiune de livrare, eveniment specific etc."
          value={data.message}
          onChange={(e) => update("message", e.target.value)}
        />
      </div>

      {error && <p className="step-error">{error}</p>}

      <div className="partner-form-actions">
        <span className="save-note">
          Datele se trimit către <strong>b2b@locus.ro</strong>. Răspundem în 48h.
        </span>
        <button type="submit" className="btn btn-solid">
          Trimite cererea
          <svg className="arrow" viewBox="0 0 24 12" aria-hidden="true">
            <use href="#arrow-right" />
          </svg>
        </button>
      </div>
    </form>
  );
}

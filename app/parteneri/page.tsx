import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/landing/footer";
import { PartnerForm } from "@/components/parteneri/partner-form";

export const metadata: Metadata = {
  title: "Parteneri B2B · HoReCa · Domeniul Locus",
  description:
    "Vânzări en-gros pentru restaurante, hoteluri, vinoteci și magazine specializate. Catalog dedicat HoReCa, prețuri preferențiale, livrare în toată țara.",
};

const VALUES = [
  {
    n: "01",
    title: "Producător direct, fără intermediari.",
    body: "Vinurile vin direct de la cramă. Prețuri en-gros transparente, fără markup distribuitor. Pentru restaurante, asta înseamnă marjă mai bună la pahar.",
  },
  {
    n: "02",
    title: "Loturi mici, identitate puternică.",
    body: "Producem cantități limitate per recoltă. Asta îți dă unicitate pe carta de vinuri — clienții tăi nu găsesc Locus în supermarket.",
  },
  {
    n: "03",
    title: "Suport pentru echipa ta.",
    body: "Sesiuni de degustare gratuite la sediul Buciumeni sau la tine, fișe de vânzare per vin (note tasting, food pairing), pregătire pentru somelieri.",
  },
  {
    n: "04",
    title: "Livrare flexibilă, plată la 30 zile.",
    body: "Comenzi recurente cu calendar fix. Plata la 30 zile pentru parteneri verificați, factură electronică automat în SPV.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Cerere ofertă",
    body: "Completezi formularul de mai jos cu detaliile tale.",
  },
  {
    n: "02",
    title: "Catalog + prețuri",
    body: "Trimitem PDF-ul B2B cu prețuri en-gros și disponibilitate.",
  },
  {
    n: "03",
    title: "Degustare",
    body: "Te invităm la cramă (sau venim la tine cu mostre).",
  },
  {
    n: "04",
    title: "Contract + livrare",
    body: "Semnăm cadrul comercial și începem livrările.",
  },
];

const SEGMENTS = [
  {
    label: "Restaurante & bistro-uri",
    desc: "Carte de vinuri locale, pairing pentru bucătărie românească modernă.",
  },
  {
    label: "Hoteluri & pensiuni",
    desc: "Mini-bar, room-service, evenimente private. Cantități predictibile.",
  },
  {
    label: "Vinoteci & magazine specializate",
    desc: "Producător de nișă, exclusivitate teritorială negociabilă.",
  },
  {
    label: "Cadouri corporate",
    desc: "Cutii personalizate cu logo client, livrare în volum mare la sărbători.",
  },
];

export default function ParteneriPage() {
  return (
    <>
      <main className="parteneri-page">
        <header className="parteneri-hero">
          <div className="container-locus">
            <div className="eyebrow">Parteneri · HoReCa</div>
            <h1 className="parteneri-title">
              Lucrăm <em>direct</em> cu tine.
            </h1>
            <p className="parteneri-lead">
              Restaurant, hotel, vinotecă sau cadouri corporate — Domeniul Locus
              are un program separat pentru parteneri B2B. Prețuri en-gros,
              cantități rezervate, suport pentru echipa ta de vânzare.
            </p>
            <div className="parteneri-hero-actions">
              <a href="#cerere" className="btn btn-solid">
                Cere ofertă
                <svg className="arrow" viewBox="0 0 24 12" aria-hidden="true">
                  <use href="#arrow-right" />
                </svg>
              </a>
              <a href="mailto:b2b@locus.ro" className="parteneri-mail-link">
                sau scrie direct: <strong>b2b@locus.ro</strong>
              </a>
            </div>
          </div>
        </header>

        <div className="container-locus parteneri-content">
          {/* ── 01 De ce ── */}
          <section className="parteneri-values" aria-label="De ce Domeniul Locus">
            <div className="livrare-section-head">
              <div className="eyebrow">01 — de ce locus</div>
              <h2 className="h2">Ce primești ca partener.</h2>
            </div>

            <div className="parteneri-values-grid">
              {VALUES.map((v) => (
                <article key={v.n} className="parteneri-value">
                  <span className="parteneri-value-num">{v.n}</span>
                  <h3 className="parteneri-value-title">{v.title}</h3>
                  <p className="parteneri-value-body">{v.body}</p>
                </article>
              ))}
            </div>
          </section>

          {/* ── 02 Cum lucrăm ── */}
          <section className="parteneri-flow" aria-label="Cum lucrăm">
            <div className="livrare-section-head">
              <div className="eyebrow">02 — cum lucrăm</div>
              <h2 className="h2">Patru pași până la primul lot.</h2>
            </div>

            <ol className="parteneri-flow-list">
              {STEPS.map((s) => (
                <li key={s.n} className="parteneri-flow-item">
                  <span className="parteneri-flow-num">{s.n}</span>
                  <div>
                    <h3 className="parteneri-flow-title">{s.title}</h3>
                    <p className="parteneri-flow-text">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* ── 03 Pentru cine ── */}
          <section className="parteneri-segments" aria-label="Categorii parteneri">
            <div className="livrare-section-head">
              <div className="eyebrow">03 — pentru cine</div>
              <h2 className="h2">Tipuri de parteneri.</h2>
            </div>

            <div className="parteneri-segments-grid">
              {SEGMENTS.map((s) => (
                <article key={s.label} className="parteneri-segment">
                  <h3>{s.label}</h3>
                  <p>{s.desc}</p>
                </article>
              ))}
            </div>
          </section>

          {/* ── 04 Catalog PDF ── */}
          <section className="parteneri-catalog" aria-label="Catalog B2B">
            <div className="parteneri-catalog-inner">
              <div>
                <div className="eyebrow">04 — catalog B2B</div>
                <h2 className="h2">Lista completă, în format PDF.</h2>
                <p className="lead">
                  Catalogul include fișa tehnică pentru fiecare vin, prețuri
                  en-gros pe niveluri de cantitate, disponibilitate per recoltă
                  și note de tasting pentru somelieri. <em>Trimitem PDF-ul
                  după prima cerere de ofertă.</em>
                </p>
              </div>
              {/* TODO Faza 2: catalog real în Supabase Storage; un download = +1 lead în CRM */}
              <div className="parteneri-catalog-cta">
                <a href="#cerere" className="btn">
                  cere catalog
                  <svg className="arrow" viewBox="0 0 24 12" aria-hidden="true">
                    <use href="#arrow-right" />
                  </svg>
                </a>
              </div>
            </div>
          </section>

          {/* ── 05 Form ── */}
          <section className="parteneri-cerere" id="cerere" aria-label="Cerere ofertă">
            <div className="livrare-section-head">
              <div className="eyebrow">05 — cerere ofertă</div>
              <h2 className="h2">Spune-ne despre tine.</h2>
              <p className="lead">
                Răspundem în 48h cu o ofertă personalizată și catalogul B2B
                complet. Toate detaliile sunt confidențiale.
              </p>
            </div>

            <PartnerForm />
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

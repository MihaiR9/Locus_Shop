import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin · Dashboard",
};

const PLACEHOLDER_CARDS = [
  {
    label: "Comenzi azi",
    value: "—",
    note: "se conectează la Supabase la Faza 2",
  },
  {
    label: "Vânzări lună",
    value: "—",
    note: "raport agregat",
  },
  {
    label: "Stoc redus",
    value: "—",
    note: "alerte sub prag",
  },
  {
    label: "Lead-uri parteneri",
    value: "—",
    note: "B2B HoReCa",
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div className="eyebrow">Admin · Dashboard</div>
        <h1>În construcție.</h1>
        <p>
          Schela este pregătită. Conectarea la Supabase, autentificarea cu
          magic link și restul funcționalităților vin în <strong>Faza 2</strong>.
        </p>
      </header>

      <div className="admin-cards">
        {PLACEHOLDER_CARDS.map((c) => (
          <article key={c.label} className="admin-card">
            <div className="admin-card-label">{c.label}</div>
            <div className="admin-card-value">{c.value}</div>
            <div className="admin-card-note">{c.note}</div>
          </article>
        ))}
      </div>

      <section className="admin-roadmap">
        <h2>Ce urmează (Faza 2)</h2>
        <ul>
          <li>Schemă Supabase (products, orders, customers, coupons, audit_log)</li>
          <li>Auth cu magic link + rol admin</li>
          <li>CRUD produse cu upload imagini în Supabase Storage</li>
          <li>Listă comenzi cu filtre + acțiuni (refund, AWB manual, regenerare factură)</li>
          <li>Webhook Stripe + idempotency</li>
          <li>Integrare Smartbill (e-Factura) și Sameday (AWB)</li>
        </ul>
      </section>
    </div>
  );
}

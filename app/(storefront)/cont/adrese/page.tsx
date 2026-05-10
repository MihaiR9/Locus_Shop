import type { Metadata } from "next";
import { MOCK_ADDRESSES } from "@/lib/mock-account";
import { AddAddressButton } from "./add-address-button";

export const metadata: Metadata = {
  title: "Adrese · Cont",
};

export default function AddressesPage() {
  return (
    <>
      <div className="eyebrow">livrare · facturare</div>
      <h1>Adresele tale.</h1>
      <p className="lead-mono">
        Adrese salvate pentru livrare. Cea marcată ca implicită apare
        precompletată la checkout — o poți schimba oricând.
      </p>

      <section className="cont-section">
        <div className="cont-section-head">
          <h2>{MOCK_ADDRESSES.length} adrese salvate</h2>
          <AddAddressButton />
        </div>

        <div className="address-list">
          {MOCK_ADDRESSES.map((addr) => (
            <article key={addr.id} className="address-card">
              <div className="lines">
                <strong>{addr.line1}</strong>
                {addr.line2 && (
                  <>
                    {addr.line2}
                    <br />
                  </>
                )}
                {addr.city}, {addr.county}
                {addr.zip ? ` · ${addr.zip}` : ""}
              </div>
              <div className="badges">
                <span className="badge">
                  {addr.kind === "shipping" ? "livrare" : "facturare"}
                </span>
                {addr.isDefault && (
                  <span className="badge is-default">implicită</span>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <p
        style={{
          marginTop: 32,
          fontFamily: "var(--font-mono), monospace",
          fontSize: 11,
          lineHeight: 1.7,
          color: "var(--ink-mute)",
        }}
      >
        Pentru factură pe persoană juridică, adaugi datele firmei separat la
        checkout — le salvăm dacă bifezi „salvează pentru viitor".
      </p>
    </>
  );
}

import { SHIPPING_METHODS, getReferencePrice } from "@/lib/shipping";

export function MethodsGrid() {
  return (
    <section className="livrare-methods" aria-label="Metode de livrare">
      <div className="livrare-section-head">
        <div className="eyebrow">01 — metode de livrare</div>
        <h2 className="h2">Cinci feluri în care ajunge la tine.</h2>
      </div>

      <div className="livrare-methods-grid">
        {SHIPPING_METHODS.map((m) => {
          const price = getReferencePrice(m.id);
          return (
          <article key={m.id} className="livrare-method">
            <div className="livrare-method-head">
              <div className="livrare-method-carrier">{m.carrier}</div>
              <h3 className="livrare-method-name">{m.name}</h3>
              <div className="livrare-method-duration">{m.duration}</div>
            </div>

            <div className="livrare-method-price">
              {price === 0 ? (
                <span className="price-free">gratuit</span>
              ) : (
                <>
                  <span className="price-num">de la {price}</span>
                  <span className="price-currency">lei</span>
                </>
              )}
              {m.freeShippingFromRon !== null && price > 0 && (
                <div className="livrare-method-free">
                  gratuit peste {m.freeShippingFromRon} lei
                </div>
              )}
            </div>

            <p className="livrare-method-desc">{m.description}</p>

            <ul className="livrare-method-notes">
              {m.notes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>

            <div className="livrare-method-meta">
              {m.maxCodRon && (
                <span>Ramburs până la {m.maxCodRon.toLocaleString("ro-RO")} lei</span>
              )}
              {!m.maxCodRon && (
                <span>Doar plată online</span>
              )}
              <span>
                Acoperire: {m.coverage === "all" ? "toată țara" : m.coverage.join(", ")}
              </span>
            </div>
          </article>
          );
        })}
      </div>
    </section>
  );
}

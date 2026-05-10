import { SHIPPING_METHODS } from "@/lib/shipping";

const STANDARD = SHIPPING_METHODS.find((m) => m.id === "sameday-standard")!;
const EASYBOX = SHIPPING_METHODS.find((m) => m.id === "sameday-easybox")!;

const SCENARIOS = [
  {
    bottles: 1,
    subtotalAprox: 89,
    label: "1 sticlă",
    weight: "1.3 kg",
  },
  {
    bottles: 3,
    subtotalAprox: 267,
    label: "3 sticle (cutie mică)",
    weight: "3.5 kg",
  },
  {
    bottles: 6,
    subtotalAprox: 534,
    label: "6 sticle (cutie standard)",
    weight: "6.2 kg",
  },
];

function format(n: number) {
  return n.toLocaleString("ro-RO") + " lei";
}

export function CalcCost() {
  return (
    <section className="livrare-calc" aria-label="Calcul cost transport">
      <div className="livrare-section-head">
        <div className="eyebrow">03 — cost transport</div>
        <h2 className="h2">Câteva scenarii reale.</h2>
        <p className="lead">
          Costul transportului depinde doar de metoda aleasă, nu de greutate
          (până la 8 kg). Comenzile mari trec automat la transport gratuit.
        </p>
      </div>

      <div className="livrare-calc-table">
        <div className="livrare-calc-head" aria-hidden="true">
          <span>Comandă</span>
          <span>Greutate aprox.</span>
          <span>Curier la ușă</span>
          <span>Easybox</span>
          <span>Ridicare Locus</span>
        </div>
        {SCENARIOS.map((s) => {
          const standardFree =
            STANDARD.freeShippingFromRon !== null &&
            s.subtotalAprox >= STANDARD.freeShippingFromRon;
          const easyboxFree =
            EASYBOX.freeShippingFromRon !== null &&
            s.subtotalAprox >= EASYBOX.freeShippingFromRon;
          return (
            <div key={s.bottles} className="livrare-calc-row">
              <span className="livrare-calc-label">
                {s.label}
                <em>aprox. {format(s.subtotalAprox)} subtotal</em>
              </span>
              <span>{s.weight}</span>
              <span className={standardFree ? "is-free" : ""}>
                {standardFree ? "gratuit" : format(STANDARD.basePriceRon)}
              </span>
              <span className={easyboxFree ? "is-free" : ""}>
                {easyboxFree ? "gratuit" : format(EASYBOX.basePriceRon)}
              </span>
              <span className="is-free">gratuit</span>
            </div>
          );
        })}
      </div>

      <ul className="livrare-calc-notes">
        <li>
          <strong>Curier la ușă</strong> devine <strong>gratuit</strong> peste{" "}
          {STANDARD.freeShippingFromRon} lei subtotal.
        </li>
        <li>
          <strong>Easybox</strong> devine <strong>gratuit</strong> peste{" "}
          {EASYBOX.freeShippingFromRon} lei subtotal.
        </li>
        <li>
          <strong>Ridicarea de la sediu</strong> este întotdeauna gratuită,
          indiferent de valoarea comenzii.
        </li>
      </ul>
    </section>
  );
}

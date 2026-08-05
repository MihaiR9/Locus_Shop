import { getShippingMethod, getReferencePrice } from "@/lib/shipping";

const STANDARD = getShippingMethod("fancourier-standard")!;
const FANBOX = getShippingMethod("fancourier-fanbox")!;
const STANDARD_PRICE = getReferencePrice("fancourier-standard");
const FANBOX_PRICE = getReferencePrice("fancourier-fanbox");

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
          Prețurile de mai jos sunt pentru „restul țării". În București + Ilfov
          și în județele vecine domeniului, transportul e ceva mai ieftin.
          Comenzile mari trec automat la transport gratuit.
        </p>
      </div>

      <div className="livrare-calc-table">
        <div className="livrare-calc-head" aria-hidden="true">
          <span>Comandă</span>
          <span>Greutate aprox.</span>
          <span>Curier la ușă</span>
          <span>FANbox</span>
          <span>Ridicare Locus</span>
        </div>
        {SCENARIOS.map((s) => {
          const standardFree =
            STANDARD.freeShippingFromRon !== null &&
            s.subtotalAprox >= STANDARD.freeShippingFromRon;
          const fanboxFree =
            FANBOX.freeShippingFromRon !== null &&
            s.subtotalAprox >= FANBOX.freeShippingFromRon;
          return (
            <div key={s.bottles} className="livrare-calc-row">
              <span className="livrare-calc-label">
                {s.label}
                <em>aprox. {format(s.subtotalAprox)} subtotal</em>
              </span>
              <span>{s.weight}</span>
              <span className={standardFree ? "is-free" : ""}>
                {standardFree ? "gratuit" : format(STANDARD_PRICE)}
              </span>
              <span className={fanboxFree ? "is-free" : ""}>
                {fanboxFree ? "gratuit" : format(FANBOX_PRICE)}
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
          <strong>FANbox</strong> devine <strong>gratuit</strong> peste{" "}
          {FANBOX.freeShippingFromRon} lei subtotal.
        </li>
        <li>
          <strong>Ridicarea de la sediu</strong> este întotdeauna gratuită,
          indiferent de valoarea comenzii.
        </li>
      </ul>
    </section>
  );
}

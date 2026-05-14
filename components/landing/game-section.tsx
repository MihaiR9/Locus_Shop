import { Reveal } from "@/components/reveal";

const GAME = [
  {
    key: "cuvinte",
    code: "LC",
    body: "Eticheta minimalistă, tipografică. Vinul vorbește singur — un cod, un soi, un an. Restul se află în pahar.",
    list: ["Fetească Regală", "Fetească Neagră", "Riesling Italian"],
    href: "/cuvinte",
  },
  {
    key: "semne",
    code: "LS",
    body: "Paletă cu hartă și relief. Locul se citește pe etichetă — coordonate, simboluri, ritmuri vizuale ale teritoriului.",
    list: ["Fetească Regală", "Fetească Neagră", "Riesling Italian"],
    href: "/semne",
  },
] as const;

export function GameSection() {
  return (
    <section className="vinuri" id="vinuri" aria-label="Game de vin">
      <Reveal as="div" className="vinuri-head">
        <div className="eyebrow">trei game · același loc</div>
        <h2 className="display">Vinul vorbește.</h2>
        <p className="lead">
          Trei feluri în care vinul vorbește. Trei game, același loc, aceeași
          mână de om.
        </p>
      </Reveal>

      <div className="game">
        {GAME.map((g) => (
          <a
            key={g.key}
            href={g.href}
            className="gama"
            data-gama={g.key}
          >
            <div className="gama-tag">{g.key}</div>
            <div className="gama-body">
              <p>{g.body}</p>
              <div className="gama-list">
                {g.list.map((soi) => (
                  <span key={soi}>{soi}</span>
                ))}
              </div>
            </div>
            <div className="gama-cta">
              <span className="small">3 vinuri · gama {g.code}</span>
              <span className="arrow-big" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <path d="M7 17 L17 7 M9 7 H17 V15" />
                </svg>
              </span>
            </div>
          </a>
        ))}

        <article className="gama gama--soon" data-gama="pauze">
          <div className="gama-tag">pauze</div>
          <div className="gama-body">
            <p>
              Momentul când vinul tace și asculți. O gamă în lansare — vinuri de
              rezervă, ediții limitate, păstrate dincolo de recolta lor.
            </p>
          </div>
          <div className="gama-cta" />
        </article>
      </div>
    </section>
  );
}

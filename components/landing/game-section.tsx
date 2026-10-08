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

const SOON = [
  {
    key: "pauze",
    body: "Momentul când vinul tace și asculți. O gamă în lansare — vinuri de rezervă, ediții limitate, păstrate dincolo de recolta lor.",
  },
  {
    key: "urme",
    body: "Drumul bătut de cei dinainte. O gamă în lansare — vinuri făcute după felul vechi al locului.",
  },
] as const;

export function GameSection() {
  return (
    <section className="vinuri" id="vinuri" aria-label="Game de vin">
      <Reveal as="div" className="vinuri-head">
        <div className="eyebrow">patru game · același loc</div>
        <h2 className="display">Vinul vorbește.</h2>
        <p className="lead">
          Patru feluri în care vinul vorbește. Patru game, același loc, aceeași
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

        {SOON.map((g) => (
          <article key={g.key} className="gama gama--soon" data-gama={g.key}>
            <div className="gama-tag">{g.key}</div>
            <div className="gama-body">
              <p>{g.body}</p>
            </div>
            <div className="gama-cta" />
          </article>
        ))}
      </div>
    </section>
  );
}

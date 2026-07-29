import Image from "next/image";
import Link from "next/link";

/**
 * Banda de sub hero: două sticle, câte una din fiecare gamă.
 *
 * Rolul ei e să arate produsul imediat după hero — cine intră de pe o
 * reclamă vede sticla reală în primele secunde, nu după trei ecrane de
 * manifest.
 *
 * Doar două sticle, la aceeași scară, ca să se citească diferența dintre
 * game dintr-o privire. Șase sticle aliniate devin un raft, nu o afirmație.
 */

const BOTTLES = [
  {
    src: "/photos/products/cuvinte-feteasca-neagra-nobg.png",
    label: "cuvinte",
    wine: "Fetească Neagră",
    href: "/cuvinte",
  },
  {
    src: "/photos/products/semne-nobg.png",
    label: "semne",
    wine: "Riesling Italian",
    href: "/semne",
  },
];

export function BottlesBanner() {
  return (
    <section className="bottles-banner" aria-label="Vinurile Domeniului Locus">
      {/* Linie punctată care traversează banda — leagă textul de sticle. */}
      <span className="bb-rule" aria-hidden="true" />

      <div className="bb-inner">
        <div className="bb-lede">
          <svg className="bb-star" viewBox="0 0 24 24" aria-hidden="true">
            <use href="#star8" />
          </svg>
          <p className="bb-claim">
            Vinuri cu personalitate,
            <br />
            născute dintr-un loc unic.
          </p>
          <Link href="/shop" className="bb-cta">
            Descoperă vinurile
            <svg viewBox="0 0 24 12" aria-hidden="true">
              <use href="#arrow-right" />
            </svg>
          </Link>
        </div>

        <div className="bb-bottles">
          {BOTTLES.map((b) => (
            <Link key={b.src} href={b.href} className="bb-bottle">
              <span className="bb-bottle-glow" aria-hidden="true" />
              <Image
                src={b.src}
                alt={`${b.wine} — gama ${b.label}`}
                width={941}
                height={1672}
                sizes="(max-width: 900px) 34vw, 210px"
              />
              <span className="bb-bottle-meta">
                <span className="bb-bottle-gama">{b.label}</span>
                <span className="bb-bottle-wine">{b.wine}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

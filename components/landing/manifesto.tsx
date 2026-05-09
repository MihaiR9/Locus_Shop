import { Reveal } from "@/components/reveal";

const PILLARS = [
  {
    word: "Origine",
    sub: "teritoriu",
    body: "Vinurile noastre se nasc la granița dintre Panciu și Nicorești — două arealuri viticole istorice, cu relief, sol și lumină proprii. Locul lor exact contează la fel de mult ca soiul.",
  },
  {
    word: "Timp",
    sub: "viață",
    body: "Răbdarea e singurul ingredient pe care nu-l putem grăbi. Cules la maturitate deplină, vinificat fără urgență, păstrat până când vinul își găsește singur echilibrul.",
  },
  {
    word: "Măsură",
    sub: "atenție",
    body: "Intervenția umană e discretă — o mână care orientează, nu una care impune. Fiecare gest e cântărit, fiecare detaliu observat. Restul îl face locul.",
  },
];

export function Manifesto() {
  return (
    <section className="manifesto" aria-label="Manifesto">
      <Reveal as="div" stagger className="manifesto-grid">
        {PILLARS.map((p) => (
          <article key={p.word} className="manifesto-item">
            <div className="word">{p.word}</div>
            <div className="sub">{p.sub}</div>
            <p>{p.body}</p>
          </article>
        ))}
      </Reveal>
      <Reveal as="div" className="manifesto-divider">
        <span className="line" aria-hidden="true" />
        <svg className="drift" aria-hidden="true">
          <use href="#star8" />
        </svg>
        <span className="line" aria-hidden="true" />
      </Reveal>
    </section>
  );
}

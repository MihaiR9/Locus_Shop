import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { Footer } from "@/components/landing/footer";
import { ChapterThread } from "@/components/landing/chapter-thread";
import { ChapterArt } from "@/components/despre/chapter-art";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/seo/schema";

export const metadata: Metadata = {
  title: "Povestea locului",
  description:
    "Povestea Domeniului Locus în trei capitole — familia care a început-o, tradiția care o ține, și continuitatea dusă mai departe de la tată la copii.",
  alternates: { canonical: "/despre" },
  openGraph: {
    type: "website",
    url: "/despre",
    title: "Povestea locului · Domeniul Locus",
    description:
      "O poveste de familie, dusă mai departe firesc, de la tată la copii. Buciumeni, între Panciu și Nicorești.",
  },
};

/**
 * Pagina de poveste — singura. Înainte exista și o secțiune „Despre noi"
 * pe home, iar butonul „Vezi povestea locului" din `MapSection` ducea la
 * ea printr-o ancoră. Două locuri care spuneau același lucru; acum e unul.
 *
 * Textele sunt scrise de Mihai. Titlul fiecărui capitol e prima frază a
 * paragrafului lui, decupată — nimic nu e inventat aici. Dacă schimbi
 * copy-ul, păstrează regula: titlul iese din text, nu îl comentează.
 */
const CHAPTERS = [
  {
    num: "01",
    kicker: "Familie",
    title: "Înainte de a fi o cramă.",
    body: [
      "Domeniul Locus este o poveste de familie. Totul începe cu pasiunea tatălui pentru vie și continuă firesc prin generația următoare, unde experiența se întâlnește cu o perspectivă nouă.",
      "Fiecare vin poartă amprenta acestui parcurs și a unei legături autentice cu pământul.",
    ],
    art: "familie",
  },
  {
    num: "02",
    kicker: "Tradiție",
    title: "Nu despre trecut, ci despre continuitate.",
    body: [
      "Despre răbdarea de a aștepta momentul potrivit al recoltei, despre respectul pentru ritmul naturii și despre grija acordată fiecărei etape a vinificației.",
      "Astfel ia naștere un vin care exprimă sincer locul din care provine.",
    ],
    art: "traditie",
  },
  {
    num: "03",
    kicker: "Continuitate",
    title: "Locus înseamnă loc.",
    body: [
      "Un loc în care rădăcinile rămân vii, iar fiecare generație adaugă propriul capitol aceleiași povești.",
      "Domeniul Locus unește experiența, viziunea și timpul într-o identitate construită cu autenticitate și dusă mai departe, firesc, de la tată la copii.",
    ],
    art: "continuitate",
  },
] as const;

export default function DesprePage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Acasă", path: "/" },
          { name: "Povestea locului", path: "/despre" },
        ])}
      />

      <main className="poveste-page">
        {/* Antet compact: titlul nu mai ocupă un ecran întreg, ca cititorul
            să ajungă la primul capitol fără să deruleze. */}
        <section className="poveste-head" aria-label="Povestea locului">
          <Reveal as="div" className="poveste-head-inner">
            <div className="eyebrow">Povestea locului</div>
            <h1>Un loc. Un timp. Un vin.</h1>
            <p className="lead">
              O poveste de familie, o tradiție care înseamnă continuitate, și un
              loc în care rădăcinile rămân vii.
            </p>
            <div className="poveste-coords">45.98°N 27.30°E · Buciumeni · Galați</div>
          </Reveal>
        </section>

        {/* Linia ondulată care leagă capitolele, ca în landing-v6.
            Doar pe desktop — vezi ChapterThread. */}
        <ChapterThread count={CHAPTERS.length} />

        {CHAPTERS.map((ch, i) => (
          <section
            key={ch.num}
            className={`chapter ${i % 2 === 1 ? "chapter--flip" : ""}`}
            aria-label={`Capitolul ${ch.num} — ${ch.kicker}`}
          >
            <Reveal as="div" className="chapter-media">
              <ChapterArt variant={ch.art} />
            </Reveal>

            <Reveal as="div" className="chapter-text">
              <div className="chapter-num" aria-hidden="true">
                {ch.num}
              </div>
              <div className="eyebrow">{ch.kicker}</div>
              <h2 className="h2">{ch.title}</h2>
              {ch.body.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </Reveal>
          </section>
        ))}

        <section className="poveste-outro" aria-label="Spre vinuri">
          <Reveal as="div" className="poveste-outro-inner">
            <h2 className="h2">Restul se citește în pahar.</h2>
            <p>
              Gamele Cuvinte și Semne pornesc din aceleași parcele. Diferă
              registrul, nu locul.
            </p>
            <Link href="/shop" className="btn-primary">
              <span>Vezi vinurile</span>
              <svg width="16" height="8" viewBox="0 0 24 12" aria-hidden="true">
                <use href="#arrow-right" />
              </svg>
            </Link>
          </Reveal>
        </section>
      </main>
      <Footer />
    </>
  );
}

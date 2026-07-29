import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { Footer } from "@/components/landing/footer";
import { ChapterThread } from "@/components/landing/chapter-thread";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/seo/schema";

export const metadata: Metadata = {
  title: "Povestea locului",
  description:
    "Povestea Domeniului Locus în trei capitole — locul dintre Panciu și Nicorești, timpul care lucrează în sticlă, și mâna care doar orientează.",
  alternates: { canonical: "/despre" },
  openGraph: {
    type: "website",
    url: "/despre",
    title: "Povestea locului · Domeniul Locus",
    description:
      "Trei capitole despre un loc, un timp și un vin. Buciumeni, între Panciu și Nicorești.",
  },
};

/**
 * Pagina de poveste — singura. Înainte exista și o secțiune „Despre noi"
 * pe home, iar butonul „Vezi povestea locului" din `MapSection` ducea la
 * ea printr-o ancoră. Două locuri care spuneau același lucru; acum e unul.
 *
 * ⚠️ TEXTELE SUNT PROVIZORII. Structura în trei capitole e finală, dar
 * conținutul îl scrie Mihai. Fiecare capitol are: un titlu, două-trei
 * paragrafe și o fotografie. Se înlocuiește direct în `CHAPTERS`.
 */
const CHAPTERS = [
  {
    num: "01",
    kicker: "Locul",
    title: "Coama dintre două areale.",
    body: [
      "TEXT PROVIZORIU. Pământul vorbește primul. Coama dintre Panciu și Nicorești are propria respirație: relief blând, sol calcaros, vânt care vine din nord și usucă bobul exact cât trebuie.",
      "TEXT PROVIZORIU. Aici nu se plantează unde e comod, ci unde ține locul. Aceleași parcele, an după an, până le știi caracterul mai bine decât pe al tău.",
    ],
    photo: "/photos/hero/dealuri.jpg",
    alt: "Dealurile viticole dintre Panciu și Nicorești",
  },
  {
    num: "02",
    kicker: "Timpul",
    title: "Nimic nu se grăbește.",
    body: [
      "TEXT PROVIZORIU. Cules la maturitate deplină, vinificat fără urgență. Anul nu se grăbește, iar noi nu îl forțăm. Sticlele așteaptă să-și găsească singure echilibrul.",
      "TEXT PROVIZORIU. Răbdarea nu e o virtute pe care ne-o asumăm — e o condiție. Vinul care iese repede spune puțin și uită repede de unde vine.",
    ],
    photo: "/photos/homepage-amfora.webp",
    alt: "Amforă la Centrul de Vinificație Buciumeni",
  },
  {
    num: "03",
    kicker: "Mâna",
    title: "O intervenție măsurată.",
    body: [
      "TEXT PROVIZORIU. O mână care orientează, nu una care impune. Decizii puține, atent cântărite. Restul îl face locul.",
      "TEXT PROVIZORIU. Fiecare sticlă rămâne o consemnare: un fragment dintr-un an, dintr-un parcurs, dintr-o atenție. Ce ajunge în pahar nu e o promisiune — e o constatare.",
    ],
    photo: "/photos/dining-setup.webp",
    alt: "Masă pusă cu vin de la Domeniul Locus",
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
              Trei capitole despre cum ajunge un deal din Buciumeni să încapă
              într-o sticlă — și de ce ne-am hotărât să nu grăbim nimic.
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
              <Image
                src={ch.photo}
                alt={ch.alt}
                width={1200}
                height={800}
                sizes="(max-width: 900px) 100vw, 50vw"
              />
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

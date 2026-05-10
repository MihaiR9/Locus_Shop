import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "Despre noi",
  description:
    "Domeniul Locus — vinuri din Buciumeni, între Panciu și Nicorești. Locul, timpul, mâna, mărturia.",
};

const PILLARS = [
  {
    word: "Locul",
    body: "Pământul vorbește primul. Coama dintre Panciu și Nicorești are propria respirație: relief blând, sol calcaros, vânt din nord. De acolo culegem — același punct, an după an.",
  },
  {
    word: "Timpul",
    body: "Cules la maturitate deplină, vinificat fără urgență. Anul nu se grăbește, iar noi nu îl forțăm. Sticlele așteaptă să-și găsească singure echilibrul.",
  },
  {
    word: "Mâna",
    body: "Intervenția e măsurată. O mână care orientează, nu una care impune. Decizii puține, atent cântărite. Restul îl face locul.",
  },
  {
    word: "Mărturia",
    body: "Fiecare sticlă e o consemnare. Un fragment dintr-un an, dintr-un parcurs, dintr-o atenție. Ce ajunge în pahar nu e o promisiune — e o constatare.",
  },
] as const;

export default function DesprePage() {
  return (
    <>
      <main className="despre-page">
        <section className="despre-hero" aria-label="Despre Domeniul Locus">
          <Reveal as="div" className="despre-hero-inner">
            <div className="eyebrow">Despre noi</div>
            <h1>
              O linie pe pământ,
              <br />
              urmată cu răbdare.
            </h1>
            <p className="lead">
              Domeniul Locus a luat formă la granița dintre Panciu și
              Nicorești, pe coama unui deal cu propriul ritm. Facem vinuri
              care păstrează amprenta locului — fără retușări, fără prea multe
              cuvinte.
            </p>
          </Reveal>
        </section>

        <section className="despre-cards" aria-label="Patru repere">
          <Reveal as="div" stagger className="despre-cards-grid">
            {PILLARS.slice(0, 2).map((p, i) => (
              <article key={p.word} className="despre-card">
                <div className="num">{String(i + 1).padStart(2, "0")}</div>
                <div className="word">{p.word}</div>
                <p>{p.body}</p>
              </article>
            ))}
          </Reveal>
        </section>

        <Reveal as="div" className="despre-photo">
          <Image
            src="/photos/frunze.jpeg"
            alt="Frunze de viță-de-vie din Buciumeni"
            width={2400}
            height={1050}
            sizes="100vw"
          />
        </Reveal>

        <section className="despre-cards" aria-label="Patru repere — continuare">
          <Reveal as="div" stagger className="despre-cards-grid">
            {PILLARS.slice(2, 4).map((p, i) => (
              <article key={p.word} className="despre-card">
                <div className="num">{String(i + 3).padStart(2, "0")}</div>
                <div className="word">{p.word}</div>
                <p>{p.body}</p>
              </article>
            ))}
          </Reveal>
        </section>

        <Reveal as="div" className="despre-photo">
          <Image
            src="/photos/dining-setup.png"
            alt="Banc cu pâine, brânză și un pahar de vin Locus"
            width={2400}
            height={1050}
            sizes="100vw"
          />
        </Reveal>

        <section className="despre-cta" aria-label="Continuă explorarea">
          <Reveal as="div" className="despre-cta-inner">
            <h2>Restul îl face locul.</h2>
            <Link href="/cuvinte" className="btn">
              <span>Descoperă vinurile</span>
              <svg className="arrow-svg" viewBox="0 0 24 12" aria-hidden="true">
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

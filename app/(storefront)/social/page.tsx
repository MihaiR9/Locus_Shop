import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { Footer } from "@/components/landing/footer";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { SOCIAL_POSTS, INSTAGRAM_URL } from "@/lib/social-posts";

export const metadata: Metadata = {
  title: "Social",
  description:
    "Vinul Domeniului Locus în contexte reale — mese, cadouri, seri lungi. Fotografii din viața vinului.",
  alternates: { canonical: "/social" },
  openGraph: {
    type: "website",
    url: "/social",
    title: "Social · Domeniul Locus",
    description: "Vinul nostru, în locurile în care ajunge.",
  },
};

/**
 * Galeria completă — șablonul în care intră fotografiile reale.
 *
 * Grila e „masonry-lite": fiecare a treia poză ocupă două rânduri, ca
 * peretele să nu arate ca un tabel. Sursa e `lib/social-posts.ts`.
 */
export default function SocialPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Acasă", path: "/" },
          { name: "Social", path: "/social" },
        ])}
      />

      <main className="social-page">
        <section className="social-page-head">
          <Reveal as="div" className="social-page-head-inner">
            <div className="eyebrow">Din viața vinului</div>
            <h1>Unde ajunge.</h1>
            <p className="lead">
              Mese lungi, cadouri, seri care nu se grăbesc. Dacă ai o
              fotografie cu vinul nostru într-un loc care merită povestit,
              trimite-ne-o — o publicăm aici.
            </p>
            <div className="social-page-actions">
              <a
                className="btn-primary"
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>Instagram</span>
                <svg width="16" height="8" viewBox="0 0 24 12" aria-hidden="true">
                  <use href="#arrow-right" />
                </svg>
              </a>
              <Link className="btn-ghost" href="/contact">
                <span>Trimite o fotografie</span>
              </Link>
            </div>
          </Reveal>
        </section>

        <Reveal as="div" stagger className="social-grid">
          {SOCIAL_POSTS.map((p, i) => (
            <figure
              key={p.src + p.tag}
              className={`social-tile ${i % 3 === 0 ? "social-tile--tall" : ""}`}
            >
              <Image
                src={p.src}
                alt={p.alt}
                width={900}
                height={1200}
                sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
              />
              <figcaption>{p.tag}</figcaption>
            </figure>
          ))}
        </Reveal>
      </main>
      <Footer />
    </>
  );
}

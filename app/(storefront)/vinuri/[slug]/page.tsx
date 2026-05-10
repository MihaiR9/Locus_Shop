import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/reveal";
import { Footer } from "@/components/landing/footer";
import { Breadcrumbs } from "@/components/pdp/breadcrumbs";
import { WineHero } from "@/components/pdp/wine-hero";
import { WinePairing } from "@/components/pdp/wine-pairing";
import { WineSpecs } from "@/components/pdp/wine-specs";
import { WineRelated } from "@/components/pdp/wine-related";
import { metaLine } from "@/lib/wines";
import {
  getAllSlugs,
  getWineBySlug,
  getRelatedWines,
} from "@/lib/wines-queries";

type Params = { slug: string };

// Re-fetch DB at most once per minute. Stoc / preț / activ → live.
export const revalidate = 60;

export async function generateStaticParams(): Promise<Params[]> {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const wine = await getWineBySlug(slug);
  if (!wine) return { title: "Vin negăsit" };

  return {
    title: `${wine.name} ${wine.code} · ${wine.gama}`,
    description: `${wine.name} (${wine.code}) — gama ${wine.gama}. ${metaLine(wine)} · ${wine.priceRon} lei.`,
  };
}

export default async function WinePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const wine = await getWineBySlug(slug);
  if (!wine) notFound();
  const related = await getRelatedWines(wine, 3);

  return (
    <>
      <main style={{ paddingTop: 72 }}>
        <Breadcrumbs wine={wine} />
        <WineHero wine={wine} />

        <section className="story">
          <Reveal as="div" className="story-inner">
            <p>
              <em>locus</em> marchează un punct precis: locul unde natura,
              timpul și intervenția umană se întâlnesc. Ce se naște în acest
              punct exprimă fidel caracterul teritoriului de graniță — între
              Panciu și Nicorești.
            </p>
            <div className="small-mono">teritoriu · timp · măsură</div>
          </Reveal>
        </section>

        <section className="info" aria-label="Detalii vin">
          <Reveal as="div" className="info-head">
            <div className="eyebrow" style={{ justifyContent: "center" }}>
              Detalii vin
            </div>
            <h2 className="h2">Cum se citește.</h2>
          </Reveal>
          <Reveal as="div" stagger className="info-grid">
            <WinePairing wine={wine} />
            <WineSpecs wine={wine} />
          </Reveal>
        </section>

        <section className="coords-band" aria-label="Locul de origine">
          <Reveal as="div" className="coords-inner">
            <h3>Cules din parcelele de pe coama dintre Panciu și Nicorești.</h3>
            <div className="coords-card">
              <strong>45.98°N 27.30°E</strong>
              Centrul de Vinificație Buciumeni
              <br />
              jud. Galați · România
              <br />
              DOC-CMD Panciu
            </div>
          </Reveal>
        </section>

        <WineRelated wines={related} />
      </main>
      <Footer />
    </>
  );
}

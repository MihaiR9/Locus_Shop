import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/landing/footer";
import { GamaHero } from "@/components/gama/gama-hero";
import { GamaWines } from "@/components/gama/gama-wines";
import { GamaPillars } from "@/components/gama/gama-pillars";
import { JsonLd } from "@/components/seo/json-ld";
import { ALL_GAMA, GAMA_META } from "@/lib/gama-meta";
import { breadcrumbSchema, itemListSchema } from "@/lib/seo/schema";
import type { Gama } from "@/lib/wines";
import { getWinesByGama } from "@/lib/wines-queries";

type Params = { gama: string };

export const dynamicParams = false;
export const revalidate = 60;

export function generateStaticParams(): Params[] {
  return ALL_GAMA.map((g) => ({ gama: g }));
}

function isGama(value: string): value is Gama {
  return (ALL_GAMA as string[]).includes(value);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { gama } = await params;
  if (!isGama(gama)) return { title: "Gamă negăsită" };

  const meta = GAMA_META[gama];
  const title = `${meta.title} · gamă`;

  return {
    title,
    description: meta.manifesto,
    alternates: { canonical: `/${gama}` },
    openGraph: {
      type: "website",
      url: `/${gama}`,
      title,
      description: meta.manifesto,
    },
  };
}

export default async function GamaPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { gama } = await params;
  if (!isGama(gama)) notFound();

  const wines = await getWinesByGama(gama);

  return (
    <>
      <JsonLd
        data={[
          itemListSchema(wines, `Gama ${GAMA_META[gama].title}`),
          breadcrumbSchema([
            { name: "Acasă", path: "/" },
            { name: "Shop", path: "/shop" },
            { name: gama, path: `/${gama}` },
          ]),
        ]}
      />
      <main className="gama-page">
        <GamaHero gama={gama} />
        <GamaWines gama={gama} wines={wines} />
        <GamaPillars gama={gama} />
      </main>
      <Footer />
    </>
  );
}

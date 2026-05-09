import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/landing/footer";
import { GamaHero } from "@/components/gama/gama-hero";
import { GamaWines } from "@/components/gama/gama-wines";
import { GamaPillars } from "@/components/gama/gama-pillars";
import { ALL_GAMA, GAMA_META } from "@/lib/gama-meta";
import type { Gama } from "@/lib/wines";

type Params = { gama: string };

export const dynamicParams = false;

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
  return {
    title: `${meta.title} · gamă`,
    description: meta.manifesto,
  };
}

export default async function GamaPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { gama } = await params;
  if (!isGama(gama)) notFound();

  return (
    <>
      <main className="gama-page">
        <GamaHero gama={gama} />
        <GamaWines gama={gama} />
        <GamaPillars gama={gama} />
      </main>
      <Footer />
    </>
  );
}

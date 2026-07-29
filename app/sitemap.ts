import type { MetadataRoute } from "next";
import { absUrl } from "@/lib/site";
import { ALL_GAMA } from "@/lib/gama-meta";
import { getAllWines } from "@/lib/wines-queries";

// Regenerăm o dată pe oră: produsele noi trebuie descoperite repede,
// dar nu justifică o interogare DB la fiecare hit de crawler.
export const revalidate = 3600;

/** Pagini statice publice + prioritatea lor relativă. */
const STATIC_ROUTES: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1.0, freq: "weekly" },
  { path: "/shop", priority: 0.9, freq: "daily" },
  { path: "/despre", priority: 0.6, freq: "monthly" },
  { path: "/contact", priority: 0.5, freq: "yearly" },
  { path: "/parteneri", priority: 0.5, freq: "monthly" },
  { path: "/livrare", priority: 0.5, freq: "monthly" },
  { path: "/cum-cumperi", priority: 0.5, freq: "monthly" },
  { path: "/termeni", priority: 0.3, freq: "yearly" },
  { path: "/confidentialitate", priority: 0.3, freq: "yearly" },
  { path: "/cookies", priority: 0.3, freq: "yearly" },
  { path: "/retur", priority: 0.3, freq: "yearly" },
];

/**
 * sitemap.xml
 *
 * Nu includem /checkout, /cont/*, /admin/* — pagini private sau tranzacționale,
 * fără valoare de indexare (și blocate oricum din robots.txt).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const wines = await getAllWines();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: absUrl(r.path),
    lastModified: now,
    changeFrequency: r.freq,
    priority: r.priority,
  }));

  const gamaEntries: MetadataRoute.Sitemap = ALL_GAMA.map((g) => ({
    url: absUrl(`/${g}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const wineEntries: MetadataRoute.Sitemap = wines.map((w) => ({
    url: absUrl(`/vinuri/${w.slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  return [...staticEntries, ...gamaEntries, ...wineEntries];
}

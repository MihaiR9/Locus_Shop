import type { MetadataRoute } from "next";
import { absUrl } from "@/lib/site";
import { ALL_GAMA } from "@/lib/gama-meta";
import { getAllWines } from "@/lib/wines-queries";
import { isHiddenFromSearch } from "@/lib/seo/hidden-pages";

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
 *
 * `lastModified` doar unde avem o dată reală: vinurile (`updated_at`), iar
 * /shop și paginile de gamă iau cea mai recentă modificare a vinurilor lor.
 * Paginile statice n-au dată — Google ignoră un `lastmod` care e mereu „acum".
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const wines = await getAllWines();

  const latest = (list: typeof wines): Date | undefined =>
    list.length
      ? new Date(Math.max(...list.map((w) => Date.parse(w.updatedAt))))
      : undefined;

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: absUrl(r.path),
    lastModified: r.path === "/shop" ? latest(wines) : undefined,
    changeFrequency: r.freq,
    priority: r.priority,
  }));

  const gamaEntries: MetadataRoute.Sitemap = ALL_GAMA.map((g) => ({
    url: absUrl(`/${g}`),
    lastModified: latest(wines.filter((w) => w.gama === g)),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const wineEntries: MetadataRoute.Sitemap = wines.map((w) => ({
    url: absUrl(`/vinuri/${w.slug}`),
    lastModified: new Date(w.updatedAt),
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  // Paginile ascunse de Google (lib/seo/hidden-pages.ts) nu intră în sitemap.
  return [...staticEntries, ...gamaEntries, ...wineEntries].filter(
    (e) => !isHiddenFromSearch(new URL(e.url).pathname),
  );
}

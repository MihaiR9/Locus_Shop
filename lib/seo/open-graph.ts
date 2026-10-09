import type { Metadata } from "next";

type OpenGraph = NonNullable<Metadata["openGraph"]>;

/** Imaginea de partajare a site-ului, generată de `app/opengraph-image.tsx`. */
const DEFAULT_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Domeniul Locus — un loc. un timp. un vin.",
};

/**
 * `openGraph` pentru o pagină. Next nu combină obiectul paginii cu cel din
 * layout, ci îl înlocuiește, așa că fără helper-ul ăsta paginile pierdeau
 * imaginea, numele site-ului și limba când erau distribuite.
 *
 * `image: false` lasă imaginea pe seama unui `opengraph-image` propriu
 * al rutei (ex. pagina de vin).
 */
export function pageOpenGraph(input: {
  url: string;
  title: string;
  description: string;
  image?: false;
}): OpenGraph {
  return {
    type: "website",
    siteName: "Domeniul Locus",
    locale: "ro_RO",
    url: input.url,
    title: input.title,
    description: input.description,
    ...(input.image === false ? {} : { images: [DEFAULT_IMAGE] }),
  };
}

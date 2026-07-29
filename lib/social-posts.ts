/**
 * Fotografiile din secțiunea Social.
 *
 * ⚠️ TOATE SUNT PROVIZORII — refolosesc pozele de brand existente doar ca
 * să se vadă structura. Se înlocuiesc cu fotografii REALE făcute de voi:
 * mese cu prieteni, cadouri, corporate, mare, munte, petreceri.
 *
 * Nu folosi stock și nu genera imagini. Tot brandul stă pe ideea că vinul
 * spune adevărul despre locul lui; o poză cumpărată contrazice exact asta,
 * iar oamenii simt diferența chiar dacă nu o pot numi.
 *
 * Reguli pentru poze, din politica Meta pentru alcool — contează când
 * aceleași imagini ajung în reclame:
 *  - fără sugestii de consum excesiv
 *  - fără șofat, fără minori în cadru
 *  - accentul pe context și oameni, nu pe cantitate
 */

export type SocialPost = {
  src: string;
  alt: string;
  /** Contextul afișat peste poză — ocazia de consum. */
  tag: string;
};

export const SOCIAL_POSTS: SocialPost[] = [
  {
    src: "/photos/dining-setup.webp",
    alt: "Masă pusă cu vin de la Domeniul Locus",
    tag: "La masă",
  },
  {
    src: "/photos/hero/cuvinte-rosu.jpg",
    alt: "Sticlă de Fetească Neagră lângă o amforă de piatră",
    tag: "Cadou",
  },
  {
    src: "/photos/hero/dealuri.jpg",
    alt: "Dealurile viticole de la Buciumeni",
    tag: "La cramă",
  },
  {
    src: "/photos/frunze.jpeg",
    alt: "Frunze de viță-de-vie",
    tag: "În vie",
  },
  {
    src: "/photos/homepage-amfora.webp",
    alt: "Amforă la Centrul de Vinificație Buciumeni",
    tag: "Pivniță",
  },
];

export const INSTAGRAM_URL = "https://instagram.com";

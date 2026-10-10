import { Reveal } from "@/components/reveal";
import { WineGallery } from "@/components/pdp/wine-gallery";
import { WineBuyBox } from "@/components/pdp/wine-buy-box";
import type { Wine } from "@/lib/wines";

export function WineHero({ wine }: { wine: Wine }) {
  return (
    <section className="product" aria-label={`Fișa vinului ${wine.name}`}>
      <div className="product-grid">
        {/* Fără <Reveal>: sticla e LCP-ul paginii și trebuie vizibilă din
            primul cadru, nu după hidratare. Intrarea e doar CSS (.gallery-rise). */}
        <div className="gallery-rise">
          <WineGallery wine={wine} />
        </div>
        <Reveal as="div">
          <WineBuyBox wine={wine} />
        </Reveal>
      </div>
    </section>
  );
}

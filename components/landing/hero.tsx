import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { HeroPager } from "@/components/landing/hero-pager";

export function Hero() {
  return (
    <section className="hero" id="acasa" aria-label="Hero">
      <div className="hero-stage">
        <div className="hero-frames" aria-hidden="true">
          <div className="hero-frame frame-1 is-active">
            <div className="ken" />
          </div>
          <div className="hero-frame frame-2">
            <div className="ken" />
          </div>
          <div className="hero-frame frame-3">
            <div className="ken" />
          </div>
        </div>

        <div className="hero-watermark" aria-hidden="true">
          lócus
        </div>

        <div className="hero-content">
          <div>
            <div className="eyebrow hero-eyebrow">
              Domeniul Locus · Panciu — Nicorești
            </div>
          </div>

          <h1 className="hero-title">
            <span className="line">
              <span>un loc.</span>
            </span>
            <span className="line">
              <span>un timp.</span>
            </span>
            <span className="line">
              <span>un vin.</span>
            </span>
          </h1>

          <div className="hero-cta-row">
            <div className="hero-ctas">
              <a href="#locul" className="hero-cta">
                <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                  <use href="#star8" />
                </svg>
                Descoperă locul
                <svg width="16" height="8" viewBox="0 0 24 12" aria-hidden="true">
                  <use href="#arrow-right" />
                </svg>
              </a>
              <Link href="/shop" className="hero-cta hero-cta--secondary">
                <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true">
                  <use href="#diamond" />
                </svg>
                Shop
                <svg width="16" height="8" viewBox="0 0 24 12" aria-hidden="true">
                  <use href="#arrow-right" />
                </svg>
              </Link>
            </div>

            <HeroPager />
          </div>
        </div>
      </div>

      <div className="hero-quote">
        <Reveal as="div">
          <p>
            Vinul începe în vie, acolo unde timpul și natura își urmează cursul
            firesc. Fiecare recoltă păstrează amprenta locului, iar fiecare
            sticlă devine o mărturie a unui parcurs dus cu respect și măsură.
          </p>
        </Reveal>
        <Reveal as="div" className="symbol-row">
          <svg aria-hidden="true"><use href="#square" /></svg>
          <svg aria-hidden="true"><use href="#triangle-flag" /></svg>
          <svg aria-hidden="true"><use href="#star8" /></svg>
          <svg aria-hidden="true"><use href="#circle" /></svg>
          <svg aria-hidden="true"><use href="#diamond" /></svg>
        </Reveal>
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import { Reveal } from "@/components/reveal";
import { Footer } from "@/components/landing/footer";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Scrie-ne, sună-ne sau vino la o degustare. Centrul de Vinificație Buciumeni — programare prealabilă.",
};

export default function ContactPage() {
  return (
    <>
      <main className="contact-page">
        <section className="contact-hero" aria-label="Contact">
          <Reveal as="div" className="contact-hero-inner">
            <div className="eyebrow">Contact</div>
            <h1>Scrie-ne.</h1>
            <p className="lead">
              Ne găsești la cramă în Buciumeni — degustările sunt cu programare.
              Pentru orice altceva, lasă-ne un mesaj.
            </p>
          </Reveal>
        </section>

        <section className="contact-body">
          <div className="contact-grid">
            <Reveal as="div">
              <ContactForm />
            </Reveal>

            <Reveal as="aside" className="contact-info">
              {/* TODO: Mihai sa confirme adresa exacta + numarul de telefon */}
              <div className="contact-info-block">
                <span className="contact-info-label">Cramă</span>
                <span className="contact-info-value">
                  Centrul de Vinificație Buciumeni
                </span>
                <span className="contact-info-text">
                  com. Buciumeni, jud. Galați
                  <br />
                  România
                </span>
              </div>

              <div className="contact-info-block">
                <span className="contact-info-label">Telefon</span>
                <span className="contact-info-value">
                  <a href="tel:+40752232912">0752 232 912</a>
                </span>
              </div>

              <div className="contact-info-block">
                <span className="contact-info-label">Email</span>
                <span className="contact-info-value">
                  <a href="mailto:contact@domeniul-locus.ro">
                    contact@domeniul-locus.ro
                  </a>
                </span>
              </div>

              <div className="contact-info-block">
                <span className="contact-info-label">Program</span>
                <span className="contact-info-text">
                  Degustări la cerere — programare prealabilă.
                  <br />
                  Răspundem la mesaje în maxim 48h.
                </span>
              </div>

              <div className="contact-info-block">
                <span className="contact-info-label">Social</span>
                <div className="contact-social">
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    Instagram ↗
                  </a>
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    Facebook ↗
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

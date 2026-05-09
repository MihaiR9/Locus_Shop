import { Reveal } from "@/components/reveal";
import { NewsletterForm } from "@/components/landing/newsletter-form";

export function Newsletter() {
  return (
    <section className="newsletter" aria-label="Newsletter">
      <div className="newsletter-inner">
        <Reveal as="div" className="newsletter-text">
          <h3>Câteva cuvinte, rar.</h3>
          <p>
            Despre recolte, evenimente la cramă și pauzele dintre ele. Niciodată
            mai des decât merită.
          </p>
        </Reveal>
        <Reveal as="div">
          <NewsletterForm />
        </Reveal>
      </div>
    </section>
  );
}

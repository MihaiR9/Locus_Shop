import { Reveal } from "@/components/reveal";
import { NewsletterForm } from "@/components/landing/newsletter-form";

export function Newsletter() {
  return (
    <section className="newsletter" aria-label="Newsletter">
      <div className="newsletter-inner">
        <Reveal as="div" className="newsletter-text">
          <h3>Locul, în cuvinte.</h3>
          <p>
            Notițe rare din vie și pivniță — recolte, ediții limitate înainte
            să apară pe site, invitații la degustări și evenimente la sediul
            din Buciumeni. Trimitem doar când chiar avem ce povesti.
          </p>
        </Reveal>
        <Reveal as="div">
          <NewsletterForm />
        </Reveal>
      </div>
    </section>
  );
}

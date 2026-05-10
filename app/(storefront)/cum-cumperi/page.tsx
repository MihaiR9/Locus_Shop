import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "Cum cumperi · Domeniul Locus",
  description:
    "Pași simpli pentru a comanda vin de la Domeniul Locus. Plată online sau la livrare, factură electronică, livrare prin Sameday. Răspundem la întrebările tale.",
};

const STEPS = [
  {
    n: "01",
    title: "Alege vinul.",
    body: "Răsfoiește colecția în pagina Shop sau direct pe gamă (cuvinte, semne, pauze). Apasă pe orice sticlă pentru fișa tehnică completă.",
  },
  {
    n: "02",
    title: "Adaugă în coș.",
    body: "Reglezi cantitatea de pe pagina produsului sau direct din coș. Coșul se păstrează pe device-ul tău — poți reveni mai târziu.",
  },
  {
    n: "03",
    title: "Completează datele.",
    body: "La checkout intri trei detalii: cum vrei să primești sticlele (curier sau ridicare), pe ce nume emitem factura (persoană fizică sau juridică) și cum plătești.",
  },
  {
    n: "04",
    title: "Plătește.",
    body: "Card online (procesat securizat prin Stripe, 3-D Secure activ) sau card bancar la livrare. Indiferent de metodă, banii sunt în siguranță — noi nu vedem niciodată numărul cardului tău.",
  },
  {
    n: "05",
    title: "Primești vinul.",
    body: "1–3 zile lucrătoare prin Sameday, sau gratuit la sediul Buciumeni dacă alegi ridicarea personală. Email cu tracking + factură electronică pe drum.",
  },
];

const FAQ = [
  {
    q: "Pot anula o comandă după ce am plătit?",
    a: "Da, dacă AWB-ul nu a plecat încă (cam 4 ore după plată). Scrie-ne urgent la contact@locus.ro cu numărul comenzii. Banii revin pe card în 3–7 zile lucrătoare.",
  },
  {
    q: "Cum schimb cantitatea după ce am plătit?",
    a: "Anulăm comanda inițială, refundăm și plasezi una nouă. E mai sigur decât să modificăm AWB-ul — Sameday nu garantează schimbările pe ruta deja începută.",
  },
  {
    q: "Trebuie cont ca să comand?",
    a: "Nu. Poți comanda ca guest cu email-ul tău. Dacă vrei să-ți salvezi adresele și să vezi istoric comenzi, faci cont rapid cu magic link (fără parolă — primești un email și apeși un buton).",
  },
  {
    q: "Cum primesc factura?",
    a: "Automat, pe email, în câteva minute după plată. Factura e electronică (eFactura ANAF), conform legii. O găsești și în contul tău dacă te-ai logat.",
  },
  {
    q: "Plătesc cu cardul la livrare?",
    a: "Da. Curierul Sameday are POS mobil, accepți cardul (Visa, Mastercard) sau cash. Numerar maxim 5.000 lei conform legii.",
  },
  {
    q: "Pot cumpăra cu factură pentru firmă?",
    a: "Da. La pasul Date Facturare alegi 'Persoană juridică' și completezi denumire, CUI, registrul comerțului. Factura ajunge automat și în SPV (Spațiul Privat Virtual ANAF) prin eFactura.",
  },
  {
    q: "Sticla a sosit spartă. Ce fac?",
    a: "Ne pare rău — se întâmplă rar, dar se întâmplă. Sună-ne în 24h și trimite o poză cu coletul deschis + sticla. Trimitem alta sau returnăm banii, fără cost suplimentar.",
  },
  {
    q: "Vând și en-gros la restaurante / hoteluri?",
    a: (
      <>
        Da, avem program separat pentru HoReCa și parteneri. Vezi pagina{" "}
        <Link href="/parteneri">Parteneri</Link> sau scrie-ne direct la{" "}
        <a href="mailto:b2b@locus.ro">b2b@locus.ro</a>.
      </>
    ),
  },
];

export default function CumCumperiPage() {
  return (
    <>
      <main className="cum-cumperi-page">
        <header className="cum-cumperi-hero">
          <div className="container-locus">
            <div className="eyebrow">Cum cumperi · Domeniul Locus</div>
            <h1 className="cum-cumperi-title">Cinci pași și gata.</h1>
            <p className="cum-cumperi-lead">
              De la alegerea vinului până în pahar, fără surprize. Mai jos, exact
              cum funcționează — și răspunsuri la cele mai dese întrebări.
            </p>
          </div>
        </header>

        <div className="container-locus cum-cumperi-content">
          <section className="steps-section" aria-label="Pași comandă">
            <div className="livrare-section-head">
              <div className="eyebrow">01 — pas cu pas</div>
              <h2 className="h2">Cum funcționează.</h2>
            </div>

            <ol className="steps-list">
              {STEPS.map((s) => (
                <li key={s.n} className="step-item">
                  <span className="step-num">{s.n}</span>
                  <div className="step-body">
                    <h3 className="step-title">{s.title}</h3>
                    <p className="step-text">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="cum-cumperi-faq" aria-label="Întrebări frecvente">
            <div className="livrare-section-head">
              <div className="eyebrow">02 — întrebări frecvente</div>
              <h2 className="h2">Ce ne mai întreabă lumea.</h2>
              <p className="lead">
                Despre livrare specific, vezi{" "}
                <Link href="/livrare" className="inline-link">
                  pagina dedicată Livrare
                </Link>
                .
              </p>
            </div>

            <div className="livrare-faq-list">
              {FAQ.map((item, i) => (
                <details key={i} className="livrare-faq-item">
                  <summary>
                    <span className="livrare-faq-q">{item.q}</span>
                    <span className="livrare-faq-toggle" aria-hidden="true">+</span>
                  </summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="livrare-cta">
            <h2 className="h2">N-ai găsit răspunsul?</h2>
            <p>Răspundem în maxim 48h pe email.</p>
            <Link href="/contact" className="btn">
              scrie-ne
              <svg className="arrow" viewBox="0 0 24 12" aria-hidden="true">
                <use href="#arrow-right" />
              </svg>
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

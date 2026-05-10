const FAQ = [
  {
    q: "Când pleacă comanda?",
    a: "Comenzile plasate până în ora 14:00 sunt preluate de curier în aceeași zi lucrătoare. Restul, a doua zi.",
  },
  {
    q: "Pot urmări coletul?",
    a: "Da. Imediat ce Sameday generează AWB-ul, primești email și SMS cu link de tracking direct de la Sameday.",
  },
  {
    q: "Ce se întâmplă dacă nu sunt acasă când vine curierul?",
    a: "Curierul te sună înainte. Dacă nu răspunzi, lasă o încercare nouă a doua zi. După 3 încercări, coletul revine la depozit și te contactăm noi.",
  },
  {
    q: "Pot schimba adresa după ce am plasat comanda?",
    a: "Da, dacă AWB-ul nu a fost încă generat (cam 4 ore după plată). Scrie-ne urgent pe contact@locus.ro cu numărul comenzii.",
  },
  {
    q: "Sticla a ajuns spartă. Ce fac?",
    a: "Sună-ne în 24 h și trimite o poză cu coletul + sticla. Returnăm sau trimitem alta nouă, fără cost suplimentar pentru tine.",
  },
  {
    q: "Livrați în străinătate?",
    a: "Doar la cerere și doar în UE, cu calcul individual de cost. Scrie-ne pentru ofertă personalizată.",
  },
];

export function LivrareFAQ() {
  return (
    <section className="livrare-faq" aria-label="Întrebări frecvente despre livrare">
      <div className="livrare-section-head">
        <div className="eyebrow">04 — întrebări frecvente</div>
        <h2 className="h2">Înainte să comanzi.</h2>
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
  );
}

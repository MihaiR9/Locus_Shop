import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Termeni și condiții",
  description: "Termenii și condițiile de utilizare a magazinului online Domeniul Locus.",
};

{/* TODO: review jurist înainte de launch */}

export default function TermsPage() {
  return (
    <>
      <div className="eyebrow">Documentație</div>
      <h1>Termeni și condiții</h1>
      <p className="meta">Ultima actualizare: 9 mai 2026</p>

      <p>
        Acești termeni guvernează utilizarea site-ului <strong>domeniul-locus.ro</strong>{" "}
        (denumit în continuare „site-ul”) și achiziționarea produselor din magazinul
        online operat de <strong>SC ROMVINTEC SRL</strong> (denumită în continuare
        „Vânzător”). Prin utilizarea site-ului, accepți integral acești termeni.
      </p>

      <div className="callout">
        <strong>18+.</strong> Site-ul vinde băuturi alcoolice. Achiziționarea este
        permisă exclusiv persoanelor majore. La intrare, ți se va cere să confirmi
        vârsta.
      </div>

      <h2>1. Identificarea Vânzătorului</h2>
      <ul>
        <li><strong>Denumire:</strong> SC ROMVINTEC SRL</li>
        <li><strong>Sediu social:</strong> str. Portului nr. 20, tronson 1, camera 211, mun. Galați, jud. Galați</li>
        <li><strong>Punct de lucru:</strong> Centrul de Vinificație Buciumeni, com. Buciumeni, jud. Galați</li>
        <li><strong>CUI:</strong> [TODO]</li>
        <li><strong>Reg. Com.:</strong> [TODO]</li>
        <li><strong>Telefon:</strong> 0752 232 912</li>
        <li><strong>Email:</strong> contact@domeniul-locus.ro</li>
      </ul>

      <h2>2. Plasarea comenzii</h2>
      <p>
        Comenzile se plasează prin selectarea produselor în coș și completarea
        formularului de checkout cu datele de livrare și facturare. Comanda devine
        un contract de vânzare-cumpărare în momentul în care primești email-ul de
        confirmare.
      </p>
      <p>
        Vânzătorul își rezervă dreptul de a refuza orice comandă (de exemplu, stoc
        insuficient, suspiciune de fraudă, sau dacă cumpărătorul nu poate dovedi
        vârsta majoratului).
      </p>

      <h2>3. Prețuri și plată</h2>
      <p>
        Prețurile afișate includ TVA. Costurile de transport sunt calculate la
        checkout, în funcție de zonă și greutate. Plata se poate face:
      </p>
      <ul>
        <li>Online cu cardul (procesare prin Stripe — nu stocăm date de card)</li>
        <li>La livrare (ramburs), cu numerar sau card la curier</li>
      </ul>

      <h2>4. Livrare</h2>
      <p>
        Livrăm prin curier în 2–4 zile lucrătoare în România continentală.
        Coletele sunt asigurate. La primire, verifică integritatea ambalajului
        și refuză coletul dacă observi deteriorări vizibile.
      </p>
      <p>
        Livrarea către persoane minore este interzisă. Curierul poate solicita
        actul de identitate la livrare.
      </p>
      <p>
        Costuri, durate și acoperire detaliate în{" "}
        <Link href="/livrare">Politica de livrare</Link>. Pașii de comandă și
        întrebări frecvente — în{" "}
        <Link href="/cum-cumperi">Cum cumperi</Link>.
      </p>

      <h2>5. Dreptul de retragere (retur)</h2>
      <p>
        Conform <strong>OUG 34/2014</strong>, ai dreptul să te retragi din contract
        în termen de 14 zile calendaristice de la primirea produselor, fără a
        invoca un motiv. Detalii complete în{" "}
        <Link href="/retur">Politica de retur</Link>.
      </p>
      <p>
        <strong>Excepție:</strong> dreptul de retragere nu se aplică sticlelor
        deschise sau deteriorate după livrare (art. 16 OUG 34/2014).
      </p>

      <h2>6. Garanție și conformitate</h2>
      <p>
        Garantăm că produsele livrate corespund descrierii și sunt apte pentru
        consum până la termenul de valabilitate marcat pe etichetă. În caz de
        neconformitate, contactează-ne în 30 de zile.
      </p>

      <h2>7. Răspundere</h2>
      <p>
        Vânzătorul nu răspunde pentru efectele consumului inadecvat de alcool.
        <strong> Consumul excesiv de alcool dăunează sănătății.</strong>
      </p>

      <h2>8. Date personale</h2>
      <p>
        Prelucrăm datele tale conform{" "}
        <Link href="/confidentialitate">Politicii de confidențialitate</Link>.
      </p>

      <h2>9. Soluționarea disputelor</h2>
      <p>
        Reclamațiile se trimit la <a href="mailto:contact@domeniul-locus.ro">contact@domeniul-locus.ro</a>.
        Dacă nu ajungem la un acord, te poți adresa:
      </p>
      <ul>
        <li>
          <strong>ANPC</strong> —{" "}
          <a href="https://anpc.ro" target="_blank" rel="noopener noreferrer">anpc.ro</a>
        </li>
        <li>
          <strong>SOL (Soluționare Online a Litigiilor)</strong> —{" "}
          <a
            href="https://ec.europa.eu/consumers/odr"
            target="_blank"
            rel="noopener noreferrer"
          >
            ec.europa.eu/consumers/odr
          </a>
        </li>
      </ul>

      <h2>10. Modificări</h2>
      <p>
        Putem actualiza acești termeni periodic. Versiunea în vigoare este
        întotdeauna cea publicată pe această pagină.
      </p>
    </>
  );
}

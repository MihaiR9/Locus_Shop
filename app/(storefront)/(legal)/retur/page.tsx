import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politica de retur",
  description: "Dreptul de retragere de 14 zile (OUG 34/2014). Excepții pentru sticle deschise.",
};

{/* TODO: review jurist înainte de launch */}

export default function ReturnsPage() {
  return (
    <>
      <div className="eyebrow">Documentație</div>
      <h1>Politica de retur</h1>
      <p className="meta">Ultima actualizare: 9 mai 2026</p>

      <p>
        Conform <strong>Ordonanței de Urgență a Guvernului nr. 34/2014</strong>{" "}
        privind drepturile consumatorilor în cadrul contractelor încheiate cu
        profesioniștii, ai dreptul să te retragi din contract <strong>în termen
        de 14 zile calendaristice</strong> de la primirea produselor, fără a
        invoca un motiv și fără a suporta alte costuri în afara celor de
        returnare.
      </p>

      <div className="callout">
        <strong>Termen retur:</strong> 14 zile calendaristice de la primirea
        coletului. <br />
        <strong>Rambursare:</strong> în maxim 14 zile de la primirea produselor
        înapoi.
      </div>

      <h2>1. Cum returnezi un produs</h2>
      <ol>
        <li>
          Trimite o notificare la{" "}
          <a href="mailto:contact@domeniul-locus.ro">contact@domeniul-locus.ro</a>{" "}
          cu numărul comenzii și produsele pe care vrei să le returnezi.
        </li>
        <li>
          Primești un email cu instrucțiunile de returnare (adresă + AWB
          generat).
        </li>
        <li>
          Împachetează produsele <strong>în ambalajul original, sigilate și
          nedeteriorate</strong>.
        </li>
        <li>
          Predai coletul curierului.
        </li>
        <li>
          În maxim 14 zile de la primirea produselor înapoi, îți rambursăm
          contravaloarea pe aceeași metodă de plată.
        </li>
      </ol>

      <h2>2. Excepții — dreptul de retragere NU se aplică</h2>
      <p>
        Conform <strong>art. 16 OUG 34/2014</strong>, dreptul de retragere nu
        se aplică pentru:
      </p>
      <ul>
        <li>
          <strong>Sticle deschise</strong> sau cu sigiliul deteriorat — produsele
          alimentare desigilate nu pot fi returnate din motive de igienă și
          conformitate (lit. e).
        </li>
        <li>
          <strong>Produse personalizate</strong> sau cu inscripționări la cerere
          (lit. c).
        </li>
        <li>
          <strong>Produse care se deteriorează rapid</strong> — nu este cazul
          vinurilor noastre, dar reglementare standard (lit. d).
        </li>
      </ul>

      <h2>3. Costuri de returnare</h2>
      <p>
        <strong>Costul transportului de retur îți revine</strong>, conform art.
        14 alin. (2) OUG 34/2014, cu excepția cazului în care produsul a fost
        livrat greșit sau este defect — situație în care suportăm noi costul.
      </p>

      <h2>4. Produse deteriorate la livrare</h2>
      <p>
        Dacă primești un colet vizibil deteriorat, refuză-l direct la curier
        sau, dacă ai semnat deja, fotografiază starea coletului și a produselor
        înainte de a deschide complet și trimite-ne fotografiile la{" "}
        <a href="mailto:contact@domeniul-locus.ro">contact@domeniul-locus.ro</a>{" "}
        în maxim 24 de ore. Procesăm înlocuirea sau rambursarea fără cost
        suplimentar pentru tine.
      </p>

      <h2>5. Formular de retragere</h2>
      <p>
        Poți folosi modelul de formular de retragere de mai jos sau orice altă
        formă scrisă neechivocă:
      </p>
      <div className="callout">
        Către <strong>SC ROMVINTEC SRL</strong>,{" "}
        <a href="mailto:contact@domeniul-locus.ro">contact@domeniul-locus.ro</a>:
        <br />
        <br />
        Vă notific prin prezenta că mă retrag din contractul de vânzare
        privind comanda nr. <em>[număr comandă]</em> din data de{" "}
        <em>[data comenzii]</em>.
        <br />
        Numele consumatorului: <em>[nume prenume]</em>
        <br />
        Data: <em>[data]</em>
      </div>

      <h2>6. Întrebări</h2>
      <p>
        Pentru orice întrebare despre retururi sau probleme cu o comandă, scrie
        la <a href="mailto:contact@domeniul-locus.ro">contact@domeniul-locus.ro</a>{" "}
        sau sună la <a href="tel:+40752232912">0752 232 912</a>.
      </p>
      <p>
        În cazul în care nu ajungem la o înțelegere, te poți adresa{" "}
        <strong>ANPC</strong> (
        <a href="https://anpc.ro" target="_blank" rel="noopener noreferrer">
          anpc.ro
        </a>
        ) sau platformei{" "}
        <strong>SOL</strong> (
        <a
          href="https://ec.europa.eu/consumers/odr"
          target="_blank"
          rel="noopener noreferrer"
        >
          ec.europa.eu/consumers/odr
        </a>
        ).
      </p>
    </>
  );
}

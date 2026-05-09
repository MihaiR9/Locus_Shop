import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politica de confidențialitate",
  description: "Cum prelucrează Domeniul Locus datele tale personale, conform GDPR.",
};

{/* TODO: review jurist înainte de launch */}

export default function PrivacyPage() {
  return (
    <>
      <div className="eyebrow">Documentație</div>
      <h1>Politica de confidențialitate</h1>
      <p className="meta">Ultima actualizare: 9 mai 2026</p>

      <p>
        <strong>SC ROMVINTEC SRL</strong> (denumită în continuare „Operator”)
        prelucrează datele tale personale conform Regulamentului (UE) 2016/679
        (<strong>GDPR</strong>) și legislației române aplicabile.
      </p>

      <h2>1. Operator de date</h2>
      <ul>
        <li><strong>Denumire:</strong> SC ROMVINTEC SRL</li>
        <li><strong>Sediu:</strong> str. Portului nr. 20, mun. Galați, jud. Galați</li>
        <li><strong>Email:</strong> <a href="mailto:contact@domeniul-locus.ro">contact@domeniul-locus.ro</a></li>
        <li><strong>DPO:</strong> [TODO — desemnează responsabil cu protecția datelor]</li>
      </ul>

      <h2>2. Ce date colectăm</h2>
      <h3>Date de contact și livrare</h3>
      <ul>
        <li>Nume, prenume</li>
        <li>Adresă de email și număr de telefon</li>
        <li>Adresă de livrare și facturare</li>
        <li>Pentru persoane juridice: denumire firmă, CUI, nr. registru comerț</li>
      </ul>

      <h3>Date de plată</h3>
      <p>
        <strong>Nu stocăm date de card.</strong> Plățile online sunt procesate
        de Stripe. Primim doar un identificator de tranzacție pentru reconciliere.
      </p>

      <h3>Date tehnice</h3>
      <ul>
        <li>Adresă IP, user agent, paginile vizitate</li>
        <li>Cookie-uri (vezi <Link href="/cookies">Politica de cookie-uri</Link>)</li>
      </ul>

      <h2>3. Scopuri și temei legal</h2>
      <ul>
        <li>
          <strong>Procesarea comenzilor</strong> — temei: executarea contractului
          (art. 6(1)(b) GDPR)
        </li>
        <li>
          <strong>Facturare și obligații fiscale</strong> — temei: obligație
          legală (art. 6(1)(c) GDPR)
        </li>
        <li>
          <strong>Comunicări de marketing</strong> (newsletter) — temei:
          consimțământul tău (art. 6(1)(a) GDPR), pe care îl poți retrage oricând
        </li>
        <li>
          <strong>Analiză trafic și reclame</strong> — temei: consimțământ prin
          banner cookie-uri
        </li>
        <li>
          <strong>Securitate, anti-fraudă</strong> — temei: interes legitim
          (art. 6(1)(f) GDPR)
        </li>
      </ul>

      <h2>4. Cui transmitem datele</h2>
      <ul>
        <li><strong>Curier</strong> (Sameday) — pentru livrare</li>
        <li><strong>Procesator plăți</strong> (Stripe) — pentru încasare</li>
        <li><strong>Furnizor facturare</strong> (Smartbill) — pentru factură + e-Factura ANAF</li>
        <li><strong>Furnizor email</strong> (Resend) — pentru notificări tranzacționale</li>
        <li><strong>Hosting</strong> (Vercel / Supabase) — infrastructură site</li>
      </ul>
      <p>
        Toți acești furnizori sunt în UE/SEE sau au clauze contractuale standard
        pentru transfer internațional de date.
      </p>

      <h2>5. Cât timp păstrăm datele</h2>
      <ul>
        <li><strong>Comenzi și facturi</strong> — 10 ani (obligație fiscală)</li>
        <li><strong>Cont client</strong> — atât timp cât contul este activ + 3 ani</li>
        <li><strong>Newsletter</strong> — până la dezabonare</li>
        <li><strong>Cookie-uri analitice</strong> — maxim 26 luni</li>
      </ul>

      <h2>6. Drepturile tale (GDPR)</h2>
      <p>Conform GDPR, ai următoarele drepturi:</p>
      <ul>
        <li><strong>Dreptul de acces</strong> (art. 15) — să afli ce date deținem despre tine</li>
        <li><strong>Dreptul de rectificare</strong> (art. 16) — să corectăm date inexacte</li>
        <li><strong>Dreptul la ștergere</strong> (art. 17) — „dreptul de a fi uitat”</li>
        <li><strong>Dreptul la restricționarea prelucrării</strong> (art. 18)</li>
        <li><strong>Dreptul la portabilitate</strong> (art. 20) — să primești datele tale într-un format structurat</li>
        <li><strong>Dreptul de opoziție</strong> (art. 21) — față de prelucrarea pe baza interesului legitim</li>
        <li><strong>Dreptul de a-ți retrage consimțământul</strong> (art. 7) — oricând</li>
      </ul>
      <p>
        Pentru a-ți exercita orice drept, scrie la{" "}
        <a href="mailto:contact@domeniul-locus.ro">contact@domeniul-locus.ro</a>.
        Răspundem în maxim 30 de zile.
      </p>

      <h2>7. Plângeri la ANSPDCP</h2>
      <p>
        Dacă consideri că drepturile tale au fost încălcate, poți depune o plângere
        la <strong>Autoritatea Națională de Supraveghere a Prelucrării Datelor
        cu Caracter Personal (ANSPDCP)</strong>:
      </p>
      <ul>
        <li>B-dul G-ral Gheorghe Magheru 28-30, sector 1, București</li>
        <li>
          Web:{" "}
          <a href="https://www.dataprotection.ro" target="_blank" rel="noopener noreferrer">
            dataprotection.ro
          </a>
        </li>
        <li>Email: anspdcp@dataprotection.ro</li>
      </ul>

      <h2>8. Securitate</h2>
      <p>
        Aplicăm măsuri tehnice și organizatorice rezonabile pentru a proteja
        datele tale (TLS, criptare, control acces, backup-uri). Nimeni nu poate
        garanta însă securitate 100% pe internet.
      </p>

      <h2>9. Modificări</h2>
      <p>
        Putem actualiza această politică. Versiunea curentă este întotdeauna cea
        de pe această pagină. Modificările substanțiale ți le anunțăm prin email
        dacă ai cont.
      </p>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ResetConsentButton } from "@/components/legal/reset-consent-button";

export const metadata: Metadata = {
  title: "Politica de cookie-uri",
  description: "Ce cookie-uri folosește Domeniul Locus și pentru ce.",
};

{/* TODO: review jurist înainte de launch */}

export default function CookiesPage() {
  return (
    <>
      <div className="eyebrow">Documentație</div>
      <h1>Politica de cookie-uri</h1>
      <p className="meta">Ultima actualizare: 9 mai 2026</p>

      <p>
        Cookie-urile sunt fișiere mici stocate de browser pe dispozitivul tău
        atunci când vizitezi un site. Le folosim pentru a face site-ul să
        funcționeze (coș, autentificare, preferințe), pentru a înțelege cum e
        folosit (analiză anonimă) și — dacă ești de acord — pentru reclame
        personalizate.
      </p>

      <div className="callout">
        Îți poți schimba preferințele oricând — apasă butonul de mai jos și
        banner-ul va apărea din nou.
      </div>

      <ResetConsentButton />

      <h2>Categorii</h2>

      <h3>1. Necesare (întotdeauna active)</h3>
      <p>
        Fără ele site-ul nu funcționează. Nu necesită consimțământ (ePrivacy
        Directive 2002/58/CE, art. 5(3) — exceptarea pentru cookie-uri strict
        necesare).
      </p>
      <ul>
        <li>
          <strong>locus-cart</strong> — produsele din coșul tău (localStorage)
        </li>
        <li>
          <strong>locus-theme</strong> — preferința de temă (light/dark)
        </li>
        <li>
          <strong>locus-age-verified</strong> — confirmarea vârstei (30 zile)
        </li>
        <li>
          <strong>locus-cookie-consent</strong> — preferințele tale despre
          cookie-uri (6 luni)
        </li>
      </ul>

      <h3>2. Analitice (opționale)</h3>
      <p>
        Ne ajută să înțelegem cum folosesc oamenii site-ul, anonim. Activate
        doar dacă alegi „Accept tot” sau bifezi „Analitice” în banner.
      </p>
      <ul>
        <li>
          <strong>Google Analytics 4 (_ga, _ga_*)</strong> — statistici trafic,
          anonimizare IP activată. Durata: 13 luni.
        </li>
      </ul>

      <h3>3. Marketing (opționale)</h3>
      <p>
        Folosite pentru reclame personalizate și măsurare conversii. Activate
        doar dacă alegi „Accept tot” sau bifezi „Marketing”.
      </p>
      <ul>
        <li>
          <strong>Meta Pixel (_fbp, fr)</strong> — remarketing și măsurare
          conversii Facebook/Instagram. Durata: până la 90 zile.
        </li>
      </ul>

      <h2>Cum dezactivezi cookie-urile</h2>
      <p>
        Poți gestiona cookie-urile direct din browser:
      </p>
      <ul>
        <li>
          <strong>Chrome</strong>: Setări → Confidențialitate și securitate →
          Cookie-uri
        </li>
        <li><strong>Firefox</strong>: Preferințe → Confidențialitate și securitate</li>
        <li><strong>Safari</strong>: Preferințe → Confidențialitate</li>
      </ul>
      <p>
        Dezactivarea cookie-urilor necesare poate face anumite funcționalități
        ale site-ului (coșul, login-ul) să nu mai funcționeze.
      </p>

      <h2>Întrebări</h2>
      <p>
        Pentru orice întrebare despre cookie-uri sau date personale, scrie la{" "}
        <a href="mailto:contact@domeniul-locus.ro">contact@domeniul-locus.ro</a>.
        Vezi și{" "}
        <Link href="/confidentialitate">Politica de confidențialitate</Link>.
      </p>
    </>
  );
}

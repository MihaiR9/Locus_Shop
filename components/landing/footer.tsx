import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="footer-grid">
        <div className="footer-col">
          <Link href="/#acasa" className="brand" style={{ marginBottom: 32, display: "inline-flex" }}>
            <Image
              src="/brand/logo-locus.png"
              alt="Domeniul Locus"
              width={180}
              height={56}
              className="brand-img"
            />
          </Link>
          <p>
            Sediu social
            <br />
            Jud. Galați, mun. Galați,
            <br />
            str. Portului, nr. 20, tronson 1, camera 211
            <br />
            <br />
            Punct de lucru
            <br />
            Centrul de Vinificație Buciumeni,
            <br />
            jud. Galați, com. Buciumeni
          </p>
          <p>
            <a href="tel:+40752232912">(0752) 232 912</a>
            <br />
            <a href="mailto:contact@domeniul-locus.ro">contact@domeniul-locus.ro</a>
          </p>
        </div>

        <div className="footer-col">
          <h4>Navighează</h4>
          <ul>
            <li><Link href="/#acasa">Acasă</Link></li>
            <li><Link href="/#despre">Despre noi</Link></li>
            <li><Link href="/#vinuri">Vinuri</Link></li>
            <li><Link href="/#locul">Locul</Link></li>
          </ul>
          <h4 style={{ marginTop: 32 }}>Legal</h4>
          <ul>
            <li><Link href="/termeni">Termeni</Link></li>
            <li><Link href="/confidentialitate">Confidențialitate</Link></li>
            <li><Link href="/cookies">Cookies</Link></li>
            <li><Link href="/retur">Retur</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Urmărește-ne</h4>
          <ul>
            <li><a href="#" target="_blank" rel="noopener noreferrer">Instagram ↗</a></li>
            <li><a href="#" target="_blank" rel="noopener noreferrer">Facebook ↗</a></li>
          </ul>
          <h4 style={{ marginTop: 32 }}>Reclamații</h4>
          <ul>
            <li>
              <a href="https://anpc.ro" target="_blank" rel="noopener noreferrer">
                ANPC ↗
              </a>
            </li>
            <li>
              <a
                href="https://ec.europa.eu/consumers/odr"
                target="_blank"
                rel="noopener noreferrer"
              >
                SOL — soluționare online ↗
              </a>
            </li>
          </ul>
          <p style={{ marginTop: 32, fontSize: 11, lineHeight: 1.7 }}>
            SC ROMVINTEC SRL · 18+ · Conține sulfiți.
            <br />
            Consumul excesiv de alcool dăunează sănătății.
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <span className="coords-line">45.98°N 27.30°E · Buciumeni · România</span>
        <span className="legal">© 2026 Domeniul Locus · Identitate vizuală: STUDIOMASURA</span>
      </div>
    </footer>
  );
}

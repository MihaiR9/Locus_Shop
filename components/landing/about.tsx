import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/reveal";

export function About() {
  return (
    <section className="despre" id="despre" aria-label="Despre Domeniul Locus">
      <div className="despre-grid">
        <Reveal as="div" className="despre-img">
          <Image
            src="/photos/dining-setup.png"
            alt="Banc cu pâine, brânză și un pahar de vin Locus"
            width={1200}
            height={1500}
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </Reveal>
        <Reveal as="div" className="despre-text">
          <div className="eyebrow">Despre noi</div>
          <h2 className="h2">Rădăcini adânci, privire înainte.</h2>
          <p>
            Domeniul Locus s-a născut din legătura cu pământul — și din dorința
            de a face vinuri care spun o poveste despre origine, timp și sens.
            Lucrăm pe arealele Panciu și Nicorești, două teritorii istorice cu
            identități proprii, și ducem mai departe o tradiție care se măsoară
            în generații.
          </p>
          <p>
            Fiecare sticlă pe care o trimitem mai departe e rezultatul unei
            decizii: să ne lăsăm conduși de loc, nu să-l constrângem.
          </p>
          <Link href="/despre" className="btn-ghost">
            <span>Citește povestea</span>
            <svg className="arrow-svg" viewBox="0 0 24 12" aria-hidden="true">
              <use href="#arrow-right" />
            </svg>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

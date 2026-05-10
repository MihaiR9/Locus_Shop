"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function SuccessContent() {
  const params = useSearchParams();
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const fromUrl = params.get("id");
    const fromStorage = sessionStorage.getItem("locus-last-order");
    setOrderId(fromUrl || fromStorage || null);
  }, [params]);

  return (
    <div className="success-card">
      <div className="eyebrow" style={{ justifyContent: "center", marginBottom: 18 }}>
        comandă confirmată
      </div>
      <h1>mulțumim.</h1>
      {orderId && <div className="order-no">#{orderId}</div>}
      <p>
        Am primit comanda ta. Îți trimitem un email cu confirmarea și detaliile
        de livrare.
        <br />
        Vinul, ca și locul, are nevoie de timp.
      </p>
      <Link href="/" className="btn">
        înapoi la domeniu
        <svg className="arrow" viewBox="0 0 24 12" aria-hidden="true">
          <use href="#arrow-right" />
        </svg>
      </Link>
      <div className="symbol-row" aria-hidden="true">
        <svg><use href="#square" /></svg>
        <svg><use href="#diamond" /></svg>
        <svg><use href="#star8" /></svg>
        <svg><use href="#circle" /></svg>
      </div>
    </div>
  );
}

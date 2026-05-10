import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cerere retur trimisă · Cont",
};

type Params = { orderNumber: string };
type Search = { ticket?: string };

export default async function ReturnSubmittedPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  const { orderNumber } = await params;
  const { ticket } = await searchParams;

  return (
    <>
      <div className="eyebrow" style={{ color: "var(--vie)" }}>
        cerere primită
      </div>
      <h1>Mulțumim.</h1>
      <p className="lead-mono">
        Ți-am primit cererea de retur pentru comanda{" "}
        <strong style={{ color: "var(--ink)" }}>{orderNumber}</strong>
        {ticket && (
          <>
            . Ticket de urmărire:{" "}
            <strong style={{ color: "var(--ink)" }}>{ticket}</strong>
          </>
        )}
        . Răspundem prin email în maxim 48 de ore cu pașii următori (de obicei
        un AWB de retur generat prin Sameday — îl primești prin email și îl
        înmânezi curierului).
      </p>

      <p
        style={{
          marginTop: 32,
          fontFamily: "var(--font-mono), monospace",
          fontSize: 13,
          lineHeight: 1.85,
          color: "var(--ink-soft)",
        }}
      >
        Între timp, te rugăm să păstrezi sticla nedeschisă și ambalajul
        original — sunt necesare pentru rambursare conform OUG 34/2014.
      </p>

      <div className="order-actions" style={{ marginTop: 40 }}>
        <Link href={`/cont/comenzi/${encodeURIComponent(orderNumber)}`}>
          ← înapoi la comandă
        </Link>
        <Link href="/cont">acasă cont</Link>
      </div>
    </>
  );
}

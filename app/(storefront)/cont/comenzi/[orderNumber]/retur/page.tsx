import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getMockOrder, returnEligibilityFor } from "@/lib/mock-account";
import { ReturnForm } from "./return-form";

type Params = { orderNumber: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { orderNumber } = await params;
  return { title: `Retur ${orderNumber} · Cont` };
}

export default async function ReturnRequestPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { orderNumber } = await params;
  const order = getMockOrder(orderNumber);
  if (!order) notFound();

  const ret = returnEligibilityFor(order);
  if (!ret.eligible) {
    // Server-side guard — if someone hits this URL directly past the
    // window or for a cancelled order, bounce them back to the order.
    redirect(`/cont/comenzi/${encodeURIComponent(orderNumber)}`);
  }

  return (
    <>
      <Link
        href={`/cont/comenzi/${encodeURIComponent(orderNumber)}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          fontFamily: "var(--font-mono), monospace",
          fontSize: 11,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "var(--ink-soft)",
          textDecoration: "none",
          marginBottom: 16,
        }}
      >
        ← înapoi la comandă
      </Link>

      <div className="eyebrow">retur · OUG 34/2014</div>
      <h1>Inițiază retur.</h1>
      <p className="lead-mono">
        Pentru comanda{" "}
        <strong style={{ color: "var(--ink)" }}>{order.orderNumber}</strong>.
        Mai ai <strong style={{ color: "var(--vie)" }}>{ret.daysLeft}</strong>{" "}
        {ret.daysLeft === 1 ? "zi" : "zile"} din termenul legal de 14.
        Cererea se trimite la noi pe email; răspundem în maxim 48h cu pașii
        următori (AWB de retur, etc.).
      </p>

      <div className="cont-section">
        <ReturnForm orderNumber={order.orderNumber} />
      </div>

      <p
        style={{
          marginTop: 32,
          fontFamily: "var(--font-mono), monospace",
          fontSize: 11,
          lineHeight: 1.7,
          color: "var(--ink-mute)",
        }}
      >
        Detalii complete în{" "}
        <Link href="/retur" style={{ color: "var(--ink-soft)" }}>
          Politica de retur
        </Link>
        . Sticlele deschise sau deteriorate după livrare nu intră în dreptul
        de retragere de 14 zile (art. 16 OUG 34/2014).
      </p>
    </>
  );
}

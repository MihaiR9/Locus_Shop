import type { Metadata } from "next";
import Link from "next/link";
import { getReturnPickerData } from "@/lib/mock-account";
import { ReturnWizard } from "./wizard";

export const metadata: Metadata = {
  title: "Cerere retur · Cont",
};

type SearchParams = Promise<{
  orderNumber?: string;
}>;

export default async function NewReturnPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const { eligible, ineligible } = getReturnPickerData();

  // Optional preselection from a deep link (e.g. email)
  let preselectedOrder: string | undefined;
  if (sp.orderNumber && eligible.some((g) => g.order.orderNumber === sp.orderNumber)) {
    preselectedOrder = sp.orderNumber;
  }

  return (
    <>
      <div className="eyebrow">retur · cerere nouă</div>
      <h1>Cerere de retur.</h1>
      <p className="lead-mono">
        Trei pași — alegi comanda și produsele, ne spui ce s-a întâmplat,
        alegi cum rezolvăm. Te confirmăm pe email în 24h și primești AWB de
        retur dacă cererea e aprobată.{" "}
        <Link href="/retur" style={{ color: "var(--ink-soft)" }}>
          Vezi politica completă
        </Link>
        .
      </p>

      <section className="cont-section">
        <ReturnWizard
          eligibleOrders={eligible}
          ineligibleOrders={ineligible}
          preselectedOrder={preselectedOrder}
        />
      </section>

      <p
        style={{
          marginTop: 32,
          fontFamily: "var(--font-mono), monospace",
          fontSize: 11,
          lineHeight: 1.7,
          color: "var(--ink-mute)",
        }}
      >
        Termenul legal de retragere e 14 zile calendaristice de la primirea
        coletului (OUG 34/2014, art. 9). Pentru sticle nedeschise costul de
        retur îl suporți tu, în rest îl preluăm noi prin AWB Sameday.
      </p>
    </>
  );
}

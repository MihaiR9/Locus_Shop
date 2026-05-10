import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { AddressesSection, type AddressRow } from "./addresses-section";

export const metadata: Metadata = {
  title: "Adrese · Cont",
};

export default async function AddressesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/cont/login");

  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("addresses")
    .select("id, line1, line2, city, county, zip, is_default")
    .eq("customer_id", user.customerId)
    .eq("kind", "shipping")
    .order("is_default", { ascending: false })
    .order("id", { ascending: true });

  const addresses: AddressRow[] = data ?? [];

  return (
    <>
      <div className="eyebrow">livrare</div>
      <h1>Adresele tale.</h1>
      <p className="lead-mono">
        Adrese salvate pentru livrare. Cea marcată ca implicită apare
        precompletată la checkout — o poți schimba oricând.
      </p>

      <AddressesSection initial={addresses} />

      <p
        style={{
          marginTop: 32,
          fontFamily: "var(--font-mono), monospace",
          fontSize: 11,
          lineHeight: 1.7,
          color: "var(--ink-mute)",
        }}
      >
        Pentru factură pe firmă, adaugă datele de facturare în{" "}
        <a href="/cont/facturare" style={{ color: "var(--ink-soft)" }}>
          Date facturare
        </a>
        . Pentru persoană fizică, factura merge automat pe numele de pe
        livrare.
      </p>
    </>
  );
}

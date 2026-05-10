import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { BillingSection, type BillingRow } from "./billing-section";

export const metadata: Metadata = {
  title: "Date facturare · Cont",
};

export default async function BillingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/cont/login");

  const supabase = await getSupabaseServerClient();
  const { data } = await supabase
    .from("billing_profiles")
    .select("id, company, cui, reg_no, iban, hq_address, type")
    .eq("customer_id", user.customerId)
    .eq("type", "juridica")
    .order("id", { ascending: true });

  const profiles: BillingRow[] = data ?? [];

  return (
    <>
      <div className="eyebrow">factură · persoană juridică</div>
      <h1>Date facturare.</h1>
      <p className="lead-mono">
        Pentru factură pe firmă (CUI, sediu, IBAN). Le precompletăm la
        checkout când bifezi „factură pe firmă". Pentru persoană fizică nu e
        nevoie de nimic aici — facturăm direct pe numele de pe livrare.
      </p>

      <BillingSection initial={profiles} />

      <p
        style={{
          marginTop: 32,
          fontFamily: "var(--font-mono), monospace",
          fontSize: 11,
          lineHeight: 1.7,
          color: "var(--ink-mute)",
        }}
      >
        Datele firmei sunt validate la ANAF la prima salvare (denumire, CUI,
        sediu social). Modificările se reflectă în facturile emise începând
        cu următoarea comandă — facturile deja emise rămân ca atare,
        conform legislației fiscale.
      </p>
    </>
  );
}

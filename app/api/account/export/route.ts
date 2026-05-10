import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * GDPR data export — returns a JSON file with everything we hold for
 * the current user: profile, addresses, billing profiles, orders + items,
 * returns. Streamed as a download.
 */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const supabase = await getSupabaseServerClient();

  const [addresses, billing, orders, returns] = await Promise.all([
    supabase.from("addresses").select("*").eq("customer_id", user.customerId),
    supabase
      .from("billing_profiles")
      .select("*")
      .eq("customer_id", user.customerId),
    supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("customer_id", user.customerId)
      .order("created_at", { ascending: false }),
    supabase
      .from("returns")
      .select("*, return_items(*)")
      .eq("customer_id", user.customerId)
      .order("created_at", { ascending: false }),
  ]);

  const payload = {
    exported_at: new Date().toISOString(),
    profile: {
      email: user.email,
      first_name: user.firstName,
      last_name: user.lastName,
      phone: user.phone,
      marketing_opt_in: user.marketingOptIn,
      created_at: user.createdAt,
    },
    addresses: addresses.data ?? [],
    billing_profiles: billing.data ?? [],
    orders: orders.data ?? [],
    returns: returns.data ?? [],
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "content-type": "application/json",
      "content-disposition": `attachment; filename="locus-export-${user.customerId}.json"`,
    },
  });
}

import { getSupabaseServerClient } from "@/lib/supabase/server";

export type CurrentUser = {
  authId: string;
  customerId: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  marketingOptIn: boolean;
  createdAt: string;
};

/**
 * Resolves the logged-in user (auth.users + customers row).
 * Returns null if no session.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await getSupabaseServerClient();
  /* getUser() throws AuthApiError when the refresh token is missing or
     invalid (expired session, cleared server-side, cookie mismatch after
     a Supabase project change). For our purposes any such failure means
     "not logged in" — swallow and treat as guest. */
  let user;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    return null;
  }
  if (!user) return null;

  const { data: customer } = await supabase
    .from("customers")
    .select("id, email, name, phone, marketing_opt_in, created_at")
    .eq("supabase_user_id", user.id)
    .single();

  if (!customer) {
    // The trigger should have created one; fall back to user data only.
    return {
      authId: user.id,
      customerId: "",
      email: user.email ?? "",
      firstName: "",
      lastName: "",
      fullName: "",
      phone: user.phone ?? "",
      marketingOptIn: false,
      createdAt: user.created_at,
    };
  }

  const fullName = (customer.name ?? "").trim();
  const [first, ...rest] = fullName.split(/\s+/);
  return {
    authId: user.id,
    customerId: customer.id,
    email: customer.email,
    firstName: first ?? "",
    lastName: rest.join(" "),
    fullName,
    phone: customer.phone ?? "",
    marketingOptIn: customer.marketing_opt_in ?? false,
    createdAt: customer.created_at,
  };
}

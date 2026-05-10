import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client for SERVER (Server Components, Server Actions, Route
 * Handlers). Uses the public anon key + RLS, but reads/writes the
 * Supabase auth session through Next.js cookies so server-rendered
 * queries see the same logged-in user as the browser.
 *
 * The setAll() try/catch around cookies is a Next 15+ pattern: cookie
 * mutations are only allowed in Server Actions / Route Handlers, not in
 * server components rendering — but the auth library tries to refresh
 * tokens on every read. We swallow the throw silently when called from
 * a render path; refresh will succeed on the next mutation context.
 */
export async function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Supabase env missing. Copy .env.local.example to .env.local and fill it in.",
    );
  }

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // called from a server component render path — safe to ignore.
        }
      },
    },
  });
}

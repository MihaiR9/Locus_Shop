import { Footer } from "@/components/landing/footer";
import { ContSidebar } from "@/components/account/cont-sidebar";
import { MOCK_USER } from "@/lib/mock-account";

/**
 * Auth-gated layout for /cont/*. When Supabase Auth is wired up
 * (Pas 7 backend), this layout becomes async: it fetches the session
 * via getSupabaseServerClient(), redirects to /cont/login if missing,
 * and passes the real user to <ContSidebar>. Until then, MOCK_USER.
 *
 * /cont/login bypasses this layout because it lives at /cont/login/page.tsx
 * but Next.js still applies the parent layout. We accept that: showing
 * the sidebar to a not-yet-logged-in user on the login page is a minor
 * UI quirk that will resolve once auth is real (login layout will check
 * if user IS logged in and redirect to /cont in that case).
 */
export default function ContLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = MOCK_USER;

  return (
    <>
      <main className="cont-page">
        <div className="cont-shell">
          <ContSidebar user={user} />
          <div className="cont-main">{children}</div>
        </div>
      </main>
      <Footer />
    </>
  );
}

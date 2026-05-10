import { redirect } from "next/navigation";
import { Footer } from "@/components/landing/footer";
import { ContSidebar } from "@/components/account/cont-sidebar";
import { getCurrentUser } from "@/lib/auth/current-user";

/**
 * Auth-gated layout for /cont/(account)/*. Resolves the current user
 * server-side, redirects to /cont/login if missing.
 */
export default async function ContAccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/cont/login?next=/cont");

  return (
    <>
      <main className="cont-page">
        <div className="cont-shell">
          <ContSidebar user={{ firstName: user.firstName, email: user.email }} />
          <div className="cont-main">{children}</div>
        </div>
      </main>
      <Footer />
    </>
  );
}

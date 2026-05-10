import { Footer } from "@/components/landing/footer";

/**
 * /cont/login overrides the parent /cont layout (which has the sidebar)
 * so the login page renders standalone — no sidebar leaking in for a
 * not-yet-logged-in visitor.
 */
export default function ContLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="cont-page">{children}</main>
      <Footer />
    </>
  );
}

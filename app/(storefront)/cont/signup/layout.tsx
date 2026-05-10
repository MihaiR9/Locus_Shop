import { Footer } from "@/components/landing/footer";

/**
 * Standalone signup page — overrides the parent /cont layout (sidebar)
 * so visitors without an account see only the form.
 */
export default function ContSignupLayout({
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

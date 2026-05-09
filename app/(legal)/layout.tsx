import { Footer } from "@/components/landing/footer";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="legal-page">
        <article className="legal-prose">{children}</article>
      </main>
      <Footer />
    </>
  );
}

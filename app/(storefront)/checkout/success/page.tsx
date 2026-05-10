import { Suspense } from "react";
import { SuccessContent } from "./success-content";

export const metadata = {
  title: "Comandă confirmată · Domeniul Locus",
};

export default function CheckoutSuccessPage() {
  return (
    <main className="checkout-success">
      <Suspense fallback={null}>
        <SuccessContent />
      </Suspense>
    </main>
  );
}

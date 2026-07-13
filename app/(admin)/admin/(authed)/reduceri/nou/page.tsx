import type { Metadata } from "next";
import { CouponForm } from "../_form/coupon-form";

export const metadata: Metadata = { title: "Cupon nou · Admin" };

export default function NewCouponPage() {
  return (
    <CouponForm
      mode="create"
      initial={{
        code: "",
        discountType: "percent",
        percentOff: 10,
        fixedOffRon: null,
        minAmountRon: 0,
        expiresAt: null,
        maxUses: null,
        usedCount: 0,
        active: true,
      }}
    />
  );
}

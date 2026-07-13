import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCouponByCode } from "@/lib/admin/coupons-queries";
import { CouponForm } from "../_form/coupon-form";

type Params = { code: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { code } = await params;
  return { title: `${code} · Cupon · Admin` };
}

export default async function EditCouponPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { code } = await params;
  const coupon = await getCouponByCode(code);
  if (!coupon) notFound();

  return (
    <CouponForm
      mode="edit"
      initial={{
        code: coupon.code,
        discountType: coupon.percentOff !== null ? "percent" : "fixed",
        percentOff: coupon.percentOff,
        fixedOffRon:
          coupon.fixedOffCents !== null
            ? Math.round(coupon.fixedOffCents / 100)
            : null,
        minAmountRon: Math.round(coupon.minAmountCents / 100),
        expiresAt: coupon.expiresAt,
        maxUses: coupon.maxUses,
        usedCount: coupon.usedCount,
        active: coupon.active,
      }}
    />
  );
}

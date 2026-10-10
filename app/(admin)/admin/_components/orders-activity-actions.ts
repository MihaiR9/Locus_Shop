"use server";

import { cookies } from "next/headers";
import { getCurrentAdmin } from "@/lib/auth/current-admin";
import {
  ORDERS_SEEN_COOKIE,
  getOrderIdsWithNewActivity,
  getOrdersSeenAt,
} from "@/lib/admin/orders-activity";

/** Numărul din meniu, lângă „Comenzi". */
export async function getNewOrdersCount(): Promise<number> {
  if (!(await getCurrentAdmin())) return 0;
  return (await getOrderIdsWithNewActivity(await getOrdersSeenAt())).size;
}

/** Apelat la deschiderea /admin/comenzi: tot ce e acum pe listă e „văzut". */
export async function markOrdersSeen(): Promise<void> {
  if (!(await getCurrentAdmin())) return;
  (await cookies()).set(ORDERS_SEEN_COOKIE, new Date().toISOString(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type DashboardKpis = {
  revenueTodayCents: number;
  ordersTodayCount: number;
  avgBasket7dCents: number;
  lowStockCount: number;
};

export type RevenuePoint = {
  date: string; // ISO yyyy-mm-dd
  revenueCents: number;
  ordersCount: number;
};

export type RecentOrder = {
  orderNumber: string;
  customerEmail: string;
  totalCents: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
};

export type LowStockItem = {
  code: string;
  name: string;
  gama: string;
  stock: number;
};

export type DashboardData = {
  kpis: DashboardKpis;
  revenue30d: RevenuePoint[];
  recentOrders: RecentOrder[];
  lowStock: LowStockItem[];
};

/**
 * Toate KPI-urile + istoric revenue + comenzi recente + alerte stoc.
 * Un singur await pentru toate — 4 query-uri paralele via Promise.all.
 */
export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await getSupabaseServerClient();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = today.toISOString();

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);
  const sevenDaysAgoIso = sevenDaysAgo.toISOString();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);
  const thirtyDaysAgoIso = thirtyDaysAgo.toISOString();

  const [
    todayOrdersRes,
    weekOrdersRes,
    monthOrdersRes,
    lowStockRes,
    recentOrdersRes,
  ] = await Promise.all([
    // Comenzi de azi (după created_at)
    supabase
      .from("orders")
      .select("total_cents, payment_status, paid_at, created_at")
      .gte("created_at", todayIso),

    // Comenzi plătite ultimele 7 zile (pentru coș mediu)
    supabase
      .from("orders")
      .select("total_cents")
      .eq("payment_status", "succeeded")
      .gte("paid_at", sevenDaysAgoIso),

    // Comenzi plătite ultimele 30 zile (pentru grafic)
    supabase
      .from("orders")
      .select("total_cents, paid_at")
      .eq("payment_status", "succeeded")
      .gte("paid_at", thirtyDaysAgoIso)
      .order("paid_at", { ascending: true }),

    // Stoc redus
    supabase
      .from("products")
      .select("code, name, gama, stock")
      .lt("stock", 20)
      .eq("active", true)
      .order("stock", { ascending: true }),

    // Ultimele 5 comenzi
    supabase
      .from("orders")
      .select(
        "order_number, guest_email, total_cents, status, payment_status, created_at, customers(email)",
      )
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  // KPI 1: Încasări azi (doar succeeded, paid_at azi)
  const revenueTodayCents = (todayOrdersRes.data ?? [])
    .filter(
      (o) =>
        o.payment_status === "succeeded" &&
        o.paid_at &&
        new Date(o.paid_at) >= today,
    )
    .reduce((sum, o) => sum + (o.total_cents ?? 0), 0);

  // KPI 2: Comenzi azi (toate, indiferent de status)
  const ordersTodayCount = todayOrdersRes.data?.length ?? 0;

  // KPI 3: Coș mediu 7z
  const weekOrders = weekOrdersRes.data ?? [];
  const avgBasket7dCents =
    weekOrders.length === 0
      ? 0
      : Math.round(
          weekOrders.reduce((sum, o) => sum + (o.total_cents ?? 0), 0) /
            weekOrders.length,
        );

  // KPI 4: Stoc redus
  const lowStockCount = lowStockRes.data?.length ?? 0;

  // Grafic 30z — agregez per zi
  const dailyMap = new Map<string, { revenueCents: number; ordersCount: number }>();
  for (let i = 0; i < 30; i++) {
    const d = new Date(thirtyDaysAgo);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    dailyMap.set(key, { revenueCents: 0, ordersCount: 0 });
  }
  for (const o of monthOrdersRes.data ?? []) {
    if (!o.paid_at) continue;
    const key = o.paid_at.slice(0, 10);
    const bucket = dailyMap.get(key);
    if (bucket) {
      bucket.revenueCents += o.total_cents ?? 0;
      bucket.ordersCount += 1;
    }
  }
  const revenue30d: RevenuePoint[] = Array.from(dailyMap.entries()).map(
    ([date, { revenueCents, ordersCount }]) => ({ date, revenueCents, ordersCount }),
  );

  // Comenzi recente — Supabase returnează `customers` ca array/obj după relation
  const recentOrders: RecentOrder[] = (recentOrdersRes.data ?? []).map((o) => {
    const cust = o.customers as
      | { email?: string }
      | { email?: string }[]
      | null;
    const custEmail = Array.isArray(cust) ? cust[0]?.email : cust?.email;
    return {
      orderNumber: o.order_number,
      customerEmail: custEmail ?? o.guest_email ?? "—",
      totalCents: o.total_cents,
      status: o.status,
      paymentStatus: o.payment_status,
      createdAt: o.created_at,
    };
  });

  const lowStock: LowStockItem[] = (lowStockRes.data ?? []).map((p) => ({
    code: p.code,
    name: p.name,
    gama: p.gama,
    stock: p.stock,
  }));

  return {
    kpis: {
      revenueTodayCents,
      ordersTodayCount,
      avgBasket7dCents,
      lowStockCount,
    },
    revenue30d,
    recentOrders,
    lowStock,
  };
}

export function ronFromCents(cents: number): number {
  return Math.round(cents / 100);
}

export function formatRon(cents: number): string {
  return `${ronFromCents(cents).toLocaleString("ro-RO")} lei`;
}

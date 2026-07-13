import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type CustomerRow = {
  email: string;
  name: string | null;
  phone: string | null;
  isRegistered: boolean;
  customerId: string | null;
  orderCount: number;
  totalSpentCents: number;
  lastOrderAt: string | null;
  firstOrderAt: string | null;
  marketingOptIn: boolean;
};

export type CustomerAddress = {
  id: string;
  kind: "shipping" | "billing";
  line1: string;
  line2: string | null;
  city: string;
  county: string;
  zip: string | null;
  country: string;
  isDefault: boolean;
};

export type CustomerOrderRow = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalCents: number;
  createdAt: string;
  paidAt: string | null;
  shippingMethod: string;
  awbNumber: string | null;
};

export type CustomerDetail = CustomerRow & {
  addresses: CustomerAddress[];
  orders: CustomerOrderRow[];
  createdAt: string | null;
  supabaseUserId: string | null;
};

export type CustomersListResult = {
  items: CustomerRow[];
  kpis: {
    total: number;
    registered: number;
    guests: number;
    totalRevenueCents: number;
    avgOrderCents: number;
    repeatCustomers: number;
  };
};

type CustomerFilter = {
  search?: string;
  view?: "all" | "registered" | "guests" | "repeat";
};

export async function listCustomers(
  filter: CustomerFilter = {},
): Promise<CustomersListResult> {
  const supabase = await getSupabaseServerClient();

  const [customersRes, ordersRes] = await Promise.all([
    supabase
      .from("customers")
      .select("id, email, name, phone, marketing_opt_in, created_at"),
    supabase
      .from("orders")
      .select(
        "customer_id, guest_email, total_cents, payment_status, created_at",
      )
      .order("created_at", { ascending: false }),
  ]);

  if (customersRes.error) {
    console.error(
      "[listCustomers/customers]",
      customersRes.error.message,
      customersRes.error.code,
    );
  }
  if (ordersRes.error) {
    console.error(
      "[listCustomers/orders]",
      ordersRes.error.message,
      ordersRes.error.code,
    );
  }

  const customers = customersRes.data ?? [];
  const orders = ordersRes.data ?? [];

  const byEmail = new Map<string, CustomerRow>();
  const customersById = new Map<string, (typeof customers)[number]>();

  customers.forEach((c) => {
    customersById.set(c.id, c);
    const email = c.email.toLowerCase();
    byEmail.set(email, {
      email: c.email,
      name: c.name,
      phone: c.phone,
      isRegistered: true,
      customerId: c.id,
      orderCount: 0,
      totalSpentCents: 0,
      lastOrderAt: null,
      firstOrderAt: null,
      marketingOptIn: c.marketing_opt_in ?? false,
    });
  });

  orders.forEach((o) => {
    let email: string | null = null;
    if (o.customer_id) {
      const c = customersById.get(o.customer_id);
      email = c?.email.toLowerCase() ?? null;
    } else if (o.guest_email) {
      email = o.guest_email.toLowerCase();
    }
    if (!email) return;

    let row = byEmail.get(email);
    if (!row) {
      row = {
        email,
        name: null,
        phone: null,
        isRegistered: false,
        customerId: null,
        orderCount: 0,
        totalSpentCents: 0,
        lastOrderAt: null,
        firstOrderAt: null,
        marketingOptIn: false,
      };
      byEmail.set(email, row);
    }

    row.orderCount += 1;
    if (o.payment_status === "paid" || o.payment_status === "partial_refund") {
      row.totalSpentCents += o.total_cents;
    }
    if (!row.lastOrderAt || o.created_at > row.lastOrderAt) {
      row.lastOrderAt = o.created_at;
    }
    if (!row.firstOrderAt || o.created_at < row.firstOrderAt) {
      row.firstOrderAt = o.created_at;
    }
  });

  let items = Array.from(byEmail.values());

  if (filter.view === "registered") items = items.filter((c) => c.isRegistered);
  if (filter.view === "guests") items = items.filter((c) => !c.isRegistered);
  if (filter.view === "repeat") items = items.filter((c) => c.orderCount >= 2);

  if (filter.search && filter.search.trim()) {
    const q = filter.search.trim().toLowerCase();
    items = items.filter(
      (c) =>
        c.email.toLowerCase().includes(q) ||
        (c.name && c.name.toLowerCase().includes(q)),
    );
  }

  items.sort((a, b) => {
    if (b.totalSpentCents !== a.totalSpentCents) {
      return b.totalSpentCents - a.totalSpentCents;
    }
    return (b.lastOrderAt ?? "").localeCompare(a.lastOrderAt ?? "");
  });

  const all = Array.from(byEmail.values());
  const totalRevenue = all.reduce((s, c) => s + c.totalSpentCents, 0);
  const totalOrders = all.reduce((s, c) => s + c.orderCount, 0);

  return {
    items,
    kpis: {
      total: all.length,
      registered: all.filter((c) => c.isRegistered).length,
      guests: all.filter((c) => !c.isRegistered).length,
      totalRevenueCents: totalRevenue,
      avgOrderCents: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
      repeatCustomers: all.filter((c) => c.orderCount >= 2).length,
    },
  };
}

export async function getCustomerByEmail(
  emailRaw: string,
): Promise<CustomerDetail | null> {
  const email = decodeURIComponent(emailRaw).toLowerCase().trim();
  if (!email) return null;

  const supabase = await getSupabaseServerClient();

  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .ilike("email", email)
    .maybeSingle();

  let addresses: CustomerAddress[] = [];
  if (customer) {
    const { data: addrs } = await supabase
      .from("addresses")
      .select("*")
      .eq("customer_id", customer.id);
    addresses = (addrs ?? []).map((a) => ({
      id: a.id,
      kind: a.kind,
      line1: a.line1,
      line2: a.line2,
      city: a.city,
      county: a.county,
      zip: a.zip,
      country: a.country,
      isDefault: a.is_default,
    }));
  }

  let ordersQuery = supabase
    .from("orders")
    .select(
      "id, order_number, status, payment_status, total_cents, created_at, paid_at, shipping_method, awb_number, customer_id, guest_email",
    )
    .order("created_at", { ascending: false });

  if (customer) {
    ordersQuery = ordersQuery.or(
      `customer_id.eq.${customer.id},guest_email.ilike.${email}`,
    );
  } else {
    ordersQuery = ordersQuery.ilike("guest_email", email);
  }

  const { data: ordersData } = await ordersQuery;
  const orders: CustomerOrderRow[] = (ordersData ?? []).map((o) => ({
    id: o.id,
    orderNumber: o.order_number,
    status: o.status,
    paymentStatus: o.payment_status,
    totalCents: o.total_cents,
    createdAt: o.created_at,
    paidAt: o.paid_at,
    shippingMethod: o.shipping_method,
    awbNumber: o.awb_number,
  }));

  if (!customer && orders.length === 0) return null;

  const totalSpentCents = orders
    .filter(
      (o) =>
        o.paymentStatus === "paid" || o.paymentStatus === "partial_refund",
    )
    .reduce((s, o) => s + o.totalCents, 0);

  const lastOrderAt = orders[0]?.createdAt ?? null;
  const firstOrderAt =
    orders.length > 0 ? orders[orders.length - 1].createdAt : null;

  return {
    email: customer?.email ?? email,
    name: customer?.name ?? null,
    phone: customer?.phone ?? null,
    isRegistered: !!customer,
    customerId: customer?.id ?? null,
    supabaseUserId: customer?.supabase_user_id ?? null,
    createdAt: customer?.created_at ?? null,
    marketingOptIn: customer?.marketing_opt_in ?? false,
    orderCount: orders.length,
    totalSpentCents,
    lastOrderAt,
    firstOrderAt,
    addresses,
    orders,
  };
}

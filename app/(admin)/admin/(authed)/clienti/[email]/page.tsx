import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  Calendar,
  Truck,
  Home,
} from "lucide-react";
import { getCustomerByEmail } from "@/lib/admin/customers-queries";
import { formatRon } from "@/lib/admin/products-queries";
import { formatRelDate } from "../../../_components/rel-date";
import {
  PaymentBadge,
  FulfillmentBadge,
} from "../../../_components/payment-fulfillment-badges";

type Params = { email: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { email } = await params;
  return { title: `${decodeURIComponent(email)} · Clienți · Admin` };
}

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { email } = await params;
  const customer = await getCustomerByEmail(email);
  if (!customer) notFound();

  const shipping = customer.addresses.find((a) => a.kind === "shipping");
  const billing = customer.addresses.find((a) => a.kind === "billing");

  return (
    <>
      <Link
        href="/admin/clienti"
        className="mb-3 inline-flex items-center gap-1.5 text-xs text-zinc-500 transition-colors hover:text-zinc-900"
      >
        <ArrowLeft className="h-3 w-3" />
        Înapoi la clienți
      </Link>

      {/* Compact header */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-sm font-semibold uppercase text-zinc-600">
            {(customer.name ?? customer.email).slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="admin-page-title">
                {customer.name ?? customer.email}
              </h1>
              {customer.isRegistered ? (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Cont creat
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                  Guest
                </span>
              )}
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
              <span className="inline-flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {customer.email}
              </span>
              {customer.phone && (
                <span className="inline-flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {customer.phone}
                </span>
              )}
              {customer.createdAt && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Cont creat{" "}
                  {new Date(customer.createdAt).toLocaleDateString("ro-RO")}
                </span>
              )}
              {customer.marketingOptIn && (
                <span className="text-emerald-700">✓ opt-in newsletter</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4">
        <MiniKpi
          icon={<ShoppingBag className="h-3.5 w-3.5" />}
          label="Comenzi"
          value={customer.orderCount.toString()}
        />
        <MiniKpi
          icon={<span className="text-[10px]">lei</span>}
          label="Total cheltuit"
          value={formatRon(customer.totalSpentCents)}
        />
        <MiniKpi
          icon={<Calendar className="h-3.5 w-3.5" />}
          label="Prima comandă"
          value={
            customer.firstOrderAt
              ? new Date(customer.firstOrderAt).toLocaleDateString("ro-RO")
              : "—"
          }
        />
        <MiniKpi
          icon={<Calendar className="h-3.5 w-3.5" />}
          label="Ultima comandă"
          value={
            customer.lastOrderAt ? formatRelDate(customer.lastOrderAt) : "—"
          }
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Orders (main) */}
        <div className="lg:col-span-2">
          <Card>
            <SectionHead
              title="Istoric comenzi"
              hint={`${customer.orders.length} ${customer.orders.length === 1 ? "comandă" : "comenzi"}`}
            />
            {customer.orders.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-zinc-500">
                Nici o comandă înregistrată.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-100 text-left text-[11px] uppercase tracking-[0.06em] text-zinc-500">
                      <th className="py-2.5 pl-4 font-medium">Comandă</th>
                      <th className="py-2.5 font-medium">Plată</th>
                      <th className="py-2.5 font-medium">Fulfillment</th>
                      <th className="py-2.5 text-right font-medium">Total</th>
                      <th className="py-2.5 font-medium">Data</th>
                      <th className="px-4 py-2.5" />
                    </tr>
                  </thead>
                  <tbody>
                    {customer.orders.map((o) => (
                      <tr
                        key={o.id}
                        className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/60"
                      >
                        <td className="py-2.5 pl-4">
                          <Link
                            href={`/admin/comenzi/${o.orderNumber}`}
                            className="font-mono text-xs font-medium text-zinc-900 hover:underline"
                          >
                            {o.orderNumber}
                          </Link>
                        </td>
                        <td className="py-2.5">
                          <PaymentBadge status={o.paymentStatus} />
                        </td>
                        <td className="py-2.5">
                          <FulfillmentBadge status={o.status} />
                        </td>
                        <td className="py-2.5 text-right font-medium text-zinc-900">
                          {formatRon(o.totalCents)}
                        </td>
                        <td className="py-2.5 text-zinc-600">
                          {formatRelDate(o.createdAt)}
                        </td>
                        <td className="px-4 py-2.5">
                          <Link
                            href={`/admin/comenzi/${o.orderNumber}`}
                            className="text-xs font-medium text-zinc-700 hover:text-zinc-900 hover:underline"
                          >
                            Deschide
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar — addresses */}
        <div className="flex flex-col gap-4">
          {shipping ? (
            <AddressCard
              title="Adresă livrare"
              icon={<Truck className="h-3.5 w-3.5" />}
              addr={shipping}
            />
          ) : (
            <EmptyCard
              title="Adresă livrare"
              icon={<Truck className="h-3.5 w-3.5" />}
              text="Nu e salvată."
            />
          )}

          {billing ? (
            <AddressCard
              title="Adresă facturare"
              icon={<Home className="h-3.5 w-3.5" />}
              addr={billing}
            />
          ) : (
            <EmptyCard
              title="Adresă facturare"
              icon={<Home className="h-3.5 w-3.5" />}
              text={
                customer.orders.length > 0
                  ? "Din comenzi — snapshot la momentul plății."
                  : "Nu e salvată."
              }
            />
          )}
        </div>
      </div>
    </>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
      {children}
    </div>
  );
}

function SectionHead({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
      <h2 className="text-[13px] font-semibold text-zinc-900">{title}</h2>
      {hint && <span className="text-[11px] text-zinc-500">{hint}</span>}
    </div>
  );
}

function MiniKpi({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-0.5 text-sm font-semibold text-zinc-900">{value}</div>
    </div>
  );
}

function AddressCard({
  title,
  icon,
  addr,
}: {
  title: string;
  icon: React.ReactNode;
  addr: {
    line1: string;
    line2: string | null;
    city: string;
    county: string;
    zip: string | null;
    country: string;
  };
}) {
  return (
    <Card>
      <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-3">
        <span className="text-zinc-500">{icon}</span>
        <h2 className="text-[13px] font-semibold text-zinc-900">{title}</h2>
      </div>
      <div className="p-4 text-xs text-zinc-700">
        <div>{addr.line1}</div>
        {addr.line2 && <div>{addr.line2}</div>}
        <div>
          {addr.city}, {addr.county}
          {addr.zip ? ` · ${addr.zip}` : ""}
        </div>
        <div className="text-zinc-500">{addr.country}</div>
      </div>
    </Card>
  );
}

function EmptyCard({
  title,
  icon,
  text,
}: {
  title: string;
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <Card>
      <div className="flex items-center gap-2 border-b border-zinc-100 px-4 py-3">
        <span className="text-zinc-500">{icon}</span>
        <h2 className="text-[13px] font-semibold text-zinc-900">{title}</h2>
      </div>
      <div className="flex items-center gap-2 p-4 text-xs text-zinc-500">
        <MapPin className="h-3 w-3" />
        <span>{text}</span>
      </div>
    </Card>
  );
}

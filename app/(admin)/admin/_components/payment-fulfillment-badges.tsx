import { cn } from "@/lib/utils";

const PAYMENT_STYLES: Record<
  string,
  { dot: string; text: string; bg: string; label: string }
> = {
  pending: { dot: "bg-zinc-400", text: "text-zinc-700", bg: "bg-zinc-100", label: "În așteptare" },
  succeeded: { dot: "bg-emerald-500", text: "text-emerald-800", bg: "bg-emerald-50", label: "Plătită" },
  failed: { dot: "bg-red-500", text: "text-red-800", bg: "bg-red-50", label: "Eșuată" },
  refunded: { dot: "bg-amber-500", text: "text-amber-800", bg: "bg-amber-50", label: "Rambursată" },
  partial_refund: { dot: "bg-amber-500", text: "text-amber-800", bg: "bg-amber-50", label: "Rambursare parțială" },
};

const FULFILLMENT_STYLES: Record<
  string,
  { ring: string; text: string; bg: string; label: string }
> = {
  pending_payment: { ring: "ring-zinc-300", text: "text-zinc-700", bg: "bg-zinc-50", label: "Neprocesată" },
  paid: { ring: "ring-amber-300", text: "text-amber-800", bg: "bg-amber-50", label: "De expediat" },
  shipped: { ring: "ring-sky-300", text: "text-sky-800", bg: "bg-sky-50", label: "Expediată" },
  delivered: { ring: "ring-emerald-300", text: "text-emerald-800", bg: "bg-emerald-50", label: "Livrată" },
  cancelled: { ring: "ring-zinc-300", text: "text-zinc-500", bg: "bg-zinc-50", label: "Anulată" },
  refunded: { ring: "ring-amber-300", text: "text-amber-800", bg: "bg-amber-50", label: "Rambursată" },
};

export function PaymentBadge({ status }: { status: string }) {
  const s = PAYMENT_STYLES[status] ?? {
    dot: "bg-zinc-400",
    text: "text-zinc-700",
    bg: "bg-zinc-100",
    label: status,
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium",
        s.bg,
        s.text,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {s.label}
    </span>
  );
}

export function FulfillmentBadge({ status }: { status: string }) {
  const s = FULFILLMENT_STYLES[status] ?? {
    ring: "ring-zinc-300",
    text: "text-zinc-700",
    bg: "bg-zinc-50",
    label: status,
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset",
        s.bg,
        s.text,
        s.ring,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full ring-1", s.ring.replace("ring-", "bg-").replace("-300", "-500"))} />
      {s.label}
    </span>
  );
}

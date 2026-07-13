import { cn } from "@/lib/utils";

const STYLES: Record<string, { bg: string; text: string; ring: string; label: string }> = {
  pending_payment: { bg: "bg-zinc-100", text: "text-zinc-700", ring: "ring-zinc-200", label: "așteaptă plata" },
  paid: { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200", label: "plătită" },
  shipped: { bg: "bg-sky-50", text: "text-sky-700", ring: "ring-sky-200", label: "expediată" },
  delivered: { bg: "bg-emerald-100", text: "text-emerald-900", ring: "ring-emerald-300", label: "livrată" },
  cancelled: { bg: "bg-zinc-100", text: "text-zinc-500", ring: "ring-zinc-200", label: "anulată" },
  refunded: { bg: "bg-amber-50", text: "text-amber-700", ring: "ring-amber-200", label: "rambursată" },
};

export function StatusBadge({ status }: { status: string }) {
  const style = STYLES[status] ?? {
    bg: "bg-zinc-100",
    text: "text-zinc-700",
    ring: "ring-zinc-200",
    label: status,
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset",
        style.bg,
        style.text,
        style.ring,
      )}
    >
      {style.label}
    </span>
  );
}

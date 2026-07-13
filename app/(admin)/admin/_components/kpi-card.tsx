import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  tone?: "default" | "warning";
};

export function KpiCard({ label, value, hint, icon: Icon, tone = "default" }: Props) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-xl border bg-white p-5 transition-shadow hover:shadow-sm",
        tone === "warning"
          ? "border-amber-200 bg-amber-50/50"
          : "border-zinc-200",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500">
          {label}
        </span>
        {Icon && <Icon className="h-4 w-4 text-zinc-400" strokeWidth={1.75} />}
      </div>
      <div className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">
        {value}
      </div>
      {hint && <div className="text-xs text-zinc-500">{hint}</div>}
    </div>
  );
}

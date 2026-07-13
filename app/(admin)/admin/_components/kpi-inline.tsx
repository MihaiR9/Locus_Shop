"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: string | number;
  trendPct: number | null;
  spark: number[];
};

export function KpiInline({ label, value, trendPct, spark }: Props) {
  const trendUp = trendPct !== null && trendPct >= 0;
  const chartData = spark.map((v, i) => ({ i, v }));

  return (
    <div className="relative flex min-w-[140px] flex-col rounded-lg border border-zinc-200 bg-white px-4 py-3">
      <span className="text-[11px] font-medium text-zinc-500">{label}</span>

      <div className="mt-0.5 flex items-baseline gap-2">
        <span className="text-lg font-semibold tracking-tight text-zinc-900">
          {typeof value === "number" ? value.toLocaleString("ro-RO") : value}
        </span>
        {trendPct !== null && (
          <span
            className={cn(
              "flex items-center gap-0.5 text-[11px] font-medium",
              trendUp ? "text-emerald-600" : "text-red-600",
            )}
          >
            {trendUp ? (
              <TrendingUp className="h-2.5 w-2.5" strokeWidth={2.5} />
            ) : (
              <TrendingDown className="h-2.5 w-2.5" strokeWidth={2.5} />
            )}
            {Math.abs(trendPct)}%
          </span>
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 opacity-70">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`spark-${label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3e4336" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#3e4336" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke="#3e4336"
              strokeWidth={1.2}
              fill={`url(#spark-${label})`}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { RevenuePoint } from "@/lib/admin/dashboard-queries";

type Props = {
  data: RevenuePoint[];
};

const RO_DAY = new Intl.DateTimeFormat("ro-RO", {
  day: "numeric",
  month: "short",
});

function formatRon(cents: number): string {
  const ron = Math.round(cents / 100);
  return `${ron.toLocaleString("ro-RO")} lei`;
}

export function RevenueChart({ data }: Props) {
  const chartData = data.map((p) => ({
    date: p.date,
    label: RO_DAY.format(new Date(p.date)),
    ron: Math.round(p.revenueCents / 100),
    orders: p.ordersCount,
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3e4336" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#3e4336" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#f4f4f5" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#71717a" }}
            axisLine={{ stroke: "#e4e4e7" }}
            tickLine={false}
            minTickGap={30}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#71717a" }}
            axisLine={false}
            tickLine={false}
            width={56}
            tickFormatter={(v) => `${v.toLocaleString("ro-RO")}`}
          />
          <Tooltip
            contentStyle={{
              background: "#ffffff",
              border: "1px solid #e4e4e7",
              borderRadius: 8,
              fontSize: 12,
              padding: "8px 12px",
            }}
            labelStyle={{ fontSize: 11, color: "#71717a", marginBottom: 4 }}
            formatter={(val, name) => {
              const n = typeof val === "number" ? val : Number(val);
              if (name === "ron") return [formatRon(n * 100), "Încasări"];
              return [n, "Comenzi"];
            }}
          />
          <Area
            type="monotone"
            dataKey="ron"
            stroke="#3e4336"
            strokeWidth={2}
            fill="url(#revFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

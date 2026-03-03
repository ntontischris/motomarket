"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { CHART_COLORS } from "@/lib/bi-analytics";

interface TopProductsBarProps {
  data: { code: string; name: string; brand: string; metric: number }[];
  metric?: "revenue" | "units" | "margin";
  height?: number;
}

function shortName(name: string): string {
  // Shorten product names for display
  return name.length > 28 ? name.slice(0, 26) + "…" : name;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="rounded-lg border border-[#333] bg-[#1a1a1a] px-3 py-2 shadow-lg text-sm max-w-xs">
      <p className="font-semibold text-[#e5e5e5] mb-1">{d.payload.name}</p>
      <p style={{ color: d.fill }}>
        {typeof d.value === "number"
          ? d.value > 100
            ? `€${d.value.toLocaleString("el-GR", { minimumFractionDigits: 2 })}`
            : `${d.value}`
          : d.value}
      </p>
    </div>
  );
}

export default function TopProductsBar({ data, metric = "revenue", height = 280 }: TopProductsBarProps) {
  const chartData = data.slice(0, 10).map(d => ({
    ...d,
    shortName: shortName(d.name),
  }));

  const metricLabel = metric === "revenue" ? "Έσοδα" : metric === "units" ? "Τεμάχια" : "Margin%";

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#222" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fill: "#888", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => metric === "revenue" ? `€${(v / 1000).toFixed(0)}k` : String(v)}
        />
        <YAxis
          type="category"
          dataKey="shortName"
          width={140}
          tick={{ fill: "#aaa", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="metric" name={metricLabel} radius={[0, 4, 4, 0]}>
          {chartData.map((_, i) => (
            <Cell
              key={i}
              fill={CHART_COLORS.brands[i % CHART_COLORS.brands.length]}
              fillOpacity={1 - i * 0.05}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { CHART_COLORS } from "@/lib/bi-analytics";

interface BrandPieChartProps {
  data: { brand: string; revenue: number }[];
  height?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="rounded-lg border border-[#333] bg-[#1a1a1a] px-3 py-2 shadow-lg text-sm">
      <p className="font-semibold text-[#e5e5e5]">{d.name}</p>
      <p style={{ color: d.payload.fill }}>
        €{d.value?.toLocaleString("el-GR", { minimumFractionDigits: 2 })}
      </p>
      <p className="text-[#888888]">{(d.payload.percent * 100).toFixed(1)}%</p>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomLegend({ payload }: any) {
  if (!payload) return null;
  return (
    <div className="flex flex-wrap gap-2 justify-center mt-2">
      {payload.map((entry: { color: string; value: string }, i: number) => (
        <div key={i} className="flex items-center gap-1 text-xs text-[#888888]">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
          {entry.value}
        </div>
      ))}
    </div>
  );
}

export default function BrandPieChart({ data, height = 260 }: BrandPieChartProps) {
  // Show top 7 brands, group rest as "Άλλα"
  const sorted = [...data].sort((a, b) => b.revenue - a.revenue);
  const top = sorted.slice(0, 7);
  const rest = sorted.slice(7);
  const restRevenue = rest.reduce((s, d) => s + d.revenue, 0);

  const chartData = [
    ...top,
    ...(restRevenue > 0 ? [{ brand: "Άλλα", revenue: restRevenue }] : []),
  ];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="revenue"
          nameKey="brand"
          cx="50%"
          cy="45%"
          outerRadius={80}
          innerRadius={40}
          paddingAngle={2}
        >
          {chartData.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS.brands[i % CHART_COLORS.brands.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomLegend />} />
      </PieChart>
    </ResponsiveContainer>
  );
}

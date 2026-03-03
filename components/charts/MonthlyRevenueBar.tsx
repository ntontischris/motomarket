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

interface MonthlyRevenueBarProps {
  data: { label: string; revenue: number; orders: number }[];
  height?: number;
}

const MONTH_NAMES: Record<string, string> = {
  "01": "Ιαν", "02": "Φεβ", "03": "Μαρ", "04": "Απρ",
  "05": "Μαΐ", "06": "Ιουν", "07": "Ιουλ", "08": "Αυγ",
  "09": "Σεπ", "10": "Οκτ", "11": "Νοε", "12": "Δεκ",
};

function formatMonth(label: string): string {
  if (/^\d{4}-\d{2}$/.test(label)) {
    const [, month] = label.split("-");
    return MONTH_NAMES[month] ?? month;
  }
  return label;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[#333] bg-[#1a1a1a] px-3 py-2 shadow-lg text-sm">
      <p className="font-semibold text-[#e5e5e5] mb-1">{formatMonth(label)}</p>
      <p className="text-orange-400">
        €{payload[0]?.value?.toLocaleString("el-GR", { minimumFractionDigits: 2 })}
      </p>
      {payload[0]?.payload?.orders !== undefined && (
        <p className="text-[#888888]">{payload[0].payload.orders} παραγγελίες</p>
      )}
    </div>
  );
}

export default function MonthlyRevenueBar({ data, height = 220 }: MonthlyRevenueBarProps) {
  // Find max revenue month for highlighting
  const maxRev = Math.max(...data.map(d => d.revenue));

  const chartData = data.map(d => ({
    ...d,
    shortLabel: formatMonth(d.label),
    isMax: d.revenue === maxRev,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
        <XAxis
          dataKey="shortLabel"
          tick={{ fill: "#888", fontSize: 11 }}
          axisLine={{ stroke: "#333" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#888", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => `€${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.isMax ? CHART_COLORS.primary : "#2d2d2d"}
              stroke={CHART_COLORS.primary}
              strokeWidth={entry.isMax ? 0 : 1}
              strokeOpacity={0.4}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

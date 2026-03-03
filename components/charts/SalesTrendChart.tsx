"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CHART_COLORS } from "@/lib/bi-analytics";

interface SalesTrendChartProps {
  data: { label: string; revenue: number; units: number; orders: number }[];
  height?: number;
}

function formatLabel(label: string): string {
  // YYYY-MM → Σεπ, Οκτ, etc.
  const monthNames: Record<string, string> = {
    "01": "Ιαν", "02": "Φεβ", "03": "Μαρ", "04": "Απρ",
    "05": "Μαΐ", "06": "Ιουν", "07": "Ιουλ", "08": "Αυγ",
    "09": "Σεπ", "10": "Οκτ", "11": "Νοε", "12": "Δεκ",
  };
  if (/^\d{4}-\d{2}$/.test(label)) {
    const [year, month] = label.split("-");
    return `${monthNames[month] ?? month} ${year.slice(2)}`;
  }
  if (/^\d{4}-W\d+$/.test(label)) {
    return label.replace(/\d{4}-/, "W");
  }
  // Daily: return dd/mm
  if (/^\d{4}-\d{2}-\d{2}$/.test(label)) {
    const [, m, d] = label.split("-");
    return `${d}/${m}`;
  }
  return label;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-[#333] bg-[#1a1a1a] px-3 py-2 shadow-lg text-sm">
      <p className="font-semibold text-[#e5e5e5] mb-1">{formatLabel(label)}</p>
      <p className="text-orange-400">Έσοδα: €{payload[0]?.value?.toLocaleString("el-GR", { minimumFractionDigits: 2 })}</p>
      <p className="text-[#888888]">Παραγγελίες: {payload[1]?.value}</p>
    </div>
  );
}

export default function SalesTrendChart({ data, height = 260 }: SalesTrendChartProps) {
  const formatted = data.map(d => ({ ...d, labelShort: formatLabel(d.label) }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={formatted} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
            <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={CHART_COLORS.secondary} stopOpacity={0.2} />
            <stop offset="95%" stopColor={CHART_COLORS.secondary} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#222" />
        <XAxis
          dataKey="labelShort"
          tick={{ fill: "#888", fontSize: 11 }}
          axisLine={{ stroke: "#333" }}
          tickLine={false}
        />
        <YAxis
          yAxisId="revenue"
          orientation="left"
          tick={{ fill: "#888", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => `€${(v / 1000).toFixed(0)}k`}
        />
        <YAxis
          yAxisId="orders"
          orientation="right"
          tick={{ fill: "#555", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          yAxisId="revenue"
          type="monotone"
          dataKey="revenue"
          stroke={CHART_COLORS.primary}
          strokeWidth={2}
          fill="url(#revenueGradient)"
        />
        <Area
          yAxisId="orders"
          type="monotone"
          dataKey="orders"
          stroke={CHART_COLORS.secondary}
          strokeWidth={1.5}
          fill="url(#ordersGradient)"
          strokeDasharray="4 2"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

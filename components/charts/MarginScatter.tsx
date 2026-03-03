"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ZAxis,
} from "recharts";
import { CHART_COLORS } from "@/lib/bi-analytics";

interface MarginScatterPoint {
  code: string;
  name: string;
  brand: string;
  price: number;
  marginPct: number;
  revenue: number;
}

interface MarginScatterProps {
  data: MarginScatterPoint[];
  height?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div className="rounded-lg border border-[#333] bg-[#1a1a1a] px-3 py-2 shadow-lg text-sm max-w-xs">
      <p className="font-semibold text-[#e5e5e5] text-xs leading-tight mb-1">{d.name}</p>
      <p className="text-[#888888] text-xs">{d.brand}</p>
      <p className="text-orange-400">Τιμή: €{d.price?.toFixed(2)}</p>
      <p className="text-green-400">Margin: {d.marginPct?.toFixed(1)}%</p>
    </div>
  );
}

export default function MarginScatter({ data, height = 280 }: MarginScatterProps) {
  // Color dots by margin level
  const getColor = (m: number) => {
    if (m >= 30) return CHART_COLORS.success;
    if (m >= 20) return CHART_COLORS.primary;
    if (m >= 10) return CHART_COLORS.warning;
    return CHART_COLORS.danger;
  };

  // Group by margin band for legend
  const highMargin = data.filter(d => d.marginPct >= 25);
  const midMargin = data.filter(d => d.marginPct >= 15 && d.marginPct < 25);
  const lowMargin = data.filter(d => d.marginPct < 15);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#222" />
        <XAxis
          dataKey="price"
          name="Τιμή"
          type="number"
          tick={{ fill: "#888", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => `€${v}`}
          label={{ value: "Τιμή Πώλησης", position: "insideBottom", offset: -2, fill: "#555", fontSize: 10 }}
        />
        <YAxis
          dataKey="marginPct"
          name="Margin%"
          type="number"
          tick={{ fill: "#888", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => `${v}%`}
        />
        <ZAxis range={[40, 40]} />
        <Tooltip content={<CustomTooltip />} />
        <Scatter
          name="Margin >25%"
          data={highMargin}
          fill={CHART_COLORS.success}
          fillOpacity={0.8}
        />
        <Scatter
          name="Margin 15-25%"
          data={midMargin}
          fill={CHART_COLORS.primary}
          fillOpacity={0.8}
        />
        <Scatter
          name="Margin <15%"
          data={lowMargin}
          fill={CHART_COLORS.warning}
          fillOpacity={0.8}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

export type { MarginScatterPoint };

"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { CHART_COLORS } from "@/lib/bi-analytics";

interface StockHealthDonutProps {
  healthy: number;
  low: number;
  critical: number;
  height?: number;
}

const COLORS = [CHART_COLORS.success, CHART_COLORS.warning, CHART_COLORS.danger];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="rounded-lg border border-[#333] bg-[#1a1a1a] px-3 py-2 shadow-lg text-sm">
      <p className="font-semibold" style={{ color: d.payload.fill }}>{d.name}</p>
      <p className="text-[#e5e5e5]">{d.value} προϊόντα</p>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomLabel({ cx, cy, total }: any) {
  return (
    <>
      <text x={cx} y={cy - 6} textAnchor="middle" fill="#888" fontSize={11}>Σύνολο</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="#e5e5e5" fontSize={22} fontWeight="bold">{total}</text>
    </>
  );
}

export default function StockHealthDonut({ healthy, low, critical, height = 260 }: StockHealthDonutProps) {
  const data = [
    { name: "Υγιές", value: healthy },
    { name: "Χαμηλό", value: low },
    { name: "Κρίσιμο", value: critical },
  ].filter(d => d.value > 0);

  const total = healthy + low + critical;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          cx="50%"
          cy="45%"
          outerRadius={85}
          innerRadius={52}
          paddingAngle={3}
          label={<CustomLabel total={total} cx={0} cy={0} />}
          labelLine={false}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => <span className="text-xs text-[#888]">{value}</span>}
          iconSize={8}
          iconType="circle"
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

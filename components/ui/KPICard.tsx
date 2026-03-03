import React from "react";

interface KPICardProps {
  label: string;
  value: string;
  subtitle?: string;
  change?: number;   // positive = up, negative = down
  icon?: React.ReactNode;
  color?: "orange" | "green" | "blue" | "red" | "purple" | "teal";
}

const colorMap = {
  orange: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
  green:  { bg: "bg-green-500/10",  text: "text-green-400",  border: "border-green-500/20" },
  blue:   { bg: "bg-blue-500/10",   text: "text-blue-400",   border: "border-blue-500/20" },
  red:    { bg: "bg-red-500/10",    text: "text-red-400",    border: "border-red-500/20" },
  purple: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
  teal:   { bg: "bg-teal-500/10",   text: "text-teal-400",   border: "border-teal-500/20" },
};

export default function KPICard({ label, value, subtitle, change, icon, color = "orange" }: KPICardProps) {
  const c = colorMap[color];

  return (
    <div className={`rounded-xl border ${c.border} bg-[#111111] p-5 flex flex-col gap-2`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon && (
            <div className={`${c.bg} ${c.text} rounded-lg p-2`}>
              {icon}
            </div>
          )}
          <span className="text-sm text-[#888888] font-medium">{label}</span>
        </div>
        {change !== undefined && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            change >= 0
              ? "bg-green-500/10 text-green-400"
              : "bg-red-500/10 text-red-400"
          }`}>
            {change >= 0 ? "▲" : "▼"} {Math.abs(change)}%
          </span>
        )}
      </div>
      <div className={`text-2xl font-bold ${c.text}`}>{value}</div>
      {subtitle && <div className="text-xs text-[#666666]">{subtitle}</div>}
    </div>
  );
}

import React from "react";

interface KPICardProps {
  label: string;
  value: string;
  subtitle?: string;
  change?: number;   // positive = up, negative = down
  icon?: React.ReactNode;
  color?: "orange" | "green" | "blue" | "red" | "purple" | "teal" | "indigo";
}

const colorMap = {
  orange: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/30", accent: "border-l-orange-500" },
  green:  { bg: "bg-emerald-500/10",  text: "text-emerald-400",  border: "border-emerald-500/30", accent: "border-l-emerald-500" },
  blue:   { bg: "bg-sky-500/10",   text: "text-sky-400",   border: "border-sky-500/30", accent: "border-l-sky-500" },
  red:    { bg: "bg-red-500/10",    text: "text-red-400",    border: "border-red-500/30", accent: "border-l-red-500" },
  purple: { bg: "bg-violet-500/10", text: "text-violet-400", border: "border-violet-500/30", accent: "border-l-violet-500" },
  teal:   { bg: "bg-teal-500/10",   text: "text-teal-400",   border: "border-teal-500/30", accent: "border-l-teal-500" },
  indigo: { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/30", accent: "border-l-indigo-500" },
};

export default function KPICard({ label, value, subtitle, change, icon, color = "orange" }: KPICardProps) {
  const c = colorMap[color];

  return (
    <div className={`rounded-xl border ${c.border} border-l-2 ${c.accent} bg-[#1A1D27] p-4 flex flex-col gap-2 hover:bg-[#22263A] transition-colors`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon && (
            <div className={`${c.bg} ${c.text} rounded-lg p-1.5`}>
              {icon}
            </div>
          )}
          <span className="text-xs text-[#94A3B8] font-medium leading-tight">{label}</span>
        </div>
        {change !== undefined && (
          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
            change >= 0
              ? "bg-emerald-500/10 text-emerald-400"
              : "bg-red-500/10 text-red-400"
          }`}>
            {change >= 0 ? "▲" : "▼"} {Math.abs(change)}%
          </span>
        )}
      </div>
      <div className={`text-xl font-bold ${c.text}`}>{value}</div>
      {subtitle && <div className="text-[11px] text-[#475569]">{subtitle}</div>}
    </div>
  );
}

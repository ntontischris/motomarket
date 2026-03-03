"use client";

import { BarChart2, Package, AlertTriangle, TrendingUp, MessageSquare } from "lucide-react";

export type NavSection = "overview" | "catalog" | "stock" | "sales" | "advisor";

interface DashboardNavProps {
  active: NavSection;
  onChange: (section: NavSection) => void;
  criticalStockCount?: number;
}

const NAV_ITEMS: {
  id: NavSection;
  label: string;
  icon: React.ReactNode;
}[] = [
  { id: "overview",  label: "Overview",    icon: <BarChart2 size={20} /> },
  { id: "sales",     label: "Πωλήσεις",    icon: <TrendingUp size={20} /> },
  { id: "catalog",   label: "Κατάλογος",   icon: <Package size={20} /> },
  { id: "stock",     label: "Απόθεμα",     icon: <AlertTriangle size={20} /> },
  { id: "advisor",   label: "AI Σύμβουλος", icon: <MessageSquare size={20} /> },
];

export default function DashboardNav({ active, onChange, criticalStockCount = 0 }: DashboardNavProps) {
  return (
    <nav className="flex-shrink-0 w-16 lg:w-56 h-full bg-[#111111] border-r border-[#1e1e1e] flex flex-col py-4 gap-1">
      {NAV_ITEMS.map(item => {
        const isActive = active === item.id;
        const hasBadge = item.id === "stock" && criticalStockCount > 0;

        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={`
              w-full flex items-center gap-3 px-3 lg:px-4 py-3 rounded-lg mx-1 lg:mx-2
              transition-all duration-150 text-left relative
              ${isActive
                ? "bg-[#1e1e1e] border-l-2 border-[#f97316] text-[#f97316]"
                : "text-[#666666] hover:text-[#aaaaaa] hover:bg-[#161616]"
              }
            `}
            style={{ width: "calc(100% - 8px)" }}
          >
            <span className="flex-shrink-0 relative">
              {item.icon}
              {hasBadge && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                  {criticalStockCount > 9 ? "9+" : criticalStockCount}
                </span>
              )}
            </span>
            <span className="hidden lg:block text-sm font-medium whitespace-nowrap">
              {item.label}
            </span>
          </button>
        );
      })}

      <div className="mt-auto px-4 hidden lg:block">
        <div className="text-[10px] text-[#444444] font-mono">
          DEMO MODE<br />
          Sep 25 – Feb 26
        </div>
      </div>
    </nav>
  );
}

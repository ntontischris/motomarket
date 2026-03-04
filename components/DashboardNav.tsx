"use client";

import { BarChart2, Package, AlertTriangle, TrendingUp, MessageSquare, PieChart } from "lucide-react";

export type NavSection = "overview" | "catalog" | "stock" | "sales" | "margins" | "advisor";

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
  { id: "overview",  label: "Overview",     icon: <BarChart2 size={20} /> },
  { id: "sales",     label: "Πωλήσεις",     icon: <TrendingUp size={20} /> },
  { id: "catalog",   label: "Κατάλογος",    icon: <Package size={20} /> },
  { id: "margins",   label: "Margins",      icon: <PieChart size={20} /> },
  { id: "stock",     label: "Απόθεμα",      icon: <AlertTriangle size={20} /> },
  { id: "advisor",   label: "AI Σύμβουλος", icon: <MessageSquare size={20} /> },
];

export default function DashboardNav({ active, onChange, criticalStockCount = 0 }: DashboardNavProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden md:flex flex-shrink-0 w-16 lg:w-56 h-full bg-[#141720] border-r border-[#2A2D3A] flex-col py-4 gap-1">
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
                  ? "bg-indigo-500/10 border-l-2 border-indigo-500 text-indigo-400"
                  : "text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-white/5"
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
          <div className="text-[10px] text-[#475569] font-mono">
            DEMO MODE<br />
            Μαρ 2024 – Φεβ 2026
          </div>
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#141720]/95 backdrop-blur-md border-t border-[#2A2D3A] flex pb-safe">
        {NAV_ITEMS.map(item => {
          const isActive = active === item.id;
          const hasBadge = item.id === "stock" && criticalStockCount > 0;
          const isAdvisor = item.id === "advisor";

          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 relative transition-colors
                ${isActive ? "text-indigo-400" : "text-[#475569]"}
                ${isAdvisor && isActive ? "text-orange-400" : ""}
              `}
            >
              <span className="relative">
                {item.icon}
                {hasBadge && (
                  <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                    {criticalStockCount > 9 ? "9+" : criticalStockCount}
                  </span>
                )}
              </span>
              <span className="text-[9px] font-medium leading-none">{item.label}</span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-indigo-500 rounded-full" />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
}

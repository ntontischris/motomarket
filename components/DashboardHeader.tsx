import type { NavSection } from "./DashboardNav";

interface DashboardHeaderProps {
  activeSection: NavSection;
}

const SECTION_LABELS: Record<NavSection, string> = {
  overview: "Overview",
  sales:    "Πωλήσεις",
  catalog:  "Κατάλογος",
  stock:    "Απόθεμα",
  advisor:  "AI Σύμβουλος",
};

export default function DashboardHeader({ activeSection }: DashboardHeaderProps) {
  return (
    <header className="flex-shrink-0 h-14 bg-[#0a0a0a] border-b border-[#1e1e1e] flex items-center px-4 lg:px-6 gap-4">
      {/* Logo + Title */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 bg-[#f97316] rounded-lg flex items-center justify-center text-white font-black text-xs">
          M
        </div>
        <div>
          <span className="text-[#e5e5e5] font-semibold text-sm">Motomarket</span>
          <span className="text-[#444444] text-xs ml-1 hidden sm:inline">Business Intelligence</span>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#555555]">
        <span>/</span>
        <span className="text-[#888888] font-medium">{SECTION_LABELS[activeSection]}</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Badges */}
      <div className="flex items-center gap-2">
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#1e1e1e] text-[#666666] border border-[#2a2a2a]">
          DEMO
        </span>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
          Claude Sonnet
        </span>
      </div>
    </header>
  );
}

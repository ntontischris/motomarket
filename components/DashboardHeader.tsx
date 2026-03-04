"use client";

import { useEffect, useState } from "react";
import type { NavSection } from "./DashboardNav";
import { Circle } from "lucide-react";

interface DashboardHeaderProps {
  activeSection: NavSection;
}

interface ERPStatus {
  mode: "mock" | "live";
  connected: boolean;
  itemCount: number;
  lastSync: string | null;
}

const SECTION_LABELS: Record<NavSection, string> = {
  overview: "Overview",
  sales:    "Πωλήσεις",
  catalog:  "Κατάλογος",
  stock:    "Απόθεμα",
  margins:  "Margins",
  advisor:  "AI Σύμβουλος",
};

export default function DashboardHeader({ activeSection }: DashboardHeaderProps) {
  const [erpStatus, setErpStatus] = useState<ERPStatus>({
    mode: "mock",
    connected: false,
    itemCount: 400,
    lastSync: null,
  });

  useEffect(() => {
    fetch("/api/erp-status")
      .then(r => r.json())
      .then(setErpStatus)
      .catch(() => {});
  }, []);

  return (
    <header className="flex-shrink-0 h-14 bg-[#141720]/90 backdrop-blur-sm border-b border-[#2A2D3A] flex items-center px-4 lg:px-6 gap-4">
      {/* Logo + Title */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 bg-[#f97316] rounded-lg flex items-center justify-center text-white font-black text-xs">
          M
        </div>
        <div>
          <span className="text-[#F1F5F9] font-semibold text-sm">Motomarket</span>
          <span className="text-[#475569] text-xs ml-1 hidden sm:inline">Business Intelligence</span>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#475569]">
        <span>/</span>
        <span className="text-[#94A3B8] font-medium">{SECTION_LABELS[activeSection]}</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Print Report */}
      <button
        onClick={() => window.open("/print", "_blank")}
        className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-medium text-[#475569] hover:text-[#94A3B8] hover:bg-white/5 transition-colors"
        title="Print Report"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
          <rect x="6" y="14" width="12" height="8"/>
        </svg>
        Print
      </button>

      {/* Badges */}
      <div className="flex items-center gap-2">
        {erpStatus.mode === "live" ? (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Circle size={6} className="fill-emerald-400 animate-[livePulse_2s_ease-in-out_infinite]" />
            LIVE · {erpStatus.itemCount} προϊόντα
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 hidden sm:inline">
            DEMO · {erpStatus.itemCount} προϊόντα · 24 μήνες
          </span>
        )}
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          Claude Sonnet
        </span>
      </div>
    </header>
  );
}

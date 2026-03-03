"use client";

import { getCatalogStats } from "@/lib/erp-adapter";

function getActiveProvider(): { name: string; model: string; color: string } {
  // This runs server-side via getCatalogStats, but the provider
  // is shown client-side based on what was detected at runtime.
  // We use the event "provider" sent from the API to update UI dynamically.
  // For the static header we just show what's configured.
  return { name: "AI", model: "Auto", color: "text-gray-400" };
}

export default function Header() {
  const stats = getCatalogStats();

  return (
    <header className="border-b border-surface-500 bg-surface-800 px-6 py-3 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-brand-orange flex items-center justify-center flex-shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div>
          <div className="font-bold text-white text-base leading-tight">Motomarket AI</div>
          <div className="text-xs text-gray-500 leading-tight">Έξυπνος βοηθός εξοπλισμού</div>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-3">
        {/* AI Provider badge — updated dynamically by ChatWindowWithQuery */}
        <div id="ai-provider-badge" className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-600 border border-surface-400 text-xs">
          <span className="w-2 h-2 rounded-full bg-blue-400"></span>
          <span className="text-gray-300 font-medium">AI Ready</span>
        </div>

        {/* ERP Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-600 border border-surface-400 text-xs">
          <span className={`w-2 h-2 rounded-full animate-pulse ${stats.mode === "live" ? "bg-green-400" : "bg-yellow-400"}`} />
          <span className="text-gray-300 font-medium">
            {stats.mode === "mock" ? "DEMO DATA" : "LIVE ERP"}
          </span>
        </div>

        {/* Stats */}
        <div className="hidden md:flex items-center gap-4 text-xs text-gray-500">
          <span><span className="text-white font-medium">{stats.totalItems}</span> προϊόντα</span>
          <span><span className="text-white font-medium">{stats.brands}</span> brands</span>
        </div>
      </div>
    </header>
  );
}

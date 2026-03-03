"use client";

import { useState } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardNav, { type NavSection } from "@/components/DashboardNav";
import OverviewSection from "@/components/sections/OverviewSection";
import CatalogSection from "@/components/sections/CatalogSection";
import StockSection from "@/components/sections/StockSection";
import SalesSection from "@/components/sections/SalesSection";
import AIAdvisorSection from "@/components/sections/AIAdvisorSection";
import { getStockAlerts } from "@/lib/bi-analytics";

function getCriticalCount() {
  try {
    return getStockAlerts().filter(a => a.severity === "critical").length;
  } catch {
    return 0;
  }
}

export default function Home() {
  const [activeSection, setActiveSection] = useState<NavSection>("overview");
  const criticalCount = getCriticalCount();

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] overflow-hidden">
      <DashboardHeader activeSection={activeSection} />

      <div className="flex flex-1 min-h-0">
        <DashboardNav
          active={activeSection}
          onChange={setActiveSection}
          criticalStockCount={criticalCount}
        />

        <main className="flex-1 overflow-y-auto">
          {activeSection === "overview" && <OverviewSection />}
          {activeSection === "sales" && <SalesSection />}
          {activeSection === "catalog" && <CatalogSection />}
          {activeSection === "stock" && <StockSection />}
          {activeSection === "advisor" && (
            <div className="h-full flex flex-col">
              <AIAdvisorSection />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

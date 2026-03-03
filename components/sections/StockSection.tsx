"use client";

import { useState } from "react";
import { getStockAlerts, getInventorySnapshot } from "@/lib/bi-analytics";
import KPICard from "@/components/ui/KPICard";
import AlertCard from "@/components/ui/AlertCard";
import { Package, DollarSign, TrendingUp } from "lucide-react";

export default function StockSection() {
  const alerts = getStockAlerts();
  const inventory = getInventorySnapshot();
  const [tab, setTab] = useState<"critical" | "warning">("critical");

  const criticalAlerts = alerts.filter(a => a.severity === "critical");
  const warningAlerts = alerts.filter(a => a.severity === "warning");

  const potentialProfit = inventory.totalRetailValue - inventory.totalCostValue;

  const displayAlerts = tab === "critical" ? criticalAlerts : warningAlerts;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[#e5e5e5]">Διαχείριση Αποθέματος</h2>
        <p className="text-sm text-[#666666]">Αξία αποθέματος και ειδοποιήσεις</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard
          label="Αξία Αποθέματος (Λιανική)"
          value={`€${inventory.totalRetailValue.toLocaleString("el-GR", { minimumFractionDigits: 0 })}`}
          subtitle={`${inventory.totalUnits} συνολικά τεμάχια`}
          icon={<Package size={16} />}
          color="blue"
        />
        <KPICard
          label="Αξία Αποθέματος (Κόστος)"
          value={`€${inventory.totalCostValue.toLocaleString("el-GR", { minimumFractionDigits: 0 })}`}
          subtitle="Τιμή αγοράς"
          icon={<DollarSign size={16} />}
          color="orange"
        />
        <KPICard
          label="Δυνητικό Κέρδος"
          value={`€${potentialProfit.toLocaleString("el-GR", { minimumFractionDigits: 0 })}`}
          subtitle="Αν πουληθεί όλο το στοκ"
          icon={<TrendingUp size={16} />}
          color="green"
        />
      </div>

      {/* Alert Tabs */}
      <div className="rounded-xl border border-[#2a2a2a] bg-[#111111] overflow-hidden">
        <div className="flex border-b border-[#2a2a2a]">
          <button
            onClick={() => setTab("critical")}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              tab === "critical"
                ? "text-red-400 border-b-2 border-red-500 bg-red-500/5"
                : "text-[#555555] hover:text-[#888888]"
            }`}
          >
            Κρίσιμα
            <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              {criticalAlerts.length}
            </span>
          </button>
          <button
            onClick={() => setTab("warning")}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              tab === "warning"
                ? "text-yellow-400 border-b-2 border-yellow-500 bg-yellow-500/5"
                : "text-[#555555] hover:text-[#888888]"
            }`}
          >
            Προειδοποίηση
            <span className="bg-yellow-500 text-black text-xs px-1.5 py-0.5 rounded-full">
              {warningAlerts.length}
            </span>
          </button>
        </div>

        <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
          {displayAlerts.length === 0 ? (
            <p className="text-center text-[#555555] text-sm py-8">
              Δεν υπάρχουν ειδοποιήσεις αυτής της κατηγορίας
            </p>
          ) : (
            displayAlerts.map(alert => (
              <AlertCard key={alert.code} alert={alert} />
            ))
          )}
        </div>
      </div>

      {/* Stock by Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-[#2a2a2a] bg-[#111111] p-4">
          <h3 className="text-sm font-semibold text-[#888888] mb-4 uppercase tracking-wide">
            Αξία Αποθέματος ανά Κατηγορία
          </h3>
          <div className="space-y-2">
            {inventory.byCategory.slice(0, 8).map(cat => {
              const pct = inventory.totalRetailValue > 0
                ? (cat.retailValue / inventory.totalRetailValue) * 100
                : 0;
              return (
                <div key={cat.category}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#aaaaaa]">{cat.category}</span>
                    <span className="text-[#666666]">€{cat.retailValue.toLocaleString("el-GR", { minimumFractionDigits: 0 })} · {cat.units} τεμ</span>
                  </div>
                  <div className="h-1.5 bg-[#1e1e1e] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#f97316] rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-[#2a2a2a] bg-[#111111] p-4">
          <h3 className="text-sm font-semibold text-[#888888] mb-4 uppercase tracking-wide">
            Αξία Αποθέματος ανά Brand
          </h3>
          <div className="space-y-2">
            {inventory.byBrand.slice(0, 8).map(brand => {
              const pct = inventory.totalRetailValue > 0
                ? (brand.retailValue / inventory.totalRetailValue) * 100
                : 0;
              return (
                <div key={brand.brand}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#aaaaaa]">{brand.brand}</span>
                    <span className="text-[#666666]">€{brand.retailValue.toLocaleString("el-GR", { minimumFractionDigits: 0 })} · {brand.units} τεμ</span>
                  </div>
                  <div className="h-1.5 bg-[#1e1e1e] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

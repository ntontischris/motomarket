"use client";

import { getKPIsWithDeltas, getSalesTrend, getTopProducts, getBrandPerformance, getInventorySnapshot } from "@/lib/bi-analytics";
import KPICard from "@/components/ui/KPICard";
import SalesTrendChart from "@/components/charts/SalesTrendChart";
import BrandPieChart from "@/components/charts/BrandPieChart";
import TopProductsBar from "@/components/charts/TopProductsBar";
import StockHealthDonut from "@/components/charts/StockHealthDonut";
import { Euro, TrendingUp, Percent, Package, AlertTriangle, ShoppingCart } from "lucide-react";

export default function OverviewSection() {
  const kpis = getKPIsWithDeltas();
  const trend = getSalesTrend("monthly");
  const topProducts = getTopProducts("revenue", 10);
  const brands = getBrandPerformance();
  const inventory = getInventorySnapshot();

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[#F1F5F9]">Business Overview</h2>
        <p className="text-sm text-[#94A3B8]">Περίοδος: Μαρ 2024 – Φεβ 2026 (24 μήνες)</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <KPICard
          label="Έσοδα 24μήνου"
          value={`€${kpis.revenue6m.toLocaleString("el-GR", { minimumFractionDigits: 0 })}`}
          subtitle="Μαρ 2024 – Φεβ 2026"
          change={kpis.revenueYTDChange}
          icon={<Euro size={16} />}
          color="orange"
        />
        <KPICard
          label="Έσοδα Φεβ 2026"
          value={`€${kpis.revenue30d.toLocaleString("el-GR", { minimumFractionDigits: 0 })}`}
          subtitle="vs Ιαν 2026"
          change={kpis.revenue30dChange}
          icon={<TrendingUp size={16} />}
          color="blue"
        />
        <KPICard
          label="Avg Margin"
          value={`${kpis.avgMarginPct}%`}
          subtitle="Μέσος όρος καταλόγου"
          icon={<Percent size={16} />}
          color="green"
        />
        <KPICard
          label="Ενεργά Προϊόντα"
          value={String(kpis.activeProducts)}
          subtitle="Στον κατάλογο"
          icon={<Package size={16} />}
          color="purple"
        />
        <KPICard
          label="Κρίσιμα Αποθέματα"
          value={String(kpis.criticalStockCount)}
          subtitle={`+ ${kpis.lowStockCount} χαμηλά`}
          icon={<AlertTriangle size={16} />}
          color="red"
        />
        <KPICard
          label="Avg Παραγγελία"
          value={`€${kpis.avgOrderValue.toFixed(0)}`}
          subtitle={`${kpis.totalOrders} παραγγελίες`}
          change={kpis.ordersChange}
          icon={<ShoppingCart size={16} />}
          color="teal"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 rounded-xl border border-[#2A2D3A] bg-[#1A1D27] p-4">
          <h3 className="text-sm font-semibold text-[#94A3B8] mb-4 uppercase tracking-wide">Τάση Εσόδων — 24 μήνες</h3>
          <SalesTrendChart data={trend} height={240} />
          <div className="flex gap-4 mt-2 text-xs text-[#475569]">
            <div className="flex items-center gap-1"><span className="w-3 h-0.5 bg-orange-500 inline-block" /> Έσοδα</div>
            <div className="flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-500 inline-block" /> Παραγγελίες</div>
          </div>
        </div>

        <div className="rounded-xl border border-[#2A2D3A] bg-[#1A1D27] p-4">
          <h3 className="text-sm font-semibold text-[#94A3B8] mb-2 uppercase tracking-wide">Έσοδα ανά Brand</h3>
          <BrandPieChart data={brands} height={260} />
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 rounded-xl border border-[#2A2D3A] bg-[#1A1D27] p-4">
          <h3 className="text-sm font-semibold text-[#94A3B8] mb-4 uppercase tracking-wide">Top 10 Προϊόντα — Έσοδα</h3>
          <TopProductsBar data={topProducts} metric="revenue" height={280} />
        </div>

        <div className="rounded-xl border border-[#2A2D3A] bg-[#1A1D27] p-4">
          <h3 className="text-sm font-semibold text-[#94A3B8] mb-2 uppercase tracking-wide">Υγεία Αποθέματος</h3>
          <StockHealthDonut
            healthy={inventory.healthyCount}
            low={inventory.lowCount}
            critical={inventory.criticalCount}
            height={200}
          />
          <div className="mt-3 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-emerald-400">Υγιές (&gt;8 τεμ)</span>
              <span className="text-[#94A3B8]">{inventory.healthyCount} προϊόντα</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-amber-400">Χαμηλό (1-8 τεμ)</span>
              <span className="text-[#94A3B8]">{inventory.lowCount} προϊόντα</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-red-400">Κρίσιμο (0 τεμ)</span>
              <span className="text-[#94A3B8]">{inventory.criticalCount} προϊόντα</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

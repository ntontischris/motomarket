"use client";

import { useState } from "react";
import {
  getSalesTrend,
  getTopProducts,
  getBrandPerformance,
  getCustomerAnalytics,
} from "@/lib/bi-analytics";
import SalesTrendChart from "@/components/charts/SalesTrendChart";
import MonthlyRevenueBar from "@/components/charts/MonthlyRevenueBar";
import TopProductsBar from "@/components/charts/TopProductsBar";
import BrandPieChart from "@/components/charts/BrandPieChart";

type GroupBy = "daily" | "weekly" | "monthly";

export default function SalesSection() {
  const [groupBy, setGroupBy] = useState<GroupBy>("monthly");
  const [topMetric, setTopMetric] = useState<"revenue" | "units">("revenue");

  const trend = getSalesTrend(groupBy);
  const monthlyTrend = getSalesTrend("monthly");
  const topProducts = getTopProducts(topMetric, 10);
  const brands = getBrandPerformance();
  const customers = getCustomerAnalytics();

  // Total revenue & orders
  const totalRevenue = trend.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = trend.reduce((s, d) => s + d.orders, 0);

  const CHANNEL_LABELS: Record<string, string> = {
    "walk-in": "Φυσικό Κατάστημα",
    "phone": "Τηλέφωνο",
    "web": "Online",
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[#e5e5e5]">Ανάλυση Πωλήσεων</h2>
        <p className="text-sm text-[#666666]">Σεπ 2025 – Φεβ 2026 · {totalOrders} παραγγελίες · €{totalRevenue.toLocaleString("el-GR", { minimumFractionDigits: 0 })} έσοδα</p>
      </div>

      {/* Full-width trend chart with toggle */}
      <div className="rounded-xl border border-[#2a2a2a] bg-[#111111] p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[#888888] uppercase tracking-wide">Τάση Πωλήσεων</h3>
          <div className="flex gap-1 bg-[#1a1a1a] rounded-lg p-0.5">
            {(["daily", "weekly", "monthly"] as GroupBy[]).map(g => (
              <button
                key={g}
                onClick={() => setGroupBy(g)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  groupBy === g
                    ? "bg-[#f97316] text-white"
                    : "text-[#666666] hover:text-[#aaa]"
                }`}
              >
                {g === "daily" ? "Ημέρα" : g === "weekly" ? "Εβδομάδα" : "Μήνας"}
              </button>
            ))}
          </div>
        </div>
        <SalesTrendChart data={trend} height={260} />
      </div>

      {/* Row 2: Monthly bars + top products */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="rounded-xl border border-[#2a2a2a] bg-[#111111] p-4">
          <h3 className="text-sm font-semibold text-[#888888] mb-4 uppercase tracking-wide">Έσοδα ανά Μήνα</h3>
          <MonthlyRevenueBar data={monthlyTrend} height={220} />
        </div>

        <div className="rounded-xl border border-[#2a2a2a] bg-[#111111] p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#888888] uppercase tracking-wide">Top Προϊόντα</h3>
            <div className="flex gap-1 bg-[#1a1a1a] rounded-lg p-0.5">
              {(["revenue", "units"] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setTopMetric(m)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                    topMetric === m ? "bg-[#f97316] text-white" : "text-[#666666] hover:text-[#aaa]"
                  }`}
                >
                  {m === "revenue" ? "Έσοδα" : "Τεμάχια"}
                </button>
              ))}
            </div>
          </div>
          <TopProductsBar data={topProducts} metric={topMetric} height={220} />
        </div>
      </div>

      {/* Row 3: Brand pie + customer split + stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-[#2a2a2a] bg-[#111111] p-4">
          <h3 className="text-sm font-semibold text-[#888888] mb-2 uppercase tracking-wide">Brands</h3>
          <BrandPieChart data={brands} height={220} />
        </div>

        <div className="rounded-xl border border-[#2a2a2a] bg-[#111111] p-4">
          <h3 className="text-sm font-semibold text-[#888888] mb-4 uppercase tracking-wide">Κανάλι Πωλήσεων</h3>
          <div className="space-y-3">
            {customers.channelBreakdown.map(ch => {
              const totalRev = customers.channelBreakdown.reduce((s, c) => s + c.revenue, 0);
              const pct = totalRev > 0 ? (ch.revenue / totalRev) * 100 : 0;
              return (
                <div key={ch.channel}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#aaaaaa]">{CHANNEL_LABELS[ch.channel] ?? ch.channel}</span>
                    <span className="text-[#666666]">{pct.toFixed(0)}% · {ch.orders} παραγγ.</span>
                  </div>
                  <div className="h-1.5 bg-[#1e1e1e] rounded-full">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-[#1e1e1e]">
            <div className="text-xs text-[#666666] mb-2">Τύπος Πελάτη</div>
            <div className="flex gap-2">
              <div className="flex-1 text-center py-2 rounded-lg bg-orange-500/10">
                <div className="text-orange-400 font-bold text-sm">{customers.retailPct}%</div>
                <div className="text-[#666666] text-xs">Λιανική</div>
              </div>
              <div className="flex-1 text-center py-2 rounded-lg bg-blue-500/10">
                <div className="text-blue-400 font-bold text-sm">{customers.wholesalePct}%</div>
                <div className="text-[#666666] text-xs">Χονδρική</div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#2a2a2a] bg-[#111111] p-4">
          <h3 className="text-sm font-semibold text-[#888888] mb-4 uppercase tracking-wide">Top Πελάτες</h3>
          <div className="space-y-2">
            {customers.topCustomers.map((c, i) => (
              <div key={c.code} className="flex items-center gap-3">
                <span className="text-xs text-[#444444] w-4 font-mono">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-[#aaaaaa] truncate">{c.name}</div>
                  <div className="text-[10px] text-[#555555]">{c.type === "wholesale" ? "Χονδρική" : "Λιανική"} · {c.orders} παραγγ.</div>
                </div>
                <span className="text-xs text-orange-400 font-semibold flex-shrink-0">
                  €{c.revenue.toLocaleString("el-GR", { minimumFractionDigits: 0 })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

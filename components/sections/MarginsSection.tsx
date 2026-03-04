"use client";

import { getMarginAnalysis } from "@/lib/bi-analytics";
import KPICard from "@/components/ui/KPICard";
import MarginScatter from "@/components/charts/MarginScatter";
import DataTable, { type Column } from "@/components/ui/DataTable";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function MarginsSection() {
  const margins = getMarginAnalysis();

  const brandColumns: Column<typeof margins.byBrand[0]>[] = [
    { key: "brand", label: "Brand", sortable: true },
    {
      key: "marginPct",
      label: "Margin %",
      sortable: true,
      align: "right",
      render: row => (
        <span className={`font-semibold ${
          row.marginPct >= 30 ? "text-emerald-400" :
          row.marginPct >= 20 ? "text-amber-400" : "text-red-400"
        }`}>
          {row.marginPct}%
        </span>
      ),
    },
    {
      key: "revenue",
      label: "Έσοδα",
      sortable: true,
      align: "right",
      render: row => `€${Number(row.revenue).toLocaleString("el-GR")}`,
    },
  ];

  const catColumns: Column<typeof margins.byCategory[0]>[] = [
    { key: "category", label: "Κατηγορία", sortable: true },
    {
      key: "marginPct",
      label: "Margin %",
      sortable: true,
      align: "right",
      render: row => (
        <span className={`font-semibold ${
          row.marginPct >= 30 ? "text-emerald-400" :
          row.marginPct >= 20 ? "text-amber-400" : "text-red-400"
        }`}>
          {row.marginPct}%
        </span>
      ),
    },
    {
      key: "revenue",
      label: "Έσοδα",
      sortable: true,
      align: "right",
      render: row => `€${Number(row.revenue).toLocaleString("el-GR")}`,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[#F1F5F9]">Ανάλυση Margins</h2>
        <p className="text-sm text-[#94A3B8]">Κερδοφορία ανά brand, κατηγορία και προϊόν — Μαρ 2024 – Φεβ 2026</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4">
        <KPICard
          label="Καλύτερο Margin"
          value={`${margins.bestMarginProduct.marginPct}%`}
          subtitle={margins.bestMarginProduct.name.length > 35
            ? margins.bestMarginProduct.name.substring(0, 35) + "…"
            : margins.bestMarginProduct.name}
          icon={<TrendingUp size={16} />}
          color="green"
        />
        <KPICard
          label="Χειρότερο Margin"
          value={`${margins.worstMarginProduct.marginPct}%`}
          subtitle={margins.worstMarginProduct.name.length > 35
            ? margins.worstMarginProduct.name.substring(0, 35) + "…"
            : margins.worstMarginProduct.name}
          icon={<TrendingDown size={16} />}
          color="red"
        />
      </div>

      {/* Margin Scatter (hidden on mobile) + margin trend */}
      <div className="hidden md:block rounded-xl border border-[#2A2D3A] bg-[#1A1D27] p-4">
        <h3 className="text-sm font-semibold text-[#94A3B8] mb-4 uppercase tracking-wide">
          Margin vs Τιμή — Scatter ανά Προϊόν
        </h3>
        <MarginScatter height={300} />
      </div>

      {/* By Brand & By Category tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold text-[#94A3B8] mb-3 uppercase tracking-wide">
            Margins ανά Brand
          </h3>
          <DataTable columns={brandColumns} data={margins.byBrand} maxRows={10} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[#94A3B8] mb-3 uppercase tracking-wide">
            Margins ανά Κατηγορία
          </h3>
          <DataTable columns={catColumns} data={margins.byCategory} maxRows={10} />
        </div>
      </div>

      {/* Margin trend table */}
      <div>
        <h3 className="text-sm font-semibold text-[#94A3B8] mb-3 uppercase tracking-wide">
          Τάση Margin ανά Μήνα
        </h3>
        <div className="flex flex-wrap gap-3">
          {margins.trend.map(t => (
            <div key={t.month} className="rounded-lg border border-[#2A2D3A] bg-[#1A1D27] px-4 py-2 text-center min-w-[80px]">
              <div className="text-[10px] text-[#475569] font-mono">{t.month}</div>
              <div className={`text-base font-bold ${
                t.marginPct >= 30 ? "text-emerald-400" :
                t.marginPct >= 20 ? "text-amber-400" : "text-red-400"
              }`}>{t.marginPct}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

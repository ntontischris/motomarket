"use client";

import { getKPIsWithDeltas, getSalesTrend, getTopProducts, getBrandPerformance, getStockAlerts, getMarginAnalysis } from "@/lib/bi-analytics";

export default function PrintPage() {
  const kpis = getKPIsWithDeltas();
  const trend = getSalesTrend("monthly");
  const topProducts = getTopProducts("revenue", 10);
  const brands = getBrandPerformance().slice(0, 8);
  const alerts = getStockAlerts().filter(a => a.severity === "critical").slice(0, 10);
  const margins = getMarginAnalysis();

  const today = new Date().toLocaleDateString("el-GR", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="print-page bg-white text-black p-8 max-w-4xl mx-auto font-sans">
      <style>{`
        @media print {
          body { margin: 0; }
          .print-page { padding: 16px; }
          .no-print { display: none; }
          @page { margin: 15mm; size: A4; }
        }
        .print-page { font-family: system-ui, sans-serif; }
      `}</style>

      {/* Print button */}
      <div className="no-print mb-6 flex gap-3">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          Εκτύπωση / PDF
        </button>
        <button
          onClick={() => window.close()}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
        >
          Κλείσιμο
        </button>
      </div>

      {/* Header */}
      <div className="flex justify-between items-start mb-8 pb-4 border-b-2 border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Motomarket Business Intelligence</h1>
          <p className="text-sm text-gray-500 mt-1">Αναφορά Επιχειρηματικής Ανάλυσης · Μαρ 2024 – Φεβ 2026</p>
        </div>
        <div className="text-right text-xs text-gray-400">
          <p>Ημερομηνία: {today}</p>
          <p className="mt-0.5 text-orange-600 font-semibold">DEMO DATA</p>
        </div>
      </div>

      {/* KPIs */}
      <section className="mb-8">
        <h2 className="text-base font-bold text-gray-700 uppercase tracking-wide mb-3">Βασικοί Δείκτες</h2>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Συνολικά Έσοδα 24μ", value: `€${kpis.revenue6m.toLocaleString("el-GR")}`, sub: `YoY: ${kpis.revenueYTDChange > 0 ? "+" : ""}${kpis.revenueYTDChange}%` },
            { label: "Έσοδα Φεβ 2026", value: `€${kpis.revenue30d.toLocaleString("el-GR")}`, sub: `vs Ιαν: ${kpis.revenue30dChange > 0 ? "+" : ""}${kpis.revenue30dChange}%` },
            { label: "Avg Margin", value: `${kpis.avgMarginPct}%`, sub: "Μέσος όρος καταλόγου" },
            { label: "Ενεργά Προϊόντα", value: String(kpis.activeProducts), sub: "Στον κατάλογο" },
            { label: "Κρίσιμα Αποθέματα", value: String(kpis.criticalStockCount), sub: `+ ${kpis.lowStockCount} χαμηλά` },
            { label: "Avg Παραγγελία", value: `€${kpis.avgOrderValue.toFixed(0)}`, sub: `${kpis.totalOrders} παραγγελίες` },
          ].map((kpi, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">{kpi.label}</div>
              <div className="text-lg font-bold text-gray-900">{kpi.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{kpi.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Monthly Revenue Trend */}
      <section className="mb-8">
        <h2 className="text-base font-bold text-gray-700 uppercase tracking-wide mb-3">Τάση Εσόδων (24 μήνες)</h2>
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left px-2 py-1.5 border border-gray-200">Μήνας</th>
              <th className="text-right px-2 py-1.5 border border-gray-200">Έσοδα</th>
              <th className="text-right px-2 py-1.5 border border-gray-200">Παραγγελίες</th>
              <th className="text-right px-2 py-1.5 border border-gray-200">Τεμάχια</th>
            </tr>
          </thead>
          <tbody>
            {trend.map((t, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-2 py-1 border border-gray-200 font-mono">{t.label}</td>
                <td className="px-2 py-1 border border-gray-200 text-right font-semibold">€{t.revenue.toLocaleString("el-GR")}</td>
                <td className="px-2 py-1 border border-gray-200 text-right">{t.orders}</td>
                <td className="px-2 py-1 border border-gray-200 text-right">{t.units}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Top 10 Products */}
      <section className="mb-8">
        <h2 className="text-base font-bold text-gray-700 uppercase tracking-wide mb-3">Top 10 Προϊόντα — Έσοδα</h2>
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left px-2 py-1.5 border border-gray-200">#</th>
              <th className="text-left px-2 py-1.5 border border-gray-200">Προϊόν</th>
              <th className="text-left px-2 py-1.5 border border-gray-200">Brand</th>
              <th className="text-right px-2 py-1.5 border border-gray-200">Έσοδα</th>
              <th className="text-right px-2 py-1.5 border border-gray-200">Τεμ.</th>
              <th className="text-right px-2 py-1.5 border border-gray-200">Margin%</th>
            </tr>
          </thead>
          <tbody>
            {topProducts.map((p, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-2 py-1 border border-gray-200 text-gray-400">{i + 1}</td>
                <td className="px-2 py-1 border border-gray-200 font-medium max-w-xs truncate">{p.name}</td>
                <td className="px-2 py-1 border border-gray-200 text-gray-600">{p.brand}</td>
                <td className="px-2 py-1 border border-gray-200 text-right font-semibold">€{p.revenue.toLocaleString("el-GR")}</td>
                <td className="px-2 py-1 border border-gray-200 text-right">{p.units}</td>
                <td className="px-2 py-1 border border-gray-200 text-right">{p.marginPct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Brand Performance */}
      <section className="mb-8">
        <h2 className="text-base font-bold text-gray-700 uppercase tracking-wide mb-3">Brands — Top 8</h2>
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left px-2 py-1.5 border border-gray-200">Brand</th>
              <th className="text-right px-2 py-1.5 border border-gray-200">Έσοδα</th>
              <th className="text-right px-2 py-1.5 border border-gray-200">Τεμ.</th>
              <th className="text-right px-2 py-1.5 border border-gray-200">Margin%</th>
              <th className="text-right px-2 py-1.5 border border-gray-200">Προϊόντα</th>
            </tr>
          </thead>
          <tbody>
            {brands.map((b, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-2 py-1 border border-gray-200 font-semibold">{b.brand}</td>
                <td className="px-2 py-1 border border-gray-200 text-right">€{b.revenue.toLocaleString("el-GR")}</td>
                <td className="px-2 py-1 border border-gray-200 text-right">{b.units}</td>
                <td className="px-2 py-1 border border-gray-200 text-right">{b.marginPct}%</td>
                <td className="px-2 py-1 border border-gray-200 text-right">{b.productCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Critical Stock Alerts */}
      {alerts.length > 0 && (
        <section className="mb-8">
          <h2 className="text-base font-bold text-red-700 uppercase tracking-wide mb-3">Κρίσιμα Αποθέματα ({alerts.length})</h2>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-red-50">
                <th className="text-left px-2 py-1.5 border border-red-100">Προϊόν</th>
                <th className="text-left px-2 py-1.5 border border-red-100">Brand</th>
                <th className="text-right px-2 py-1.5 border border-red-100">Τεμ.</th>
                <th className="text-left px-2 py-1.5 border border-red-100">Κατάσταση</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((a, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-red-50/30"}>
                  <td className="px-2 py-1 border border-red-100 font-medium">{a.name}</td>
                  <td className="px-2 py-1 border border-red-100 text-gray-600">{a.brand}</td>
                  <td className="px-2 py-1 border border-red-100 text-right font-bold text-red-600">{a.totalUnits}</td>
                  <td className="px-2 py-1 border border-red-100 text-red-500">{a.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-gray-200 text-xs text-gray-400 flex justify-between">
        <span>Motomarket Business Intelligence · Powered by Claude AI</span>
        <span>Εκτυπώθηκε: {today}</span>
      </div>
    </div>
  );
}

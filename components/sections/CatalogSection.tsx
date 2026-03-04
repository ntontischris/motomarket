"use client";

import { useState } from "react";
import { MOCK_ITEMS, MOCK_STOCK } from "@/lib/mock-catalog";
import { getBrandPerformance } from "@/lib/bi-analytics";
import DataTable, { type Column } from "@/components/ui/DataTable";
import MarginScatter, { type MarginScatterPoint } from "@/components/charts/MarginScatter";

interface CatalogRow extends Record<string, unknown> {
  code: string;
  name: string;
  brand: string;
  category: string;
  retailPrice: number;
  costPrice: number;
  marginPct: number;
  stock: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  "0001": "Ανοιχτά",
  "0002": "Κλειστά",
  "0003": "Flip-Up",
  "0004": "MX",
  "0005": "ADV",
  "0101": "Μπουφάν",
  "0102": "Παντελόνια",
  "0103": "Γάντια",
  "0104": "Μπότες",
  "0201": "Βαλίτσες",
  "0203": "Bluetooth",
  "0301": "Off-Road",
  "0401": "Λάδια",
  "0402": "Λιπαντικά",
  "0501": "Cameras",
};

function getTotalStock(code: string): number {
  const stockData = MOCK_STOCK[code];
  if (!stockData) return 0;
  return Object.values(stockData).reduce((s: number, n) => s + (n as number), 0);
}

export default function CatalogSection() {
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");

  const brands = Array.from(new Set(MOCK_ITEMS.map(i => i.Brand))).sort();

  const catalogRows: CatalogRow[] = MOCK_ITEMS
    .filter(i => i.Inactive === 0)
    .map(item => {
      const m = item.RetailPrice > 0
        ? (item.RetailPrice - item.Price) / item.RetailPrice * 100
        : 0;
      return {
        code: item.Code,
        name: item.Description,
        brand: item.Brand,
        category: CATEGORY_LABELS[item.CCategory] ?? item.CCategory,
        retailPrice: item.RetailPrice,
        costPrice: item.Price,
        marginPct: Math.round(m * 10) / 10,
        stock: getTotalStock(item.Code),
      };
    })
    .filter(row => {
      const matchSearch = !search || row.name.toLowerCase().includes(search.toLowerCase()) || row.code.toLowerCase().includes(search.toLowerCase());
      const matchBrand = brandFilter === "all" || row.brand === brandFilter;
      return matchSearch && matchBrand;
    });

  const columns: Column<CatalogRow>[] = [
    {
      key: "name",
      label: "Προϊόν",
      render: (row) => (
        <div>
          <div className="text-[#F1F5F9] font-medium text-sm">{row.name}</div>
          <div className="text-[#555555] text-xs font-mono">{row.code}</div>
        </div>
      ),
    },
    { key: "brand", label: "Brand" },
    { key: "category", label: "Κατηγορία" },
    {
      key: "retailPrice",
      label: "Τιμή Πώλησης",
      sortable: true,
      align: "right",
      render: (row) => <span className="text-[#F1F5F9]">€{row.retailPrice.toFixed(2)}</span>,
    },
    {
      key: "costPrice",
      label: "Κόστος",
      sortable: true,
      align: "right",
      render: (row) => <span className="text-[#475569]">€{row.costPrice.toFixed(2)}</span>,
    },
    {
      key: "marginPct",
      label: "Margin%",
      sortable: true,
      align: "right",
      render: (row) => (
        <span className={`font-semibold ${
          row.marginPct >= 30 ? "text-green-400" :
          row.marginPct >= 20 ? "text-orange-400" :
          row.marginPct >= 10 ? "text-yellow-400" : "text-red-400"
        }`}>
          {row.marginPct.toFixed(1)}%
        </span>
      ),
    },
    {
      key: "stock",
      label: "Απόθεμα",
      sortable: true,
      align: "right",
      render: (row) => (
        <span className={`${
          row.stock === 0 ? "text-red-400" :
          row.stock <= 5 ? "text-yellow-400" : "text-green-400"
        }`}>
          {row.stock} τεμ
        </span>
      ),
    },
  ];

  // Scatter data
  const scatterData: MarginScatterPoint[] = MOCK_ITEMS.filter(i => i.Inactive === 0).map(item => ({
    code: item.Code,
    name: item.Description,
    brand: item.Brand,
    price: item.RetailPrice,
    marginPct: item.RetailPrice > 0 ? (item.RetailPrice - item.Price) / item.RetailPrice * 100 : 0,
    revenue: 0,
  }));

  // Brand performance table
  const brandPerf = getBrandPerformance();
  const brandPerfCols: Column<typeof brandPerf[0]>[] = [
    { key: "brand", label: "Brand" },
    { key: "productCount", label: "Προϊόντα", sortable: true, align: "right" },
    {
      key: "avgPrice",
      label: "Avg Τιμή",
      sortable: true,
      align: "right",
      render: (r) => `€${r.avgPrice.toFixed(0)}`,
    },
    {
      key: "marginPct",
      label: "Avg Margin",
      sortable: true,
      align: "right",
      render: (r) => (
        <span className={r.marginPct >= 25 ? "text-green-400" : r.marginPct >= 15 ? "text-orange-400" : "text-red-400"}>
          {r.marginPct.toFixed(1)}%
        </span>
      ),
    },
    {
      key: "stockValue",
      label: "Αξία Αποθ.",
      sortable: true,
      align: "right",
      render: (r) => `€${r.stockValue.toLocaleString("el-GR", { minimumFractionDigits: 0 })}`,
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-[#F1F5F9]">Κατάλογος Προϊόντων</h2>
        <p className="text-sm text-[#475569]">{MOCK_ITEMS.filter(i => i.Inactive === 0).length} ενεργά προϊόντα</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Αναζήτηση προϊόντος..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-48 bg-[#1A1D27] border border-[#2A2D3A] rounded-lg px-3 py-2 text-sm text-[#F1F5F9] placeholder-[#555555] focus:outline-none focus:border-orange-500/50"
        />
        <select
          value={brandFilter}
          onChange={e => setBrandFilter(e.target.value)}
          className="bg-[#1A1D27] border border-[#2A2D3A] rounded-lg px-3 py-2 text-sm text-[#F1F5F9] focus:outline-none focus:border-orange-500/50"
        >
          <option value="all">Όλα τα Brands</option>
          {brands.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      {/* Product table */}
      <DataTable
        columns={columns}
        data={catalogRows}
      />

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="rounded-xl border border-[#2A2D3A] bg-[#1A1D27] p-4">
          <h3 className="text-sm font-semibold text-[#94A3B8] mb-4 uppercase tracking-wide">
            Τιμή vs Margin — Scatter
          </h3>
          <MarginScatter data={scatterData} height={280} />
          <div className="flex gap-4 mt-2 text-xs text-[#555555]">
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Margin &gt;25%</div>
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500 inline-block" /> 15-25%</div>
            <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" /> &lt;15%</div>
          </div>
        </div>

        <div className="rounded-xl border border-[#2A2D3A] bg-[#1A1D27] p-4">
          <h3 className="text-sm font-semibold text-[#94A3B8] mb-4 uppercase tracking-wide">
            Απόδοση ανά Brand
          </h3>
          <DataTable
            columns={brandPerfCols}
            data={brandPerf}
            maxRows={10}
          />
        </div>
      </div>
    </div>
  );
}

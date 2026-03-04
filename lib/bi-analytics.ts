// ============================================================
// BI Analytics — Pure computation functions (sync, browser-safe)
// All data derived from mock-catalog.ts + mock-sales.ts
// ============================================================

import { MOCK_ITEMS, MOCK_STOCK } from "./mock-catalog";
import { MOCK_SALES, MOCK_CUSTOMERS, type SaleRecord } from "./mock-sales";

// ─── Chart color palette (exported for consistent use across charts) ──

export const CHART_COLORS = {
  primary:   "#f97316",
  secondary: "#3b82f6",
  success:   "#22c55e",
  warning:   "#eab308",
  danger:    "#ef4444",
  purple:    "#a855f7",
  teal:      "#14b8a6",
  brands:    ["#f97316","#3b82f6","#22c55e","#a855f7","#eab308","#14b8a6","#f43f5e","#64748b"],
};

// ─── Type definitions ─────────────────────────────────────────────────

export interface KPIData {
  revenue6m: number;
  revenue30d: number;
  avgMarginPct: number;
  activeProducts: number;
  lowStockCount: number;
  criticalStockCount: number;
  avgOrderValue: number;
  totalOrders: number;
  totalUnits: number;
  topBrand: string;
  topBrandRevenue: number;
}

export interface SalesTrendPoint {
  label: string;
  revenue: number;
  units: number;
  orders: number;
}

export interface TopProductData {
  code: string;
  name: string;
  brand: string;
  metric: number; // value of the selected metric
  revenue: number;
  units: number;
  margin: number;
  marginPct: number;
}

export interface BrandPerformance extends Record<string, unknown> {
  brand: string;
  revenue: number;
  units: number;
  marginPct: number;
  productCount: number;
  avgPrice: number;
  stockValue: number;
}

export interface CategoryPerformance {
  category: string;
  revenue: number;
  units: number;
  productCount: number;
}

export interface StockAlert {
  code: string;
  name: string;
  brand: string;
  severity: "critical" | "warning" | "info";
  message: string;
  totalUnits: number;
  retailValue: number;
  daysOfStock: number | null;
}

export interface PriceAnalysis {
  avgRetailPrice: number;
  avgCostPrice: number;
  avgMarginPct: number;
  promoDepthAvg: number;
  marginDistribution: { label: string; count: number }[];
  priceRanges: { label: string; count: number }[];
}

export interface MarginAnalysis {
  byBrand: { brand: string; marginPct: number; revenue: number }[];
  byCategory: { category: string; marginPct: number; revenue: number }[];
  trend: { month: string; marginPct: number }[];
  bestMarginProduct: { code: string; name: string; marginPct: number };
  worstMarginProduct: { code: string; name: string; marginPct: number };
}

export interface InventorySnapshot {
  totalRetailValue: number;
  totalCostValue: number;
  totalUnits: number;
  byCategory: { category: string; retailValue: number; units: number }[];
  byBrand: { brand: string; retailValue: number; units: number }[];
  healthyCount: number;
  lowCount: number;
  criticalCount: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────

// Map productCode → item for quick lookup
const itemByCode = new Map(MOCK_ITEMS.map(i => [i.Code, i]));

// Calculate total units in stock for a product
function getTotalStock(code: string): number {
  const stockData = MOCK_STOCK[code];
  if (!stockData) return 0;
  return Object.values(stockData).reduce((s, n) => s + n, 0);
}

// Calculate margin %
function marginPct(item: { Price: number; RetailPrice: number }): number {
  if (!item.RetailPrice || item.RetailPrice === 0) return 0;
  return ((item.RetailPrice - item.Price) / item.RetailPrice) * 100;
}

// Get category label (short name from code)
const CATEGORY_LABELS: Record<string, string> = {
  "0001": "Ανοιχτά Κράνη",
  "0002": "Κλειστά Κράνη",
  "0003": "Flip-Up Κράνη",
  "0004": "MX Κράνη",
  "0005": "ADV Κράνη",
  "0101": "Μπουφάν",
  "0102": "Παντελόνια",
  "0103": "Γάντια",
  "0104": "Μπότες",
  "0201": "Βαλίτσες",
  "0203": "Bluetooth",
  "0301": "Off-Road Εξοπλισμός",
  "0401": "Λάδια Μηχανής",
  "0402": "Λιπαντικά Αλυσίδας",
  "0501": "Action Cameras",
};

function categoryLabel(code: string): string {
  return CATEGORY_LABELS[code] || code;
}

// Get last N days of sales
function getSalesLast30d(): SaleRecord[] {
  const cutoff = "2026-02-01"; // Feb 2026 month
  return MOCK_SALES.filter(s => s.date >= cutoff);
}

// ─── KPIs ─────────────────────────────────────────────────────────────

export function getKPIs(): KPIData {
  const revenue6m = MOCK_SALES.reduce((s, sale) => {
    const item = itemByCode.get(sale.productCode);
    return s + (item ? sale.soldPrice * sale.quantity : 0);
  }, 0);

  const sales30d = getSalesLast30d();
  const revenue30d = sales30d.reduce((s, sale) => {
    const item = itemByCode.get(sale.productCode);
    return s + (item ? sale.soldPrice * sale.quantity : 0);
  }, 0);

  const margins = MOCK_ITEMS.map(i => marginPct(i)).filter(m => m > 0);
  const avgMarginPct = margins.reduce((s, m) => s + m, 0) / margins.length;

  const activeProducts = MOCK_ITEMS.filter(i => i.Inactive === 0 && i.WEB === 1).length;

  // Stock alerts
  let lowStockCount = 0;
  let criticalStockCount = 0;
  for (const item of MOCK_ITEMS) {
    const total = getTotalStock(item.Code);
    if (total === 0) criticalStockCount++;
    else if (total <= 5) lowStockCount++;
  }

  const avgOrderValue = revenue6m / MOCK_SALES.length;
  const totalOrders = MOCK_SALES.length;
  const totalUnits = MOCK_SALES.reduce((s, sale) => s + sale.quantity, 0);

  // Top brand by revenue
  const brandRevMap: Record<string, number> = {};
  for (const sale of MOCK_SALES) {
    const item = itemByCode.get(sale.productCode);
    if (!item) continue;
    brandRevMap[item.Brand] = (brandRevMap[item.Brand] || 0) + sale.soldPrice * sale.quantity;
  }
  const topBrand = Object.entries(brandRevMap).sort((a, b) => b[1] - a[1])[0];

  return {
    revenue6m: Math.round(revenue6m * 100) / 100,
    revenue30d: Math.round(revenue30d * 100) / 100,
    avgMarginPct: Math.round(avgMarginPct * 10) / 10,
    activeProducts,
    lowStockCount,
    criticalStockCount,
    avgOrderValue: Math.round(avgOrderValue * 100) / 100,
    totalOrders,
    totalUnits,
    topBrand: topBrand?.[0] ?? "N/A",
    topBrandRevenue: Math.round((topBrand?.[1] ?? 0) * 100) / 100,
  };
}

// ─── Sales Trend ──────────────────────────────────────────────────────

export function getSalesTrend(groupBy: "daily" | "weekly" | "monthly" = "monthly"): SalesTrendPoint[] {
  const grouped: Record<string, { revenue: number; units: number; orders: number }> = {};

  for (const sale of MOCK_SALES) {
    const item = itemByCode.get(sale.productCode);
    const rev = item ? sale.soldPrice * sale.quantity : 0;

    let label: string;
    if (groupBy === "monthly") {
      label = sale.date.substring(0, 7); // YYYY-MM
    } else if (groupBy === "weekly") {
      const d = new Date(sale.date);
      const startOfYear = new Date(d.getFullYear(), 0, 1);
      const week = Math.ceil(((d.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
      label = `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
    } else {
      label = sale.date;
    }

    if (!grouped[label]) grouped[label] = { revenue: 0, units: 0, orders: 0 };
    grouped[label].revenue += rev;
    grouped[label].units += sale.quantity;
    grouped[label].orders += 1;
  }

  return Object.entries(grouped)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([label, data]) => ({
      label,
      revenue: Math.round(data.revenue * 100) / 100,
      units: data.units,
      orders: data.orders,
    }));
}

// ─── Top Products ─────────────────────────────────────────────────────

export function getTopProducts(metric: "revenue" | "units" | "margin" = "revenue", limit = 10): TopProductData[] {
  const productMap: Record<string, { revenue: number; units: number }> = {};

  for (const sale of MOCK_SALES) {
    if (!productMap[sale.productCode]) productMap[sale.productCode] = { revenue: 0, units: 0 };
    const item = itemByCode.get(sale.productCode);
    productMap[sale.productCode].revenue += item ? sale.soldPrice * sale.quantity : 0;
    productMap[sale.productCode].units += sale.quantity;
  }

  const results: TopProductData[] = Object.entries(productMap).map(([code, data]) => {
    const item = itemByCode.get(code);
    if (!item) return null;
    const m = marginPct(item);
    const rev = Math.round(data.revenue * 100) / 100;
    const marginVal = Math.round(rev * m / 100 * 100) / 100;
    return {
      code,
      name: item.Description,
      brand: item.Brand,
      metric: metric === "revenue" ? rev : metric === "units" ? data.units : Math.round(m * 10) / 10,
      revenue: rev,
      units: data.units,
      margin: marginVal,
      marginPct: Math.round(m * 10) / 10,
    };
  }).filter(Boolean) as TopProductData[];

  return results
    .sort((a, b) => b.metric - a.metric)
    .slice(0, limit);
}

// ─── Brand Performance ────────────────────────────────────────────────

export function getBrandPerformance(): BrandPerformance[] {
  const brandMap: Record<string, { revenue: number; units: number; margins: number[]; items: Set<string> }> = {};

  for (const sale of MOCK_SALES) {
    const item = itemByCode.get(sale.productCode);
    if (!item) continue;
    const b = item.Brand;
    if (!brandMap[b]) brandMap[b] = { revenue: 0, units: 0, margins: [], items: new Set() };
    brandMap[b].revenue += sale.soldPrice * sale.quantity;
    brandMap[b].units += sale.quantity;
    brandMap[b].margins.push(marginPct(item));
    brandMap[b].items.add(item.Code);
  }

  // Also include brands that have items but no sales
  for (const item of MOCK_ITEMS) {
    if (!brandMap[item.Brand]) {
      brandMap[item.Brand] = { revenue: 0, units: 0, margins: [marginPct(item)], items: new Set([item.Code]) };
    } else {
      brandMap[item.Brand].items.add(item.Code);
    }
  }

  return Object.entries(brandMap).map(([brand, data]) => {
    const avgMargin = data.margins.length > 0
      ? data.margins.reduce((s, m) => s + m, 0) / data.margins.length
      : 0;

    // Calculate stock value for brand
    let stockValue = 0;
    for (const code of data.items) {
      const item = itemByCode.get(code);
      if (!item) continue;
      stockValue += getTotalStock(code) * item.RetailPrice;
    }

    const avgPrice = data.items.size > 0
      ? Array.from(data.items).reduce((s, code) => {
          const item = itemByCode.get(code);
          return s + (item?.RetailPrice ?? 0);
        }, 0) / data.items.size
      : 0;

    return {
      brand,
      revenue: Math.round(data.revenue * 100) / 100,
      units: data.units,
      marginPct: Math.round(avgMargin * 10) / 10,
      productCount: data.items.size,
      avgPrice: Math.round(avgPrice * 100) / 100,
      stockValue: Math.round(stockValue * 100) / 100,
    };
  }).sort((a, b) => b.revenue - a.revenue);
}

// ─── Category Performance ─────────────────────────────────────────────

export function getCategoryPerformance(): CategoryPerformance[] {
  const catMap: Record<string, { revenue: number; units: number; items: Set<string> }> = {};

  for (const sale of MOCK_SALES) {
    const item = itemByCode.get(sale.productCode);
    if (!item) continue;
    const cat = item.CCategory;
    if (!catMap[cat]) catMap[cat] = { revenue: 0, units: 0, items: new Set() };
    catMap[cat].revenue += sale.soldPrice * sale.quantity;
    catMap[cat].units += sale.quantity;
    catMap[cat].items.add(item.Code);
  }

  return Object.entries(catMap).map(([cat, data]) => ({
    category: categoryLabel(cat),
    revenue: Math.round(data.revenue * 100) / 100,
    units: data.units,
    productCount: data.items.size,
  })).sort((a, b) => b.revenue - a.revenue);
}

// ─── Stock Alerts ─────────────────────────────────────────────────────

export function getStockAlerts(): StockAlert[] {
  const alerts: StockAlert[] = [];

  // Calculate avg daily sales rate per product
  const salesCount: Record<string, number> = {};
  for (const sale of MOCK_SALES) {
    salesCount[sale.productCode] = (salesCount[sale.productCode] || 0) + sale.quantity;
  }
  const totalDays = 180; // 6 months

  for (const item of MOCK_ITEMS) {
    if (item.Inactive === 1) continue;

    const total = getTotalStock(item.Code);
    const dailyRate = (salesCount[item.Code] || 0) / totalDays;
    const daysOfStock = dailyRate > 0 ? Math.floor(total / dailyRate) : null;

    let severity: "critical" | "warning" | "info";
    let message: string;

    if (total === 0) {
      severity = "critical";
      message = "Εξαντλημένο — αδύνατη η πώληση";
    } else if (total <= 3 || (daysOfStock !== null && daysOfStock < 14)) {
      severity = "critical";
      message = `Κρίσιμα χαμηλό (${total} τεμ${daysOfStock !== null ? `, ~${daysOfStock} ημέρες` : ""})`;
    } else if (total <= 8 || (daysOfStock !== null && daysOfStock < 30)) {
      severity = "warning";
      message = `Χαμηλό απόθεμα (${total} τεμ${daysOfStock !== null ? `, ~${daysOfStock} ημέρες` : ""})`;
    } else {
      severity = "info";
      message = `Ικανοποιητικό (${total} τεμ${daysOfStock !== null ? `, ~${daysOfStock} ημέρες` : ""})`;
    }

    // Only include critical and warning in alerts (skip info unless specifically requested)
    if (severity !== "info") {
      alerts.push({
        code: item.Code,
        name: item.Description,
        brand: item.Brand,
        severity,
        message,
        totalUnits: total,
        retailValue: Math.round(total * item.RetailPrice * 100) / 100,
        daysOfStock,
      });
    }
  }

  return alerts.sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2 };
    return order[a.severity] - order[b.severity];
  });
}

// ─── Price Analysis ───────────────────────────────────────────────────

export function getPriceAnalysis(): PriceAnalysis {
  const items = MOCK_ITEMS.filter(i => i.Inactive === 0);
  const avgRetailPrice = items.reduce((s, i) => s + i.RetailPrice, 0) / items.length;
  const avgCostPrice = items.reduce((s, i) => s + i.Price, 0) / items.length;
  const avgMarginPct = items.reduce((s, i) => s + marginPct(i), 0) / items.length;

  // Promo depth: how much discount from retail to promo
  const promoItems = items.filter(i => i.Price1 < i.RetailPrice);
  const promoDepthAvg = promoItems.length > 0
    ? promoItems.reduce((s, i) => s + (i.RetailPrice - i.Price1) / i.RetailPrice * 100, 0) / promoItems.length
    : 0;

  // Margin distribution
  const marginBuckets = [
    { label: "0-10%", min: 0, max: 10 },
    { label: "10-20%", min: 10, max: 20 },
    { label: "20-30%", min: 20, max: 30 },
    { label: "30%+", min: 30, max: 100 },
  ];
  const marginDistribution = marginBuckets.map(b => ({
    label: b.label,
    count: items.filter(i => {
      const m = marginPct(i);
      return m >= b.min && m < b.max;
    }).length,
  }));

  // Price ranges
  const priceBuckets = [
    { label: "<€50", max: 50 },
    { label: "€50-150", max: 150 },
    { label: "€150-300", max: 300 },
    { label: "€300-500", max: 500 },
    { label: "€500+", max: Infinity },
  ];
  let prev = 0;
  const priceRanges = priceBuckets.map(b => {
    const count = items.filter(i => i.RetailPrice >= prev && i.RetailPrice < b.max).length;
    const label = b.label;
    prev = b.max;
    return { label, count };
  });

  return {
    avgRetailPrice: Math.round(avgRetailPrice * 100) / 100,
    avgCostPrice: Math.round(avgCostPrice * 100) / 100,
    avgMarginPct: Math.round(avgMarginPct * 10) / 10,
    promoDepthAvg: Math.round(promoDepthAvg * 10) / 10,
    marginDistribution,
    priceRanges,
  };
}

// ─── Margin Analysis ──────────────────────────────────────────────────

export function getMarginAnalysis(): MarginAnalysis {
  const items = MOCK_ITEMS.filter(i => i.Inactive === 0);

  // By brand
  const brandMargins: Record<string, number[]> = {};
  const brandRevenue: Record<string, number> = {};
  for (const sale of MOCK_SALES) {
    const item = itemByCode.get(sale.productCode);
    if (!item) continue;
    if (!brandMargins[item.Brand]) brandMargins[item.Brand] = [];
    brandMargins[item.Brand].push(marginPct(item));
    brandRevenue[item.Brand] = (brandRevenue[item.Brand] || 0) + sale.soldPrice * sale.quantity;
  }
  const byBrand = Object.entries(brandMargins).map(([brand, margins]) => ({
    brand,
    marginPct: Math.round(margins.reduce((s, m) => s + m, 0) / margins.length * 10) / 10,
    revenue: Math.round((brandRevenue[brand] || 0) * 100) / 100,
  })).sort((a, b) => b.marginPct - a.marginPct);

  // By category
  const catMargins: Record<string, number[]> = {};
  const catRevenue: Record<string, number> = {};
  for (const sale of MOCK_SALES) {
    const item = itemByCode.get(sale.productCode);
    if (!item) continue;
    const cat = categoryLabel(item.CCategory);
    if (!catMargins[cat]) catMargins[cat] = [];
    catMargins[cat].push(marginPct(item));
    catRevenue[cat] = (catRevenue[cat] || 0) + sale.soldPrice * sale.quantity;
  }
  const byCategory = Object.entries(catMargins).map(([category, margins]) => ({
    category,
    marginPct: Math.round(margins.reduce((s, m) => s + m, 0) / margins.length * 10) / 10,
    revenue: Math.round((catRevenue[category] || 0) * 100) / 100,
  })).sort((a, b) => b.revenue - a.revenue);

  // Trend by month
  const monthMargins: Record<string, number[]> = {};
  for (const sale of MOCK_SALES) {
    const item = itemByCode.get(sale.productCode);
    if (!item) continue;
    const month = sale.date.substring(0, 7);
    if (!monthMargins[month]) monthMargins[month] = [];
    monthMargins[month].push(marginPct(item));
  }
  const trend = Object.entries(monthMargins)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, margins]) => ({
      month,
      marginPct: Math.round(margins.reduce((s, m) => s + m, 0) / margins.length * 10) / 10,
    }));

  // Best/worst margin products
  const itemMargins = items.map(i => ({ code: i.Code, name: i.Description, marginPct: marginPct(i) }));
  const best = itemMargins.reduce((a, b) => b.marginPct > a.marginPct ? b : a);
  const worst = itemMargins.reduce((a, b) => b.marginPct < a.marginPct ? b : a);

  return {
    byBrand,
    byCategory,
    trend,
    bestMarginProduct: { code: best.code, name: best.name, marginPct: Math.round(best.marginPct * 10) / 10 },
    worstMarginProduct: { code: worst.code, name: worst.name, marginPct: Math.round(worst.marginPct * 10) / 10 },
  };
}

// ─── Inventory Snapshot ───────────────────────────────────────────────

export function getInventorySnapshot(): InventorySnapshot {
  const items = MOCK_ITEMS.filter(i => i.Inactive === 0);
  let totalRetailValue = 0;
  let totalCostValue = 0;
  let totalUnits = 0;
  let healthyCount = 0;
  let lowCount = 0;
  let criticalCount = 0;

  const catMap: Record<string, { retailValue: number; units: number }> = {};
  const brandMap: Record<string, { retailValue: number; units: number }> = {};

  for (const item of items) {
    const qty = getTotalStock(item.Code);
    const retailVal = qty * item.RetailPrice;
    const costVal = qty * item.Price;
    totalRetailValue += retailVal;
    totalCostValue += costVal;
    totalUnits += qty;

    if (qty === 0) criticalCount++;
    else if (qty <= 5) lowCount++;
    else healthyCount++;

    const cat = categoryLabel(item.CCategory);
    if (!catMap[cat]) catMap[cat] = { retailValue: 0, units: 0 };
    catMap[cat].retailValue += retailVal;
    catMap[cat].units += qty;

    if (!brandMap[item.Brand]) brandMap[item.Brand] = { retailValue: 0, units: 0 };
    brandMap[item.Brand].retailValue += retailVal;
    brandMap[item.Brand].units += qty;
  }

  return {
    totalRetailValue: Math.round(totalRetailValue * 100) / 100,
    totalCostValue: Math.round(totalCostValue * 100) / 100,
    totalUnits,
    byCategory: Object.entries(catMap)
      .map(([category, data]) => ({ category, retailValue: Math.round(data.retailValue * 100) / 100, units: data.units }))
      .sort((a, b) => b.retailValue - a.retailValue),
    byBrand: Object.entries(brandMap)
      .map(([brand, data]) => ({ brand, retailValue: Math.round(data.retailValue * 100) / 100, units: data.units }))
      .sort((a, b) => b.retailValue - a.retailValue),
    healthyCount,
    lowCount,
    criticalCount,
  };
}

// ─── Customer Analytics ───────────────────────────────────────────────

export interface CustomerAnalytics {
  retailRevenue: number;
  wholesaleRevenue: number;
  retailPct: number;
  wholesalePct: number;
  channelBreakdown: { channel: string; orders: number; revenue: number }[];
  topCustomers: { code: string; name: string; type: string; revenue: number; orders: number }[];
}

export function getCustomerAnalytics(): CustomerAnalytics {
  const customerMap = new Map(MOCK_CUSTOMERS.map(c => [c.code, c]));
  const customerRevenue: Record<string, { revenue: number; orders: number }> = {};
  let retailRevenue = 0;
  let wholesaleRevenue = 0;
  const channelMap: Record<string, { orders: number; revenue: number }> = {};

  for (const sale of MOCK_SALES) {
    const item = itemByCode.get(sale.productCode);
    const rev = item ? sale.soldPrice * sale.quantity : 0;
    const customer = customerMap.get(sale.customerCode);

    if (customer?.type === "wholesale") wholesaleRevenue += rev;
    else retailRevenue += rev;

    if (!customerRevenue[sale.customerCode]) customerRevenue[sale.customerCode] = { revenue: 0, orders: 0 };
    customerRevenue[sale.customerCode].revenue += rev;
    customerRevenue[sale.customerCode].orders += 1;

    if (!channelMap[sale.channel]) channelMap[sale.channel] = { orders: 0, revenue: 0 };
    channelMap[sale.channel].orders += 1;
    channelMap[sale.channel].revenue += rev;
  }

  const total = retailRevenue + wholesaleRevenue;

  const topCustomers = Object.entries(customerRevenue)
    .map(([code, data]) => {
      const c = customerMap.get(code);
      return {
        code,
        name: c?.name ?? code,
        type: c?.type ?? "retail",
        revenue: Math.round(data.revenue * 100) / 100,
        orders: data.orders,
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return {
    retailRevenue: Math.round(retailRevenue * 100) / 100,
    wholesaleRevenue: Math.round(wholesaleRevenue * 100) / 100,
    retailPct: total > 0 ? Math.round(retailRevenue / total * 1000) / 10 : 0,
    wholesalePct: total > 0 ? Math.round(wholesaleRevenue / total * 1000) / 10 : 0,
    channelBreakdown: Object.entries(channelMap).map(([channel, data]) => ({
      channel,
      orders: data.orders,
      revenue: Math.round(data.revenue * 100) / 100,
    })).sort((a, b) => b.revenue - a.revenue),
    topCustomers,
  };
}

// ─── Seasonality Insights ─────────────────────────────────────────────

export interface SeasonalityData {
  peakMonths: { month: string; revenuePct: number }[];
  categorySeasonality: { category: string; variance: number; peakMonth: string }[];
  yoyComparison: { month: string; current: number; prior: number }[];
}

export function getSeasonalityInsights(): SeasonalityData {
  // Monthly revenue totals
  const monthRevenue: Record<string, number> = {};
  for (const sale of MOCK_SALES) {
    const item = itemByCode.get(sale.productCode);
    if (!item) continue;
    const month = sale.date.substring(0, 7);
    monthRevenue[month] = (monthRevenue[month] || 0) + sale.soldPrice * sale.quantity;
  }

  const totalRevenue = Object.values(monthRevenue).reduce((s, v) => s + v, 0);

  // Peak months (top 5 by revenue %)
  const peakMonths = Object.entries(monthRevenue)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([month, rev]) => ({
      month,
      revenuePct: Math.round(rev / totalRevenue * 1000) / 10,
    }));

  // Category seasonality: for each category, find peak month and variance
  const catMonthRev: Record<string, Record<string, number>> = {};
  for (const sale of MOCK_SALES) {
    const item = itemByCode.get(sale.productCode);
    if (!item) continue;
    const cat = categoryLabel(item.CCategory);
    const month = sale.date.substring(2, 7); // MM-YY short
    if (!catMonthRev[cat]) catMonthRev[cat] = {};
    catMonthRev[cat][month] = (catMonthRev[cat][month] || 0) + sale.soldPrice * sale.quantity;
  }

  const categorySeasonality = Object.entries(catMonthRev).map(([category, months]) => {
    const values = Object.values(months);
    const avg = values.reduce((s, v) => s + v, 0) / values.length;
    const variance = Math.round(
      Math.sqrt(values.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / values.length)
    );
    const peakMonth = Object.entries(months).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
    return { category, variance, peakMonth };
  }).sort((a, b) => b.variance - a.variance).slice(0, 8);

  // YoY comparison: compare months that exist in both 2025 and 2024
  const yoyComparison: { month: string; current: number; prior: number }[] = [];
  for (const m of ["03","04","05","06","07","08","09","10","11","12"]) {
    const current = monthRevenue[`2025-${m}`] ?? 0;
    const prior = monthRevenue[`2024-${m}`] ?? 0;
    if (current > 0 || prior > 0) {
      yoyComparison.push({
        month: m,
        current: Math.round(current),
        prior: Math.round(prior),
      });
    }
  }

  return { peakMonths, categorySeasonality, yoyComparison };
}

// ─── Demand Forecast ──────────────────────────────────────────────────

export interface ForecastPoint {
  label: string;
  projected: number;
  confidence: "high" | "medium" | "low";
  isProjection: boolean;
}

export function getForecastData(category?: string): ForecastPoint[] {
  // Get monthly revenue for all available months, optionally filtered by category
  const monthRevenue: Record<string, number> = {};

  for (const sale of MOCK_SALES) {
    const item = itemByCode.get(sale.productCode);
    if (!item) continue;
    if (category && categoryLabel(item.CCategory) !== category) continue;
    const month = sale.date.substring(0, 7);
    monthRevenue[month] = (monthRevenue[month] || 0) + sale.soldPrice * sale.quantity;
  }

  const sorted = Object.entries(monthRevenue).sort((a, b) => a[0].localeCompare(b[0]));

  // Linear regression on last 12 months
  const recent = sorted.slice(-12);
  const n = recent.length;
  if (n < 3) return [];

  const xs = recent.map((_, i) => i);
  const ys = recent.map(([, v]) => v);
  const sumX = xs.reduce((s, x) => s + x, 0);
  const sumY = ys.reduce((s, y) => s + y, 0);
  const sumXY = xs.reduce((s, x, i) => s + x * ys[i], 0);
  const sumXX = xs.reduce((s, x) => s + x * x, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Historical points (last 6 months)
  const historical: ForecastPoint[] = sorted.slice(-6).map(([label, rev]) => ({
    label,
    projected: Math.round(rev),
    confidence: "high",
    isProjection: false,
  }));

  // Forecast next 3 months
  const lastIdx = n - 1;
  const lastMonth = new Date(sorted[sorted.length - 1][0] + "-01");
  const forecast: ForecastPoint[] = [1, 2, 3].map(offset => {
    const d = new Date(lastMonth);
    d.setMonth(d.getMonth() + offset);
    const label = d.toISOString().substring(0, 7);
    const projected = Math.max(0, Math.round(intercept + slope * (lastIdx + offset)));
    return {
      label,
      projected,
      confidence: offset === 1 ? "high" : offset === 2 ? "medium" : "low",
      isProjection: true,
    };
  });

  return [...historical, ...forecast];
}

// ─── RFM Analysis ─────────────────────────────────────────────────────

export interface RFMSegment {
  segment: "champions" | "loyal" | "at_risk" | "lost" | "new";
  customerCount: number;
  totalRevenue: number;
  avgOrderValue: number;
  customers: { code: string; name: string; rfmScore: number }[];
}

export function getRFMAnalysis(): RFMSegment[] {
  const customerMap = new Map(MOCK_CUSTOMERS.map(c => [c.code, c]));
  const now = new Date("2026-03-01");

  // Calculate R, F, M per customer
  const customerStats: Record<string, { lastDate: string; orderCount: number; revenue: number }> = {};

  for (const sale of MOCK_SALES) {
    if (!customerStats[sale.customerCode]) {
      customerStats[sale.customerCode] = { lastDate: sale.date, orderCount: 0, revenue: 0 };
    }
    const cs = customerStats[sale.customerCode];
    if (sale.date > cs.lastDate) cs.lastDate = sale.date;
    cs.orderCount += 1;
    const item = itemByCode.get(sale.productCode);
    cs.revenue += item ? sale.soldPrice * sale.quantity : 0;
  }

  // Score each customer 1-5 on R, F, M
  const entries = Object.entries(customerStats);
  if (entries.length === 0) return [];

  const allRevenues = entries.map(([, s]) => s.revenue).sort((a, b) => a - b);
  const allFreqs = entries.map(([, s]) => s.orderCount).sort((a, b) => a - b);

  function percentileScore(value: number, sorted: number[]): number {
    const pct = sorted.filter(v => v <= value).length / sorted.length;
    return Math.ceil(pct * 5);
  }

  const scored = entries.map(([code, stats]) => {
    const daysSinceLast = Math.floor((now.getTime() - new Date(stats.lastDate).getTime()) / 86400000);
    const r = daysSinceLast < 30 ? 5 : daysSinceLast < 90 ? 4 : daysSinceLast < 180 ? 3 : daysSinceLast < 365 ? 2 : 1;
    const f = percentileScore(stats.orderCount, allFreqs);
    const m = percentileScore(stats.revenue, allRevenues);
    const rfmScore = r * 100 + f * 10 + m;
    const customer = customerMap.get(code);
    return { code, name: customer?.name ?? code, rfmScore, revenue: stats.revenue, orderCount: stats.orderCount, r, f, m };
  });

  // Assign segments
  function assignSegment(s: typeof scored[0]): RFMSegment["segment"] {
    if (s.r >= 4 && s.f >= 4 && s.m >= 4) return "champions";
    if (s.r >= 3 && s.f >= 3) return "loyal";
    if (s.r <= 2 && s.f >= 3) return "at_risk";
    if (s.r === 1) return "lost";
    return "new";
  }

  const segmentMap: Record<RFMSegment["segment"], typeof scored> = {
    champions: [], loyal: [], at_risk: [], lost: [], new: [],
  };

  for (const s of scored) {
    segmentMap[assignSegment(s)].push(s);
  }

  return (["champions", "loyal", "at_risk", "lost", "new"] as const).map(segment => {
    const customers = segmentMap[segment];
    const totalRevenue = customers.reduce((s, c) => s + c.revenue, 0);
    const totalOrders = customers.reduce((s, c) => s + c.orderCount, 0);
    return {
      segment,
      customerCount: customers.length,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      avgOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders * 100) / 100 : 0,
      customers: customers
        .sort((a, b) => b.rfmScore - a.rfmScore)
        .slice(0, 5)
        .map(c => ({ code: c.code, name: c.name, rfmScore: c.rfmScore })),
    };
  });
}

// ─── KPI Deltas (period-over-period) ─────────────────────────────────

export interface KPIWithDeltas extends KPIData {
  revenue30dChange: number;  // % change vs prior 30 days
  revenueYTDChange: number;  // % YoY change
  ordersChange: number;      // % change in order count
}

export function getKPIsWithDeltas(): KPIWithDeltas {
  const base = getKPIs();

  // Last 30 days (Feb 2026) vs prior 30 days (Jan 2026)
  const feb2026Sales = MOCK_SALES.filter(s => s.date >= "2026-02-01" && s.date < "2026-03-01");
  const jan2026Sales = MOCK_SALES.filter(s => s.date >= "2026-01-01" && s.date < "2026-02-01");

  const revFeb = feb2026Sales.reduce((s, sale) => {
    const item = itemByCode.get(sale.productCode);
    return s + (item ? sale.soldPrice * sale.quantity : 0);
  }, 0);
  const revJan = jan2026Sales.reduce((s, sale) => {
    const item = itemByCode.get(sale.productCode);
    return s + (item ? sale.soldPrice * sale.quantity : 0);
  }, 0);

  const revenue30dChange = revJan > 0
    ? Math.round((revFeb - revJan) / revJan * 1000) / 10
    : 0;

  // YoY: Mar-Aug 2025 vs Mar-Aug 2024
  const period2025 = MOCK_SALES.filter(s => s.date >= "2025-03-01" && s.date < "2025-09-01");
  const period2024 = MOCK_SALES.filter(s => s.date >= "2024-03-01" && s.date < "2024-09-01");
  const rev2025 = period2025.reduce((s, sale) => {
    const item = itemByCode.get(sale.productCode);
    return s + (item ? sale.soldPrice * sale.quantity : 0);
  }, 0);
  const rev2024 = period2024.reduce((s, sale) => {
    const item = itemByCode.get(sale.productCode);
    return s + (item ? sale.soldPrice * sale.quantity : 0);
  }, 0);
  const revenueYTDChange = rev2024 > 0
    ? Math.round((rev2025 - rev2024) / rev2024 * 1000) / 10
    : 0;

  // Orders: Feb vs Jan
  const ordersChange = jan2026Sales.length > 0
    ? Math.round((feb2026Sales.length - jan2026Sales.length) / jan2026Sales.length * 1000) / 10
    : 0;

  return {
    ...base,
    revenue30dChange,
    revenueYTDChange,
    ordersChange,
  };
}

/**
 * ERP Adapter — Mock / Live toggle
 * ─────────────────────────────────
 * Mock mode: reads from mock-catalog.ts (instant, no network)
 * Live mode:  calls Entersoft API (requires credentials + WEB=true items)
 *
 * Switch to live: set ERP_MODE=live in .env.local
 */

import { MOCK_ITEMS, MOCK_STOCK } from "./mock-catalog";
import { ALL_CATEGORIES } from "./categories";
import type { ERPItem, ERPCategory, StockInfo, ProductSearchParams, SearchResult } from "./types";

const IS_MOCK = process.env.ERP_MODE !== "live";

// ─── SEARCH ─────────────────────────────────────────────────

export async function searchProducts(params: ProductSearchParams): Promise<SearchResult> {
  if (IS_MOCK) return searchMock(params);
  return searchLive(params); // TODO: implement when credentials available
}

function searchMock(params: ProductSearchParams): SearchResult {
  const { query, category, brand, minPrice, maxPrice, inStock, limit = 6 } = params;

  let results = MOCK_ITEMS.filter(item => item.WEB === 1 && item.Inactive === 0);

  // Text search across multiple fields
  if (query && query.trim().length > 0) {
    const q = query.toLowerCase();
    results = results.filter(item =>
      item.Description.toLowerCase().includes(q) ||
      item.Brand.toLowerCase().includes(q) ||
      (item.GreekFeatures?.toLowerCase().includes(q)) ||
      (item.AlternativeDescription?.toLowerCase().includes(q)) ||
      item.Code.toLowerCase().includes(q) ||
      (item.InternationalCode?.toLowerCase().includes(q))
    );
  }

  // Category filter (exact or parent match)
  if (category) {
    results = results.filter(item =>
      item.CCategory === category ||
      item.CCategory.startsWith(category)
    );
  }

  // Brand filter
  if (brand) {
    const b = brand.toLowerCase();
    results = results.filter(item => item.Brand.toLowerCase().includes(b));
  }

  // Price range
  if (minPrice !== undefined) {
    results = results.filter(item => item.RetailPrice >= minPrice);
  }
  if (maxPrice !== undefined) {
    results = results.filter(item => item.RetailPrice <= maxPrice);
  }

  // In stock filter
  if (inStock) {
    results = results.filter(item => {
      const stock = MOCK_STOCK[item.Code];
      if (!stock) return false;
      return Object.values(stock).some(qty => qty > 0);
    });
  }

  const total = results.length;
  return {
    items: results.slice(0, limit),
    total,
    query: params.query || "",
  };
}

async function searchLive(_params: ProductSearchParams): Promise<SearchResult> {
  // TODO: implement when ERP credentials available
  // GET /api/rpc/PublicQuery/ESWBCat/CS_AppItems?Code=*&CCategory={category}
  throw new Error("Live ERP mode not yet configured. Set ERP_MODE=mock or provide credentials.");
}

// ─── GET SINGLE PRODUCT ─────────────────────────────────────

export async function getProduct(code: string): Promise<ERPItem | null> {
  if (IS_MOCK) {
    return MOCK_ITEMS.find(i => i.Code === code) ?? null;
  }
  // Live: GET /api/rpc/PublicQuery/ESWBCat/CS_AppItems?Code={code}
  throw new Error("Live mode not configured");
}

// ─── STOCK ──────────────────────────────────────────────────

export async function getStock(code: string): Promise<StockInfo> {
  if (IS_MOCK) {
    const stockRecord = MOCK_STOCK[code] ?? {};
    const sizes = Object.entries(stockRecord).map(([size, available]) => ({
      size,
      available: available as number,
      reserved: 0,
    }));
    return {
      code,
      sizes,
      totalAvailable: sizes.reduce((sum, s) => sum + s.available, 0),
      warehouse: "Κεντρική αποθήκη (Mock)",
    };
  }
  // Live: POST /api/eshopconnector/ProductsStock/{routeid}
  throw new Error("Live mode not configured");
}

// ─── CATEGORIES ─────────────────────────────────────────────

export async function getCategories(parentCode?: string | null): Promise<ERPCategory[]> {
  const parent = parentCode === undefined ? null : parentCode;
  return ALL_CATEGORIES.filter(
    c => c.fParentCode === parent && c.Inactive === 0
  );
}

// ─── RECOMMENDATIONS ────────────────────────────────────────

export async function getRecommendations(code: string, limit = 4): Promise<ERPItem[]> {
  const item = await getProduct(code);
  if (!item) return [];

  const relatedCodes = item.RelatedItems
    ? item.RelatedItems.split(",").map(s => s.trim()).filter(Boolean)
    : [];

  if (relatedCodes.length > 0) {
    const relatedItems = relatedCodes
      .map(c => MOCK_ITEMS.find(i => i.Code === c))
      .filter((i): i is ERPItem => i !== undefined)
      .slice(0, limit);
    if (relatedItems.length > 0) return relatedItems;
  }

  // Fallback: same category
  return MOCK_ITEMS
    .filter(i => i.CCategory === item.CCategory && i.Code !== item.Code && i.WEB === 1)
    .slice(0, limit);
}

// ─── BRAND LIST ─────────────────────────────────────────────

export function getAllBrands(): string[] {
  const brands = new Set(MOCK_ITEMS.map(i => i.Brand));
  return Array.from(brands).sort();
}

// ─── CATALOG STATS ──────────────────────────────────────────

export function getCatalogStats() {
  const active = MOCK_ITEMS.filter(i => i.WEB === 1 && i.Inactive === 0);
  return {
    mode: IS_MOCK ? "mock" : "live",
    totalItems: active.length,
    totalCategories: ALL_CATEGORIES.filter(c => c.Inactive === 0).length,
    brands: getAllBrands().length,
    lastSync: new Date().toISOString(),
  };
}

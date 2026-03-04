// ============================================================
// Data Provider — switches between mock and live ERP data
// Set ERP_MODE=live + credentials in .env.local to use live
// ============================================================

import type { ERPItem } from "./types";
import type { SaleRecord } from "./mock-sales";

const ERP_MODE = (process.env.ERP_MODE ?? "mock") as "mock" | "live";

export async function getItems(): Promise<ERPItem[]> {
  if (ERP_MODE === "live") {
    const { searchLive } = await import("./erp-adapter");
    const result = await searchLive({});
    return result.items;
  }
  const { MOCK_ITEMS } = await import("./mock-catalog");
  return MOCK_ITEMS;
}

export async function getSales(): Promise<SaleRecord[]> {
  if (ERP_MODE === "live") {
    // Live sales come from erp-sync cache
    try {
      const { readFileSync } = await import("fs");
      const raw = readFileSync("data/erp-cache.json", "utf-8");
      const cache = JSON.parse(raw) as { sales?: SaleRecord[] };
      return cache.sales ?? [];
    } catch {
      // No cache yet — return empty (run sync first)
      return [];
    }
  }
  const { MOCK_SALES } = await import("./mock-sales");
  return MOCK_SALES;
}

export async function getStock(code: string): Promise<Record<string, number>> {
  if (ERP_MODE === "live") {
    const { getStockLive } = await import("./erp-adapter");
    return getStockLive(code);
  }
  const { MOCK_STOCK } = await import("./mock-catalog");
  return (MOCK_STOCK[code] as Record<string, number>) ?? {};
}

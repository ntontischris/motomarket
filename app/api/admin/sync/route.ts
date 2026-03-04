// POST /api/admin/sync — pulls live ERP data and caches it
// Protected by SYNC_SECRET environment variable

import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-sync-secret");
  if (!secret || secret !== process.env.SYNC_SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (process.env.ERP_MODE !== "live") {
    return new Response(JSON.stringify({
      error: "ERP_MODE is not 'live'. Set ERP_MODE=live to run sync.",
    }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { searchLive } = await import("@/lib/erp-adapter");

    // Pull all products page by page
    const allItems = [];
    let page = 1;
    while (true) {
      const result = await searchLive({ page, limit: 100 });
      allItems.push(...result.items);
      if (allItems.length >= result.total || result.items.length === 0) break;
      page++;
    }

    const stats = {
      products: allItems.length,
      syncedAt: new Date().toISOString(),
    };

    // On Vercel we can't write to filesystem — return stats only
    // On local dev, optionally write to data/erp-cache.json
    try {
      const { writeFileSync, mkdirSync } = await import("fs");
      mkdirSync("data", { recursive: true });
      writeFileSync("data/erp-cache.json", JSON.stringify({ items: allItems, syncedAt: stats.syncedAt }));
    } catch {
      // Filesystem not available (Vercel) — no-op
    }

    return new Response(JSON.stringify({ success: true, ...stats }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

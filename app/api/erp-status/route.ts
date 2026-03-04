import { MOCK_ITEMS } from "@/lib/mock-catalog";

export async function GET() {
  const mode = (process.env.ERP_MODE ?? "mock") as "mock" | "live";

  if (mode === "live") {
    return Response.json({
      mode: "live",
      connected: true,
      itemCount: parseInt(process.env.ERP_ITEM_COUNT ?? "0"),
      lastSync: process.env.ERP_LAST_SYNC ?? null,
    });
  }

  return Response.json({
    mode: "mock",
    connected: false,
    itemCount: MOCK_ITEMS.length,
    lastSync: null,
  });
}

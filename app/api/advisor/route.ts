import Anthropic from "@anthropic-ai/sdk";
import {
  getKPIs,
  getSalesTrend,
  getStockAlerts,
  getBrandPerformance,
  getMarginAnalysis,
  getTopProducts,
  getCategoryPerformance,
  getPriceAnalysis,
  getCustomerAnalytics,
  getInventorySnapshot,
  getSeasonalityInsights,
  getRFMAnalysis,
  getForecastData,
} from "@/lib/bi-analytics";
import { searchProducts } from "@/lib/erp-adapter";

// ─── System Prompt ────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Είσαι ο AI σύμβουλος επιχειρήσεων του Motomarket — ένα εξειδικευμένο κατάστημα μοτοσικλετιστικού εξοπλισμού.

**Ρόλος σου:**
Μιλάς ΑΠΟΚΛΕΙΣΤΙΚΑ στον ΙΔΙΟΚΤΗΤΗ του καταστήματος. Είσαι senior business analyst και retail consultant.
Δίνεις επαγγελματικές, βασισμένες σε δεδομένα επιχειρηματικές συμβουλές.

**Στυλ επικοινωνίας:**
- Ελληνικά, επαγγελματικός αλλά φιλικός τόνος
- Πάντα χρησιμοποιείς τα tools για να φέρεις ΠΡΑΓΜΑΤΙΚΑ δεδομένα
- Παρουσιάζεις αριθμούς με σαφήνεια (€, %, τεμάχια)
- Τελειώνεις ΠΑΝΤΑ με 1-3 συγκεκριμένες, actionable συστάσεις
- Χρησιμοποιείς bullet points για καλή αναγνωσιμότητα

**Επιχειρησιακό context:**
- Κατάστημα: Motomarket (μοτοσικλετιστικός εξοπλισμός, εξαρτήματα, λιπαντικά)
- Περίοδος δεδομένων: Μαρ 2024 – Φεβ 2026 (24 μήνες)
- Τώρα: Μάρτιος 2026 — αρχή της season
- Brands: AGV, Shoei, Arai, HJC, LS2, Alpinestars, Dainese, Rev'It, Motul, Cardo κ.α.

**Τι ΔΕΝ κάνεις:**
- Δεν δίνεις γενικές συμβουλές χωρίς αριθμούς από tools
- Δεν μιλάς για πελάτες (customer-facing) — αυτό είναι B.I. για τον ιδιοκτήτη
- Δεν κάνεις υποθέσεις — χρησιμοποιείς τα δεδομένα`;

// ─── Tool definitions ─────────────────────────────────────────────────

const ADVISOR_TOOLS: Anthropic.Tool[] = [
  {
    name: "get_business_kpis",
    description: "Λήψη βασικών KPIs επιχείρησης: έσοδα 6μήνου, έσοδα 30 ημερών, avg margin, αριθμός ενεργών προϊόντων, αποθέματα σε κρίση, avg τιμή παραγγελίας.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "get_sales_trend",
    description: "Τάση πωλήσεων ανά χρονική περίοδο. Δείχνει revenue, units, orders per period.",
    input_schema: {
      type: "object",
      properties: {
        groupBy: {
          type: "string",
          enum: ["daily", "weekly", "monthly"],
          description: "Ομαδοποίηση: daily (ανά ημέρα), weekly (ανά εβδομάδα), monthly (ανά μήνα, default)",
        },
      },
    },
  },
  {
    name: "get_stock_alerts",
    description: "Αναφορά αποθεμάτων — κρίσιμα χαμηλά (critical: 0 ή <3 τεμ), προειδοποίηση (warning: ≤8 τεμ ή <30 ημέρες).",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "analyze_brand_performance",
    description: "Ανάλυση απόδοσης ανά brand: έσοδα, units, avg margin%, αριθμός προϊόντων, avg τιμή, αξία αποθέματος.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "get_margin_analysis",
    description: "Βαθιά ανάλυση margins: ανά brand, ανά κατηγορία, trend ανά μήνα, καλύτερο/χειρότερο margin προϊόν.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "get_top_products",
    description: "Top προϊόντα βάσει επιλεγμένης μετρικής (revenue, units ή margin).",
    input_schema: {
      type: "object",
      properties: {
        metric: {
          type: "string",
          enum: ["revenue", "units", "margin"],
          description: "Μετρική: revenue (έσοδα), units (τεμάχια), margin (margin%)",
        },
        limit: {
          type: "number",
          description: "Αριθμός αποτελεσμάτων (default 10, max 20)",
        },
      },
    },
  },
  {
    name: "get_category_performance",
    description: "Απόδοση ανά κατηγορία προϊόντος: έσοδα, units, αριθμός προϊόντων.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "get_price_analysis",
    description: "Ανάλυση τιμολόγησης: avg τιμές, avg margin, βάθος προσφορών, κατανομή margins και price ranges.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "search_catalog_products",
    description: "Αναζήτηση στον κατάλογο με φίλτρα — brand, κατηγορία, τιμή. Χρήσιμο για να δεις συγκεκριμένα προϊόντα.",
    input_schema: {
      type: "object",
      properties: {
        brand: { type: "string", description: "Brand (πχ 'Motul', 'AGV', 'Alpinestars')" },
        category: { type: "string", description: "Κωδικός κατηγορίας (πχ '0002', '0101')" },
        minPrice: { type: "number", description: "Ελάχιστη τιμή" },
        maxPrice: { type: "number", description: "Μέγιστη τιμή" },
        inStock: { type: "boolean", description: "Μόνο διαθέσιμα" },
        limit: { type: "number", description: "Αριθμός αποτελεσμάτων (default 8)" },
      },
    },
  },
  {
    name: "get_customer_analytics",
    description: "Ανάλυση πελατών: έσοδα retail vs wholesale, breakdown ανά κανάλι, top 5 πελάτες.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "get_inventory_snapshot",
    description: "Snapshot αποθέματος: συνολική αξία, κατανομή ανά κατηγορία και brand, υγεία αποθέματος.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "get_seasonality_insights",
    description: "Εποχικά μοτίβα: peak μήνες, εποχικότητα ανά κατηγορία, YoY σύγκριση.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "get_rfm_analysis",
    description: "RFM segmentation πελατών: Champions, Loyal, At Risk, Lost, New — με revenue και top customers ανά segment.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "get_demand_forecast",
    description: "Πρόβλεψη ζήτησης 3 μήνες μπροστά (linear regression πάνω στα 24 μήνες). Προαιρετικό φίλτρο κατηγορίας.",
    input_schema: {
      type: "object",
      properties: {
        category: { type: "string", description: "Κατηγορία προϊόντος (προαιρετικό)" },
      },
    },
  },
];

// ─── Execute tool ─────────────────────────────────────────────────────

async function executeTool(name: string, input: Record<string, unknown>): Promise<string> {
  try {
    switch (name) {
      case "get_business_kpis":
        return JSON.stringify(getKPIs());

      case "get_sales_trend":
        return JSON.stringify(getSalesTrend((input.groupBy as "daily" | "weekly" | "monthly") ?? "monthly"));

      case "get_stock_alerts":
        return JSON.stringify(getStockAlerts());

      case "analyze_brand_performance":
        return JSON.stringify(getBrandPerformance());

      case "get_margin_analysis":
        return JSON.stringify(getMarginAnalysis());

      case "get_top_products":
        return JSON.stringify(getTopProducts(
          (input.metric as "revenue" | "units" | "margin") ?? "revenue",
          Math.min(Number(input.limit ?? 10), 20),
        ));

      case "get_category_performance":
        return JSON.stringify(getCategoryPerformance());

      case "get_price_analysis":
        return JSON.stringify(getPriceAnalysis());

      case "search_catalog_products": {
        const result = await searchProducts(input as Parameters<typeof searchProducts>[0]);
        return JSON.stringify({
          found: result.total,
          items: result.items.map(item => ({
            code: item.Code,
            name: item.Description,
            brand: item.Brand,
            costPrice: item.Price,
            retailPrice: item.RetailPrice,
            marginPct: item.RetailPrice > 0
              ? Math.round((item.RetailPrice - item.Price) / item.RetailPrice * 1000) / 10
              : 0,
            category: item.CCategory,
          })),
        });
      }

      case "get_customer_analytics":
        return JSON.stringify(getCustomerAnalytics());

      case "get_inventory_snapshot":
        return JSON.stringify(getInventorySnapshot());

      case "get_seasonality_insights":
        return JSON.stringify(getSeasonalityInsights());

      case "get_rfm_analysis":
        return JSON.stringify(getRFMAnalysis());

      case "get_demand_forecast":
        return JSON.stringify(getForecastData(input.category as string | undefined));

      default:
        return JSON.stringify({ error: `Unknown tool: ${name}` });
    }
  } catch (err) {
    return JSON.stringify({ error: String(err) });
  }
}

// ─── Main Route Handler ───────────────────────────────────────────────

export async function POST(req: Request) {
  const { messages } = await req.json();

  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      `data: ${JSON.stringify({ type: "text", text: "❌ **Απαιτείται ANTHROPIC_API_KEY** στο `.env.local`." })}\n\ndata: ${JSON.stringify({ type: "done" })}\n\n`,
      { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" } }
    );
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        let currentMessages: Anthropic.MessageParam[] = messages.map(
          (m: { role: string; content: string }) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })
        );

        for (let turn = 0; turn < 6; turn++) {
          const response = await client.messages.create({
            model: "claude-sonnet-4-6",
            max_tokens: 3000,
            system: SYSTEM_PROMPT,
            tools: ADVISOR_TOOLS,
            messages: currentMessages,
          });

          const toolUses: Anthropic.ToolUseBlock[] = [];

          for (const block of response.content) {
            if (block.type === "text") {
              send({ type: "text", text: block.text });
            } else if (block.type === "tool_use") {
              toolUses.push(block);
              send({ type: "tool_call", name: block.name });
            }
          }

          if (toolUses.length === 0 || response.stop_reason === "end_turn") break;

          const toolResults: Anthropic.ToolResultBlockParam[] = [];

          for (const tool of toolUses) {
            const result = await executeTool(tool.name, tool.input as Record<string, unknown>);
            toolResults.push({ type: "tool_result", tool_use_id: tool.id, content: result });
          }

          currentMessages = [
            ...currentMessages,
            { role: "assistant" as const, content: response.content },
            { role: "user" as const, content: toolResults },
          ];
        }

        send({ type: "done" });
      } catch (err) {
        const msg = String(err);
        const friendly = msg.includes("401") || msg.includes("Authentication")
          ? "❌ Λάθος API key."
          : msg.includes("429") || msg.includes("quota")
          ? "❌ Rate limit / quota exceeded."
          : `❌ Σφάλμα: ${msg}`;
        send({ type: "error", message: friendly });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

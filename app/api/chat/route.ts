import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import {
  searchProducts,
  getProduct,
  getStock,
  getCategories,
  getRecommendations,
  getCatalogStats,
} from "@/lib/erp-adapter";

// ─── Provider detection ──────────────────────────────────────────────
// Priority: explicit AI_PROVIDER env → whichever key is set → error

function getProvider(): "anthropic" | "openai" | "none" {
  const explicit = process.env.AI_PROVIDER?.toLowerCase();
  if (explicit === "openai" && process.env.OPENAI_API_KEY) return "openai";
  if (explicit === "anthropic" && process.env.ANTHROPIC_API_KEY) return "anthropic";
  // Auto-detect: prefer Anthropic if both present
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (process.env.OPENAI_API_KEY) return "openai";
  return "none";
}

// ─── Shared tool parameter definitions (provider-agnostic) ───────────

const TOOL_PARAMS = {
  search_products: {
    description: "Αναζήτηση προϊόντων στον κατάλογο. Χρησιμοποίησε το όταν ο χρήστης ρωτά για προϊόντα, ζητά προτάσεις, ή θέλει να βρει κάτι συγκεκριμένο.",
    parameters: {
      type: "object" as const,
      properties: {
        query: { type: "string", description: "Ελεύθερο κείμενο αναζήτησης (πχ 'κράνος touring', 'AGV μαύρο', 'αδιάβροχο μπουφάν')" },
        category: { type: "string", description: "Κωδικός κατηγορίας (πχ '00'=κράνη, '0002'=κλειστά, '0101'=μπουφάν, '0103'=γάντια, '0104'=μπότες)" },
        brand: { type: "string", description: "Brand (πχ 'AGV', 'Shoei', 'Alpinestars', 'Dainese')" },
        minPrice: { type: "number", description: "Ελάχιστη τιμή σε ευρώ" },
        maxPrice: { type: "number", description: "Μέγιστη τιμή σε ευρώ" },
        inStock: { type: "boolean", description: "Μόνο διαθέσιμα (true=ναι)" },
        limit: { type: "number", description: "Μέγιστος αριθμός αποτελεσμάτων (default 4, max 8)" },
      },
    },
  },
  get_product_details: {
    description: "Λεπτομέρειες για ένα συγκεκριμένο προϊόν (τιμή, περιγραφή, χαρακτηριστικά).",
    parameters: {
      type: "object" as const,
      required: ["code"],
      properties: {
        code: { type: "string", description: "Κωδικός προϊόντος (πχ 'AGV-K6S-BK')" },
      },
    },
  },
  check_stock: {
    description: "Έλεγχος διαθεσιμότητας / αποθέματος για ένα προϊόν ανά μέγεθος.",
    parameters: {
      type: "object" as const,
      required: ["code"],
      properties: {
        code: { type: "string", description: "Κωδικός προϊόντος" },
      },
    },
  },
  get_categories: {
    description: "Λίστα κατηγοριών ειδών. Χρησιμοποίησε για πλοήγηση στις κατηγορίες.",
    parameters: {
      type: "object" as const,
      properties: {
        parentCode: { type: "string", description: "Κωδικός γονικής κατηγορίας (παράλειψε για κορυφαίο επίπεδο)" },
      },
    },
  },
  get_recommendations: {
    description: "Προτάσεις / σχετικά προϊόντα για cross-selling.",
    parameters: {
      type: "object" as const,
      required: ["code"],
      properties: {
        code: { type: "string", description: "Κωδικός προϊόντος" },
      },
    },
  },
} as const;

// ─── Anthropic tool format ───────────────────────────────────────────

const ANTHROPIC_TOOLS: Anthropic.Tool[] = Object.entries(TOOL_PARAMS).map(([name, def]) => ({
  name,
  description: def.description,
  input_schema: def.parameters,
}));

// ─── OpenAI tool format ──────────────────────────────────────────────

const OPENAI_TOOLS: OpenAI.Chat.Completions.ChatCompletionTool[] = Object.entries(TOOL_PARAMS).map(([name, def]) => ({
  type: "function" as const,
  function: {
    name,
    description: def.description,
    parameters: def.parameters,
  },
}));

// ─── System Prompt ───────────────────────────────────────────────────

function buildSystemPrompt(provider: string): string {
  const stats = getCatalogStats();
  return `Είσαι ο AI βοηθός του Motomarket, ενός εξειδικευμένου καταστήματος μοτοσικλετιστικού εξοπλισμού.

**Ταυτότητα:**
- Ονομάζεσαι "Moto AI"
- Είσαι ειδικός σε κράνη, ένδυση, εξοπλισμό, αξεσουάρ και λιπαντικά μοτοσικλέτας
- Μιλάς πάντα στα Ελληνικά, φιλικά και επαγγελματικά
- Χρησιμοποιείς τεχνική γνώση αλλά εξηγείς με απλά λόγια

**Κατάλογος (${stats.mode === "mock" ? "DEMO" : "LIVE"} · ${provider.toUpperCase()}):**
- ${stats.totalItems} προϊόντα ενεργά
- ${stats.totalCategories} κατηγορίες
- ${stats.brands} brands: AGV, Shoei, HJC, Arai, Bell, Caberg, Nolan, LS2, Alpinestars, Dainese, Rev'It, Sidi, TCX, Motul, Cardo, GoPro, κ.α.

**Κανόνες λειτουργίας:**
1. Όταν ο χρήστης ρωτά για προϊόντα → χρησιμοποίησε ΠΑΝΤΑ τα tools
2. Μετά τα αποτελέσματα → δώσε προσωπική σύσταση με αιτιολόγηση
3. Σύγκρινε προϊόντα όταν σου ζητηθεί ή όταν βοηθά
4. Πρότεινε συνδυασμούς (κράνος + γάντια + μπουφάν + μπότες)
5. Αν κάτι δεν υπάρχει → πες το ειλικρινά και δώσε εναλλακτικό

**Τεχνικές γνώσεις:**
- Πιστοποιήσεις: ECE 22.06 (EU), Snell M2020, DOT (USA)
- Τύποι κρανών: Full-face, Open-face, Flip-up/Modular, ADV, MX/Enduro
- Υλικά κελύφους: Polycarbonate (entry) → Fiberglass (mid) → Carbon (premium, ελαφρύτερο)
- CE levels: Level 1 = βασικό, Level 2 = υψηλό (ζητείται για racing)
- Sizing tips: Shoei τρέχει μεγάλο, Arai = στρογγυλό εσωτερικό, AGV/HJC = οβάλ
- Brands: AGV/Arai = sport, Shoei = premium touring, HJC/LS2 = αξία, Alpinestars/Dainese = premium ένδυση

**Κατηγορίες:**
- 00=Κράνη, 0001=Ανοιχτά, 0002=Κλειστά, 0003=Flip-up, 0004=MX, 0005=ADV
- 01=Εξοπλισμός αναβάτη, 0101=Μπουφάν, 0102=Παντελόνια, 0103=Γάντια, 0104=Μπότες
- 02=Equipment, 0201=Βαλίτσες, 0203=Bluetooth
- 03=Off-Road, 04=Λιπαντικά, 05=Αξεσουάρ

${stats.mode === "mock" ? "**⚠️ DEMO:** Mock δεδομένα — Live ERP σύνδεση available όταν ενεργοποιηθεί." : ""}`;
}

// ─── Execute Tool (shared for both providers) ────────────────────────

async function executeTool(name: string, input: Record<string, unknown>): Promise<string> {
  try {
    switch (name) {
      case "search_products": {
        const result = await searchProducts(input as Parameters<typeof searchProducts>[0]);
        if (result.items.length === 0) {
          return JSON.stringify({ found: 0, message: "Δεν βρέθηκαν προϊόντα με αυτά τα κριτήρια." });
        }
        return JSON.stringify({
          found: result.total,
          showing: result.items.length,
          items: result.items.map(item => ({
            code: item.Code,
            name: item.Description,
            brand: item.Brand,
            price: item.RetailPrice,
            promoPrice: item.Price1 < item.RetailPrice ? item.Price1 : null,
            category: item.CCategory,
            sizes: item.fStockDimCode_comma_separated,
            features: item.GreekFeatures?.substring(0, 200),
          })),
        });
      }
      case "get_product_details": {
        const item = await getProduct(input.code as string);
        if (!item) return JSON.stringify({ error: "Προϊόν δεν βρέθηκε" });
        return JSON.stringify({
          code: item.Code,
          name: item.Description,
          brand: item.Brand,
          retailPrice: item.RetailPrice,
          promoPrice: item.Price1 < item.RetailPrice ? item.Price1 : null,
          category: item.CCategory,
          sizes: item.fStockDimCode_comma_separated,
          greekFeatures: item.GreekFeatures,
          relatedItems: item.RelatedItems,
        });
      }
      case "check_stock": {
        const stock = await getStock(input.code as string);
        const available = stock.sizes.filter(s => s.available > 0);
        const outOfStock = stock.sizes.filter(s => s.available === 0);
        return JSON.stringify({
          code: stock.code,
          totalAvailable: stock.totalAvailable,
          availableSizes: available.map(s => `${s.size}: ${s.available} τεμ.`),
          outOfStock: outOfStock.map(s => s.size),
        });
      }
      case "get_categories": {
        const cats = await getCategories(
          input.parentCode === undefined ? null : (input.parentCode as string | null)
        );
        return JSON.stringify(cats.map(c => ({ code: c.Code, name: c.Description })));
      }
      case "get_recommendations": {
        const recs = await getRecommendations(input.code as string);
        return JSON.stringify(recs.map(item => ({
          code: item.Code,
          name: item.Description,
          brand: item.Brand,
          price: item.RetailPrice,
        })));
      }
      default:
        return JSON.stringify({ error: `Unknown tool: ${name}` });
    }
  } catch (err) {
    return JSON.stringify({ error: String(err) });
  }
}

// ─── Anthropic agentic loop ──────────────────────────────────────────

async function runAnthropic(
  messages: { role: string; content: string }[],
  send: (data: object) => void
) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let currentMessages: Anthropic.MessageParam[] = messages.map(m => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  for (let turn = 0; turn < 5; turn++) {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: buildSystemPrompt("anthropic"),
      tools: ANTHROPIC_TOOLS,
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
    const productCodes: string[] = [];

    for (const tool of toolUses) {
      const result = await executeTool(tool.name, tool.input as Record<string, unknown>);
      toolResults.push({ type: "tool_result", tool_use_id: tool.id, content: result });

      if (tool.name === "search_products" || tool.name === "get_recommendations") {
        try {
          const parsed = JSON.parse(result);
          if (parsed.items) productCodes.push(...parsed.items.map((i: { code: string }) => i.code));
        } catch { /* ignore */ }
      }
    }

    if (productCodes.length > 0) send({ type: "products", codes: productCodes });

    currentMessages = [
      ...currentMessages,
      { role: "assistant" as const, content: response.content },
      { role: "user" as const, content: toolResults },
    ];
  }
}

// ─── OpenAI agentic loop ─────────────────────────────────────────────

async function runOpenAI(
  messages: { role: string; content: string }[],
  send: (data: object) => void
) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const systemPrompt = buildSystemPrompt("openai");

  type OAIMessage =
    | OpenAI.Chat.Completions.ChatCompletionSystemMessageParam
    | OpenAI.Chat.Completions.ChatCompletionUserMessageParam
    | OpenAI.Chat.Completions.ChatCompletionAssistantMessageParam
    | OpenAI.Chat.Completions.ChatCompletionToolMessageParam;

  let currentMessages: OAIMessage[] = [
    { role: "system", content: systemPrompt },
    ...messages.map(m => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  for (let turn = 0; turn < 5; turn++) {
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 2048,
      tools: OPENAI_TOOLS,
      tool_choice: "auto",
      messages: currentMessages,
    });

    const choice = response.choices[0];
    const msg = choice.message;

    // Stream text
    if (msg.content) {
      send({ type: "text", text: msg.content });
    }

    // No tool calls → done
    if (!msg.tool_calls || msg.tool_calls.length === 0 || choice.finish_reason === "stop") {
      break;
    }

    // Execute tools
    const productCodes: string[] = [];
    const toolResultMessages: OpenAI.Chat.Completions.ChatCompletionToolMessageParam[] = [];

    for (const tc of msg.tool_calls) {
      const toolName = tc.function.name;
      send({ type: "tool_call", name: toolName });

      let input: Record<string, unknown> = {};
      try { input = JSON.parse(tc.function.arguments); } catch { /* ignore */ }

      const result = await executeTool(toolName, input);
      toolResultMessages.push({
        role: "tool",
        tool_call_id: tc.id,
        content: result,
      });

      if (toolName === "search_products" || toolName === "get_recommendations") {
        try {
          const parsed = JSON.parse(result);
          if (parsed.items) productCodes.push(...parsed.items.map((i: { code: string }) => i.code));
        } catch { /* ignore */ }
      }
    }

    if (productCodes.length > 0) send({ type: "products", codes: productCodes });

    // Append assistant message + tool results to history
    currentMessages = [
      ...currentMessages,
      msg as OpenAI.Chat.Completions.ChatCompletionAssistantMessageParam,
      ...toolResultMessages,
    ];
  }
}

// ─── Main Route Handler ──────────────────────────────────────────────

export async function POST(req: Request) {
  const { messages } = await req.json();
  const provider = getProvider();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        if (provider === "none") {
          send({
            type: "text",
            text: "❌ **Δεν βρέθηκε API key.**\n\nΠρόσθεσε στο `.env.local`:\n```\nANTHROPIC_API_KEY=sk-ant-api03-...\n```\nή\n```\nOPENAI_API_KEY=sk-proj-...\n```\nκαι κάνε restart το `npm run dev`.",
          });
          send({ type: "done" });
          return;
        }

        send({ type: "provider", name: provider });

        if (provider === "anthropic") {
          await runAnthropic(messages, send);
        } else {
          await runOpenAI(messages, send);
        }

        send({ type: "done" });
      } catch (err) {
        const msg = String(err);
        // User-friendly error messages
        const friendly = msg.includes("401") || msg.includes("Authentication")
          ? "❌ Λάθος API key. Έλεγξε το `.env.local`."
          : msg.includes("429") || msg.includes("quota")
          ? "❌ Limit reached / quota exceeded. Δοκίμασε αργότερα."
          : msg.includes("model")
          ? "❌ Το model δεν είναι διαθέσιμο στον λογαριασμό σου."
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

"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, User, TrendingUp } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

const STARTER_QUESTIONS = [
  "Ποια brands έχουν τα καλύτερα margins;",
  "Ποια προϊόντα κινδυνεύουν να εξαντληθούν πριν τη σεζόν;",
  "Ανάλυση πελατών — ποιους να επαναπροσεγγίσω;",
  "Δείξε τα top 10 προϊόντα σε έσοδα",
  "Τι εποχικότητα έχουν οι κατηγορίες μας;",
  "Πρόβλεψη εσόδων Μαρτίου – Μαΐου 2026",
];

export default function AIAdvisorSection() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toolsInProgress, setToolsInProgress] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, toolsInProgress]);

  async function sendMessage(text: string) {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setToolsInProgress([]);

    const assistantId = crypto.randomUUID();
    let accText = "";

    // Add streaming assistant message
    setMessages(prev => [...prev, {
      id: assistantId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    }]);

    try {
      const res = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok || !res.body) throw new Error("HTTP " + res.status);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === "text") {
              accText += event.text;
              setMessages(prev => prev.map(m =>
                m.id === assistantId ? { ...m, content: accText } : m
              ));
            } else if (event.type === "tool_call") {
              setToolsInProgress(prev => [...prev, event.name]);
            } else if (event.type === "done") {
              setMessages(prev => prev.map(m =>
                m.id === assistantId ? { ...m, isStreaming: false } : m
              ));
              setToolsInProgress([]);
            } else if (event.type === "error") {
              accText = event.message;
              setMessages(prev => prev.map(m =>
                m.id === assistantId ? { ...m, content: accText, isStreaming: false } : m
              ));
            }
          } catch { /* ignore parse errors */ }
        }
      }
    } catch (err) {
      setMessages(prev => prev.map(m =>
        m.id === assistantId
          ? { ...m, content: `❌ Σφάλμα σύνδεσης: ${String(err)}`, isStreaming: false }
          : m
      ));
    } finally {
      setIsLoading(false);
      setToolsInProgress([]);
    }
  }

  const TOOL_LABELS: Record<string, string> = {
    get_business_kpis: "KPIs επιχείρησης",
    get_sales_trend: "Τάση πωλήσεων",
    get_stock_alerts: "Αποθέματα",
    analyze_brand_performance: "Απόδοση brands",
    get_margin_analysis: "Ανάλυση margins",
    get_top_products: "Top προϊόντα",
    get_category_performance: "Κατηγορίες",
    get_price_analysis: "Τιμολόγηση",
    search_catalog_products: "Αναζήτηση καταλόγου",
    get_customer_analytics: "Ανάλυση πελατών",
    get_inventory_snapshot: "Snapshot αποθέματος",
    get_seasonality_insights: "Εποχικότητα",
    get_rfm_analysis: "RFM πελατών",
    get_demand_forecast: "Πρόβλεψη ζήτησης",
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 p-6 pb-4 border-b border-[#1e1e1e]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500/20 flex items-center justify-center">
            <TrendingUp size={18} className="text-orange-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#e5e5e5]">AI Σύμβουλος Επιχείρησης</h2>
            <p className="text-xs text-[#666666]">Ανάλυση δεδομένων και επιχειρηματικές συμβουλές</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="space-y-6">
            {/* Welcome */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                <Bot size={16} className="text-orange-400" />
              </div>
              <div className="bg-[#1a1a1a] rounded-xl rounded-tl-sm px-4 py-3 max-w-lg">
                <p className="text-sm text-[#e5e5e5] leading-relaxed">
                  Γεια σου! Είμαι ο AI σύμβουλός σου για το <strong>Motomarket</strong>.
                  Έχω πρόσβαση στα δεδομένα πωλήσεων, αποθεμάτων και margins — 24 μήνες (Μαρ 2024 – Φεβ 2026).
                  Πες μου τι θέλεις να αναλύσουμε.
                </p>
              </div>
            </div>

            {/* Season Report CTA */}
            <div className="mb-4">
              <button
                onClick={() => sendMessage(`Δημιούργησε πλήρη στρατηγική αναφορά για τη σεζόν Μαρτίου–Μαΐου 2026: (1) Ποια προϊόντα/brands να παραγγείλω άμεσα και γιατί (2) Pricing strategy βάσει margin analysis (3) Ποιους πελάτες να επαναπροσεγγίσω (RFM) (4) Top 3 ευκαιρίες και top 3 κινδύνοι. Χρησιμοποίησε όλα τα διαθέσιμα tools.`)}
                className="w-full px-5 py-4 rounded-xl bg-gradient-to-r from-indigo-600/20 to-orange-500/10 border border-indigo-500/30 hover:border-indigo-500/60 hover:from-indigo-600/30 transition-all text-left group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-indigo-300 group-hover:text-indigo-200">
                    Αναφορά Σεζόν Μαρτίου–Μαΐου 2026
                  </span>
                  <span className="text-xs text-indigo-400 opacity-70">AI Report</span>
                </div>
                <p className="text-xs text-[#94A3B8]">
                  Πλήρης στρατηγική: παραγγελίες, τιμολόγηση, επαναπροσέγγιση πελατών, ευκαιρίες & κινδύνοι
                </p>
              </button>
            </div>

            {/* Starter questions */}
            <div>
              <p className="text-xs text-[#555555] mb-3 pl-11">Ή επίλεξε μια ερώτηση:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {STARTER_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    className="text-left px-4 py-3 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] hover:border-orange-500/40 hover:bg-orange-500/5 text-sm text-[#aaaaaa] hover:text-[#e5e5e5] transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              msg.role === "user"
                ? "bg-orange-500/20"
                : "bg-[#1e1e1e]"
            }`}>
              {msg.role === "user"
                ? <User size={15} className="text-orange-400" />
                : <Bot size={15} className="text-[#888888]" />
              }
            </div>
            <div className={`max-w-2xl ${msg.role === "user" ? "items-end flex flex-col" : ""}`}>
              {msg.role === "assistant" ? (
                <div className="bg-[#1a1a1a] rounded-xl rounded-tl-sm px-4 py-3">
                  <div className="prose-chat text-sm">
                    <ReactMarkdown>{msg.content || (msg.isStreaming ? "…" : "")}</ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div className="bg-orange-500/15 rounded-xl rounded-tr-sm px-4 py-3">
                  <p className="text-sm text-[#e5e5e5]">{msg.content}</p>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Tool progress */}
        {toolsInProgress.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#1e1e1e] flex items-center justify-center">
              <Loader2 size={14} className="text-orange-400 animate-spin" />
            </div>
            <div className="flex flex-wrap gap-2">
              {toolsInProgress.map((tool, i) => (
                <span key={i} className="text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-1 rounded-full">
                  {TOOL_LABELS[tool] ?? tool}
                </span>
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 p-4 border-t border-[#1e1e1e]">
        <form
          onSubmit={e => { e.preventDefault(); sendMessage(input); }}
          className="flex gap-3"
        >
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ρώτησε για πωλήσεις, margins, απόθεμα, στρατηγική..."
            disabled={isLoading}
            className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-[#e5e5e5] placeholder-[#555555] focus:outline-none focus:border-orange-500/50 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-[#f97316] hover:bg-[#ea6800] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl px-4 py-3 flex items-center gap-2 text-sm font-medium transition-colors"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </form>
        <p className="text-[10px] text-[#333333] mt-2 px-1">
          AI Advisor · Ανάλυση Μαρ 2024 – Φεβ 2026 · 24 μήνες δεδομένα demo
        </p>
      </div>
    </div>
  );
}

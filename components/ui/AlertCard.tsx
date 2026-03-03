import type { StockAlert } from "@/lib/bi-analytics";

interface AlertCardProps {
  alert: StockAlert;
}

const severityStyles = {
  critical: {
    border: "border-red-500/40",
    bg: "bg-red-500/5",
    badge: "bg-red-500/20 text-red-400",
    badgeLabel: "ΚΡΙΣΙΜΟ",
    dot: "bg-red-500",
  },
  warning: {
    border: "border-yellow-500/40",
    bg: "bg-yellow-500/5",
    badge: "bg-yellow-500/20 text-yellow-400",
    badgeLabel: "ΠΡΟΕΙΔΟΠΟΙΗΣΗ",
    dot: "bg-yellow-500",
  },
  info: {
    border: "border-blue-500/40",
    bg: "bg-blue-500/5",
    badge: "bg-blue-500/20 text-blue-400",
    badgeLabel: "ΠΛΗΡΟΦΟΡΙΑ",
    dot: "bg-blue-500",
  },
};

export default function AlertCard({ alert }: AlertCardProps) {
  const s = severityStyles[alert.severity];

  return (
    <div className={`rounded-lg border ${s.border} ${s.bg} px-4 py-3 flex items-start gap-3`}>
      <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="font-medium text-sm text-[#e5e5e5] truncate block">{alert.name}</span>
            <span className="text-xs text-[#888888]">{alert.brand} · {alert.code}</span>
          </div>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${s.badge}`}>
            {s.badgeLabel}
          </span>
        </div>
        <p className="text-xs text-[#aaaaaa] mt-1">{alert.message}</p>
        {alert.retailValue > 0 && (
          <p className="text-xs text-[#666666] mt-0.5">
            Αξία αποθέματος: <span className="text-[#888888]">€{alert.retailValue.toLocaleString("el-GR", { minimumFractionDigits: 2 })}</span>
          </p>
        )}
      </div>
    </div>
  );
}

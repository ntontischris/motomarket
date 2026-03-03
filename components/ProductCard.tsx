"use client";

import type { ERPItem } from "@/lib/types";

interface ProductCardProps {
  item: ERPItem;
  compact?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  "00": "Κράνη", "0001": "Κράνη Ανοιχτά", "0002": "Κράνη Κλειστά",
  "0003": "Κράνη Flip-Up", "0004": "Κράνη MX", "0005": "Κράνη ADV",
  "01": "Εξοπλισμός", "0101": "Μπουφάν", "0102": "Παντελόνια",
  "0103": "Γάντια", "0104": "Μπότες",
  "02": "Moto Equipment", "0201": "Βαλίτσες", "0203": "Bluetooth",
  "03": "Off-Road", "0301": "MX Κράνη", "0302": "MX Ένδυση",
  "04": "Λιπαντικά", "0401": "Λάδια", "0402": "Αλυσίδα",
  "05": "Αξεσουάρ", "0501": "Action Cameras",
};

function BrandBadge({ brand }: { brand: string }) {
  const colors: Record<string, string> = {
    AGV: "bg-red-900/40 text-red-300 border-red-800/50",
    Shoei: "bg-blue-900/40 text-blue-300 border-blue-800/50",
    HJC: "bg-purple-900/40 text-purple-300 border-purple-800/50",
    Arai: "bg-amber-900/40 text-amber-300 border-amber-800/50",
    Bell: "bg-cyan-900/40 text-cyan-300 border-cyan-800/50",
    Caberg: "bg-pink-900/40 text-pink-300 border-pink-800/50",
    Nolan: "bg-teal-900/40 text-teal-300 border-teal-800/50",
    LS2: "bg-green-900/40 text-green-300 border-green-800/50",
    Alpinestars: "bg-orange-900/40 text-orange-300 border-orange-800/50",
    Dainese: "bg-red-900/40 text-red-300 border-red-800/50",
    "Rev'It": "bg-yellow-900/40 text-yellow-300 border-yellow-800/50",
    Sidi: "bg-indigo-900/40 text-indigo-300 border-indigo-800/50",
    TCX: "bg-slate-700/40 text-slate-300 border-slate-600/50",
    Motul: "bg-sky-900/40 text-sky-300 border-sky-800/50",
    Cardo: "bg-violet-900/40 text-violet-300 border-violet-800/50",
    Scott: "bg-lime-900/40 text-lime-300 border-lime-800/50",
  };
  const cls = colors[brand] || "bg-gray-800/40 text-gray-300 border-gray-700/50";
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${cls} uppercase tracking-wide`}>
      {brand}
    </span>
  );
}

export default function ProductCard({ item, compact = false }: ProductCardProps) {
  const hasPromo = item.Price1 > 0 && item.Price1 < item.RetailPrice;
  const discount = hasPromo
    ? Math.round(((item.RetailPrice - item.Price1) / item.RetailPrice) * 100)
    : 0;
  const catLabel = CATEGORY_LABELS[item.CCategory] || item.CCategory;
  const sizes = item.fStockDimCode_comma_separated?.split(",") ?? [];

  return (
    <div className="group relative bg-surface-700 border border-surface-500 rounded-xl overflow-hidden hover:border-brand-orange/50 transition-all duration-200 hover:shadow-lg hover:shadow-brand-orange/5 animate-slide-up">
      {/* Promo badge */}
      {hasPromo && (
        <div className="absolute top-2 right-2 z-10 bg-brand-orange text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
          -{discount}%
        </div>
      )}

      {/* Image placeholder */}
      <div className="relative h-36 bg-surface-600 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-surface-600 to-surface-800" />
        <div className="relative z-10 flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-xl bg-surface-500/60 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-500">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
            </svg>
          </div>
          <span className="text-[9px] text-gray-600 font-mono">{item.Code}</span>
        </div>
      </div>

      <div className="p-3">
        {/* Category + Brand */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-[10px] text-gray-500 font-medium">{catLabel}</span>
          <span className="text-gray-700">·</span>
          <BrandBadge brand={item.Brand} />
        </div>

        {/* Name */}
        <h3 className="text-sm font-semibold text-white leading-tight mb-2 line-clamp-2 group-hover:text-brand-orange-light transition-colors">
          {item.Description}
        </h3>

        {/* Description preview */}
        {!compact && item.GreekFeatures && (
          <p className="text-[11px] text-gray-500 line-clamp-2 mb-2.5 leading-relaxed">
            {item.GreekFeatures.replace(/<[^>]*>/g, "").substring(0, 90)}…
          </p>
        )}

        {/* Sizes */}
        {sizes.length > 0 && sizes.length <= 8 && (
          <div className="flex flex-wrap gap-1 mb-2.5">
            {sizes.map(s => (
              <span key={s} className="text-[9px] px-1.5 py-0.5 rounded bg-surface-500 text-gray-400 font-medium">
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Price */}
        <div className="flex items-end justify-between mt-auto pt-2 border-t border-surface-500">
          <div>
            {hasPromo ? (
              <div className="flex items-baseline gap-1.5">
                <span className="text-brand-orange font-bold text-base">
                  €{item.Price1.toFixed(2)}
                </span>
                <span className="text-gray-600 line-through text-xs">
                  €{item.RetailPrice.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="text-white font-bold text-base">
                €{item.RetailPrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* CTA */}
          <button className="text-[11px] font-medium text-brand-orange hover:text-white hover:bg-brand-orange px-2.5 py-1 rounded-lg border border-brand-orange/40 hover:border-brand-orange transition-all duration-150">
            Λεπτομέρειες
          </button>
        </div>
      </div>
    </div>
  );
}

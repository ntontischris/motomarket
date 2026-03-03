export default function TypingIndicator({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {/* Avatar */}
      <div className="w-7 h-7 rounded-full bg-brand-orange/20 border border-brand-orange/30 flex items-center justify-center flex-shrink-0">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-brand-orange">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 px-3 py-2 bg-surface-700 rounded-2xl border border-surface-500">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-orange/70 animate-pulse-dot" style={{ animationDelay: "0ms" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-brand-orange/70 animate-pulse-dot" style={{ animationDelay: "200ms" }} />
          <span className="w-1.5 h-1.5 rounded-full bg-brand-orange/70 animate-pulse-dot" style={{ animationDelay: "400ms" }} />
        </div>
        {label && (
          <span className="text-xs text-gray-500 italic">{label}</span>
        )}
      </div>
    </div>
  );
}

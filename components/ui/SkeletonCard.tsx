export default function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-xl border border-[#2A2D3A] bg-[#1A1D27] p-4 animate-pulse ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-[#2A2D3A]" />
        <div className="h-3 w-24 bg-[#2A2D3A] rounded" />
      </div>
      <div className="h-6 w-20 bg-[#2A2D3A] rounded mb-2" />
      <div className="h-2.5 w-32 bg-[#22263A] rounded" />
    </div>
  );
}

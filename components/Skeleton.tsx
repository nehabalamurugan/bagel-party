export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        background: "rgba(253,252,247,0.92)",
        border: "1.5px dashed #3a4866",
        borderRadius: 4,
      }}
    >
      <div className="absolute inset-0 animate-pulse bg-[rgba(14,23,48,0.04)]" />
    </div>
  );
}

export function TileSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="aspect-square w-full" />
      ))}
    </div>
  );
}

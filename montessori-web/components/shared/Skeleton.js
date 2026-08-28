/**
 * Skeleton loaders — always use these, never spinners.
 * They mirror the shape of the actual content so layout doesn't jump.
 */
export function SkeletonLine({ className = '' }) {
  return <div className={`skel h-4 w-full ${className}`} aria-hidden="true" />;
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`card space-y-3 ${className}`} aria-hidden="true">
      <SkeletonLine className="w-1/2 h-5" />
      <SkeletonLine className="w-full" />
      <SkeletonLine className="w-3/4" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="space-y-2" aria-hidden="true" aria-label="Loading table data">
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonLine key={i} className="h-4 w-3/4" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="grid gap-4 py-3 border-t border-border" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, c) => (
            <SkeletonLine key={c} className={`h-4 ${c === 0 ? 'w-3/4' : 'w-1/2'}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonAvatar({ size = 'md' }) {
  const sizeClass = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-14 h-14' }[size];
  return <div className={`skel rounded-full ${sizeClass}`} aria-hidden="true" />;
}

export function SkeletonStatCard() {
  return (
    <div className="stat-card" aria-hidden="true">
      <SkeletonLine className="w-1/3 h-3" />
      <SkeletonLine className="w-1/2 h-8 mt-1" />
      <SkeletonLine className="w-2/3 h-3 mt-2" />
    </div>
  );
}

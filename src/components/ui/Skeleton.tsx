/**
 * Loading placeholder block. Compose it into the shape of the content that is
 * loading, so a section never shows stand-in data before the live data arrives.
 */
export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-lg bg-surface-container-high ${className}`} />;
}

/** Wraps a section's skeletons so screen readers announce one loading state. */
export function SkeletonGroup({ label = 'Loading live deals', className = '', children }: { label?: string; className?: string; children: React.ReactNode }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

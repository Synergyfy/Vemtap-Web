interface ProgressDotsProps {
  activeIndex: number;
  total?: number;
  label?: string;
  className?: string;
}

export function ProgressDots({
  activeIndex,
  total = 3,
  label,
  className = '',
}: ProgressDotsProps) {
  return (
    <div
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={activeIndex + 1}
      aria-label={label}
      className={`flex items-center gap-2 ${className}`}
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={
            i === activeIndex
              ? 'w-6 h-1.5 rounded-full bg-primary-container shadow-sm transition-all'
              : 'w-1.5 h-1.5 rounded-full bg-surface-container-highest transition-all'
          }
        />
      ))}
    </div>
  );
}
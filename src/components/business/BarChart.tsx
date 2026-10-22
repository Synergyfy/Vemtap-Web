import { useState } from 'react';

export interface BarDatum {
  key: string;
  label: string;
  value: number;
}

/**
 * Single-series bar chart: one brand hue, rounded data ends on a recessive
 * baseline, per-bar hover/focus tooltip. Labels are thinned to every `labelEvery`.
 */
export function BarChart({
  data,
  format,
  height = 160,
  labelEvery = 1,
  ariaLabel,
  highlightKey,
}: {
  data: BarDatum[];
  format: (value: number) => string;
  height?: number;
  labelEvery?: number;
  ariaLabel: string;
  highlightKey?: string;
}) {
  const [active, setActive] = useState<string | null>(null);
  const max = Math.max(1, ...data.map((d) => d.value));
  const activeDatum = data.find((d) => d.key === active);

  return (
    <figure className="flex flex-col gap-space-2xs" aria-label={ariaLabel}>
      <div className="h-6 font-label-sm text-label-sm text-text-secondary" aria-live="polite">
        {activeDatum ? (
          <span>
            <span className="text-text-primary font-semibold">{format(activeDatum.value)}</span> · {activeDatum.label}
          </span>
        ) : null}
      </div>
      <div className="flex items-end gap-[2px] border-b border-border-subtle" style={{ height }} onMouseLeave={() => setActive(null)}>
        {data.map((d) => (
          <button
            key={d.key}
            type="button"
            aria-label={`${d.label}: ${format(d.value)}`}
            onMouseEnter={() => setActive(d.key)}
            onFocus={() => setActive(d.key)}
            onBlur={() => setActive(null)}
            className="flex-1 h-full flex items-end group focus:outline-none"
          >
            <span
              className={`w-full rounded-t-[4px] transition-colors ${
                active === d.key || highlightKey === d.key ? 'bg-primary' : 'bg-primary-container/70 group-hover:bg-primary-container'
              }`}
              style={{ height: `${Math.max(d.value > 0 ? 2 : 0, (d.value / max) * 100)}%` }}
            />
          </button>
        ))}
      </div>
      <div className="flex gap-[2px]" aria-hidden="true">
        {data.map((d, index) => (
          <span key={d.key} className="flex-1 relative h-4">
            {index % labelEvery === 0 ? (
              <span className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap font-caption text-[10px] text-text-tertiary">{d.label}</span>
            ) : null}
          </span>
        ))}
      </div>
    </figure>
  );
}

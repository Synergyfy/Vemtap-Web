import type { ReactNode } from 'react';
import { Icon } from '../ui/Icon';

export interface ReferralStat {
  id: string;
  label: string;
  value: string;
  /** Renders next to the value, e.g. "Preview" or "Not yet available". */
  caption?: string;
  icon: string;
}

export interface ReferralStatGridProps {
  stats: ReferralStat[];
  /** Note shown under the grid — used to be explicit that figures are not live. */
  note?: ReactNode;
  /** Desktop column count, so a 5- or 6-tile grid never orphans the last tile. */
  columns?: 3 | 5 | 6;
  className?: string;
}

/**
 * Tailwind purges class names it can't see in source, so the column count is
 * mapped literally rather than interpolated.
 */
const COLUMN_CLASS: Record<3 | 5 | 6, string> = {
  3: 'lg:grid-cols-3',
  5: 'lg:grid-cols-5',
  6: 'lg:grid-cols-6',
};

/**
 * Referral overview tiles. Every value is supplied by the caller, and the
 * dashboards pass zero/empty values with the "Preview" caption — no invented
 * balances or referral counts are rendered as real activity.
 */
export function ReferralStatGrid({ stats, note, columns = 5, className = '' }: ReferralStatGridProps) {
  return (
    <section className={className}>
      <div className={`grid grid-cols-2 sm:grid-cols-3 ${COLUMN_CLASS[columns]} gap-space-xs`}>
        {stats.map((stat) => (
          <div
            key={stat.id}
            className="rounded-xl bg-surface-canvas border border-border-subtle shadow-sm p-space-sm flex flex-col gap-space-2xs min-w-0"
          >
            <span className="w-8 h-8 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center">
              <Icon name={stat.icon} className="text-[18px]" />
            </span>
            <span className="font-heading-md text-heading-md text-text-primary font-bold leading-none break-words">
              {stat.value}
            </span>
            <span className="font-caption text-caption text-text-secondary leading-snug">{stat.label}</span>
            {stat.caption && (
              <span className="font-caption text-caption text-text-tertiary leading-snug">{stat.caption}</span>
            )}
          </div>
        ))}
      </div>
      {note && (
        <p className="mt-space-xs font-caption text-caption text-text-secondary leading-relaxed flex items-start gap-space-2xs">
          <Icon name="info" className="text-[14px] text-text-tertiary shrink-0 mt-0.5" />
          <span>{note}</span>
        </p>
      )}
    </section>
  );
}

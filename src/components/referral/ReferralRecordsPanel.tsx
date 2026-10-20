import type { ReactNode } from 'react';
import { Icon } from '../ui/Icon';

/**
 * Where the referral backend will plug in. Nothing here performs a request —
 * the dashboards render `empty` because referral tracking only becomes
 * available when the programme launches.
 */
export type ReferralRecordsStatus = 'loading' | 'empty' | 'error' | 'ready';

export interface ReferralRecordRow {
  id: string;
  /** One entry per item in `headers`, aligned left-to-right. */
  cells: ReactNode[];
  /** The same record rendered as a card for the mobile layout. */
  card: ReactNode;
}

export interface ReferralRecordsPanelProps {
  title: string;
  description?: string;
  status: ReferralRecordsStatus;
  headers: string[];
  rows: ReferralRecordRow[];
  emptyIcon: string;
  emptyTitle: string;
  emptyMessage: string;
  /** Shown in the error state; omit when a retry isn't meaningful yet. */
  onRetry?: () => void;
}

function LoadingRows({ columns }: { columns: number }) {
  return (
    <div className="flex flex-col gap-space-xs" aria-hidden="true">
      {Array.from({ length: 3 }, (_, rowIndex) => (
        <div key={rowIndex} className="flex items-center gap-space-sm px-space-sm py-space-xs">
          {Array.from({ length: Math.min(columns, 5) }, (_, cellIndex) => (
            <div
              key={cellIndex}
              className={`h-3 rounded bg-surface-container animate-pulse ${
                cellIndex === 0 ? 'w-1/4' : 'w-1/6'
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Referral history panel with the three states a real integration needs:
 * loading, empty and error. Desktop renders a table, mobile renders cards.
 */
export function ReferralRecordsPanel({
  title,
  description,
  status,
  headers,
  rows,
  emptyIcon,
  emptyTitle,
  emptyMessage,
  onRetry,
}: ReferralRecordsPanelProps) {
  return (
    <section className="rounded-2xl bg-surface-canvas shadow-sm border border-border-subtle overflow-hidden">
      <header className="px-space-md py-space-sm border-b border-border-subtle">
        <h3 className="font-label-md text-label-md text-text-primary font-semibold">{title}</h3>
        {description && <p className="font-caption text-caption text-text-secondary mt-0.5">{description}</p>}
      </header>

      {status === 'loading' && (
        <div className="p-space-md">
          <LoadingRows columns={headers.length} />
          <p className="mt-space-xs font-caption text-caption text-text-tertiary">Loading referral activity…</p>
        </div>
      )}

      {status === 'error' && (
        <div className="p-space-md flex flex-col items-center gap-space-xs text-center">
          <span className="w-10 h-10 rounded-full bg-error-container text-on-error-container flex items-center justify-center">
            <Icon name="error_outline" className="text-[20px]" />
          </span>
          <p className="font-label-md text-label-md text-text-primary font-semibold">We couldn’t load your referrals</p>
          <p className="font-caption text-caption text-text-secondary max-w-sm">
            Something went wrong on our side. Your referral link above still works — try again in a moment.
          </p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-space-2xs inline-flex items-center gap-space-2xs h-10 px-space-sm rounded-xl bg-surface-container-high hover:bg-surface-container text-on-surface font-label-sm text-label-sm font-semibold transition active:scale-[0.98]"
            >
              <Icon name="refresh" className="text-[16px] text-primary" />
              <span>Try again</span>
            </button>
          )}
        </div>
      )}

      {status === 'empty' && (
        <div className="p-space-xl flex flex-col items-center gap-space-xs text-center">
          <span className="w-12 h-12 rounded-full bg-surface-subtle text-text-tertiary flex items-center justify-center">
            <Icon name={emptyIcon} className="text-[24px]" />
          </span>
          <p className="font-label-md text-label-md text-text-primary font-semibold">{emptyTitle}</p>
          <p className="font-caption text-caption text-text-secondary max-w-sm leading-relaxed">{emptyMessage}</p>
        </div>
      )}

      {status === 'ready' && rows.length === 0 && (
        <div className="p-space-xl flex flex-col items-center gap-space-xs text-center">
          <span className="w-12 h-12 rounded-full bg-surface-subtle text-text-tertiary flex items-center justify-center">
            <Icon name={emptyIcon} className="text-[24px]" />
          </span>
          <p className="font-label-md text-label-md text-text-primary font-semibold">{emptyTitle}</p>
          <p className="font-caption text-caption text-text-secondary max-w-sm leading-relaxed">{emptyMessage}</p>
        </div>
      )}

      {status === 'ready' && rows.length > 0 && (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low">
                <tr>
                  {headers.map((header) => (
                    <th
                      key={header}
                      scope="col"
                      className="px-space-sm py-space-xs font-label-sm text-label-sm text-text-secondary font-semibold whitespace-nowrap"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-surface-subtle transition-colors">
                    {row.cells.map((cell, index) => (
                      <td key={index} className="px-space-sm py-space-xs font-body-md text-body-md text-text-primary">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="md:hidden divide-y divide-border-subtle">
            {rows.map((row) => (
              <li key={row.id} className="p-space-sm">
                {row.card}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

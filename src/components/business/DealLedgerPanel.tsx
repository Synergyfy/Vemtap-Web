import { useMemo, useState } from 'react';
import { Icon } from '../ui/Icon';
import { EmptyState, ErrorState, FilterChips, LoadingRows } from './QueryStates';
import { useDealLedger } from '../../hooks/business/useDealLedger';
import { toAmount, type DealLedgerRow, type DealLedgerStatus } from '../../services/dealLedgerService';
import { formatNaira, formatRelativeTime } from '../../utils/format';
import { downloadCsv } from '../../utils/exportCsv';

type Filter = 'all' | DealLedgerStatus;

const STATUS_BADGE: Record<DealLedgerStatus, string> = {
  claimed: 'bg-surface-tint-blue text-primary',
  redeemed: 'bg-badge-discount-bg text-badge-discount-text',
  expired: 'bg-surface-container text-text-secondary',
};

const STATUS_LABEL: Record<DealLedgerStatus, string> = {
  claimed: 'Claimed',
  redeemed: 'Redeemed',
  expired: 'Expired',
};

function StatTile({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="rounded-xl bg-surface-canvas shadow-sm border border-border-subtle p-space-sm flex flex-col gap-1 min-w-0">
      <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-text-secondary">
        <Icon name={icon} className="text-[16px]" />
        {label}
      </span>
      <span className="font-heading-md text-heading-md text-text-primary font-semibold truncate">{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: DealLedgerStatus }) {
  return (
    <span className={`px-2 py-0.5 rounded-full font-label-sm text-[11px] font-semibold ${STATUS_BADGE[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}

function LedgerCard({ row }: { row: DealLedgerRow }) {
  return (
    <article className="rounded-xl bg-surface-canvas shadow-sm border border-border-subtle p-space-sm flex flex-col gap-space-2xs">
      <div className="flex items-center justify-between gap-space-xs">
        <span className="font-label-md text-label-md text-text-primary font-semibold truncate">{row.customerName}</span>
        <StatusBadge status={row.status} />
      </div>
      <span className="font-body-md text-body-md text-text-secondary truncate">{row.dealName}</span>
      <div className="flex items-center justify-between font-caption text-caption text-text-tertiary">
        <span className="font-mono">{row.claimCode}</span>
        <span>
          {row.branchName ?? '—'} · {formatRelativeTime(row.activityAt)}
        </span>
      </div>
      <div className="flex items-center justify-between pt-space-2xs border-t border-border-subtle">
        <span className="font-label-sm text-label-sm text-text-secondary">Discount {formatNaira(toAmount(row.discountGiven))}</span>
        <span className="font-label-md text-label-md text-text-primary font-semibold">{formatNaira(toAmount(row.amount))}</span>
      </div>
    </article>
  );
}

interface DealLedgerPanelProps {
  /** Scope the ledger to one deal (deal detail entry point). */
  dealGroupId?: string;
}

/** Deal redemption ledger: one row per claim, with totals over the current scope. */
export function DealLedgerPanel({ dealGroupId }: DealLedgerPanelProps) {
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const ledger = useDealLedger({ dealGroupId, status: filter === 'all' ? undefined : filter, limit: 50 });

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    const data = ledger.data?.data ?? [];
    if (!term) return data;
    return data.filter((row) =>
      [row.customerName, row.dealName, row.claimCode].some((field) => field.toLowerCase().includes(term)),
    );
  }, [ledger.data, search]);

  const totals = ledger.data?.totals;

  const handleExport = () =>
    downloadCsv(
      'deal-redemption-ledger',
      ['Claim code', 'Customer', 'Deal', 'Branch', 'Status', 'Amount', 'Discount', 'Claimed', 'Redeemed'],
      rows.map((row) => [
        row.claimCode,
        row.customerName,
        row.dealName,
        row.branchName ?? '',
        STATUS_LABEL[row.status],
        toAmount(row.amount),
        toAmount(row.discountGiven),
        row.claimedAt,
        row.redeemedAt ?? '',
      ]),
    );

  return (
    <div className="flex flex-col gap-space-lg">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-space-sm">
        <StatTile icon="confirmation_number" label="Claims" value={String(totals?.claims ?? '—')} />
        <StatTile icon="task_alt" label="Redeemed" value={String(totals?.redeemed ?? '—')} />
        <StatTile icon="event_busy" label="Expired" value={String(totals?.expired ?? '—')} />
        <StatTile icon="payments" label="Net revenue" value={totals ? formatNaira(toAmount(totals.netRevenue)) : '—'} />
        <StatTile icon="sell" label="Discount given" value={totals ? formatNaira(toAmount(totals.discountGiven)) : '—'} />
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center gap-space-sm justify-between">
        <FilterChips<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { key: 'all', label: 'All' },
            { key: 'claimed', label: 'Claimed' },
            { key: 'redeemed', label: 'Redeemed' },
            { key: 'expired', label: 'Expired' },
          ]}
        />
        <div className="flex items-center gap-space-xs">
          <label className="relative flex items-center flex-1 lg:w-72">
            <Icon name="search" className="absolute left-3 text-[18px] text-text-tertiary pointer-events-none" />
            <input
              type="search"
              aria-label="Search claims"
              placeholder="Customer, deal or code"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-lg bg-surface-container-lowest border border-border-subtle font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container/40"
            />
          </label>
          <button
            type="button"
            onClick={handleExport}
            disabled={!rows.length}
            className="h-10 px-space-sm rounded-lg bg-surface-container text-text-primary font-label-md text-label-md inline-flex items-center gap-1 disabled:opacity-50"
          >
            <Icon name="download" className="text-[18px]" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {ledger.isLoading ? (
        <LoadingRows label="Loading ledger" />
      ) : ledger.isError ? (
        <ErrorState title="Could not load the ledger" error={ledger.error} onRetry={() => ledger.refetch()} />
      ) : !rows.length ? (
        <EmptyState icon="receipt_long" title="No claims in this view" body="Claims appear here as soon as customers claim your deals." />
      ) : (
        <>
          <div className="flex flex-col gap-space-sm lg:hidden">
            {rows.map((row) => (
              <LedgerCard key={row.id} row={row} />
            ))}
          </div>
          <div className="hidden lg:block rounded-xl bg-surface-canvas shadow-sm border border-border-subtle overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low font-label-sm text-label-sm text-text-secondary">
                <tr>
                  <th className="px-space-md py-space-sm font-medium">Customer</th>
                  <th className="px-space-md py-space-sm font-medium">Deal</th>
                  <th className="px-space-md py-space-sm font-medium">Code</th>
                  <th className="px-space-md py-space-sm font-medium">Branch</th>
                  <th className="px-space-md py-space-sm font-medium">Status</th>
                  <th className="px-space-md py-space-sm font-medium text-right">Amount</th>
                  <th className="px-space-md py-space-sm font-medium text-right">Discount</th>
                  <th className="px-space-md py-space-sm font-medium text-right">Activity</th>
                </tr>
              </thead>
              <tbody className="font-body-md text-body-md">
                {rows.map((row) => (
                  <tr key={row.id} className="border-t border-border-subtle hover:bg-surface-subtle">
                    <td className="px-space-md py-space-sm">
                      <div className="flex flex-col">
                        <span className="text-text-primary font-medium">{row.customerName}</span>
                        {row.contact ? <span className="font-caption text-caption text-text-tertiary">{row.contact}</span> : null}
                      </div>
                    </td>
                    <td className="px-space-md py-space-sm text-text-primary">{row.dealName}</td>
                    <td className="px-space-md py-space-sm font-mono text-text-secondary">{row.claimCode}</td>
                    <td className="px-space-md py-space-sm text-text-secondary">{row.branchName ?? '—'}</td>
                    <td className="px-space-md py-space-sm">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-space-md py-space-sm text-right text-text-primary">{formatNaira(toAmount(row.amount))}</td>
                    <td className="px-space-md py-space-sm text-right text-text-secondary">{formatNaira(toAmount(row.discountGiven))}</td>
                    <td className="px-space-md py-space-sm text-right text-text-secondary">{formatRelativeTime(row.activityAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Icon } from '../ui/Icon';
import { EmptyState, ErrorState, FilterChips, LoadingRows } from './QueryStates';
import { ticketStore } from '../../hooks/business/usePosTicket';
import { useBusinessBranch } from '../../context/BusinessBranchContext';
import { money, personName, posService, type PosCustomer, type PosCustomerSegment } from '../../services/posService';
import { formatNaira, formatRelativeTime } from '../../utils/format';

const naira = (value?: number | string | null) => formatNaira(money(value));
const SEGMENT_LABEL: Record<PosCustomerSegment, string> = { vip: 'VIP', new: 'New', lapsed: 'Lapsed' };
const PAGE_SIZE = 20;

type Segment = 'all' | PosCustomerSegment;

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-canvas border border-border-subtle p-space-sm flex flex-col gap-0.5">
      <span className="font-caption text-caption text-text-secondary">{label}</span>
      <span className="font-heading-sm text-heading-sm text-text-primary tabular-nums">{value}</span>
    </div>
  );
}

function CustomerDetail({ id, onBack, onStartSale }: { id: string; onBack: () => void; onStartSale: (customer: PosCustomer) => void }) {
  const { activeBranchId } = useBusinessBranch();
  const detail = useQuery({ queryKey: ['pos', 'customer', id], queryFn: () => posService.customer(id) });
  const rewards = useQuery({ queryKey: ['pos', 'customer', id, 'rewards', activeBranchId ?? 'all'], queryFn: () => posService.customerRewards(id, activeBranchId), retry: false });

  if (detail.isLoading) return <LoadingRows rows={4} label="Loading customer" />;
  if (detail.isError || !detail.data) return <ErrorState title="Could not load this customer" error={detail.error} onRetry={() => detail.refetch()} />;
  const c = detail.data;

  return (
    <div className="flex flex-col gap-space-lg max-w-3xl">
      <button type="button" onClick={onBack} className="self-start inline-flex items-center gap-1 font-label-md text-label-md text-primary">
        <Icon name="arrow_back" className="text-[18px]" /> All customers
      </button>

      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
        <div className="flex flex-col gap-0.5 min-w-0">
          <h2 className="font-heading-md text-heading-md text-text-primary truncate">{personName(c, 'Customer')}</h2>
          <span className="font-body-md text-body-md text-text-secondary">{[c.phone, c.email].filter(Boolean).join(' · ') || 'No contact details'}</span>
        </div>
        <button
          type="button"
          onClick={() => onStartSale(c)}
          className="h-11 px-space-md rounded-xl bg-primary-container text-on-primary font-label-md text-label-md inline-flex items-center gap-space-2xs shrink-0"
        >
          <Icon name="point_of_sale" className="text-[18px]" /> Start sale for {c.firstName || 'customer'}
        </button>
      </section>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm">
        <Stat label="Visits" value={String(c.totalVisits ?? 0)} />
        <Stat label="Total spent" value={naira(c.totalSpent)} />
        <Stat label="Average order" value={naira(c.averageOrderValue)} />
        <Stat label="Points" value={`${(c.pointsBalance ?? 0).toLocaleString()}${c.tier ? ` · ${c.tier}` : ''}`} />
      </div>

      <section className="flex flex-col gap-space-xs">
        <h3 className="font-label-md text-label-md text-text-primary font-semibold">Rewards they can redeem</h3>
        {rewards.isLoading ? <LoadingRows rows={1} label="Loading rewards" /> : null}
        {rewards.isError ? <span className="font-body-md text-body-md text-text-secondary">Rewards are not available for this customer.</span> : null}
        {rewards.data && !rewards.data.data.length ? (
          <span className="font-body-md text-body-md text-text-secondary">No active rewards at this business.</span>
        ) : null}
        <ul className="flex flex-col gap-space-xs">
          {rewards.data?.data.map((reward) => (
            <li key={reward.id} className="rounded-xl bg-surface-canvas border border-border-subtle px-space-md py-space-sm flex items-center justify-between gap-space-sm">
              <span className="flex flex-col min-w-0">
                <span className="font-label-md text-label-md text-text-primary truncate">{reward.name}</span>
                <span className="font-caption text-caption text-text-secondary">{reward.pointsRequired.toLocaleString()} points</span>
              </span>
              <span
                className={`shrink-0 px-space-xs py-0.5 rounded-full font-caption text-caption ${
                  reward.affordable ? 'bg-badge-discount-bg text-badge-discount-text' : 'bg-surface-container text-text-secondary'
                }`}
              >
                {reward.affordable ? 'Can redeem' : `${reward.pointsShort.toLocaleString()} short`}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-space-xs">
        <h3 className="font-label-md text-label-md text-text-primary font-semibold">Recent purchases</h3>
        {c.recentPurchases.length ? (
          <ul className="flex flex-col gap-space-xs">
            {c.recentPurchases.map((purchase) => (
              <li key={purchase.id} className="rounded-xl bg-surface-canvas border border-border-subtle px-space-md py-space-sm flex items-center justify-between gap-space-sm">
                <span className="flex flex-col min-w-0">
                  <span className="font-label-md text-label-md text-text-primary truncate">{purchase.itemNames.join(', ') || `${purchase.items} items`}</span>
                  <span className="font-caption text-caption text-text-secondary">
                    {formatRelativeTime(purchase.date)}
                    {purchase.receipt ? ` · #${purchase.receipt}` : ''}
                  </span>
                </span>
                <span className="font-label-md text-label-md text-text-primary tabular-nums shrink-0">{naira(purchase.total)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <span className="font-body-md text-body-md text-text-secondary">No completed POS purchases yet.</span>
        )}
      </section>
    </div>
  );
}

/**
 * Customers who have bought at this business through the POS: find one by
 * name, phone or email, see their history and rewards, and start a sale for
 * them so the sale earns them points.
 */
export function PosCustomersPanel({ onStartSale }: { onStartSale: () => void }) {
  const { activeBranchId } = useBusinessBranch();
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [segment, setSegment] = useState<Segment>('all');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebounced(search.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const list = useQuery({
    queryKey: ['pos', 'customer-page', debounced, segment, page, activeBranchId ?? 'all'],
    queryFn: () =>
      posService.customerPage({
        search: debounced || undefined,
        segment: segment === 'all' ? undefined : segment,
        branchId: activeBranchId,
        page,
        limit: PAGE_SIZE,
      }),
    placeholderData: (prev) => prev,
  });

  const startSale = (customer: PosCustomer) => {
    ticketStore.patch({ customer: { id: customer.id, name: personName(customer) } });
    onStartSale();
  };

  if (selected) return <CustomerDetail id={selected} onBack={() => setSelected(null)} onStartSale={startSale} />;

  const counts = list.data?.segmentCounts;
  const totalPages = list.data ? Math.max(1, Math.ceil(list.data.total / PAGE_SIZE)) : 1;

  return (
    <div className="flex flex-col gap-space-md max-w-3xl">
      <label className="relative">
        <span className="sr-only">Search customers</span>
        <Icon name="search" className="absolute left-space-sm top-1/2 -translate-y-1/2 text-[20px] text-text-tertiary" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Name, phone or email"
          className="w-full h-11 rounded-lg border border-border-subtle bg-surface-canvas pl-10 pr-space-sm font-body-md text-body-md"
        />
      </label>
      <FilterChips<Segment>
        options={[
          { key: 'all', label: 'All', count: counts?.all },
          { key: 'vip', label: 'VIP', count: counts?.vip },
          { key: 'new', label: 'New', count: counts?.new },
          { key: 'lapsed', label: 'Lapsed', count: counts?.lapsed },
        ]}
        value={segment}
        onChange={(next) => {
          setSegment(next);
          setPage(1);
        }}
      />

      {list.isLoading ? <LoadingRows rows={4} label="Loading customers" /> : null}
      {list.isError ? <ErrorState title="Could not load customers" error={list.error} onRetry={() => list.refetch()} /> : null}
      {list.data && !list.data.data.length ? (
        <EmptyState
          icon="person_search"
          title={debounced || segment !== 'all' ? 'No matching customers' : 'No POS customers yet'}
          body={debounced || segment !== 'all' ? 'Try another name, number or filter.' : 'Add a customer to a sale at the register and they appear here.'}
        />
      ) : null}

      <ul className="flex flex-col gap-space-xs">
        {list.data?.data.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => setSelected(c.id)}
              className="w-full rounded-xl bg-surface-canvas border border-border-subtle hover:border-primary/40 px-space-md py-space-sm flex items-center justify-between gap-space-sm text-left"
            >
              <span className="flex flex-col min-w-0">
                <span className="font-label-md text-label-md text-text-primary truncate">
                  {personName(c, 'Customer')}
                  {c.segments?.map((s) => (
                    <span key={s} className="ml-space-2xs align-middle px-1.5 py-0.5 rounded-full bg-surface-tint-blue text-primary font-caption text-caption">
                      {SEGMENT_LABEL[s]}
                    </span>
                  ))}
                </span>
                <span className="font-caption text-caption text-text-secondary">
                  {c.totalVisits ?? 0} visits{c.lastVisitAt ? ` · last ${formatRelativeTime(c.lastVisitAt)}` : ''}
                  {c.phone ? ` · ${c.phone}` : ''}
                </span>
              </span>
              <span className="flex flex-col items-end shrink-0">
                <span className="font-label-md text-label-md text-text-primary tabular-nums">{naira(c.totalSpent)}</span>
                <span className="font-caption text-caption text-text-secondary">{(c.pointsBalance ?? 0).toLocaleString()} pts</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="h-10 px-space-sm rounded-lg border border-border-subtle font-label-sm text-label-sm disabled:opacity-40">
            Previous
          </button>
          <span className="font-caption text-caption text-text-secondary">
            Page {page} of {totalPages}
          </span>
          <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="h-10 px-space-sm rounded-lg border border-border-subtle font-label-sm text-label-sm disabled:opacity-40">
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}

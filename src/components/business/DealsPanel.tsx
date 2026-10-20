import { useState } from 'react';
import { Icon } from '../ui/Icon';
import { EmptyState, ErrorState, FilterChips, LoadingRows } from './QueryStates';
import { useOfferMutations, useOfferSummary, useOffers } from '../../hooks/business/useOffers';
import type { BusinessOffer } from '../../services/offersService';
import { apiErrorMessage } from '../../services/errorMessages';
import { formatNaira } from '../../utils/format';

type Filter = 'all' | 'active' | 'inactive' | 'ended';

const isEnded = (offer: BusinessOffer) => Boolean(offer.endDate && new Date(offer.endDate).getTime() < Date.now());
const shortDate = (iso?: string | null) => (iso ? new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }) : null);

function DealRow({ offer, onBoost, onOpenLedger }: { offer: BusinessOffer; onBoost?: (name: string) => void; onOpenLedger?: () => void }) {
  const { setStatus, remove } = useOfferMutations();
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const active = offer.status === 'active' && !isEnded(offer);
  const claimed = offer.claimedCount ?? 0;
  const cap = offer.maxClaims ?? offer.quantity ?? 0;
  const window = [shortDate(offer.startDate), shortDate(offer.endDate) ?? 'no end date'].filter(Boolean).join(' → ');

  return (
    <li className="rounded-xl bg-surface-canvas border border-border-subtle shadow-sm p-space-md flex flex-col gap-space-sm">
      <div className="flex items-start gap-space-sm">
        {offer.mainImage ? (
          <img src={offer.mainImage} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
        ) : (
          <span className="w-14 h-14 rounded-lg bg-badge-discount-bg text-badge-discount-text flex items-center justify-center shrink-0">
            <Icon name="local_offer" className="text-[24px]" />
          </span>
        )}
        <div className="flex flex-col flex-1 min-w-0 gap-0.5">
          <div className="flex items-center gap-space-xs flex-wrap">
            <span className="font-label-md text-label-md text-text-primary font-semibold truncate">{offer.name}</span>
            <span
              className={`px-2 py-0.5 rounded-full font-label-sm text-[11px] font-semibold ${
                active ? 'bg-badge-discount-bg text-badge-discount-text' : 'bg-surface-container text-text-secondary'
              }`}
            >
              {isEnded(offer) ? 'Ended' : active ? 'Live' : 'Paused'}
            </span>
          </div>
          <span className="font-caption text-caption text-text-secondary">{window}</span>
          <span className="font-label-sm text-label-sm text-text-primary">
            {offer.calculatedPrice !== null && offer.calculatedPrice !== undefined ? formatNaira(offer.calculatedPrice) : '—'}
            {offer.originalPrice ? <span className="text-text-tertiary line-through ml-1">{formatNaira(offer.originalPrice)}</span> : null}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-space-xs">
        {[
          { label: 'Claimed', value: cap ? `${claimed} / ${cap}` : String(claimed) },
          { label: 'Redeemed', value: String(offer.redeemedCount ?? 0) },
          { label: 'Views', value: String(offer.views ?? 0) },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg bg-surface-subtle px-space-sm py-space-xs flex flex-col">
            <span className="font-caption text-caption text-text-secondary">{stat.label}</span>
            <span className="font-label-md text-label-md text-text-primary font-semibold">{stat.value}</span>
          </div>
        ))}
      </div>
      {cap ? (
        <div className="h-1.5 rounded-full bg-surface-container-low overflow-hidden" aria-label={`${claimed} of ${cap} claimed`}>
          <div className="h-full rounded-full bg-primary-container" style={{ width: `${Math.min(100, Math.round((claimed / cap) * 100))}%` }} />
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-space-xs pt-space-2xs border-t border-border-subtle">
        {!isEnded(offer) ? (
          <button
            type="button"
            disabled={setStatus.isPending}
            onClick={() => setStatus.mutate({ id: offer.id, status: active ? 'inactive' : 'active' }, { onError: (e) => setError(apiErrorMessage(e)) })}
            className="h-9 px-space-sm rounded-lg bg-surface-container font-label-md text-label-md disabled:opacity-50"
          >
            {active ? 'Pause' : 'Resume'}
          </button>
        ) : null}
        {onBoost && active ? (
          <button type="button" onClick={() => onBoost(offer.name)} className="h-9 px-space-sm rounded-lg text-primary font-label-md text-label-md hover:bg-surface-tint-blue">
            Boost
          </button>
        ) : null}
        {onOpenLedger ? (
          <button type="button" onClick={onOpenLedger} className="h-9 px-space-sm rounded-lg text-text-secondary font-label-md text-label-md hover:bg-surface-container">
            Claims
          </button>
        ) : null}
        {confirm ? (
          <span className="ml-auto flex items-center gap-space-xs">
            <button
              type="button"
              disabled={remove.isPending}
              onClick={() => remove.mutate(offer.id, { onError: (e) => setError(apiErrorMessage(e)) })}
              className="h-9 px-space-sm rounded-lg bg-error text-on-error font-label-md text-label-md"
            >
              Delete deal
            </button>
            <button type="button" onClick={() => setConfirm(false)} className="h-9 px-space-sm rounded-lg font-label-md text-label-md">
              Cancel
            </button>
          </span>
        ) : (
          <button type="button" onClick={() => setConfirm(true)} className="h-9 px-space-sm rounded-lg text-red-600 font-label-md text-label-md ml-auto">
            Delete
          </button>
        )}
      </div>
      {error ? <span className="font-caption text-caption text-red-600">{error}</span> : null}
    </li>
  );
}

/** Live deals at the active branch, with today's claim numbers. */
export function DealsPanel({ onCreate, onBoost, onOpenLedger }: { onCreate: () => void; onBoost?: (name: string) => void; onOpenLedger?: () => void }) {
  const offers = useOffers();
  const summary = useOfferSummary();
  const [filter, setFilter] = useState<Filter>('all');
  const rows = (offers.data ?? []).filter((o) =>
    filter === 'all' ? true : filter === 'ended' ? isEnded(o) : filter === 'active' ? o.status === 'active' && !isEnded(o) : o.status !== 'active' && !isEnded(o),
  );
  const s = summary.data;

  return (
    <div className="flex flex-col gap-space-lg">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-sm">
        {[
          { label: 'Live deals', value: s ? String(s.activeDeals) : '—' },
          { label: 'Claims today', value: s ? String(s.claimsToday) : '—' },
          { label: 'Redeemed today', value: s ? String(s.redeemedToday) : '—' },
          { label: 'Net revenue (30d)', value: s ? formatNaira(s.netRevenue30d) : '—' },
        ].map((tile) => (
          <div key={tile.label} className="rounded-xl bg-surface-canvas border border-border-subtle shadow-sm p-space-sm flex flex-col">
            <span className="font-label-sm text-label-sm text-text-secondary">{tile.label}</span>
            <span className="font-heading-md text-heading-md text-text-primary font-semibold">{tile.value}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-space-sm">
        <FilterChips<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { key: 'all', label: 'All' },
            { key: 'active', label: 'Live' },
            { key: 'inactive', label: 'Paused' },
            { key: 'ended', label: 'Ended' },
          ]}
        />
        <button type="button" onClick={onCreate} className="h-10 px-space-md rounded-lg bg-primary-container text-on-primary font-label-md text-label-md inline-flex items-center gap-1">
          <Icon name="add" className="text-[18px]" /> Create deal
        </button>
      </div>
      {offers.isLoading ? (
        <LoadingRows rows={3} label="Loading deals" />
      ) : offers.isError ? (
        <ErrorState title="Could not load deals" error={offers.error} onRetry={() => offers.refetch()} />
      ) : !rows.length ? (
        <EmptyState icon="local_offer" title="No deals here" body="Create a deal on one of your products or services to bring customers in." />
      ) : (
        <ul className="grid grid-cols-1 xl:grid-cols-2 gap-space-md">
          {rows.map((offer) => (
            <DealRow key={offer.id} offer={offer} onBoost={onBoost} onOpenLedger={onOpenLedger} />
          ))}
        </ul>
      )}
    </div>
  );
}

import { useState } from 'react';
import { Icon } from '../../ui/Icon';
import { EmptyState, ErrorState, FilterChips, LoadingRows } from '../QueryStates';
import { ReferralRow } from './NetworkShared';
import { useReferrals } from '../../../hooks/business/useBusinessNetwork';
import type { ReferralStatusFilter } from '../../../services/businessNetworkService';

/** Every business that signed up with this business's code. */
export function ReferralsPanel({ onOpenReferral }: { onOpenReferral: (id: string) => void }) {
  const [status, setStatus] = useState<ReferralStatusFilter>('all');
  const [search, setSearch] = useState('');
  const referrals = useReferrals(status, search.trim());
  const counts = referrals.data?.meta.statusCounts;

  return (
    <div className="flex flex-col gap-space-md max-w-4xl">
      <div className="flex flex-col lg:flex-row lg:items-center gap-space-sm justify-between">
        <FilterChips<ReferralStatusFilter>
          value={status}
          onChange={setStatus}
          options={[
            { key: 'all', label: 'All', count: counts?.all },
            { key: 'verified', label: 'Verified', count: counts?.verified },
            { key: 'pending', label: 'In review', count: counts?.pending },
            { key: 'registered', label: 'Registered', count: counts?.registered },
            { key: 'notQualified', label: 'Not qualified', count: counts?.notQualified },
          ]}
        />
        <label className="relative flex items-center lg:w-64">
          <Icon name="search" className="absolute left-3 text-[18px] text-text-tertiary pointer-events-none" />
          <input
            type="search"
            aria-label="Search referrals"
            placeholder="Search by name"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-lg bg-surface-container-lowest border border-border-subtle font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container/40"
          />
        </label>
      </div>

      {referrals.isLoading ? (
        <LoadingRows label="Loading referrals" />
      ) : referrals.isError ? (
        <ErrorState title="Could not load referrals" error={referrals.error} onRetry={() => referrals.refetch()} />
      ) : !referrals.data?.data.length ? (
        <EmptyState icon="diversity_3" title="No referrals here" body="Businesses that join with your code appear in this list." />
      ) : (
        <div className="rounded-xl bg-surface-canvas shadow-sm border border-border-subtle p-space-xs flex flex-col">
          {referrals.data.data.map((referral) => (
            <ReferralRow key={referral.id} referral={referral} onOpen={onOpenReferral} />
          ))}
        </div>
      )}
    </div>
  );
}

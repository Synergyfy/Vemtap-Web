import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Icon } from '../ui/Icon';
import { ErrorState, LoadingRows } from './QueryStates';
import { SettingsSection, TextField } from './FormPrimitives';
import { BarChart } from './BarChart';
import { offersService } from '../../services/offersService';
import { apiErrorMessage } from '../../services/errorMessages';
import { formatNaira } from '../../utils/format';

const n = (value?: number | string | null) => Number(value) || 0;
const dealKeys = { stats: (id: string) => ['deal-group-stats', id] as const };

/**
 * Live performance of one deal across every branch that runs it, with
 * group-wide pause/resume and simple edits.
 */
export function DealDetailPanel({
  dealGroupId,
  onOpenLedger,
  onBoost,
}: {
  dealGroupId: string;
  onOpenLedger?: () => void;
  onBoost?: (name: string) => void;
}) {
  const queryClient = useQueryClient();
  const stats = useQuery({ queryKey: dealKeys.stats(dealGroupId), queryFn: () => offersService.groupStats(dealGroupId) });
  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: dealKeys.stats(dealGroupId) });
    void queryClient.invalidateQueries({ queryKey: ['offers'] });
  };
  const setStatus = useMutation({ mutationFn: (status: 'active' | 'inactive') => offersService.setGroupStatus(dealGroupId, status), onSuccess: refresh });
  const [editing, setEditing] = useState(false);
  const [endDate, setEndDate] = useState('');
  const [quantity, setQuantity] = useState('');
  const update = useMutation({
    mutationFn: () =>
      offersService.updateGroup(dealGroupId, {
        ...(endDate ? { endDate: new Date(`${endDate}T23:59:59`).toISOString() } : {}),
        ...(quantity ? { quantity: Math.max(1, Math.round(Number(quantity))) } : {}),
      }),
    onSuccess: () => {
      setEditing(false);
      refresh();
    },
  });

  if (stats.isLoading) return <LoadingRows rows={4} label="Loading deal performance" />;
  if (stats.isError || !stats.data) return <ErrorState title="Could not load this deal" error={stats.error} onRetry={() => stats.refetch()} />;
  const s = stats.data;
  const active = s.status === 'active';
  const rate = Math.round(n(s.redemptionRate) * 100);
  const series = (s.series ?? []).map((p) => ({
    key: p.date,
    label: new Date(`${p.date}T00:00:00`).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }),
    value: n(p.claims),
  }));

  return (
    <div className="flex flex-col gap-space-lg max-w-5xl">
      <div className="flex flex-wrap items-start justify-between gap-space-sm">
        <div className="flex flex-col">
          <span className="font-heading-md text-heading-md text-text-primary">{s.name}</span>
          <span className="font-caption text-caption text-text-secondary">
            <span className={`inline-block w-2 h-2 rounded-full mr-1 ${active ? 'bg-badge-discount-text' : 'bg-text-tertiary'}`} />
            {active ? 'Live' : 'Paused'}
            {s.daysLeft !== null && s.daysLeft !== undefined ? ` · ${s.daysLeft} days left` : ' · no end date'}
            {s.quantity ? ` · ${s.remaining ?? 0} of ${s.quantity} vouchers left` : ''}
          </span>
        </div>
        <div className="flex flex-wrap gap-space-xs">
          <button
            type="button"
            disabled={setStatus.isPending}
            onClick={() => setStatus.mutate(active ? 'inactive' : 'active')}
            className="h-10 px-space-md rounded-lg bg-surface-container font-label-md text-label-md inline-flex items-center gap-1 disabled:opacity-50"
          >
            <Icon name={active ? 'pause' : 'play_arrow'} className="text-[18px]" /> {active ? 'Pause everywhere' : 'Resume everywhere'}
          </button>
          <button type="button" onClick={() => setEditing((v) => !v)} className="h-10 px-space-md rounded-lg bg-surface-container font-label-md text-label-md inline-flex items-center gap-1">
            <Icon name="edit" className="text-[18px]" /> Edit
          </button>
          {onOpenLedger ? (
            <button type="button" onClick={onOpenLedger} className="h-10 px-space-md rounded-lg bg-surface-container font-label-md text-label-md inline-flex items-center gap-1">
              <Icon name="receipt_long" className="text-[18px]" /> Claims
            </button>
          ) : null}
          {onBoost && active ? (
            <button type="button" onClick={() => onBoost(s.name)} className="h-10 px-space-md rounded-lg bg-primary-container text-on-primary font-label-md text-label-md inline-flex items-center gap-1">
              <Icon name="rocket_launch" className="text-[18px]" /> Boost
            </button>
          ) : null}
        </div>
      </div>
      {setStatus.isError ? <span className="font-caption text-caption text-red-600">{apiErrorMessage(setStatus.error)}</span> : null}

      {editing ? (
        <SettingsSection title="Edit at every branch" icon="edit">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
            <TextField id="deal-end" label="End date" type="date" value={endDate} onChange={setEndDate} hint="Leave empty to keep the current date" />
            <TextField id="deal-qty" label="Total vouchers" inputMode="numeric" value={quantity} onChange={setQuantity} hint={s.quantity ? `Currently ${s.quantity}` : 'Currently unlimited'} />
          </div>
          {update.isError ? <span className="font-caption text-caption text-red-600">{apiErrorMessage(update.error, 'Could not update the deal.')}</span> : null}
          <div className="flex gap-space-xs justify-end">
            <button type="button" onClick={() => setEditing(false)} className="h-10 px-space-md rounded-lg bg-surface-container font-label-md text-label-md">
              Cancel
            </button>
            <button
              type="button"
              disabled={update.isPending || (!endDate && !quantity)}
              onClick={() => update.mutate()}
              className="h-10 px-space-md rounded-lg bg-primary-container text-on-primary font-label-md text-label-md disabled:opacity-50"
            >
              {update.isPending ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </SettingsSection>
      ) : null}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-space-sm">
        {[
          { label: 'Views', value: n(s.views).toLocaleString('en-NG') },
          { label: 'Saves', value: n(s.saves).toLocaleString('en-NG') },
          { label: 'Claims', value: n(s.claims).toLocaleString('en-NG') },
          { label: 'Redeemed', value: `${n(s.redeemed).toLocaleString('en-NG')} · ${rate}%` },
          { label: 'Revenue', value: formatNaira(n(s.revenue)) },
          { label: 'Discount given', value: formatNaira(n(s.discountGiven)) },
          { label: 'Waiting to redeem', value: n(s.activeUnclaimed).toLocaleString('en-NG') },
          { label: 'Expired unused', value: n(s.expired).toLocaleString('en-NG') },
        ].map((tile) => (
          <div key={tile.label} className="rounded-xl bg-surface-canvas border border-border-subtle shadow-sm p-space-sm flex flex-col">
            <span className="font-label-sm text-label-sm text-text-secondary">{tile.label}</span>
            <span className="font-heading-md text-heading-md text-text-primary font-semibold">{tile.value}</span>
          </div>
        ))}
      </div>

      <SettingsSection title="Claims per day" icon="bar_chart">
        {series.some((p) => p.value > 0) ? (
          <BarChart data={series} format={(v) => `${v} claims`} ariaLabel="Claims per day" labelEvery={Math.max(1, Math.ceil(series.length / 8))} />
        ) : (
          <span className="font-caption text-caption text-text-secondary">No claims yet. They appear here day by day.</span>
        )}
      </SettingsSection>

      {(s.byBranch ?? []).length ? (
        <SettingsSection title="By branch" icon="store">
          <ul className="flex flex-col divide-y divide-border-subtle">
            {(s.byBranch ?? []).map((b) => (
              <li key={b.offerId} className="py-space-xs flex items-center justify-between gap-space-sm">
                <span className="flex flex-col min-w-0">
                  <span className="font-label-md text-label-md text-text-primary truncate">{b.branchName ?? 'Branch'}</span>
                  <span className="font-caption text-caption text-text-secondary capitalize">{b.status === 'active' ? 'Live' : b.status}</span>
                </span>
                <span className="font-caption text-caption text-text-secondary shrink-0">
                  {n(b.claims)} claims · {n(b.redeemed)} redeemed · {formatNaira(n(b.revenue))}
                </span>
              </li>
            ))}
          </ul>
        </SettingsSection>
      ) : null}
    </div>
  );
}

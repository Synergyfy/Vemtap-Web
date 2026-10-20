import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Icon } from '../ui/Icon';
import { EmptyState, ErrorState, LoadingRows } from './QueryStates';
import { TextField } from './FormPrimitives';
import { useBusinessBranch } from '../../context/BusinessBranchContext';
import { segmentsService } from '../../services/segmentsService';
import type { SegmentCriteria } from '../../services/types';
import { apiErrorMessage } from '../../services/errorMessages';
import { planErrorMessage } from '../../services/planErrors';

const segmentKeys = { all: ['live-segments'] as const };

const num = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : undefined;
};

/** Readable summary of a segment's rules. */
function describe(criteria?: SegmentCriteria | null) {
  if (!criteria) return 'Everyone';
  const parts: string[] = [];
  if (criteria.recency?.visitedWithinDays) parts.push(`visited in the last ${criteria.recency.visitedWithinDays} days`);
  if (criteria.recency?.notVisitedForDays) parts.push(`not seen for ${criteria.recency.notVisitedForDays}+ days`);
  if (criteria.recency?.minVisits) parts.push(`${criteria.recency.minVisits}+ visits`);
  if (criteria.spend?.minTotal) parts.push(`spent ₦${criteria.spend.minTotal.toLocaleString('en-NG')}+`);
  if (criteria.loyalty?.minPoints) parts.push(`${criteria.loyalty.minPoints}+ points`);
  return parts.length ? parts.join(' · ') : 'Everyone';
}

function CreateSegmentForm({ onDone }: { onDone: () => void }) {
  const { activeBranchId } = useBusinessBranch();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [visitedWithin, setVisitedWithin] = useState('');
  const [notSeenFor, setNotSeenFor] = useState('');
  const [minVisits, setMinVisits] = useState('');
  const [minSpend, setMinSpend] = useState('');
  const [minPoints, setMinPoints] = useState('');
  const [error, setError] = useState<string | null>(null);

  const criteria: SegmentCriteria = {};
  const recency = { visitedWithinDays: num(visitedWithin), notVisitedForDays: num(notSeenFor), minVisits: num(minVisits) };
  if (Object.values(recency).some(Boolean)) criteria.recency = JSON.parse(JSON.stringify(recency));
  if (num(minSpend)) criteria.spend = { minTotal: num(minSpend) };
  if (num(minPoints)) criteria.loyalty = { minPoints: num(minPoints) as number };
  const criteriaKey = JSON.stringify(criteria);

  // Live reach estimate, recomputed shortly after the rules stop changing.
  const [debouncedKey, setDebouncedKey] = useState(criteriaKey);
  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedKey(criteriaKey), 400);
    return () => window.clearTimeout(id);
  }, [criteriaKey]);
  const reach = useQuery({ queryKey: ['segment-preview', debouncedKey], queryFn: () => segmentsService.preview({ criteria: JSON.parse(debouncedKey) }) });

  const create = useMutation({
    mutationFn: () => segmentsService.create({ name: name.trim(), branchId: activeBranchId, type: 'dynamic', criteria }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: segmentKeys.all });
      onDone();
    },
    onError: (e) => setError(planErrorMessage(e) ?? apiErrorMessage(e, 'Could not create the segment.')),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return setError('Give the segment a name.');
    setError(null);
    create.mutate();
  };

  return (
    <form onSubmit={submit} noValidate className="rounded-xl bg-surface-canvas border border-primary/30 p-space-md flex flex-col gap-space-sm">
      <h3 className="font-heading-sm text-heading-sm text-text-primary">New segment</h3>
      {error ? (
        <p role="alert" className="rounded-lg bg-error-container text-on-error-container px-space-sm py-space-xs font-caption text-caption">
          {error}
        </p>
      ) : null}
      <TextField id="seg-name" label="Name" value={name} onChange={setName} placeholder="e.g. Weekend regulars" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
        <TextField id="seg-visited" label="Visited within (days)" inputMode="numeric" value={visitedWithin} onChange={setVisitedWithin} />
        <TextField id="seg-notseen" label="Not seen for (days)" inputMode="numeric" value={notSeenFor} onChange={setNotSeenFor} />
        <TextField id="seg-visits" label="At least (visits)" inputMode="numeric" value={minVisits} onChange={setMinVisits} />
        <TextField id="seg-spend" label="Spent at least (₦)" inputMode="numeric" value={minSpend} onChange={setMinSpend} />
        <TextField id="seg-points" label="Points at least" inputMode="numeric" value={minPoints} onChange={setMinPoints} />
      </div>
      <div className="rounded-lg bg-surface-tint-blue p-space-sm flex flex-wrap items-center gap-space-md font-label-sm text-label-sm text-primary" aria-live="polite">
        <span className="inline-flex items-center gap-1">
          <Icon name="groups" className="text-[18px]" />
          {reach.data ? `${reach.data.size} customers match` : reach.isError ? 'Could not estimate reach' : 'Estimating…'}
        </span>
        {reach.data ? (
          <span className="text-text-secondary">
            Push {reach.data.reachableByPush ?? 0} · SMS {reach.data.reachableBySms ?? 0} · Email {reach.data.reachableByEmail ?? 0}
          </span>
        ) : null}
      </div>
      <div className="flex gap-space-xs justify-end">
        <button type="button" onClick={onDone} className="h-10 px-space-md rounded-lg bg-surface-container font-label-md text-label-md">
          Cancel
        </button>
        <button type="submit" disabled={create.isPending} className="h-10 px-space-md rounded-lg bg-primary-container text-on-primary font-label-md text-label-md disabled:opacity-60">
          {create.isPending ? 'Creating…' : 'Create segment'}
        </button>
      </div>
    </form>
  );
}

/** Live customer segments with a rule builder and reach preview. */
export function SegmentsPanel() {
  const { activeBranchId } = useBusinessBranch();
  const queryClient = useQueryClient();
  const segments = useQuery({ queryKey: [...segmentKeys.all, activeBranchId ?? 'all'], queryFn: () => segmentsService.list({ branchId: activeBranchId }) });
  const remove = useMutation({
    mutationFn: (id: string) => segmentsService.remove(id, activeBranchId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: segmentKeys.all }),
  });
  const [creating, setCreating] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-space-md max-w-4xl">
      <div className="flex items-center justify-between gap-space-sm">
        <p className="font-body-md text-body-md text-text-secondary">Groups of customers you can target with deals, boosts and messages.</p>
        {!creating ? (
          <button type="button" onClick={() => setCreating(true)} className="h-10 px-space-md rounded-lg bg-primary-container text-on-primary font-label-md text-label-md inline-flex items-center gap-1 shrink-0">
            <Icon name="add" className="text-[18px]" /> New segment
          </button>
        ) : null}
      </div>
      {creating ? <CreateSegmentForm onDone={() => setCreating(false)} /> : null}
      {segments.isLoading ? (
        <LoadingRows rows={3} label="Loading segments" />
      ) : segments.isError ? (
        <ErrorState title="Could not load segments" error={segments.error} onRetry={() => segments.refetch()} />
      ) : !segments.data?.length ? (
        <EmptyState icon="groups" title="No segments yet" body="Create one from visit, spend or loyalty rules." />
      ) : (
        <ul className="flex flex-col gap-space-xs">
          {segments.data.map((segment) => (
            <li key={segment.id} className="rounded-xl bg-surface-canvas border border-border-subtle p-space-sm flex items-center gap-space-sm">
              <span className="w-10 h-10 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                <Icon name="groups" className="text-[20px]" />
              </span>
              <span className="flex flex-col flex-1 min-w-0">
                <span className="font-label-md text-label-md text-text-primary font-semibold truncate">{segment.name}</span>
                <span className="font-caption text-caption text-text-secondary truncate">{describe(segment.criteria)}</span>
              </span>
              <span className="font-label-md text-label-md text-text-primary font-semibold shrink-0">{segment.size ?? 0}</span>
              {confirmId === segment.id ? (
                <>
                  <button type="button" onClick={() => remove.mutate(segment.id)} className="h-8 px-space-sm rounded-lg bg-error text-on-error font-label-sm text-label-sm">
                    Delete
                  </button>
                  <button type="button" onClick={() => setConfirmId(null)} className="h-8 px-space-xs font-label-sm text-label-sm">
                    Cancel
                  </button>
                </>
              ) : (
                <button type="button" aria-label={`Delete ${segment.name}`} onClick={() => setConfirmId(segment.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-red-600">
                  <Icon name="delete" className="text-[18px]" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {remove.isError ? <span className="font-caption text-caption text-red-600">{apiErrorMessage(remove.error)}</span> : null}
    </div>
  );
}

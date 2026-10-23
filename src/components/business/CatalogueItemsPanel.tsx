import { useState, type FormEvent } from 'react';
import { Icon } from '../ui/Icon';
import { EmptyState, ErrorState, FilterChips, LoadingRows } from './QueryStates';
import { TextField } from './FormPrimitives';
import { useCatalogueItemMutations, useCatalogueItems } from '../../hooks/business/useCatalogueItems';
import { useBusinessBranch } from '../../context/BusinessBranchContext';
import { toPrice, type CatalogueItem } from '../../services/catalogueItemsService';
import { apiErrorMessage } from '../../services/errorMessages';
import { planErrorMessage } from '../../services/planErrors';
import { formatNaira } from '../../utils/format';

type Kind = 'product' | 'service';

function QuickAddForm({ kind, onDone }: { kind: Kind; onDone: () => void }) {
  const { activeBranchId } = useBusinessBranch();
  const { create } = useCatalogueItemMutations();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('60');
  const [error, setError] = useState<string | null>(null);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return setError(`Give the ${kind} a name.`);
    if (!activeBranchId) return setError('Choose a branch first.');
    setError(null);
    create.mutate(
      {
        name: name.trim(),
        description: description.trim() || name.trim(),
        price: toPrice(price),
        itemType: kind,
        ...(kind === 'service' ? { duration: `${Number(duration) || 60} mins`, isBookable: true, bookingMethod: 'vemtap' as const, serviceMode: 'location' as const } : {}),
        branchId: activeBranchId,
      },
      { onSuccess: onDone, onError: (e) => setError(planErrorMessage(e) ?? apiErrorMessage(e, `Could not add the ${kind}.`)) },
    );
  };

  return (
    <form onSubmit={submit} noValidate className="rounded-xl bg-surface-canvas border border-primary/30 p-space-md flex flex-col gap-space-sm">
      {error ? (
        <p role="alert" className="rounded-lg bg-error-container text-on-error-container px-space-sm py-space-xs font-caption text-caption">
          {error}
        </p>
      ) : null}
      <TextField id="qa-name" label={kind === 'product' ? 'Product name' : 'Service name'} value={name} onChange={setName} />
      <div className="grid grid-cols-2 gap-space-sm">
        <TextField id="qa-price" label="Price (₦)" inputMode="decimal" value={price} onChange={setPrice} />
        {kind === 'service' ? <TextField id="qa-duration" label="Duration (mins)" inputMode="numeric" value={duration} onChange={setDuration} /> : null}
      </div>
      <TextField id="qa-description" label="Description" value={description} onChange={setDescription} />
      <div className="flex gap-space-xs justify-end">
        <button type="button" onClick={onDone} className="h-10 px-space-md rounded-lg bg-surface-container font-label-md text-label-md">
          Cancel
        </button>
        <button type="submit" disabled={create.isPending} className="h-10 px-space-md rounded-lg bg-primary-container text-on-primary font-label-md text-label-md disabled:opacity-60">
          {create.isPending ? 'Adding…' : 'Add'}
        </button>
      </div>
    </form>
  );
}

function ItemRow({ item }: { item: CatalogueItem }) {
  const { update, remove } = useCatalogueItemMutations();
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const active = item.status === 'active';
  const price = toPrice(item.price ?? undefined);

  return (
    <li className="rounded-xl bg-surface-canvas border border-border-subtle p-space-sm flex flex-col gap-space-xs">
      <div className="flex items-center gap-space-sm">
        {item.mainImage ? (
          <img src={item.mainImage} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
        ) : (
          <span className="w-12 h-12 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
            <Icon name={item.itemType === 'service' ? 'spa' : 'inventory_2'} className="text-[20px]" />
          </span>
        )}
        <div className="flex flex-col flex-1 min-w-0">
          <span className="font-label-md text-label-md text-text-primary font-semibold truncate">{item.name}</span>
          <span className="font-caption text-caption text-text-secondary truncate">
            {[item.category?.name, item.itemType === 'service' ? item.duration : item.sku].filter(Boolean).join(' · ') || '—'}
          </span>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <span className="font-label-md text-label-md text-text-primary font-semibold">{price !== undefined ? formatNaira(price) : '—'}</span>
          <span className={`font-caption text-[11px] font-semibold ${active ? 'text-badge-discount-text' : 'text-text-tertiary'}`}>{active ? 'Live' : 'Hidden'}</span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-space-xs">
        <button
          type="button"
          disabled={update.isPending}
          onClick={() => update.mutate({ id: item.id, input: { status: active ? 'inactive' : 'active' } }, { onError: (e) => setError(apiErrorMessage(e)) })}
          className="h-8 px-space-sm rounded-lg bg-surface-container font-label-sm text-label-sm disabled:opacity-50"
        >
          {active ? 'Hide' : 'Show'}
        </button>
        {confirm ? (
          <>
            <button
              type="button"
              disabled={remove.isPending}
              onClick={() => remove.mutate(item.id, { onError: (e) => setError(apiErrorMessage(e)) })}
              className="h-8 px-space-sm rounded-lg bg-error text-on-error font-label-sm text-label-sm"
            >
              Delete
            </button>
            <button type="button" onClick={() => setConfirm(false)} className="h-8 px-space-sm rounded-lg font-label-sm text-label-sm">
              Cancel
            </button>
          </>
        ) : (
          <button type="button" onClick={() => setConfirm(true)} className="h-8 px-space-sm rounded-lg text-red-600 font-label-sm text-label-sm ml-auto">
            Delete
          </button>
        )}
      </div>
      {error ? <span className="font-caption text-caption text-red-600">{error}</span> : null}
    </li>
  );
}

/** Live catalogue for the active branch, with a quick-add form. */
export function CatalogueItemsPanel() {
  const [kind, setKind] = useState<Kind>('product');
  const [adding, setAdding] = useState(false);
  const items = useCatalogueItems(kind);

  return (
    <div className="flex flex-col gap-space-md">
      <div className="flex items-center justify-between gap-space-sm">
        <FilterChips<Kind>
          value={kind}
          onChange={(next) => {
            setKind(next);
            setAdding(false);
          }}
          options={[
            { key: 'product', label: 'Products' },
            { key: 'service', label: 'Services' },
          ]}
        />
        {!adding ? (
          <button type="button" onClick={() => setAdding(true)} className="h-9 px-space-sm rounded-lg bg-primary-container text-on-primary font-label-md text-label-md inline-flex items-center gap-1">
            <Icon name="add" className="text-[18px]" /> Add
          </button>
        ) : null}
      </div>
      {adding ? <QuickAddForm kind={kind} onDone={() => setAdding(false)} /> : null}
      {items.isLoading ? (
        <LoadingRows rows={3} label="Loading catalogue" />
      ) : items.isError ? (
        <ErrorState title="Could not load your catalogue" error={items.error} onRetry={() => items.refetch()} />
      ) : !items.data?.length ? (
        <EmptyState icon="inventory_2" title={`No ${kind}s yet`} body={`Add your first ${kind} so customers can find it.`} />
      ) : (
        <ul className="flex flex-col gap-space-xs">
          {items.data.map((item) => (
            <ItemRow key={item.id} item={item} />
          ))}
        </ul>
      )}
    </div>
  );
}

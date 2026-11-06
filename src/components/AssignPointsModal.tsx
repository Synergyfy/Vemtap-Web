import { useEffect, useMemo, useState } from 'react';
import { Icon } from './ui/Icon';
import { useCatalogueItemMutations, useCatalogueItems } from '../hooks/business/useCatalogueItems';
import type { CatalogueItem } from '../services/catalogueItemsService';
import { apiErrorMessage } from '../services/errorMessages';

type TypeFilter = 'all' | 'product' | 'service';

const TYPE_OPTIONS: { key: TypeFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'product', label: 'Products' },
  { key: 'service', label: 'Services' },
];

const currentPoints = (item: CatalogueItem) => String(item.loyaltyPointsValue ?? '');

function AssignPointsBody({ onClose, onSaved }: { onClose: () => void; onSaved: (message: string) => void }) {
  const products = useCatalogueItems('product');
  const services = useCatalogueItems('service');
  const { update } = useCatalogueItemMutations();
  const items = useMemo(() => [...(products.data ?? []), ...(services.data ?? [])], [products.data, services.data]);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');
  const [type, setType] = useState<TypeFilter>('all');
  const [bulk, setBulk] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setError(null), [edits]);

  const term = search.trim().toLowerCase();
  const shown = items.filter((item) => (type === 'all' || item.itemType === type) && (!term || item.name.toLowerCase().includes(term)));
  const value = (item: CatalogueItem) => edits[item.id] ?? currentPoints(item);
  const changed = items.filter((item) => edits[item.id] !== undefined && edits[item.id] !== currentPoints(item));
  const loading = products.isLoading || services.isLoading;

  const applyBulk = () => {
    if (!bulk.trim()) return;
    setEdits((prev) => ({ ...prev, ...Object.fromEntries(shown.map((item) => [item.id, bulk.trim()])) }));
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    const results = await Promise.allSettled(
      changed.map((item) => update.mutateAsync({ id: item.id, input: { loyaltyPointsValue: Number(edits[item.id]) || 0 } })),
    );
    setSaving(false);
    const failed = results.filter((result): result is PromiseRejectedResult => result.status === 'rejected');
    if (failed.length) {
      setError(`${failed.length} of ${changed.length} couldn't be saved. ${apiErrorMessage(failed[0].reason, 'Please try again.')}`);
      return;
    }
    onSaved(`Points updated on ${changed.length} item${changed.length === 1 ? '' : 's'}`);
    onClose();
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="Assign Points" className="w-full max-w-[520px] max-h-[92vh] bg-surface-canvas rounded-2xl shadow-2xl overflow-hidden flex flex-col">
      <div className="flex items-center justify-between gap-space-sm px-space-md py-space-sm bg-surface-container-low shrink-0">
        <div className="min-w-0">
          <h2 className="font-label-md text-label-md font-semibold text-on-surface">Assign Points</h2>
          <p className="font-caption text-caption text-text-secondary truncate">Points a customer earns per product or service</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="w-9 h-9 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface-container active:scale-95 transition-all">
          <Icon name="close" className="text-[20px]" />
        </button>
      </div>

      <div className="p-space-md flex flex-col gap-space-xs shrink-0">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search products and services"
          aria-label="Search products and services"
          className="w-full h-10 px-space-sm rounded-xl bg-surface-container-low font-body-md text-body-md text-on-surface placeholder:text-text-tertiary outline-none"
        />
        <div className="flex items-center gap-space-2xs">
          {TYPE_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setType(option.key)}
              className={`h-9 px-space-sm rounded-lg font-label-md text-label-md ${type === option.key ? 'bg-surface-tint-blue text-primary' : 'bg-surface-container-low text-text-secondary'}`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-space-2xs">
          <input
            type="number"
            min={0}
            inputMode="numeric"
            value={bulk}
            onChange={(event) => setBulk(event.target.value)}
            placeholder="Points"
            aria-label="Points for every item shown"
            className="w-24 h-9 px-space-xs rounded-lg bg-surface-container-low font-body-md text-body-md text-on-surface outline-none"
          />
          <button type="button" onClick={applyBulk} disabled={!bulk.trim() || !shown.length} className="h-9 px-space-sm rounded-lg bg-surface-container-low text-primary font-label-md text-label-md disabled:opacity-50">
            Apply to {shown.length} shown
          </button>
        </div>
      </div>

      <div className="px-space-md pb-space-sm overflow-y-auto flex-1 flex flex-col gap-space-2xs">
        {loading && <p className="font-caption text-caption text-text-secondary text-center py-space-sm">Loading your catalogue…</p>}
        {(products.isError || services.isError) && <p className="font-caption text-caption text-error text-center">Couldn't load your catalogue. Try again shortly.</p>}
        {!loading && !shown.length && <p className="font-caption text-caption text-text-secondary text-center py-space-sm">Nothing to show here.</p>}
        {shown.map((item) => (
          <div key={item.id} className="px-space-sm py-space-xs rounded-xl bg-surface-container-low flex items-center justify-between gap-space-sm">
            <span className="min-w-0">
              <span className="block font-label-md text-label-md font-semibold text-on-surface truncate">{item.name}</span>
              <span className="block font-caption text-caption text-text-secondary capitalize">{item.itemType ?? 'item'}</span>
            </span>
            <input
              type="number"
              min={0}
              inputMode="numeric"
              value={value(item)}
              onChange={(event) => setEdits((prev) => ({ ...prev, [item.id]: event.target.value }))}
              aria-label={`Points for ${item.name}`}
              className="w-20 h-9 px-space-xs rounded-lg bg-surface-canvas font-body-md text-body-md text-on-surface text-right outline-none shrink-0"
            />
          </div>
        ))}
      </div>

      <div className="p-space-md shrink-0 flex flex-col gap-space-2xs">
        {error && <p className="font-caption text-caption text-error text-center" role="alert">{error}</p>}
        <button
          type="button"
          disabled={!changed.length || saving}
          onClick={() => void save()}
          className="w-full h-11 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-semibold disabled:opacity-50 active:scale-[0.99] transition-all"
        >
          {saving ? 'Saving…' : changed.length ? `Save ${changed.length} Change${changed.length === 1 ? '' : 's'}` : 'No Changes'}
        </button>
      </div>
    </div>
  );
}

/** Sets how many points each product or service earns, on desktop and mobile. */
export function AssignPointsModal({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: (message: string) => void }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-space-sm bg-scrim/70"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <AssignPointsBody onClose={onClose} onSaved={onSaved} />
    </div>
  );
}

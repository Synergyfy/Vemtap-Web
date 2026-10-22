import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Icon } from '../ui/Icon';
import { EmptyState, ErrorState, FilterChips, LoadingRows } from './QueryStates';
import { RadioCard, SaveBar, SettingsSection } from './FormPrimitives';
import { useCatalogueItems, catalogueItemKeys } from '../../hooks/business/useCatalogueItems';
import { catalogueItemsService, toPrice, type BranchPricingRow, type ItemBranchPricing } from '../../services/catalogueItemsService';
import { apiErrorMessage } from '../../services/errorMessages';
import { planErrorMessage } from '../../services/planErrors';
import { formatNaira } from '../../utils/format';

type Kind = 'product' | 'service';

interface RowDraft {
  branchId: string;
  branchName: string;
  isMainBranch: boolean;
  isAvailable: boolean;
  price: string;
  compareAtPrice: string;
  stock: string;
}

const toDraft = (row: BranchPricingRow): RowDraft => ({
  branchId: row.branchId,
  branchName: row.branchName,
  isMainBranch: row.isMainBranch,
  isAvailable: row.isAvailable,
  price: String(toPrice(row.price) ?? ''),
  compareAtPrice: row.compareAtPrice === null || row.compareAtPrice === undefined ? '' : String(toPrice(row.compareAtPrice) ?? ''),
  stock: row.stockQuantity === null || row.stockQuantity === undefined ? '' : String(row.stockQuantity),
});

const num = (value: string) => (value.trim() === '' ? null : Math.max(0, Number(value.replace(/[^0-9.]/g, '')) || 0));
const inputClass = 'h-10 w-full px-space-xs rounded-lg border border-border-subtle bg-surface-canvas font-body-md text-body-md disabled:opacity-50';

function PricingEditor({ itemId, itemName, kind }: { itemId: string; itemName: string; kind: Kind }) {
  const queryClient = useQueryClient();
  const pricing = useQuery({ queryKey: ['branch-pricing', itemId], queryFn: () => catalogueItemsService.branchPricing(itemId) });
  const [mode, setMode] = useState<ItemBranchPricing['pricingMode']>('uniform');
  const [rows, setRows] = useState<RowDraft[]>([]);
  const reset = (data: ItemBranchPricing) => {
    setMode(data.pricingMode);
    setRows(data.branches.map(toDraft));
  };
  useEffect(() => {
    if (pricing.data) reset(pricing.data);
  }, [pricing.data]);

  const save = useMutation({
    mutationFn: () =>
      catalogueItemsService.setBranchPricing(itemId, {
        pricingMode: mode,
        branches: rows.map((r) => ({
          branchId: r.branchId,
          isAvailable: r.isAvailable,
          // Uniform pricing uses the item's base price everywhere.
          price: mode === 'per_branch' ? num(r.price) : undefined,
          compareAtPrice: mode === 'per_branch' ? num(r.compareAtPrice) : undefined,
          stockQuantity: kind === 'product' ? num(r.stock) : undefined,
        })),
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(['branch-pricing', itemId], data);
      void queryClient.invalidateQueries({ queryKey: catalogueItemKeys.all });
    },
  });

  if (pricing.isLoading) return <LoadingRows rows={3} label="Loading branch pricing" />;
  if (pricing.isError || !pricing.data) return <ErrorState title="Could not load branch pricing" error={pricing.error} onRetry={() => pricing.refetch()} />;

  const base = pricing.data;
  const dirty = mode !== base.pricingMode || JSON.stringify(rows) !== JSON.stringify(base.branches.map(toDraft));
  const noneAvailable = !rows.some((r) => r.isAvailable);
  const patch = (branchId: string, change: Partial<RowDraft>) => setRows((prev) => prev.map((r) => (r.branchId === branchId ? { ...r, ...change } : r)));

  return (
    <SettingsSection title={itemName} icon={kind === 'service' ? 'spa' : 'inventory_2'}>
      <div role="radiogroup" aria-label="Pricing" className="grid grid-cols-1 sm:grid-cols-2 gap-space-xs">
        <RadioCard title="Same price everywhere" body={`${formatNaira(toPrice(base.basePrice) ?? 0)} at every branch`} selected={mode === 'uniform'} onSelect={() => setMode('uniform')} />
        <RadioCard title="Price per branch" body="Set a different price where it sells" selected={mode === 'per_branch'} onSelect={() => setMode('per_branch')} />
      </div>
      <div className="overflow-x-auto -mx-1 px-1">
        <table className="w-full min-w-[520px] text-left">
          <thead>
            <tr className="font-label-sm text-label-sm text-text-secondary">
              <th className="py-space-xs pr-space-xs font-medium">Branch</th>
              <th className="py-space-xs pr-space-xs font-medium">Sells here</th>
              <th className="py-space-xs pr-space-xs font-medium">Price (₦)</th>
              <th className="py-space-xs pr-space-xs font-medium">Was (₦)</th>
              {kind === 'product' ? <th className="py-space-xs font-medium">Stock</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {rows.map((row) => (
              <tr key={row.branchId}>
                <td className="py-space-xs pr-space-xs">
                  <span className="font-label-md text-label-md text-text-primary">{row.branchName}</span>
                  {row.isMainBranch ? <span className="ml-1 font-caption text-[11px] text-text-tertiary">Main</span> : null}
                </td>
                <td className="py-space-xs pr-space-xs">
                  <input type="checkbox" aria-label={`Sell at ${row.branchName}`} checked={row.isAvailable} onChange={(e) => patch(row.branchId, { isAvailable: e.target.checked })} className="w-5 h-5 accent-[var(--color-primary,#0055d4)]" />
                </td>
                <td className="py-space-xs pr-space-xs w-32">
                  <input
                    aria-label={`Price at ${row.branchName}`}
                    inputMode="decimal"
                    disabled={mode === 'uniform' || !row.isAvailable}
                    value={mode === 'uniform' ? String(toPrice(base.basePrice) ?? '') : row.price}
                    onChange={(e) => patch(row.branchId, { price: e.target.value })}
                    className={inputClass}
                  />
                </td>
                <td className="py-space-xs pr-space-xs w-32">
                  <input
                    aria-label={`Was price at ${row.branchName}`}
                    inputMode="decimal"
                    disabled={mode === 'uniform' || !row.isAvailable}
                    value={mode === 'uniform' ? String(toPrice(base.baseCompareAtPrice ?? undefined) ?? '') : row.compareAtPrice}
                    onChange={(e) => patch(row.branchId, { compareAtPrice: e.target.value })}
                    placeholder="—"
                    className={inputClass}
                  />
                </td>
                {kind === 'product' ? (
                  <td className="py-space-xs w-28">
                    <input
                      aria-label={`Stock at ${row.branchName}`}
                      inputMode="numeric"
                      disabled={!row.isAvailable}
                      value={row.stock}
                      onChange={(e) => patch(row.branchId, { stock: e.target.value })}
                      placeholder="Not tracked"
                      className={inputClass}
                    />
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <SaveBar
        label="Save branch pricing"
        note={noneAvailable ? 'Sell it at one branch at least.' : rows.length === 1 ? 'Add more branches to price them differently.' : 'Changes go live on the storefront and POS.'}
        dirty={dirty && !noneAvailable}
        saving={save.isPending}
        saved={save.isSuccess}
        error={save.isError ? planErrorMessage(save.error) ?? apiErrorMessage(save.error, 'Could not save branch pricing.') : null}
        onSave={() => save.mutate()}
        onReset={() => reset(base)}
      />
    </SettingsSection>
  );
}

/** Live branch availability and pricing per catalogue item. */
export function BranchPricingPanel({ initialItemId }: { initialItemId?: string | null }) {
  const [kind, setKind] = useState<Kind>('product');
  const items = useCatalogueItems(kind);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(initialItemId ?? null);
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (items.data ?? []).filter((i) => !q || i.name.toLowerCase().includes(q));
  }, [items.data, search]);
  const selected = (items.data ?? []).find((i) => i.id === selectedId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] gap-space-md items-start max-w-6xl">
      <div className="flex flex-col gap-space-sm">
        <FilterChips<Kind>
          value={kind}
          onChange={(next) => {
            setKind(next);
            setSelectedId(null);
          }}
          options={[
            { key: 'product', label: 'Products' },
            { key: 'service', label: 'Services' },
          ]}
        />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Find an item"
          aria-label="Find an item"
          className="h-10 px-space-sm rounded-lg border border-border-subtle bg-surface-canvas font-body-md text-body-md"
        />
        {items.isLoading ? (
          <LoadingRows rows={3} label="Loading items" />
        ) : items.isError ? (
          <ErrorState title="Could not load your catalogue" error={items.error} onRetry={() => items.refetch()} />
        ) : !visible.length ? (
          <EmptyState icon="inventory_2" title="No items" body={`Add a ${kind} to your catalogue first.`} />
        ) : (
          <ul className="flex flex-col gap-1 max-h-[60vh] overflow-y-auto">
            {visible.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  aria-current={item.id === selectedId ? 'true' : undefined}
                  className={`w-full text-left rounded-lg px-space-sm py-space-xs flex items-center justify-between gap-space-xs ${item.id === selectedId ? 'bg-surface-tint-blue' : 'hover:bg-surface-subtle'}`}
                >
                  <span className="font-label-md text-label-md text-text-primary truncate">{item.name}</span>
                  <span className="font-caption text-caption text-text-secondary shrink-0">{formatNaira(toPrice(item.price ?? undefined) ?? 0)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {selected ? (
        <PricingEditor key={selected.id} itemId={selected.id} itemName={selected.name} kind={kind} />
      ) : (
        <div className="rounded-xl border border-dashed border-border-subtle p-space-lg flex flex-col items-center text-center gap-1">
          <Icon name="storefront" className="text-[28px] text-text-tertiary" />
          <span className="font-label-md text-label-md text-text-primary">Pick an item</span>
          <span className="font-caption text-caption text-text-secondary">Choose where it sells and what it costs at each branch.</span>
        </div>
      )}
    </div>
  );
}

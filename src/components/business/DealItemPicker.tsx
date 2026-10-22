import { useState } from 'react';
import { Icon } from '../ui/Icon';
import { EmptyState, ErrorState, FilterChips, LoadingRows } from './QueryStates';
import { useCatalogueItems } from '../../hooks/business/useCatalogueItems';
import { toPrice, type CatalogueItem } from '../../services/catalogueItemsService';
import { formatNaira } from '../../utils/format';

/** First step of a live deal: choose the catalogue item the deal discounts. */
export function DealItemPicker({
  onPick,
  onExit,
  exitLabel = 'Back to deals',
  onSkip,
}: {
  onPick: (item: CatalogueItem) => void;
  onExit: () => void;
  exitLabel?: string;
  /** Onboarding: lets the owner move on without creating a deal. */
  onSkip?: () => void;
}) {
  const [kind, setKind] = useState<'product' | 'service'>('product');
  const items = useCatalogueItems(kind);
  const rows = (items.data ?? []).filter((item) => item.status === 'active');

  return (
    <div className="w-full min-h-screen bg-surface flex justify-center p-space-md sm:p-space-xl">
      <div className="w-full max-w-2xl flex flex-col gap-space-md">
        <button type="button" onClick={onExit} className="inline-flex items-center gap-1 w-fit font-label-md text-label-md text-text-secondary hover:text-primary">
          <Icon name="arrow_back" className="text-[18px]" /> {exitLabel}
        </button>
        <div className="flex flex-col gap-1">
          <h1 className="font-heading-lg text-heading-lg text-text-primary">What is this deal for?</h1>
          <p className="font-body-md text-body-md text-text-secondary">Pick a live product or service from your catalogue. You set the discount next.</p>
        </div>
        <FilterChips
          value={kind}
          onChange={setKind}
          options={[
            { key: 'product', label: 'Products' },
            { key: 'service', label: 'Services' },
          ]}
        />
        {items.isLoading ? (
          <LoadingRows rows={3} />
        ) : items.isError ? (
          <ErrorState title="Could not load your catalogue" error={items.error} onRetry={() => items.refetch()} />
        ) : !rows.length ? (
          <EmptyState icon="inventory_2" title={`No live ${kind}s yet`} body={`Publish a ${kind} in your catalogue first, then create a deal for it.`} />
        ) : (
          <ul className="flex flex-col gap-space-xs">
            {rows.map((item) => {
              const price = toPrice(item.price ?? undefined);
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onPick(item)}
                    className="w-full flex items-center gap-space-sm p-space-sm rounded-xl bg-surface-canvas border border-border-subtle hover:border-primary/40 text-left"
                  >
                    {item.mainImage ? (
                      <img src={item.mainImage} alt="" className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <span className="w-12 h-12 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center">
                        <Icon name={kind === 'service' ? 'spa' : 'inventory_2'} className="text-[20px]" />
                      </span>
                    )}
                    <span className="flex-1 min-w-0 font-label-md text-label-md text-text-primary font-semibold truncate">{item.name}</span>
                    <span className="font-label-md text-label-md text-text-secondary">{price !== undefined ? formatNaira(price) : '—'}</span>
                    <Icon name="chevron_right" className="text-[20px] text-text-tertiary" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {onSkip ? (
          <button type="button" onClick={onSkip} className="self-center h-10 px-space-md rounded-lg font-label-md text-label-md text-text-secondary hover:text-primary">
            Skip deals for now
          </button>
        ) : null}
      </div>
    </div>
  );
}

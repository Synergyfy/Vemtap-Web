import { useMemo, useState } from 'react';
import { ProductImage } from '../../components/ui/ProductImage';
import { Icon } from '../../components/ui/Icon';
import { formatDealAmount } from './dealStudioShared';
import type { ComboProduct } from './dealStudioShared';

interface DealProductPickerProps {
  products: ComboProduct[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  minProducts: number;
  loading?: boolean;
  error?: string | null;
  variant?: 'mobile' | 'desktop';
}

/** Live-catalogue product selection shared by the mobile and desktop Deal Studio. */
export function DealProductPicker({
  products,
  selectedIds,
  onToggle,
  minProducts,
  loading = false,
  error = null,
  variant = 'mobile',
}: DealProductPickerProps) {
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term ? products.filter((product) => product.name.toLowerCase().includes(term)) : products;
  }, [products, search]);

  const selected = products.filter((product) => selectedIds.includes(product.id));
  const desktop = variant === 'desktop';

  return (
    <div className={`flex flex-col ${desktop ? 'gap-space-md' : 'gap-space-sm'}`}>
      <div
        className={`flex items-center gap-space-xs bg-surface-canvas rounded-xl ring-1 ring-border-subtle ${
          desktop ? 'px-space-md py-space-xs' : 'px-space-sm py-2'
        }`}
      >
        <Icon name="search" className="text-[18px] text-text-tertiary" />
        <input
          aria-label="Search your product catalogue"
          className="flex-1 min-w-0 bg-transparent outline-none font-label-md text-label-md text-text-primary placeholder:text-text-tertiary"
          placeholder="Search products by name"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        {search && (
          <button
            aria-label="Clear search"
            className="text-text-tertiary hover:text-text-primary"
            type="button"
            onClick={() => setSearch('')}
          >
            <Icon name="close" className="text-[16px]" />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="font-label-sm text-label-sm text-text-secondary">
          {filtered.length} live product{filtered.length === 1 ? '' : 's'}
        </span>
        <span className="font-label-sm text-label-sm text-primary font-semibold">
          {selected.length} selected • minimum {minProducts}
        </span>
      </div>

      {error && (
        <div className="rounded-lg bg-error-container px-space-sm py-space-2xs text-on-error-container font-caption text-caption">
          {error}
        </div>
      )}
      {loading && (
        <div className="font-caption text-caption text-text-secondary">Loading your live catalogue…</div>
      )}
      {!loading && !error && filtered.length === 0 && (
        <div className="rounded-xl bg-surface-subtle px-space-md py-space-lg text-center font-body-md text-body-md text-text-secondary">
          {search ? 'No products match that search.' : 'No active products in your catalogue yet.'}
        </div>
      )}

      <div className={desktop ? 'grid grid-cols-1 sm:grid-cols-2 gap-space-sm' : 'flex flex-col gap-space-xs'}>
        {filtered.map((product) => {
          const isSelected = selectedIds.includes(product.id);
          return (
            <button
              key={product.id}
              aria-pressed={isSelected}
              className={`w-full text-left rounded-xl overflow-hidden ring-1 transition-all ${
                isSelected ? 'ring-primary bg-surface-tint-blue shadow-sm' : 'ring-border-subtle bg-surface-canvas hover:shadow-sm'
              }`}
              type="button"
              onClick={() => onToggle(product.id)}
            >
              <div className={`flex items-center gap-space-xs ${desktop ? 'p-space-xs' : 'p-space-2xs'}`}>
                <ProductImage
                  alt={product.name}
                  className={desktop ? 'h-14 w-14 rounded-lg shrink-0' : 'h-12 w-12 rounded-lg shrink-0'}
                  iconClassName="text-[20px]"
                  showLabel={false}
                  src={product.image}
                />
                <div className="flex-1 min-w-0">
                  <span className="font-label-md text-label-md text-text-primary font-semibold truncate block">
                    {product.name}
                  </span>
                  <span className="font-caption text-caption text-text-secondary">
                    ₦{formatDealAmount(product.price)}
                  </span>
                </div>
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-transparent'
                  }`}
                >
                  <Icon name="check" className="text-[14px]" />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {selected.length > 0 && (
        <div className="rounded-xl bg-surface-subtle p-space-sm flex flex-col gap-space-2xs">
          <span className="font-label-sm text-label-sm text-text-secondary font-semibold">Selected products</span>
          <div className="flex flex-wrap gap-space-2xs">
            {selected.map((product) => (
              <button
                key={product.id}
                className="inline-flex items-center gap-1 px-space-xs py-space-2xs rounded-full bg-surface-canvas ring-1 ring-border-subtle font-caption text-caption text-text-primary"
                type="button"
                onClick={() => onToggle(product.id)}
              >
                <span className="max-w-[130px] truncate">{product.name}</span>
                <Icon name="close" className="text-[12px] text-text-tertiary" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

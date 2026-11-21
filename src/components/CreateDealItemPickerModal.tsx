import { useEffect, useMemo, useState } from 'react';
import { DesktopModal, ModalCloseButton } from './desktop/DesktopModal';
import { Icon } from './ui/Icon';
import { catalogueItemsService, type CatalogueItem } from '../services/catalogueItemsService';
import { hasApiConfig } from '../services/api/client';
import { URBAN_PRODUCTS } from '../scripts/catalogueData';
import { formatNaira } from '../utils/format';

interface CreateDealItemPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelectItem: (item: CatalogueItem) => void;
}

const demoCatalogueItems: CatalogueItem[] = URBAN_PRODUCTS.map((p) => ({
  id: p.id,
  name: p.name,
  price: p.price,
  compareAtPrice: p.was,
  shortDescription: p.desc,
  description: p.desc,
  mainImage: p.image,
  status: 'active',
  itemType: p.itemType ?? (p.category === 'cat-4' ? 'service' : 'product'),
  stockQuantity: p.stock ?? 20,
}));

export function CreateDealItemPickerModal({
  open,
  onClose,
  onSelectItem,
}: CreateDealItemPickerModalProps) {
  const live = hasApiConfig();
  const [items, setItems] = useState<CatalogueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'product' | 'service'>('product');

  useEffect(() => {
    if (!open) return;
    if (!live) {
      setItems(demoCatalogueItems);
      return;
    }
    setLoading(true);
    setError(null);
    catalogueItemsService
      .list()
      .then((data) => {
        setItems(data);
      })
      .catch(() => {
        setError('Could not load catalogue items. Showing available inventory.');
        setItems(demoCatalogueItems);
      })
      .finally(() => setLoading(false));
  }, [open, live]);

  const products = useMemo(
    () => items.filter((item) => (item.itemType ?? 'product') !== 'service'),
    [items],
  );
  // Product-only rollout: service items are loaded but never offered for deals.
  // const services = useMemo(
  //   () => items.filter((item) => item.itemType === 'service'),
  //   [items],
  // );

  const hasProducts = products.length > 0;
  const hasServices = false;

  // Auto-switch tab if only one type exists
  useEffect(() => {
    if (hasServices && !hasProducts) {
      setTab('service');
    } else if (hasProducts && !hasServices) {
      setTab('product');
    }
  }, [hasProducts, hasServices]);

  const activeList = products;
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return activeList;
    return activeList.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.shortDescription && item.shortDescription.toLowerCase().includes(q)) ||
        (item.category?.name && item.category.name.toLowerCase().includes(q)),
    );
  }, [activeList, search]);

  const handleSelect = (item: CatalogueItem) => {
    onSelectItem(item);
    onClose();
  };

  return (
    <DesktopModal open={open} onClose={onClose} maxWidth="max-w-[720px]">
      <div className="flex flex-col max-h-[85vh] bg-surface-canvas">
        {/* Header */}
        <div className="p-space-lg border-b border-border-subtle flex items-start justify-between gap-space-md">
          <div>
            <div className="flex items-center gap-space-xs">
              <span className="w-8 h-8 rounded-lg bg-surface-tint-blue text-primary flex items-center justify-center font-bold">
                <Icon name="local_offer" className="text-[18px]" />
              </span>
              <h2 className="font-heading-md text-heading-md text-on-surface font-bold tracking-tight">
                Create Deal — Select Item
              </h2>
            </div>
            <p className="font-body-md text-body-md text-text-secondary mt-1">
              Select a product or service from your catalogue to build and publish your promotional deal.
            </p>
          </div>
          <ModalCloseButton onClose={onClose} />
        </div>

        {/* Tabs & Search Filter */}
        <div className="p-space-md border-b border-border-subtle bg-surface-subtle/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-space-sm">
          {/* Tabs: shown if user has products and/or services */}
          <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl self-start">
            {hasProducts && (
              <button
                type="button"
                onClick={() => setTab('product')}
                className={`px-3.5 py-1.5 rounded-lg font-label-md text-label-md flex items-center gap-2 transition-all ${
                  tab === 'product'
                    ? 'bg-surface-canvas text-primary font-bold shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Icon name="inventory_2" className="text-[16px]" />
                <span>Products</span>
                <span className="px-1.5 py-0.5 rounded-full text-caption font-semibold bg-surface-container text-text-secondary">
                  {products.length}
                </span>
              </button>
            )}
            {/* Product-only rollout: service picker tab is hidden.
            {hasServices && (
              <button
                type="button"
                onClick={() => setTab('service')}
                className={`px-3.5 py-1.5 rounded-lg font-label-md text-label-md flex items-center gap-2 transition-all ${
                  tab === 'service'
                    ? 'bg-surface-canvas text-primary font-bold shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Icon name="spa" className="text-[16px]" />
                <span>Services</span>
                <span className="px-1.5 py-0.5 rounded-full text-caption font-semibold bg-surface-container text-text-secondary">
                  {services.length}
                </span>
              </button>
            )} */}
          </div>

          {/* Search box */}
          <div className="relative flex-1 sm:max-w-[280px]">
            <Icon
              name="search"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-[18px] pointer-events-none"
            />
            <input
              type="search"
              placeholder={`Search ${tab === 'product' ? 'products' : 'services'}…`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-surface-canvas border border-border-subtle font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container"
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-space-md">
          {error && (
            <p className="mb-space-sm p-space-xs rounded-lg bg-surface-tint-blue text-primary font-caption text-caption">
              {error}
            </p>
          )}

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-2 text-text-secondary">
              <Icon name="progress_activity" className="text-[28px] animate-spin text-primary" />
              <p className="font-body-md text-body-md">Loading items from your catalogue…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-2 text-text-secondary">
              <Icon name="search_off" className="text-[32px] text-text-tertiary" />
              <p className="font-body-md text-body-md font-medium text-on-surface">
                {search ? `No ${tab}s match "${search}"` : `No ${tab}s found in your catalogue.`}
              </p>
              <p className="font-caption text-caption text-text-tertiary max-w-sm">
                {search
                  ? 'Try clearing the search query to see all items.'
                  : `Upload ${tab}s to your catalogue or create a standalone deal.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
              {filtered.map((item) => {
                const priceVal =
                  typeof item.price === 'string'
                    ? Number.parseFloat(item.price)
                    : item.price ?? 0;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className="p-space-sm rounded-xl border border-border-subtle bg-surface-canvas hover:border-primary hover:bg-surface-tint-blue/30 text-left transition-all flex items-start gap-3 group focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {item.mainImage ? (
                      <img
                        src={item.mainImage}
                        alt={item.name}
                        className="w-14 h-14 rounded-lg object-cover shrink-0 bg-surface-container"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-surface-container text-text-tertiary flex items-center justify-center shrink-0">
                        <Icon
                          name={item.itemType === 'service' ? 'spa' : 'inventory_2'}
                          className="text-[24px]"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-label-md text-label-md font-semibold text-on-surface group-hover:text-primary truncate">
                          {item.name}
                        </span>
                        <span className="font-caption text-caption uppercase px-1.5 py-0.2 rounded font-bold bg-surface-container text-text-secondary shrink-0">
                          {item.itemType === 'service' ? 'Service' : 'Product'}
                        </span>
                      </div>
                      {item.shortDescription && (
                        <p className="font-caption text-caption text-text-secondary line-clamp-1 mt-0.5">
                          {item.shortDescription}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-border-subtle">
                        <span className="font-label-md text-label-md font-bold text-on-surface">
                          {formatNaira(priceVal)}
                        </span>
                        <span className="font-caption text-caption font-semibold text-primary group-hover:underline flex items-center gap-0.5">
                          Make Deal <Icon name="arrow_forward" className="text-[14px]" />
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-space-md border-t border-border-subtle bg-surface-subtle/40 flex items-center justify-between">
          <span className="font-caption text-caption text-text-secondary">
            {activeList.length} {tab === 'product' ? 'product' : 'service'}(s) available
          </span>
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-space-md rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </DesktopModal>
  );
}

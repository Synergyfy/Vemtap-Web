import { useEffect, useMemo, useRef, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { Icon } from '../components/ui/Icon';
import { PosTabBar, POS_NAV_STOCK, type PosTabKey } from '../components/PosTabBar';
import { URBAN_PRODUCTS, naira, type CatalogueProduct } from './catalogueData';

interface BusinessPosStockScreenProps {
  onNav: (key: PosTabKey) => void;
  onOpenProduct: () => void;
  onOpenCatalogue: () => void;
}

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'grills', label: 'Grills' },
  { key: 'burgers', label: 'Burgers' },
  { key: 'mains', label: 'Mains' },
  { key: 'sides', label: 'Sides' },
  { key: 'drinks', label: 'Drinks' },
];

type Availability = 'in' | 'low' | 'out';

const AVAILABILITY_META: Record<Availability, { label: string; chip: string }> = {
  in: { label: 'In stock · 18', chip: 'bg-badge-discount-bg text-badge-discount-text' },
  low: { label: 'Low · 5 left', chip: 'bg-secondary-fixed text-on-secondary-fixed' },
  out: { label: '86’d', chip: 'bg-surface-container text-text-secondary' },
};

interface StockRow {
  product: CatalogueProduct;
  availability: Availability;
}

const INITIAL_STOCK: StockRow[] = [
  { product: URBAN_PRODUCTS[0], availability: 'in' },
  { product: URBAN_PRODUCTS[1], availability: 'in' },
  { product: URBAN_PRODUCTS[4], availability: 'low' },
  { product: URBAN_PRODUCTS[5], availability: 'in' },
  { product: URBAN_PRODUCTS[7], availability: 'in' },
  { product: URBAN_PRODUCTS[6], availability: 'out' },
];

export function BusinessPosStockScreen({ onNav, onOpenProduct, onOpenCatalogue }: BusinessPosStockScreenProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [lowOnly, setLowOnly] = useState(false);
  const [stock, setStock] = useState<StockRow[]>(INITIAL_STOCK);
  const [modal, setModal] = useState<StockRow | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  const showToast = (message: string) => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return stock.filter(({ product, availability }) => {
      const inCategory = category === 'all' || product.category === category;
      const matches = !q || product.name.toLowerCase().includes(q) || product.id.includes(q);
      const matchesLow = !lowOnly || availability !== 'in';
      return inCategory && matches && matchesLow;
    });
  }, [stock, query, category, lowOnly]);

  const lowCount = stock.filter((row) => row.availability !== 'in').length;

  const applyAvailability = (id: string, availability: Availability) => {
    setStock((prev) => prev.map((row) => (row.product.id === id ? { ...row, availability } : row)));
    setModal(null);
    showToast(`${AVAILABILITY_META[availability].label} published to register`);
  };

  return (
    <AppScreen>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="px-margin pt-space-xs pb-space-2xs flex items-center justify-between gap-space-xs">
          <span className="h-7 px-space-xs rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold flex items-center gap-1 min-w-0">
            <Icon name="storefront" className="text-[13px]" />
            <span className="truncate">Wuse II · Till 01</span>
          </span>
          <span className="h-7 px-space-xs rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold flex items-center gap-1 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-badge-discount-text" />
            <span>Online</span>
          </span>
          <button
            type="button"
            aria-label="Open register menu"
            onClick={() => showToast('Register menu opened')}
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center shrink-0 active:scale-95 transition-transform"
          >
            <Icon name="tune" className="text-text-secondary text-[16px]" />
          </button>
        </div>
        <div className="px-margin pb-space-xs flex flex-col">
          <span className="font-heading-sm text-heading-sm text-on-surface leading-tight">Products &amp; Stock View</span>
          <span className="font-caption text-caption text-text-secondary">Live till inventory · synced 2m ago</span>
        </div>
      </header>

      <div className="flex flex-col pb-24">
        {/* Branch meta */}
        <div className="px-margin pt-space-2xs">
          <div className="bg-surface-canvas rounded-xl px-space-xs py-space-2xs shadow-sm flex items-center justify-between gap-space-xs">
            <span className="font-caption text-caption text-text-secondary truncate">
              Urban Grill &amp; Bistro · 148 items · 6 shown
            </span>
            <span className="font-caption text-caption text-badge-discount-text shrink-0">{lowCount} need attention</span>
          </div>
        </div>

        {/* Search + barcode */}
        <div className="px-margin pt-space-xs flex gap-space-2xs">
          <div className="flex-1 h-11 bg-surface-container rounded-xl px-space-xs flex items-center gap-space-2xs border border-transparent focus-within:border-border-active transition-colors">
            <Icon name="search" className="text-text-secondary text-[18px]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search product or SKU…"
              autoComplete="off"
              inputMode="search"
              className="flex-1 min-w-0 bg-transparent outline-none font-label-sm text-label-sm text-on-surface placeholder:text-text-tertiary"
            />
            {query && (
              <button type="button" aria-label="Clear search" onClick={() => setQuery('')} className="text-text-secondary">
                <Icon name="close" className="text-[16px]" />
              </button>
            )}
          </div>
          <button
            type="button"
            aria-label="Scan barcode"
            onClick={() => showToast('Barcode scanned · SKU WRS-400 matched')}
            className="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center active:scale-95 transition-transform shrink-0"
          >
            <Icon name="barcode_scanner" className="text-primary text-[19px]" />
          </button>
        </div>

        {/* Category chips */}
        <div className="pt-space-xs flex gap-space-2xs overflow-x-auto no-scrollbar px-margin pb-space-2xs">
          {CATEGORIES.map((item) => {
            const isActive = category === item.key && !lowOnly;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setCategory(item.key);
                  setLowOnly(false);
                }}
                className={`h-9 px-space-xs rounded-full font-label-sm text-label-sm font-semibold whitespace-nowrap shrink-0 active:scale-95 transition-transform ${
                  isActive ? 'bg-primary text-on-primary' : 'bg-surface-canvas border border-border-subtle text-on-surface'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Low stock banner */}
        <div className="px-margin pt-space-2xs">
          <button
            type="button"
            onClick={() => setLowOnly((value) => !value)}
            className={`w-full rounded-xl px-space-xs py-space-2xs flex items-center gap-space-xs text-left transition-colors ${
              lowOnly ? 'bg-secondary-fixed' : 'bg-surface-tint-blue'
            }`}
          >
            <span className="w-8 h-8 rounded-lg bg-white/70 flex items-center justify-center shrink-0">
              <Icon name="warning" className="text-on-secondary-fixed text-[17px]" />
            </span>
            <span className="flex flex-col min-w-0 flex-1">
              <span className="font-label-sm text-label-sm text-on-surface font-semibold">
                {lowCount} items are low or out of stock
              </span>
              <span className="font-caption text-caption text-text-secondary">Tap to filter the grid</span>
            </span>
            <span className={`font-caption text-caption font-semibold shrink-0 ${lowOnly ? 'text-on-secondary-fixed' : 'text-primary'}`}>
              {lowOnly ? 'Showing' : 'Filter'}
            </span>
          </button>
        </div>

        {/* Count header */}
        <div className="px-margin pt-space-sm pb-space-2xs flex items-center justify-between">
          <span className="font-label-md text-label-md text-text-secondary uppercase tracking-wider font-semibold">
            {lowOnly ? 'Needs Attention' : 'Till Inventory'}
          </span>
          <span className="font-caption text-caption text-text-secondary">{rows.length} items</span>
        </div>

        {/* Product cards */}
        <div className="px-margin flex flex-col gap-space-2xs">
          {rows.map(({ product, availability }) => (
            <div
              key={product.id}
              role="button"
              tabIndex={0}
              onClick={onOpenProduct}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onOpenProduct();
              }}
              className="bg-surface-canvas rounded-2xl p-space-xs shadow-sm flex gap-space-xs items-center cursor-pointer active:scale-[0.99] transition-transform"
            >
              <img
                src={product.image}
                alt={product.imageAlt}
                className="w-14 h-14 rounded-xl object-cover bg-surface-container shrink-0"
              />
              <div className="flex flex-col min-w-0 flex-1 gap-0.5">
                <span className="font-label-sm text-label-sm text-on-surface font-semibold truncate">{product.name}</span>
                <span className="font-caption text-caption text-text-secondary truncate">
                  {naira(product.price)} · SKU {product.id.slice(0, 10).toUpperCase()}
                </span>
                <span className="flex items-center gap-space-2xs">
                  <span className={`h-5 px-1.5 rounded-full font-caption text-caption font-semibold ${AVAILABILITY_META[availability].chip}`}>
                    {AVAILABILITY_META[availability].label}
                  </span>
                  <span className="font-caption text-caption text-text-tertiary">Shift ready</span>
                </span>
              </div>
              <div className="flex flex-col gap-space-2xs shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    showToast(`${product.name} added to active sale`);
                  }}
                  className="h-8 px-space-xs rounded-lg bg-primary text-on-primary font-label-sm text-label-sm font-semibold active:scale-95 transition-transform"
                >
                  + To Sale
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setModal({ product, availability });
                  }}
                  className="h-8 px-space-xs rounded-lg bg-surface-container-low text-on-surface font-caption text-caption font-semibold flex items-center justify-center gap-1 active:scale-95 transition-transform"
                >
                  <Icon name="toggle_on" className="text-primary text-[14px]" />
                  <span>Shift</span>
                </button>
              </div>
            </div>
          ))}
          {rows.length === 0 && (
            <div className="flex flex-col items-center text-center gap-space-xs py-space-md">
              <span className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center">
                <Icon name="inventory_2" className="text-text-secondary text-[22px]" />
              </span>
              <span className="font-label-md text-label-md text-on-surface">No items match this filter</span>
              <span className="font-caption text-caption text-text-secondary max-w-[250px]">
                Clear the search or switch category to see the rest of the till inventory.
              </span>
            </div>
          )}
        </div>

        {/* Master catalogue banner */}
        <div className="px-margin pt-space-sm">
          <button
            type="button"
            onClick={onOpenCatalogue}
            className="w-full rounded-xl bg-surface-tint-blue px-space-xs py-space-xs flex items-center justify-between gap-space-xs text-left active:scale-[0.99] transition-transform"
          >
            <span className="flex items-center gap-space-xs min-w-0">
              <span className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shrink-0">
                <Icon name="menu_book" className="text-primary text-[18px]" />
              </span>
              <span className="flex flex-col min-w-0">
                <span className="font-label-sm text-label-sm text-on-surface font-semibold truncate">Master Catalogue</span>
                <span className="font-caption text-caption text-text-secondary truncate">
                  Edit recipes, pricing and photos in the full catalogue
                </span>
              </span>
            </span>
            <Icon name="chevron_right" className="text-primary text-[18px] shrink-0" />
          </button>
        </div>
      </div>

      {/* Availability modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <button type="button" aria-label="Dismiss" className="absolute inset-0 bg-black/40" onClick={() => setModal(null)} />
          <div className="relative w-full max-w-[430px] bg-surface rounded-t-3xl px-margin pt-space-sm pb-[calc(env(safe-area-inset-bottom,0px)+16px)] shadow-[0_-8px_32px_rgba(0,0,0,0.18)] flex flex-col gap-space-xs">
            <div className="flex items-center justify-between gap-space-xs">
              <span className="font-heading-sm text-heading-sm text-on-surface font-bold truncate">Shift Availability</span>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setModal(null)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center shrink-0"
              >
                <Icon name="close" className="text-text-secondary text-[16px]" />
              </button>
            </div>
            <div className="flex items-center gap-space-xs bg-surface-container-low rounded-xl px-space-xs py-space-2xs">
              <img
                src={modal.product.image}
                alt={modal.product.imageAlt}
                className="w-10 h-10 rounded-lg object-cover bg-surface-container shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <span className="font-label-sm text-label-sm text-on-surface truncate">{modal.product.name}</span>
                <span className="font-caption text-caption text-text-secondary truncate">{naira(modal.product.price)}</span>
              </div>
            </div>
            {(['in', 'low', 'out'] as Availability[]).map((key) => {
              const isActive = modal.availability === key;
              const meta = AVAILABILITY_META[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => applyAvailability(modal.product.id, key)}
                  className={`h-11 rounded-xl px-space-xs flex items-center justify-between gap-space-xs font-label-sm text-label-sm font-semibold transition-colors ${
                    isActive ? 'bg-surface-tint-blue border-2 border-border-active text-on-surface' : 'bg-surface-canvas text-on-surface'
                  }`}
                >
                  <span>{key === 'in' ? 'Mark in stock' : key === 'low' ? 'Mark low stock' : '86 item (sold out)'}</span>
                  <span className={`h-5 px-1.5 rounded-full font-caption text-caption ${meta.chip}`}>{meta.label}</span>
                </button>
              );
            })}
            <span className="font-caption text-caption text-text-secondary">
              Availability changes publish to Till 01 instantly and log against Shift #2.
            </span>
          </div>
        </div>
      )}

      <PosTabBar
        items={POS_NAV_STOCK}
        active="products"
        onSelect={(key) => {
          if (key === 'drawer') {
            showToast('Cash drawer opened · ₦45,000 float');
            return;
          }
          onNav(key);
        }}
      />

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-margin z-50 pointer-events-none">
          <div className="bg-inverse-surface text-inverse-on-surface px-4 py-2 rounded-full font-label-sm text-label-sm shadow-xl flex items-center gap-2">
            <Icon name="check_circle" className="text-badge-discount-text text-[16px]" />
            <span className="truncate">{toast}</span>
          </div>
        </div>
      )}
    </AppScreen>
  );
}

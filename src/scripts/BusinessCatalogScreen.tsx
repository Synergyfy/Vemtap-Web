import { Fragment, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { FilterMenu } from '../components/FilterMenu';
import { Icon } from '../components/ui/Icon';
import { AddProductMethodsDialog } from '../components/import/AddProductMethodsDialog';
import { ProductImportWizard } from '../components/import/ProductImportWizard';
import { useImportedProducts, resolveProductDisplayImage } from './productImport/importedProductStore';
import { summariseImport } from './productImport/importSummary';
import { getCategoryImageByName, naira } from './catalogueData';
import type { ImportedProduct } from './productImport/importTypes';
import { useBusinessOfferings } from '../context/BusinessOfferingsContext';

interface BusinessCatalogScreenProps {
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  onAddProduct?: () => void;
  onAddService?: () => void;
}

interface CatalogItem {
  id: string;
  name: string;
  category: string;
  categoryTone: 'muted' | 'tertiary';
  image?: { src: string; alt: string };
  icon?: string;
  tileCaption?: string;
  priceParts: Array<{ amount: string; suffix?: string }>;
  priceBadge?: string;
  priceCaption?: string;
  footerIcon: string;
  footerText: string;
  footerTone: 'green' | 'secondary';
  meta: string;
}

const CATALOG_IMAGES = [
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuABbKjokKZfYnhkmkPG0delg2rbojNtiWCZuXNEG-TmKjzMssurv4U7qxC0XnDffcdwgf6dcUEUNWsdomozflqPJc-6iKc7HyaKcSRJ5RKMY1xuwBXFriZTh--f5doW6ldMXJbczU8nzp7_fgTyBcVuE3q9hJ_fR4FuHkmbDWn-82fdaOi1aJx4ahPZT5oYRaJs71DhbsQmZlPb26qGtKtCz471A8G1yITeOPLx_d6HH3G0v7mFnEvHnQ',
    alt: 'Gourmet thick woodfire grilled ribeye steak served on artisanal dark stone platter with fresh rosemary sprig and rich savory butter glaze under warm ambient restaurant spotlighting.',
  },
  {
    src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAyFEhGUOn7is2xk7hx6KF3AVcivyGLVD46lcCgBkKjVhNUJecR7fnZiUp0KRTQxSjROA6jeEPPeG6SgLolLOtUr7hhvdMJQw8AhyBzLcC17LAnFdAnS8-saYlk1Q6ab9IhIc5QGe2IWBhB1-e5OctM3xj9vUo8GSk11m-ia_aGXw3SpCanGZe1Nf2knEm0j5UMNEeS-UbQLd2CTgcmWnXEYeAZ1EDm0d4dCzPQD3xzSmNx1anFuyzHKw',
    alt: 'Handcrafted prime gourmet truffle burger with melted aged cheddar cheese, caramelized onions and crisp brioche bun photographed in high key warm studio lighting.',
  },
];

const SEED_ITEMS: CatalogItem[] = [
  {
    id: 'ribeye',
    name: 'Woodfire Aged Ribeye Steak',
    category: 'Food & Dining • Grill',
    categoryTone: 'muted',
    image: CATALOG_IMAGES[0],
    priceParts: [
      { amount: '₦12,000', suffix: '(Wuse)' },
      { amount: '₦12,500', suffix: '(Garki)' },
    ],
    priceBadge: 'Multi-Price',
    footerIcon: 'store',
    footerText: 'Available at 2/2 branches',
    footerTone: 'green',
    meta: 'Inventory: 48 units',
  },
  {
    id: 'truffle-burger',
    name: 'Artisanal Prime Truffle Burger',
    category: 'Food & Dining • Gourmet',
    categoryTone: 'muted',
    image: CATALOG_IMAGES[1],
    priceParts: [{ amount: '₦9,600' }],
    priceCaption: 'Uniform price',
    footerIcon: 'location_on',
    footerText: 'Wuse Branch only',
    footerTone: 'secondary',
    meta: 'Ready in 20 mins',
  },
  {
    id: 'tasting',
    name: 'Executive Table Reservation & Tasting',
    category: 'Dine-in Experience',
    categoryTone: 'tertiary',
    icon: 'wine_bar',
    tileCaption: 'Experience',
    priceParts: [{ amount: '₦25,000' }],
    priceCaption: 'per person • 90 mins',
    footerIcon: 'verified',
    footerText: 'Available at all branches',
    footerTone: 'green',
    meta: 'Pre-booking required',
  },
];

/** Maps an imported (or manually added) product into the onboarding catalog card. */
function importedToCatalogItem(product: ImportedProduct): CatalogItem {
  const published = product.status === 'published';
  return {
    id: product.id,
    name: product.name || 'Untitled imported product',
    category: `${product.category || 'General'} • Imported`,
    categoryTone: 'muted',
    // Own image first, category image as a fallback only — linked, never copied.
    image: (() => {
      const displayImage = resolveProductDisplayImage(product, getCategoryImageByName);
      if (!displayImage) return undefined;
      const isCategoryImage = !product.images.find((entry) => entry.trim() !== '');
      return { src: displayImage, alt: isCategoryImage ? `${product.category} category image` : product.name };
    })(),
    icon: 'inventory_2',
    tileCaption: published ? 'Live' : 'Draft',
    priceParts: [{ amount: product.price !== null ? naira(product.price) : '—' }],
    priceBadge: published ? 'Published' : 'Imported Draft',
    footerIcon: published ? 'check_circle' : 'edit_note',
    footerText: published ? 'Visible on your storefront' : 'Hidden until you publish it',
    footerTone: published ? 'green' : 'secondary',
    meta: product.stock !== null ? `Inventory: ${product.stock} ${product.unit || 'units'}` : 'Add stock later',
  };
}

export function BusinessCatalogScreen({
  onBack,
  onNext,
  onSaveDraft,
  onAddProduct,
  onAddService,
}: BusinessCatalogScreenProps) {
  const { offerings, mode } = useBusinessOfferings();
  const [items, setItems] = useState<CatalogItem[]>(SEED_ITEMS);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [methodsOpen, setMethodsOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const importedProducts = useImportedProducts();
  const allItems = [...(offerings.hasProducts ? importedProducts.map(importedToCatalogItem) : []), ...items];

  const query = search.trim().toLowerCase();

  const headingText =
    mode === 'both'
      ? 'Add your products or services'
      : mode === 'services'
      ? 'Add your services'
      : 'Add your products';

  const categoryChoices = [
    { value: '', label: 'All categories' },
    ...Array.from(new Set(allItems.map((item) => item.category))).map((name) => ({
      value: name,
      label: name,
    })),
  ];

  /** Category filter and search both have to agree before an item shows. */
  const visibleItems = allItems.filter(
    (item) =>
      (category === '' || item.category === category) &&
      (query === '' ||
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)),
  );

  const handleRemove = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  return (
    <AppScreen>
      <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-gutter flex items-center justify-between gap-space-sm">
          <button
            aria-label="Go back"
            className="w-11 h-11 flex items-center justify-center rounded-full text-on-surface hover:bg-surface-container-high/50 active:scale-95 transition-all"
            type="button"
            onClick={onBack}
          >
            <Icon name="arrow_back_ios_new" className="text-[22px]" />
          </button>
          <div className="flex flex-col items-center justify-center flex-1">
            <div className="flex items-center gap-space-2xs mb-1">
              <span className="w-6 h-1.5 rounded-full bg-primary-container transition-all" />
              <span className="w-1.5 h-1.5 rounded-full bg-border-subtle transition-all" />
              <span className="w-1.5 h-1.5 rounded-full bg-border-subtle transition-all" />
            </div>
            <h1 className="font-label-sm text-label-sm text-text-secondary line-clamp-1">Location Details</h1>
          </div>
          <div className="w-11 h-11 flex items-center justify-end">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-[0_2px_6px_rgba(0,85,196,0.2)]">
              <Icon name="person" className="text-on-primary text-[18px]" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col w-full">
        <section className="px-margin pt-space-md pb-space-lg flex flex-col">
          <div className="flex items-center justify-between gap-space-xs mb-space-sm">
            <div className="inline-flex items-center gap-space-2xs px-space-xs py-1 rounded-full bg-surface-tint-blue">
              <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
              <span className="font-label-sm text-label-sm text-primary">Step 3 of 4 • Offerings</span>
            </div>
            <span className="font-label-sm text-label-sm text-text-secondary font-semibold">75% Complete</span>
          </div>
          <div className="w-full bg-surface-container-high rounded-full h-1.5 mb-space-lg overflow-hidden flex">
            <div
              className="bg-primary-container h-full rounded-full transition-all duration-500"
              style={{ width: '75%' }}
            />
          </div>

          <h2 className="font-heading-lg text-heading-lg text-text-primary tracking-tight">
            {headingText}
          </h2>
          <p className="font-body-md text-body-md text-text-secondary mt-space-2xs leading-relaxed">
            Add what you offer so customers can discover, order, and engage with your business storefront across all
            active locations.
          </p>

          <div className={`grid ${mode === 'both' ? 'grid-cols-2' : 'grid-cols-1'} gap-space-sm mt-space-lg`}>
            {offerings.hasProducts && (
              <button
                className="group relative flex flex-col p-space-md rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md active:scale-[0.98] transition-all text-left"
                type="button"
                onClick={() => setMethodsOpen(true)}
              >
                <div className="w-10 h-10 rounded-full bg-surface-tint-blue text-primary flex items-center justify-center mb-space-sm group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <Icon name="shopping_bag" className="text-[22px]" />
                </div>
                <span className="font-heading-sm text-heading-sm text-text-primary flex items-center gap-1">
                  Add Product
                  <Icon name="tv_displays" className="text-[18px] text-primary-container font-bold" />
                </span>
                <span className="font-caption text-caption text-text-secondary mt-1 line-clamp-2">
                  One at a time, or bulk import a CSV/Excel file.
                </span>
              </button>
            )}
            {offerings.hasServices && (
              <button
                className="group relative flex flex-col p-space-md rounded-xl bg-surface-container-lowest shadow-sm hover:shadow-md active:scale-[0.98] transition-all text-left"
                type="button"
                onClick={onAddService}
              >
                <div className="w-10 h-10 rounded-full bg-tertiary-fixed text-tertiary flex items-center justify-center mb-space-sm group-hover:bg-tertiary-container group-hover:text-on-tertiary-container transition-colors">
                  <Icon className="text-[22px]" filled name="auto_awesome" />
                </div>
                <span className="font-heading-sm text-heading-sm text-text-primary flex items-center gap-1">
                  Add Service
                  <Icon name="tv_displays" className="text-[18px] text-tertiary font-bold" />
                </span>
                <span className="font-caption text-caption text-text-secondary mt-1 line-clamp-2">
                  Spa sessions, salon, dining tasting experiences.
                </span>
              </button>
            )}
          </div>

          <div className="mt-space-md p-space-md rounded-xl bg-surface-subtle shadow-sm flex items-start gap-space-sm">
            <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0 mt-0.5">
              <Icon name="sync_alt" className="text-[18px]" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-space-2xs">
                <span className="font-label-md text-label-md text-text-primary font-semibold">
                  Catalog Availability
                </span>
                <span className="px-1.5 py-0.5 rounded-full bg-badge-discount-bg text-badge-discount-text font-caption text-caption font-semibold uppercase tracking-wider">
                  Live
                </span>
              </div>
              <p className="font-caption text-caption text-text-secondary mt-1 leading-relaxed">
                Synced across <span className="font-semibold text-text-primary">2 active locations</span> (Wuse &amp;
                Garki branches). You can set custom regional prices per store.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-space-lg mb-space-sm">
            <div className="flex items-center gap-space-2xs">
              <h3 className="font-heading-sm text-heading-sm text-text-primary">Current Catalog</h3>
              <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm font-semibold">
                {allItems.length}
              </span>
            </div>
            <FilterMenu
              align="right"
              buttonClassName="font-label-sm text-label-sm text-primary flex items-center gap-0.5 hover:underline"
              choices={categoryChoices}
              icon="tune"
              iconClassName="text-[16px]"
              label="Filter"
              onChange={setCategory}
              title="Filter by category"
              value={category}
            />
          </div>

          <div className="relative flex items-center">
            <div className="absolute left-4 flex items-center pointer-events-none text-text-tertiary">
              <Icon name="search" className="text-[20px]" />
            </div>
            <input
              aria-label="Search catalog items"
              className="w-full h-11 pl-11 pr-11 bg-surface-container-lowest text-on-surface rounded-xl shadow-sm text-body-md font-body-md placeholder:text-text-tertiary focus:outline-none focus:bg-surface-tint-blue transition-all"
              placeholder="Search products or services..."
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            {search && (
              <button
                aria-label="Clear search input"
                className="absolute right-3 w-7 h-7 flex items-center justify-center rounded-full bg-surface-container-highest text-on-surface-variant hover:bg-surface-container transition-transform active:scale-90"
                type="button"
                onClick={() => setSearch('')}
              >
                <Icon name="close" className="text-[16px]" />
              </button>
            )}
          </div>

          <div className="flex flex-col gap-space-sm mt-space-sm">
            {visibleItems.map((item) => (
              <article
                key={item.id}
                className="flex flex-col p-space-md rounded-xl bg-surface-container-lowest shadow-sm"
              >
                <div className="flex items-start gap-space-sm">
                  {item.image ? (
                    <img
                      className="w-20 h-20 rounded-lg object-cover bg-surface-container shrink-0"
                      src={item.image.src}
                      alt={item.image.alt}
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-surface-tint-blue text-primary flex flex-col items-center justify-center shrink-0">
                      <Icon name={item.icon ?? 'wine_bar'} className="text-[32px]" />
                      <span className="font-caption text-caption font-semibold mt-0.5 uppercase tracking-wide">
                        {item.tileCaption}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-space-xs">
                      <div className="min-w-0">
                        <span
                          className={`font-caption text-caption uppercase tracking-wider font-semibold block truncate ${
                            item.categoryTone === 'tertiary' ? 'text-tertiary' : 'text-text-tertiary'
                          }`}
                        >
                          {item.category}
                        </span>
                        <h4 className="font-heading-sm text-heading-sm text-text-primary truncate mt-0.5">
                          {item.name}
                        </h4>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          aria-label="Edit item"
                          className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface-subtle active:scale-95 transition-all"
                          type="button"
                        >
                          <Icon name="edit" className="text-[18px]" />
                        </button>
                        {!item.id.startsWith('imp_') && (
                          <button
                            aria-label="Remove item"
                            className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary hover:bg-surface-subtle active:scale-95 transition-all"
                            type="button"
                            onClick={() => handleRemove(item.id)}
                          >
                            <Icon name="delete" className="text-[18px]" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-space-2xs mt-2">
                      <span className="font-button-secondary text-button-secondary text-text-primary font-bold">
                        {item.priceParts.map((part, index) => (
                          <Fragment key={part.amount}>
                            {index > 0 && ' • '}
                            {part.amount}
                            {part.suffix && (
                              <>
                                {' '}
                                <span className="font-caption text-caption text-text-secondary font-normal">
                                  {part.suffix}
                                </span>
                              </>
                            )}
                          </Fragment>
                        ))}
                      </span>
                      {item.priceBadge && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-surface-tint-blue text-primary font-caption text-caption font-semibold">
                          {item.priceBadge}
                        </span>
                      )}
                      {item.priceCaption && (
                        <span className="font-caption text-caption text-text-secondary">{item.priceCaption}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-space-sm pt-space-xs flex items-center justify-between bg-surface-subtle -mx-space-md -mb-space-md p-space-sm rounded-b-xl">
                  <div
                    className={`flex items-center gap-1 font-label-sm text-label-sm font-medium ${
                      item.footerTone === 'green' ? 'text-badge-discount-text' : 'text-secondary'
                    }`}
                  >
                    <Icon name={item.footerIcon} className="text-[16px]" />
                    <span>{item.footerText}</span>
                  </div>
                  <span className="font-caption text-caption text-text-secondary">{item.meta}</span>
                </div>
              </article>
            ))}
            {visibleItems.length === 0 && (
              <div className="py-space-xl flex flex-col items-center text-center">
                <span className="w-14 h-14 rounded-full bg-surface-container-high text-text-tertiary flex items-center justify-center mb-space-sm">
                  <Icon name="search_off" className="text-[26px]" />
                </span>
                <span className="font-label-md text-label-md text-text-primary font-semibold">
                  No catalog items found
                </span>
                <span className="font-caption text-caption text-text-secondary mt-1 max-w-xs leading-relaxed">
                  {category !== '' ? `Nothing in ${category}` : 'Nothing matches your search'}
                  {query !== '' ? ` for “${search.trim()}”` : ''}. Clear the filters to see the whole catalog.
                </span>
                <button
                  className="mt-space-sm h-10 px-space-md rounded-xl bg-surface-container-low text-text-primary font-button-secondary text-button-secondary font-medium active:scale-95 transition-transform"
                  type="button"
                  onClick={() => {
                    setCategory('');
                    setSearch('');
                  }}
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>

          <div className="mt-space-2xl flex flex-col items-center gap-space-sm">
            <button
              className="w-full h-[52px] rounded-xl bg-primary-container text-on-primary font-button-primary text-button-primary shadow-[0_8px_24px_-4px_rgba(6,108,244,0.25)] active:scale-[0.98] transition-all flex items-center justify-center gap-space-2xs"
              type="button"
              onClick={onNext}
            >
              <span>Continue to First Deal Setup</span>
              <Icon name="arrow_forward" className="text-[20px]" />
            </button>
            <button
              className="min-h-[44px] px-space-md text-text-secondary hover:text-text-primary font-button-secondary text-button-secondary transition-colors"
              type="button"
              onClick={onNext}
            >
              Skip for now, I'll add items later
            </button>
            <button
              className="w-full h-11 rounded-xl bg-surface-container-highest text-text-primary font-button-secondary text-button-secondary active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
              type="button"
              onClick={onSaveDraft}
            >
              <Icon name="save" className="text-[18px]" />
              <span>Save as Draft</span>
            </button>
          </div>
        </section>
      </div>

      {/* Add Product: manual / bulk import / connect platform (coming soon) */}
      <AddProductMethodsDialog
        open={methodsOpen}
        onClose={() => setMethodsOpen(false)}
        onAddManually={() => {
          setMethodsOpen(false);
          onAddProduct?.();
        }}
        onBulkImport={() => {
          setMethodsOpen(false);
          setImportOpen(true);
        }}
      />

      {/* Reusable Bulk Product Import wizard */}
      <ProductImportWizard
        open={importOpen}
        onClose={() => setImportOpen(false)}
        existingSkus={[]}
        existingNames={allItems.map((item) => item.name)}
        onImported={(importResult) => {
          setToast(summariseImport(importResult));
          window.setTimeout(() => setToast(null), 4000);
        }}
      />

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[80] bg-inverse-surface text-inverse-on-surface px-space-md py-space-xs rounded-xl shadow-2xl font-label-md text-label-md max-w-[90vw] text-center">
          {toast}
        </div>
      )}
    </AppScreen>
  );
}

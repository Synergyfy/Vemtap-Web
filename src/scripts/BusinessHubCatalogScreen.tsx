import { useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { FilterMenu } from '../components/FilterMenu';
import { Icon } from '../components/ui/Icon';
import { BusinessTabBar, type BusinessTabKey } from '../components/BusinessTabBar';
import { BusinessHubHeader } from './BusinessHubHeader';
import { AddProductMethodsDialog } from '../components/import/AddProductMethodsDialog';
import { ProductImportWizard } from '../components/import/ProductImportWizard';
import { ImportedProductsReview } from '../components/import/ImportedProductsReview';
import { useImportedProducts, resolveProductDisplayImage, saveImportedProducts, publishImportedProducts } from './productImport/importedProductStore';
import { parseMoney } from './productImport/importRecords';
import { summariseImport } from './productImport/importSummary';
import { getCategoryImageByName, naira } from './catalogueData';
import type { ImportedProduct } from './productImport/importTypes';
import { BusinessAddProductStep1Screen } from './BusinessAddProductStep1Screen';
import { BusinessAddProductStep2Screen } from './BusinessAddProductStep2Screen';
import { BusinessAddProductImageScreen } from './BusinessAddProductImageScreen';
import { BusinessAddProductStep3Screen } from './BusinessAddProductStep3Screen';
import { BusinessProductReviewScreen } from './BusinessProductReviewScreen';
import { INITIAL_PRODUCT_DRAFT } from './productDraft';
import type { ProductDraft } from './productDraft';

/** Neutral placeholder shown for imported products without an image. */
const PLACEHOLDER_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' fill='%23e5e7eb'/%3E%3Ctext x='40' y='44' font-size='9' text-anchor='middle' fill='%239ca3af'%3Eno image%3C/text%3E%3C/svg%3E";

interface BusinessHubCatalogScreenProps {
  onTab: (tab: BusinessTabKey) => void;
  onOpenAssignment: (itemName: string) => void;
  onBoost: (itemName: string) => void;
}

interface CatalogItem {
  key: string;
  category: string;
  sku: string;
  statusLabel: string;
  statusDot: string;
  statusClass: string;
  name: string;
  price: string;
  comparePrice?: string;
  baseNote?: string;
  img: string;
  alt: string;
  thumbBadge?: string;
  thumbBadgeClass?: string;
  thumbOverlay?: boolean;
  dealBadge?: string;
  note?: string;
  noteIcon?: string;
  noteClass?: string;
  availabilityPill: string;
  pillIcon: string;
  pillClass: string;
  pillExtra?: string;
  stockLabel: string;
  stockOn: boolean;
  actionLabel: string;
  actionIcon: string;
}

const CATALOG_ITEMS: CatalogItem[] = [
  {
    key: 'ribeye',
    category: 'Steaks & Grills',
    sku: 'VG-STEAK-01',
    statusLabel: 'Active & Published',
    statusDot: 'bg-badge-discount-text',
    statusClass: 'text-badge-discount-text',
    name: 'Woodfire Aged Ribeye Steak',
    price: '₦9,600',
    comparePrice: '₦12,000',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuARmJwFGfykpJ12DQzKlrQ8nVmyn8furX9pmPfeq0vBZOBqfFGKVydCleuSJuB8Qj_Ds2S05O6Cxw_XY0slNJfk7PFgId-JaJunrDffoTR6iFLmaqVMhtrkjXTNXJsyGDuKMzYh-l00MNsbSQ_nqi5sKedR-mB0eNiw6VMHQoK0gf92ShDfqv43V59PogUOgn1uMBFmaT3DJlbzEOsKe2hNt8CegtPfe7lDDcaRMjGwKKIcWCbEA-Lyew',
    alt: 'Tender woodfire grilled prime ribeye steak sliced on an artisan slate presentation board with fresh rosemary sprigs, garlic butter glaze, warm amber moody restaurant lighting, rich textures, studio culinary photography',
    thumbBadge: 'Hot',
    thumbBadgeClass: 'text-primary-container',
    dealBadge: 'Deal Active • 20% OFF',
    availabilityPill: 'Available at All Locations (2 branches)',
    pillIcon: 'apartment',
    pillClass: 'bg-surface-tint-blue text-primary',
    stockLabel: 'In Stock (42 units)',
    stockOn: true,
    actionLabel: 'Edit',
    actionIcon: 'edit',
  },
  {
    key: 'fries',
    category: 'Sides & Starters',
    sku: 'VG-SIDE-04',
    statusLabel: 'Active',
    statusDot: 'bg-badge-discount-text',
    statusClass: 'text-badge-discount-text',
    name: 'Truffle Parmesan Fries',
    price: '₦4,500',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCFufVae8sCll9rbLZkxeodDlR5es3rrONRF3D7Mg6O5Ucs__BoVU2m7mfcubeTXqgiFtRghRqVfQ1YiABbmerhjTJYgtTNvgqd97QZAF_583NGrSLXbM1y8FzkNigWQsV7Ik5DHrqgpfxoZKa1IbgYCOF9kRxYfwW_z0S-VAvPFUdY6gP09fmBqefSc0aDcyYocvKBaDbyiIgJNpPtSkT8hTxShU-0_JEWz1PBUTELFFKq9zkH0qGk4w',
    alt: 'Golden crisp hand-cut French fries tossed in grated authentic parmesan cheese flakes, shaved black truffle pieces, fine parsley sprigs in an artisanal metal cone holder, bright appetizing food photography',
    note: 'Dine-In • Takeaway',
    availabilityPill: 'Maitama Only (Branch 1 exclusive)',
    pillIcon: 'store',
    pillClass: 'bg-surface-container-high text-secondary',
    pillExtra: 'Custom',
    stockLabel: 'In Stock',
    stockOn: true,
    actionLabel: 'Edit',
    actionIcon: 'edit',
  },
  {
    key: 'wine',
    category: 'Cellar & Spirits',
    sku: 'VG-CELLAR-09',
    statusLabel: 'Active',
    statusDot: 'bg-badge-discount-text',
    statusClass: 'text-badge-discount-text',
    name: 'Vintage Reserve Cabernet',
    price: '₦42,000',
    baseNote: 'base',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDOrpMZ2tE1IF6wXYk_WRbuh-nr_OXyZ_NYzYrlZyIvLbwEkGsoczgb5WdVMx0ScErpEiCxes-Ph7_StOkqCcOSNI603EepJAge4Sx4-IbPYyq2o626Vh0lVOuFGhZH0JkeWdU6VABuoo1arewJb_YIClAt0wBXuH8Cr8a1XJOX7w483G1AZm0pC98C3qcPXHl4glcQnDE3AnxqJpCpoiY8g93NFYx0T7zvEieIpmX0WDMG8FinKKouYg',
    alt: 'High-end Cabernet Sauvignon red wine bottle with luxurious textured gold and burgundy foil label, paired beside an elegant crystal Bordeaux glass reflecting candlelit ambient bar glow',
    thumbBadge: 'Low',
    thumbBadgeClass: 'text-on-tertiary-container',
    note: 'Limited Stock (3 left)',
    noteIcon: 'warning',
    noteClass: 'text-tertiary',
    availabilityPill: 'Different Price: ₦42k Abuja / ₦45k Lagos',
    pillIcon: 'tune',
    pillClass: 'bg-surface-container text-text-secondary',
    pillExtra: 'open',
    stockLabel: 'Available',
    stockOn: true,
    actionLabel: 'Edit',
    actionIcon: 'edit',
  },
  {
    key: 'bread',
    category: 'Bakery & Breads',
    sku: 'VG-BAKE-02',
    statusLabel: 'Draft / Paused',
    statusDot: 'bg-outline',
    statusClass: 'text-text-secondary',
    name: 'Artisan Sourdough Bread',
    price: '₦3,500',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBAHZPSmQ7l9MxFIpAi2ec1zxKdMx-LEvgvykjEnJc8EmIFcyt57a5kDM4cbPe3K0J6oF207p7W3KqlSsl35xOLwQWi09gNXhlj_co_3MPGX_DkzGrMsfDxZWexqc4KCZ1pEJEVdrlwCtI0nRh1xIIwjyHtuC4YurTt3WzIT0Ep9SsGIHMJ4wAEwOC8mSUKgSicsllgW4pTfDi00khcwXqXt9PrprK5aAy166jls4Mmh2AcAIGBwAiy9w',
    alt: 'Warm artisan rustic sourdough loaf cut open dripping with creamy roasted garlic and herb compound butter on dark wood serving platter',
    thumbOverlay: true,
    note: 'Hidden from customer menu',
    noteClass: 'text-text-tertiary',
    availabilityPill: 'Configured for All Locations',
    pillIcon: 'domain',
    pillClass: 'bg-surface-container-low text-text-secondary',
    stockLabel: 'Off Shelf',
    stockOn: false,
    actionLabel: 'Publish',
    actionIcon: 'publish',
  },
];

const FILTER_CHIPS = ['All Status', 'Active Deals (4)', 'Low Stock', 'Dine-In & Takeaway'];

/** Maps a bulk-imported product onto the mobile catalogue card model. */
function importedToItem(product: ImportedProduct): CatalogItem {
  const published = product.status === 'published';
  const onSale = product.salePrice !== null && product.price !== null && product.salePrice < product.price;
  const stock = product.stock;
  return {
    key: product.id,
    category: product.category || 'General',
    sku: product.sku || '—',
    statusLabel: published ? 'Published' : product.needsReview ? 'Draft • Needs Review' : 'Imported Draft',
    statusDot: published ? 'bg-badge-discount-text' : 'bg-outline',
    statusClass: published ? 'text-badge-discount-text' : 'text-text-secondary',
    name: product.name || 'Untitled imported product',
    price: product.price !== null ? naira(onSale ? (product.salePrice as number) : product.price) : '—',
    comparePrice: onSale && product.price !== null ? naira(product.price) : undefined,
    baseNote: published ? undefined : 'draft',
    // Own image first, then the category image as a fallback (linked, not copied).
    img: resolveProductDisplayImage(product, getCategoryImageByName) ?? PLACEHOLDER_IMG,
    alt: product.description || product.name || 'Imported product',
    note: published ? undefined : 'Hidden from storefront until you publish it',
    noteIcon: published ? undefined : 'edit_note',
    noteClass: published ? undefined : 'text-text-tertiary',
    availabilityPill: published ? 'Published across your locations' : 'Draft — publish from Review when ready',
    pillIcon: published ? 'apartment' : 'edit_note',
    pillClass: published ? 'bg-surface-tint-blue text-primary' : 'bg-surface-container-high text-text-secondary',
    stockLabel: stock !== null ? `In Stock (${stock} ${product.unit || 'units'})` : 'Stock not set',
    stockOn: (stock ?? 0) > 0,
    actionLabel: 'Review',
    actionIcon: 'rate_review',
  };
}

export function BusinessHubCatalogScreen({ onTab, onOpenAssignment, onBoost }: BusinessHubCatalogScreenProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [tab, setTab] = useState('products');
  const [chip, setChip] = useState('All Status');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState<Record<string, boolean>>(
    Object.fromEntries(CATALOG_ITEMS.map((item) => [item.key, item.stockOn])),
  );
  const [sheetItem, setSheetItem] = useState<string | null>(null);

  // Bulk import state (shared wizard + review used across the whole app)
  const importedProducts = useImportedProducts();
  const [view, setView] = useState<'catalog' | 'importReview'>('catalog');
  const [addMethodsOpen, setAddMethodsOpen] = useState(false);
  const [importWizardOpen, setImportWizardOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Manual add-product flow: reuses the same onboarding wizard steps.
  const [manualStep, setManualStep] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const [manualDraft, setManualDraft] = useState<ProductDraft>({ ...INITIAL_PRODUCT_DRAFT });

  const importedItems = importedProducts.map(importedToItem);
  const importedKeys = new Set(importedProducts.map((product) => product.id));
  const allItems = [...importedItems, ...CATALOG_ITEMS];
  const draftImportCount = importedProducts.filter((product) => product.status === 'draft').length;

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3500);
  };

  const categoryChoices = [
    { value: '', label: 'All categories' },
    ...Array.from(new Set(allItems.map((item) => item.category))).map((name) => ({
      value: name,
      label: name,
    })),
  ];

  const visibleItems = allItems.filter((item) => {
    if (category !== '' && item.category !== category) return false;
    const query = search.trim().toLowerCase();
    return (
      query === '' ||
      item.name.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.sku.toLowerCase().includes(query)
    );
  });

  if (view === 'importReview') {
    return (
      <AppScreen>
        <div className="px-margin pt-space-md pb-space-xl">
          <ImportedProductsReview onBack={() => setView('catalog')} />
        </div>
        <BusinessTabBar active="business" onTab={onTab} />
      </AppScreen>
    );
  }

  // Manual add-product: same five steps as onboarding, published into the catalogue.
  if (manualStep > 0) {
    const changeManualDraft = (patch: Partial<ProductDraft>) =>
      setManualDraft((previous) => ({ ...previous, ...patch }));
    const handleManualPublish = () => {
      const { saved } = saveImportedProducts(
        { batchId: 'manual', fileName: 'manual-entry', importedAt: Date.now() },
        [
          {
            rowId: `manual_${Date.now()}`,
            rowNumber: 1,
            name: manualDraft.title,
            description: manualDraft.description,
            sku: manualDraft.skuCode,
            barcode: '',
            category: manualDraft.primaryCategory,
            price: parseMoney(manualDraft.basePrice),
            salePrice: parseMoney(manualDraft.comparePrice),
            costPrice: parseMoney(manualDraft.costPrice),
            bulkPricing: [],
            stock: manualDraft.variantsEnabled
              ? manualDraft.variants.reduce((total, variant) => total + (parseMoney(variant.inventory) ?? 0), 0)
              : null,
            unit: 'unit',
            variants: manualDraft.variants.map((variant) => ({ name: variant.name, price: parseMoney(variant.price) })),
            images: [],
            extra: {},
          },
        ],
        { existingSkus: new Set(allItems.map((item) => item.sku)) },
      );
      if (saved.length > 0) publishImportedProducts([saved[0].id]);
      setManualStep(0);
      setManualDraft({ ...INITIAL_PRODUCT_DRAFT });
      showToast(saved.length > 0 ? `“${manualDraft.title || 'Product'}” published to your catalogue.` : 'This product already exists (same SKU).');
    };
    return (
      <AppScreen>
        {manualStep === 1 && (
          <BusinessAddProductStep1Screen
            draft={manualDraft}
            onDraftChange={changeManualDraft}
            onBack={() => setManualStep(0)}
            onNext={() => setManualStep(2)}
            onSaveDraft={() => setManualStep(0)}
          />
        )}
        {manualStep === 2 && (
          <BusinessAddProductStep2Screen
            draft={manualDraft}
            onDraftChange={changeManualDraft}
            onBack={() => setManualStep(1)}
            onNext={() => setManualStep(3)}
            onSaveDraft={() => setManualStep(0)}
          />
        )}
        {manualStep === 3 && (
          <BusinessAddProductImageScreen
            draft={manualDraft}
            onBack={() => setManualStep(2)}
            onNext={() => setManualStep(4)}
            onSaveDraft={() => setManualStep(0)}
          />
        )}
        {manualStep === 4 && (
          <BusinessAddProductStep3Screen
            draft={manualDraft}
            onDraftChange={changeManualDraft}
            onBack={() => setManualStep(3)}
            onNext={() => setManualStep(5)}
            onSaveDraft={() => setManualStep(0)}
          />
        )}
        {manualStep === 5 && (
          <BusinessProductReviewScreen
            draft={manualDraft}
            onBack={() => setManualStep(4)}
            onEditBasics={() => setManualStep(1)}
            onEditPricing={() => setManualStep(2)}
            onEditImage={() => setManualStep(3)}
            onEditBranches={() => setManualStep(4)}
            onEditFulfillment={() => setManualStep(4)}
            onEditDescription={() => setManualStep(1)}
            onPublish={handleManualPublish}
            onSaveDraft={() => setManualStep(0)}
          />
        )}
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <BusinessHubHeader />
      <div className="flex flex-col w-full flex-1 pb-24">
        {/* Add New — location is picked from the persistent top-bar icon */}
        <div className="px-margin pt-space-xs pb-space-xs flex items-center justify-end gap-space-xs">
          {/* Split Add Action */}
          <div className="relative">
            {addOpen && <div className="fixed inset-0 z-30" onClick={() => setAddOpen(false)} />}
            <button
              className="h-8 flex items-center gap-1.5 bg-primary text-on-primary pl-2.5 pr-2 py-1 rounded-lg shadow-xs active:scale-95 transition-all text-label-sm font-semibold"
              type="button"
              onClick={() => setAddOpen((open) => !open)}
            >
              <Icon name="add" className="text-[16px]" />
              <span>Add New</span>
              <span className="w-[1px] h-3 bg-white/30 mx-0.5" />
              <Icon name="arrow_drop_down" className="text-[16px]" />
            </button>
            {addOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-surface-canvas rounded-xl shadow-lg z-40 p-1 border border-border-subtle flex flex-col gap-0.5">
                <button
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-surface-container text-text-primary text-[12px] font-medium flex items-center gap-2"
                  type="button"
                  onClick={() => {
                    setAddOpen(false);
                    setAddMethodsOpen(true);
                  }}
                >
                  <Icon name="inventory_2" className="text-primary text-[16px]" />
                  <span>+ Add Product</span>
                </button>
                <button
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-surface-container text-text-primary text-[12px] font-medium flex items-center gap-2"
                  type="button"
                  onClick={() => setAddOpen(false)}
                >
                  <Icon name="room_service" className="text-tertiary-container text-[16px]" />
                  <span>+ Add Service</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Segmented Tabs */}
        <div className="px-margin mb-space-xs">
          <div className="flex items-center bg-surface-container-high p-0.5 rounded-lg">
            {[
              { key: 'products', label: 'Products (28)' },
              { key: 'services', label: 'Services (14)' },
              { key: 'categories', label: 'Categories (6)' },
            ].map((catalogTab) => {
              const active = tab === catalogTab.key;
              return (
                <button
                  className={`flex-1 py-1 text-center rounded-md font-label-sm text-label-sm transition-all ${
                    active ? 'bg-surface-canvas text-primary font-semibold shadow-xs' : 'text-text-secondary hover:text-text-primary'
                  }`}
                  key={catalogTab.key}
                  type="button"
                  onClick={() => setTab(catalogTab.key)}
                >
                  {catalogTab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Imported drafts banner */}
        {draftImportCount > 0 && (
          <div className="px-margin mb-space-sm">
            <button
              className="w-full flex items-center gap-space-sm bg-surface-tint-blue rounded-xl px-space-sm py-space-xs text-left active:scale-[0.99] transition-all"
              type="button"
              onClick={() => setView('importReview')}
            >
              <span className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shrink-0">
                <Icon name="upload_file" className="text-[17px]" />
              </span>
              <span className="flex flex-col min-w-0 flex-1">
                <span className="font-label-sm text-label-sm text-primary font-semibold truncate">
                  {draftImportCount.toLocaleString()} imported product{draftImportCount === 1 ? '' : 's'} in draft
                </span>
                <span className="font-caption text-caption text-text-secondary truncate">
                  Review, add images and publish when ready
                </span>
              </span>
              <Icon name="chevron_right" className="text-[18px] text-primary shrink-0" />
            </button>
          </div>
        )}

        {/* Search & Quick Filter */}
        <div className="px-margin flex flex-col gap-1.5 mb-space-sm">
          <div className="relative flex items-center w-full">
            <Icon name="search" className="absolute left-3 text-outline text-[18px] pointer-events-none" />
            <input
              className="w-full bg-surface-canvas text-text-primary pl-9 pr-9 py-2 rounded-xl shadow-xs font-label-sm text-label-sm placeholder:text-text-tertiary focus:outline-none focus:bg-surface-tint-blue transition-all"
              placeholder="Search items, SKU, category..."
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <FilterMenu
              align="right"
              ariaLabel="Filter catalogue by category"
              buttonClassName="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-lg text-outline hover:text-text-primary transition-colors"
              choices={categoryChoices}
              icon="tune"
              iconClassName="text-[16px]"
              label={null}
              onChange={setCategory}
              title="Filter by category"
              value={category}
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {FILTER_CHIPS.map((filterChip) => {
              const active = chip === filterChip;
              return (
                <button
                  className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                    active
                      ? 'bg-primary-fixed text-on-primary-fixed font-semibold'
                      : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                  }`}
                  key={filterChip}
                  type="button"
                  onClick={() => setChip(filterChip)}
                >
                  {filterChip}
                </button>
              );
            })}
          </div>
        </div>

        {/* Items Catalogue List */}
        <div className="px-margin flex flex-col gap-2 pb-space-2xl">
          {visibleItems.map((item) => (
            <div
              className="bg-surface-canvas rounded-xl p-3 shadow-xs border border-border-subtle/50 flex flex-col gap-2 relative overflow-hidden"
              key={item.key}
            >
              {/* Top Meta Bar */}
              <div className="flex items-center justify-between text-[11px] text-text-secondary">
                <span className="flex items-center gap-1">
                  <span className="font-semibold text-text-primary">{item.category}</span>
                  <span>•</span>
                  <span className="font-mono text-outline text-[10px]">{item.sku}</span>
                </span>
                <div className="flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${item.statusDot}`} />
                  <span className={`font-medium ${item.statusClass}`}>{item.statusLabel}</span>
                </div>
              </div>
              {/* Main Row */}
              <div className="flex gap-2.5 items-start">
                <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container shadow-xs">
                  <img
                    alt={item.alt}
                    className={`w-full h-full object-cover ${item.thumbOverlay ? 'grayscale-[40%]' : ''}`}
                    src={item.img}
                  />
                  {item.thumbBadge && (
                    <span className="absolute bottom-0.5 right-0.5 bg-surface-canvas/90 px-1 py-0.2 rounded text-[9px] font-semibold flex items-center">
                      <Icon name="local_fire_department" className={`text-[9px] mr-0.5 ${item.thumbBadgeClass}`} />
                      {item.thumbBadge}
                    </span>
                  )}
                  {item.thumbOverlay && (
                    <div className="absolute inset-0 bg-surface-dim/40 flex items-center justify-center">
                      <Icon name="pause_circle" className="text-on-surface text-[16px]" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h2
                      className={`font-label-md text-label-md font-semibold truncate ${
                        item.key === 'bread' ? 'text-text-secondary' : 'text-text-primary'
                      }`}
                    >
                      {item.name}
                    </h2>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span
                        className={`font-label-md text-label-md font-bold ${
                          item.key === 'bread' ? 'text-text-secondary' : 'text-text-primary'
                        }`}
                      >
                        {item.price}
                      </span>
                      {item.comparePrice && (
                        <span className="text-[11px] text-text-tertiary line-through">
                          {item.comparePrice}
                        </span>
                      )}
                      {item.baseNote && (
                        <span className="text-[11px] text-text-secondary font-medium">{item.baseNote}</span>
                      )}
                    </div>
                  </div>
                  {item.dealBadge && (
                    <div className="mt-1 inline-flex items-center gap-1 bg-badge-discount-bg text-badge-discount-text px-1.5 py-0.5 rounded-full self-start">
                      <Icon name="local_offer" className="text-[11px]" />
                      <span className="text-[10px] font-semibold">{item.dealBadge}</span>
                    </div>
                  )}
                  {item.note && (
                    <span className={`text-[11px] mt-0.5 flex items-center gap-1 ${item.noteClass ?? 'text-text-secondary'}`}>
                      {item.noteIcon && <Icon name={item.noteIcon} className="text-[12px]" />}
                      {item.note}
                    </span>
                  )}
                </div>
                <button
                  aria-label={`${item.name} options`}
                  className="text-on-surface-variant hover:text-text-primary p-1 -mr-1 rounded-full transition-colors"
                  type="button"
                  onClick={() => setSheetItem(item.name)}
                >
                  <Icon name="more_vert" className="text-[18px]" />
                </button>
              </div>
              {/* Location Availability Pill */}
              <div
                className={`px-2 py-0.5 rounded-md flex items-center gap-1 text-[11px] ${item.pillClass}`}
              >
                <Icon name={item.pillIcon} className="text-[13px]" />
                <span className="font-medium truncate">{item.availabilityPill}</span>
                {item.pillExtra && (
                  <span className="ml-auto bg-surface-canvas text-secondary text-[10px] px-1.5 py-0.2 rounded shadow-xs font-medium shrink-0">
                    {item.pillExtra}
                  </span>
                )}
              </div>
              {/* Quick Action Deck */}
              <div className="flex items-center justify-between pt-1 bg-surface-container-low/40 -mx-3 -mb-3 px-3 py-1.5 rounded-b-xl border-t border-border-subtle/30">
                <div className="flex items-center gap-1.5">
                  <button
                    aria-label={`Toggle stock for ${item.name}`}
                    className={`relative inline-flex h-5 w-8 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none ${stock[item.key] ?? item.stockOn ? 'bg-primary' : 'bg-surface-container-highest'}`}
                    role="switch"
                    type="button"
                    onClick={() => setStock((current) => ({ ...current, [item.key]: !(current[item.key] ?? item.stockOn) }))}
                  >
                    <span
                      className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                        stock[item.key] ?? item.stockOn ? 'translate-x-3.5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className="text-[11px] text-text-secondary">
                    {(stock[item.key] ?? item.stockOn) ? item.stockLabel : 'Off Shelf'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    className="flex items-center gap-1 px-2 py-1 rounded bg-primary-container shadow-xs text-on-primary text-[11px] font-semibold hover:bg-primary transition-colors"
                    type="button"
                    onClick={() => onBoost(item.name)}
                  >
                    <Icon name="rocket_launch" className="text-[13px]" />
                    <span>Boost</span>
                  </button>
                  <button
                    className="flex items-center gap-1 px-2 py-1 rounded bg-surface-canvas shadow-xs text-primary text-[11px] font-medium hover:bg-surface-container-high transition-colors border border-border-subtle/40"
                    type="button"
                    onClick={() => {
                      if (importedKeys.has(item.key)) setView('importReview');
                      else onOpenAssignment(item.name);
                    }}
                  >
                    <Icon name={item.actionIcon} className="text-[13px]" />
                    <span>{item.actionLabel}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
          {visibleItems.length === 0 && (
            <div className="py-space-xl flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-surface-container-high text-primary flex items-center justify-center mb-space-sm">
                <Icon name="inventory_2" className="text-[32px]" />
              </div>
              <h4 className="font-heading-sm text-heading-sm text-text-primary">No items found</h4>
              <p className="font-body-md text-body-md text-text-secondary max-w-xs mt-1">
                {category !== '' || search.trim() !== ''
                  ? 'Nothing matches this search and category filter. Clear them to see the whole catalogue.'
                  : 'Try a different search or pick another status filter.'}
              </p>
              {(category !== '' || search.trim() !== '') && (
                <button
                  className="mt-space-sm h-10 px-space-md rounded-xl bg-surface-container-low text-on-surface font-button-secondary text-button-secondary font-medium active:scale-95 transition-transform"
                  type="button"
                  onClick={() => {
                    setCategory('');
                    setSearch('');
                  }}
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Item Options Action Sheet */}
      {sheetItem && (
        <div
          className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-xs z-50 flex items-end justify-center"
          onClick={() => setSheetItem(null)}
        >
          <div
            className="w-full max-w-[430px] bg-surface-canvas rounded-t-2xl p-space-md shadow-2xl flex flex-col gap-space-xs rounded-b-2xl mb-0"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-surface-container-highest rounded-full mx-auto mb-1" />
            <div className="flex items-center justify-between pb-space-xs">
              <h3 className="font-heading-sm text-heading-sm text-text-primary truncate">{sheetItem}</h3>
              <button
                className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-text-primary"
                type="button"
                onClick={() => setSheetItem(null)}
              >
                <Icon name="close" className="text-[18px]" />
              </button>
            </div>
            {[
              { icon: 'content_copy', iconClass: 'text-primary', label: 'Duplicate Product' },
              { icon: 'price_change', iconClass: 'text-primary-container', label: 'Manage Location Pricing' },
              { icon: 'qr_code_2', iconClass: 'text-secondary', label: 'View Table Order QR' },
              { icon: 'archive', iconClass: 'text-error', label: 'Archive from Catalogue', danger: true },
            ].map((action) => (
              <button
                className={`w-full flex items-center gap-space-sm px-space-sm py-space-sm rounded-xl font-body-md text-body-md transition-colors text-left ${
                  action.danger ? 'hover:bg-error-container text-error' : 'hover:bg-surface-container text-text-primary'
                }`}
                key={action.label}
                type="button"
                onClick={() => {
                  if (action.label === 'Manage Location Pricing') {
                    setSheetItem(null);
                    onOpenAssignment(sheetItem);
                  } else {
                    setSheetItem(null);
                  }
                }}
              >
                <Icon name={action.icon} className={`text-[20px] ${action.iconClass}`} />
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Floating Quick-Action Deck */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-margin z-40 flex items-center justify-center gap-space-xs pointer-events-none">
        <div className="pointer-events-auto bg-surface-canvas/95 backdrop-blur-md p-1.5 rounded-full shadow-xl flex items-center gap-space-2xs">
          <button
            className="flex items-center gap-1.5 px-space-sm py-2 rounded-full bg-primary-container text-on-primary-container font-label-md text-label-md font-semibold shadow-md active:scale-95 transition-all"
            type="button"
            onClick={() => setAddMethodsOpen(true)}
          >
            <Icon name="add_circle" className="text-[18px]" />
            <span>+ Add Product</span>
          </button>
          <button
            className="flex items-center gap-1.5 px-space-sm py-2 rounded-full bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold hover:bg-surface-container-highest active:scale-95 transition-all"
            type="button"
          >
            <Icon name="design_services" className="text-[18px] text-tertiary-container" />
            <span>+ Add Service</span>
          </button>
        </div>
      </div>

      <BusinessTabBar active="business" onTab={onTab} />

      {/* Add Product: manual / bulk import / connect platform (coming soon) */}
      <AddProductMethodsDialog
        open={addMethodsOpen}
        onClose={() => setAddMethodsOpen(false)}
        onAddManually={() => {
          setAddMethodsOpen(false);
          setManualDraft({ ...INITIAL_PRODUCT_DRAFT });
          setManualStep(1);
        }}
        onBulkImport={() => {
          setAddMethodsOpen(false);
          setImportWizardOpen(true);
        }}
      />

      {/* Reusable Bulk Product Import wizard */}
      <ProductImportWizard
        open={importWizardOpen}
        onClose={() => setImportWizardOpen(false)}
        existingSkus={allItems.map((item) => item.sku)}
        existingNames={allItems.map((item) => item.name)}
        onImported={(importResult) => {
          showToast(summariseImport(importResult));
        }}
        onOpenReview={() => setView('importReview')}
      />

      {toast && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[80] bg-inverse-surface text-inverse-on-surface px-space-md py-space-xs rounded-xl shadow-2xl font-label-md text-label-md max-w-[90vw] text-center">
          {toast}
        </div>
      )}
    </AppScreen>
  );
}

import { useEffect, useState } from 'react';
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
import { BusinessAddServiceStep1Screen } from './BusinessAddServiceStep1Screen';
import { BusinessAddServiceStep2Screen } from './BusinessAddServiceStep2Screen';
import { BusinessAddServiceStep3Screen } from './BusinessAddServiceStep3Screen';
import { BusinessServiceReviewScreen } from './BusinessServiceReviewScreen';
import { BLANK_SERVICE_DRAFT, INITIAL_SERVICE_DRAFT, type ServiceDraft } from './serviceDraft';
import { BLANK_PRODUCT_DRAFT, INITIAL_PRODUCT_DRAFT } from './productDraft';
import { hasApiConfig } from '../services/api/client';
import { useCatalogueItemMutations, useCatalogueItems } from '../hooks/business/useCatalogueItems';
import { useOffers } from '../hooks/business/useOffers';
import { useOnboardingSync } from '../hooks/business/useOnboardingSync';
import { useBusinessBranch } from '../context/BusinessBranchContext';
import { apiErrorMessage } from '../services/errorMessages';
import { itemToProductDraft, itemToServiceDraft, type CatalogueItem as LiveCatalogueItem } from '../services/catalogueItemsService';
import type { BusinessOffer } from '../services/offersService';
import {
  activeDealFor,
  availabilityLabel,
  dealBadgeLabel,
  isItemActive,
  isLowStock,
  itemComparePriceLabel,
  itemPriceLabel,
  stockLabel,
} from './catalogueLive';
import type { ProductDraft } from './productDraft';

/** Neutral placeholder shown for imported products without an image. */
const PLACEHOLDER_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='80' height='80' fill='%23e5e7eb'/%3E%3Ctext x='40' y='44' font-size='9' text-anchor='middle' fill='%239ca3af'%3Eno image%3C/text%3E%3C/svg%3E";

interface BusinessHubCatalogScreenProps {
  onTab: (tab: BusinessTabKey) => void;
  onOpenAssignment: (itemName: string) => void;
  onBoost: (itemName: string) => void;
  /** Live: start a deal for this real item. */
  onMakeDeal?: (item: LiveCatalogueItem) => void;
  /** A message to show once when the screen opens (e.g. "pick an item"). */
  notice?: string | null;
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

/** Maps a live catalogue item onto the mobile catalogue card model. */
function liveToItem(item: LiveCatalogueItem, offers: BusinessOffer[], branchCount: number): CatalogItem {
  const active = isItemActive(item);
  const deal = activeDealFor(item, offers);
  const low = isLowStock(item);
  return {
    key: item.id,
    category: item.category?.name || (item.itemType === 'service' ? 'Service' : 'Product'),
    sku: item.sku || '—',
    statusLabel: active ? 'Active & Published' : 'Hidden',
    statusDot: active ? 'bg-badge-discount-text' : 'bg-outline',
    statusClass: active ? 'text-badge-discount-text' : 'text-text-secondary',
    name: item.name,
    price: itemPriceLabel(item),
    comparePrice: itemComparePriceLabel(item),
    img: item.mainImage || getCategoryImageByName(item.category?.name ?? '') || PLACEHOLDER_IMG,
    alt: item.name,
    thumbOverlay: !active,
    dealBadge: deal ? `Deal Active • ${dealBadgeLabel(deal)}` : undefined,
    note: low ? stockLabel(item) : undefined,
    noteIcon: low ? 'warning' : undefined,
    noteClass: low ? 'text-error' : undefined,
    availabilityPill: availabilityLabel(item, branchCount),
    pillIcon: 'apartment',
    pillClass: 'bg-surface-tint-blue text-primary',
    stockLabel: stockLabel(item),
    stockOn: active,
    actionLabel: 'Pricing',
    actionIcon: 'price_change',
  };
}

export function BusinessHubCatalogScreen({ onTab, onOpenAssignment, onBoost, onMakeDeal, notice }: BusinessHubCatalogScreenProps) {
  // Live: the active branch's real catalogue; demo keeps the sample cards.
  const live = hasApiConfig();
  const itemsQuery = useCatalogueItems();
  const offersQuery = useOffers();
  const { branches } = useBusinessBranch();
  const { create, update } = useCatalogueItemMutations();
  const sync = useOnboardingSync();
  const liveItems = itemsQuery.data ?? [];
  const liveById = new Map(liveItems.map((item) => [item.id, item]));
  const [addOpen, setAddOpen] = useState(false);
  const [tab, setTab] = useState('products');
  const [chip, setChip] = useState('All Status');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState<Record<string, boolean>>(
    Object.fromEntries(CATALOG_ITEMS.map((item) => [item.key, item.stockOn])),
  );
  const [sheetItem, setSheetItem] = useState<string | null>(null);
  const [sheetKey, setSheetKey] = useState<string | null>(null);

  // Bulk import state (shared wizard + review used across the whole app)
  const importedProducts = useImportedProducts();
  const [view, setView] = useState<'catalog' | 'importReview'>('catalog');
  const [addMethodsOpen, setAddMethodsOpen] = useState(false);
  const [importWizardOpen, setImportWizardOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Manual add-product flow: reuses the same onboarding wizard steps.
  const [manualStep, setManualStep] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const [manualDraft, setManualDraft] = useState<ProductDraft>({ ...INITIAL_PRODUCT_DRAFT });
  // Add / edit a service: the same four steps as onboarding, published into the catalogue.
  const [serviceStep, setServiceStep] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [serviceDraft, setServiceDraft] = useState<ServiceDraft>({ ...INITIAL_SERVICE_DRAFT });
  const startService = () => {
    setAddOpen(false);
    setServiceDraft({ ...(live ? BLANK_SERVICE_DRAFT : INITIAL_SERVICE_DRAFT) });
    setServiceStep(1);
  };
  /** Live: open a saved item in the form that created it; publishing then updates it. */
  const editLiveItem = (item: LiveCatalogueItem) => {
    if (item.itemType === 'service') {
      setServiceDraft({ ...BLANK_SERVICE_DRAFT, ...itemToServiceDraft(item) });
      setServiceStep(1);
    } else {
      setManualDraft({ ...BLANK_PRODUCT_DRAFT, ...itemToProductDraft(item) });
      setManualStep(1);
    }
  };

  const importedItems = importedProducts.map(importedToItem);
  const importedKeys = new Set(importedProducts.map((product) => product.id));
  const catalogItems = live
    ? liveItems
        .filter((item) => (tab === 'services' ? item.itemType === 'service' : item.itemType !== 'service'))
        .map((item) => liveToItem(item, offersQuery.data ?? [], branches.filter((branch) => branch.id).length))
    : CATALOG_ITEMS;
  const allItems = live ? catalogItems : [...importedItems, ...catalogItems];
  const liveCount = (type: 'product' | 'service') =>
    liveItems.filter((item) => (type === 'service' ? item.itemType === 'service' : item.itemType !== 'service')).length;
  const liveDealCount = (offersQuery.data ?? []).filter((offer) => offer.status === 'active').length;
  const filterChips = live
    ? ['All Status', `Active Deals (${liveDealCount})`, 'Low Stock', 'Dine-In & Takeaway']
    : FILTER_CHIPS;

  /** Live: shelf on/off is the item's active status. */
  const toggleLiveItem = (id: string) => {
    const item = liveById.get(id);
    if (!item) return false;
    update.mutate(
      { id, input: { status: isItemActive(item) ? 'inactive' : 'active' } },
      { onError: (error) => showToast(apiErrorMessage(error, 'Could not update this item.')) },
    );
    return true;
  };
  const draftImportCount = live ? 0 : importedProducts.filter((product) => product.status === 'draft').length;

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (notice) showToast(notice);
  }, [notice]);

  /** Live: a copy of the item at the active branch, hidden until reviewed. */
  const duplicateLiveItem = (item: LiveCatalogueItem) => {
    const branchId = item.branches?.[0]?.id;
    if (!branchId) return showToast('This item is not assigned to a branch yet.');
    create.mutate(
      {
        name: `${item.name} (copy)`,
        description: item.description || item.name,
        price: Number(item.price ?? 0),
        ...(item.compareAtPrice ? { compareAtPrice: Number(item.compareAtPrice) } : {}),
        ...(item.mainImage ? { mainImage: item.mainImage } : {}),
        ...(item.categoryId ? { categoryId: item.categoryId } : {}),
        itemType: item.itemType === 'service' ? 'service' : 'product',
        branchId,
      },
      {
        onSuccess: () => showToast(`Copy of “${item.name}” added.`),
        onError: (error) => showToast(apiErrorMessage(error, 'Could not duplicate this item.')),
      },
    );
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

  if (serviceStep > 0) {
    const changeServiceDraft = (patch: Partial<ServiceDraft>) => setServiceDraft((previous) => ({ ...previous, ...patch }));
    const closeService = () => setServiceStep(0);
    const handleServicePublish = () => {
      const name = serviceDraft.title || 'Service';
      if (!live) {
        closeService();
        showToast(`“${name}” published to your catalogue.`);
        return;
      }
      const edited = Boolean(serviceDraft.publishedItemId);
      sync.publishService(serviceDraft, () => {
        closeService();
        setServiceDraft({ ...BLANK_SERVICE_DRAFT });
        showToast(`“${name}” ${edited ? 'updated' : 'published to your catalogue'}.`);
      });
    };
    return (
      <AppScreen>
        {serviceStep === 1 && (
          <BusinessAddServiceStep1Screen
            draft={serviceDraft}
            onDraftChange={changeServiceDraft}
            onBack={closeService}
            onNext={() => setServiceStep(2)}
            onSaveDraft={closeService}
          />
        )}
        {serviceStep === 2 && (
          <BusinessAddServiceStep2Screen
            draft={serviceDraft}
            onDraftChange={changeServiceDraft}
            onBack={() => setServiceStep(1)}
            onNext={() => setServiceStep(3)}
            onSaveDraft={closeService}
          />
        )}
        {serviceStep === 3 && (
          <BusinessAddServiceStep3Screen
            draft={serviceDraft}
            onDraftChange={changeServiceDraft}
            onBack={() => setServiceStep(2)}
            onNext={() => setServiceStep(4)}
            onSaveDraft={closeService}
          />
        )}
        {serviceStep === 4 && (
          <BusinessServiceReviewScreen
            draft={serviceDraft}
            onBack={() => setServiceStep(3)}
            onEditBasics={() => setServiceStep(1)}
            onEditPricing={() => setServiceStep(2)}
            onEditBranches={() => setServiceStep(3)}
            onPublish={handleServicePublish}
            onSaveDraft={closeService}
          />
        )}
        {sync.error && (
          <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[80] bg-inverse-surface text-inverse-on-surface px-space-md py-space-xs rounded-xl shadow-2xl font-label-md text-label-md max-w-[90vw] text-center">
            {sync.error}
          </div>
        )}
      </AppScreen>
    );
  }

  // Manual add-product: same five steps as onboarding, published into the catalogue.
  if (manualStep > 0) {
    const changeManualDraft = (patch: Partial<ProductDraft>) =>
      setManualDraft((previous) => ({ ...previous, ...patch }));
    const handleManualPublish = () => {
      if (live) {
        // Live: the same publish as setup — the active branch plus any branches ticked.
        const edited = Boolean(manualDraft.publishedItemId);
        sync.publishProduct(manualDraft, () => {
          setManualStep(0);
          setManualDraft({ ...BLANK_PRODUCT_DRAFT });
          showToast(`“${manualDraft.title || 'Product'}” ${edited ? 'updated' : 'published to your catalogue'}.`);
        });
        return;
      }
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
            onDraftChange={changeManualDraft}
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
        {sync.error && (
          <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[80] bg-inverse-surface text-inverse-on-surface px-space-md py-space-xs rounded-xl shadow-2xl font-label-md text-label-md max-w-[90vw] text-center">
            {sync.error}
          </div>
        )}
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <BusinessHubHeader />
      <div className="flex flex-col w-full flex-1 pb-24">
        {/* Add New — location is picked from the persistent top-bar icon */}
        <div className="px-margin pt-space-xs pb-space-sm flex items-center justify-end gap-space-xs">
          {/* Split Add Action */}
          <div className="relative">
            {addOpen && <div className="fixed inset-0 z-30" onClick={() => setAddOpen(false)} />}
            <button
              className="flex items-center gap-space-2xs bg-primary-container text-on-primary-container pl-space-sm pr-space-xs py-space-2xs rounded-full shadow-md active:scale-95 transition-all"
              type="button"
              onClick={() => setAddOpen((open) => !open)}
            >
              <Icon name="add" className="text-[18px]" />
              <span className="font-button-secondary text-button-secondary font-semibold">Add New</span>
              <span className="w-[1px] h-4 bg-on-primary-container/20 mx-space-2xs" />
              <Icon name="arrow_drop_down" className="text-[18px]" />
            </button>
            {addOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-surface-canvas rounded-xl shadow-xl z-40 p-space-xs flex flex-col gap-space-2xs">
                <button
                  className="w-full text-left px-space-sm py-space-xs rounded-lg hover:bg-surface-container text-text-primary font-label-sm text-label-sm flex items-center gap-space-xs"
                  type="button"
                  onClick={() => {
                    setAddOpen(false);
                    setAddMethodsOpen(true);
                  }}
                >
                  <Icon name="inventory_2" className="text-primary text-[18px]" />
                  <span>+ Add Product</span>
                </button>
                <button
                  className="w-full text-left px-space-sm py-space-xs rounded-lg hover:bg-surface-container text-text-primary font-label-sm text-label-sm flex items-center gap-space-xs"
                  type="button"
                  onClick={startService}
                >
                  <Icon name="room_service" className="text-tertiary-container text-[18px]" />
                  <span>+ Add Service</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Segmented Tabs */}
        <div className="px-margin mb-space-sm">
          <div className="flex items-center bg-surface-container-high p-[3px] rounded-full">
            {[
              { key: 'products', label: live ? `Products (${liveCount('product')})` : 'Products (28)' },
              { key: 'services', label: live ? `Services (${liveCount('service')})` : 'Services (14)' },
              { key: 'categories', label: 'Categories (6)' },
            ].map((catalogTab) => {
              const active = tab === catalogTab.key;
              return (
                <button
                  className={`flex-1 py-space-2xs text-center rounded-full font-label-md text-label-md transition-all ${
                    active ? 'bg-surface-canvas text-primary font-semibold shadow-sm' : 'text-text-secondary hover:text-text-primary'
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
        <div className="px-margin flex flex-col gap-space-xs mb-space-md">
          <div className="relative flex items-center w-full">
            <Icon name="search" className="absolute left-space-sm text-outline text-[20px] pointer-events-none" />
            <input
              className="w-full bg-surface-canvas text-text-primary pl-10 pr-space-xl py-space-xs rounded-xl shadow-sm font-body-md text-body-md placeholder:text-text-tertiary focus:outline-none focus:bg-surface-tint-blue transition-all"
              placeholder="Search items, SKU, category..."
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <FilterMenu
              align="right"
              ariaLabel="Filter catalogue by category"
              buttonClassName="absolute right-space-sm top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-lg text-outline hover:text-text-primary transition-colors"
              choices={categoryChoices}
              icon="tune"
              iconClassName="text-[18px]"
              label={null}
              onChange={setCategory}
              title="Filter by category"
              value={category}
            />
          </div>
          <div className="flex items-center gap-space-2xs overflow-x-auto no-scrollbar py-space-2xs">
            {filterChips.map((filterChip) => {
              const active = chip === filterChip;
              return (
                <button
                  className={`flex-shrink-0 px-space-sm py-1 rounded-full font-label-sm text-label-sm font-medium transition-colors ${
                    active
                      ? 'bg-primary-fixed text-on-primary-fixed'
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
        <div className="px-margin flex flex-col gap-space-sm pb-space-2xl">
          {visibleItems.map((item) => (
            <div
              className="bg-surface-canvas rounded-xl p-space-sm shadow-sm flex flex-col gap-space-xs relative overflow-hidden"
              key={item.key}
            >
              {/* Top Meta Bar */}
              <div className="flex items-center justify-between font-caption text-caption text-text-secondary">
                <span className="flex items-center gap-1">
                  <span className="font-medium text-text-primary">{item.category}</span>
                  <span>•</span>
                  <span className="font-mono text-outline">{item.sku}</span>
                </span>
                <div className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${item.statusDot}`} />
                  <span className={`font-medium ${item.statusClass}`}>{item.statusLabel}</span>
                </div>
              </div>
              {/* Main Row */}
              <div className="flex gap-space-sm items-start">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container">
                  <img
                    alt={item.alt}
                    className={`w-full h-full object-cover ${item.thumbOverlay ? 'grayscale-[40%]' : ''}`}
                    src={item.img}
                  />
                  {item.thumbBadge && (
                    <span className="absolute bottom-1 right-1 bg-surface-canvas/90 px-1 py-0.5 rounded font-caption text-[10px] font-semibold flex items-center">
                      <Icon name="local_fire_department" className={`text-[10px] mr-0.5 ${item.thumbBadgeClass}`} />
                      {item.thumbBadge}
                    </span>
                  )}
                  {item.thumbOverlay && (
                    <div className="absolute inset-0 bg-surface-dim/40 flex items-center justify-center">
                      <Icon name="pause_circle" className="text-on-surface text-[18px]" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h2
                      className={`font-heading-sm text-heading-sm truncate ${
                        item.key === 'bread' ? 'text-text-secondary' : 'text-text-primary'
                      }`}
                    >
                      {item.name}
                    </h2>
                    <div className="flex items-baseline gap-space-xs mt-0.5">
                      <span
                        className={`font-heading-sm text-heading-sm font-bold ${
                          item.key === 'bread' ? 'text-text-secondary' : 'text-text-primary'
                        }`}
                      >
                        {item.price}
                      </span>
                      {item.comparePrice && (
                        <span className="font-caption text-caption text-text-tertiary line-through">
                          {item.comparePrice}
                        </span>
                      )}
                      {item.baseNote && (
                        <span className="font-caption text-caption text-text-secondary font-medium">{item.baseNote}</span>
                      )}
                    </div>
                  </div>
                  {item.dealBadge && (
                    <div className="mt-space-2xs inline-flex items-center gap-1 bg-badge-discount-bg text-badge-discount-text px-2 py-0.5 rounded-full self-start">
                      <Icon name="local_offer" className="text-[13px]" />
                      <span className="font-caption text-caption font-semibold">{item.dealBadge}</span>
                    </div>
                  )}
                  {item.note && (
                    <span className={`font-caption text-caption mt-1 flex items-center gap-1 ${item.noteClass ?? 'text-text-secondary'}`}>
                      {item.noteIcon && <Icon name={item.noteIcon} className="text-[14px]" />}
                      {item.note}
                    </span>
                  )}
                </div>
                <button
                  aria-label={`${item.name} options`}
                  className="text-on-surface-variant hover:text-text-primary p-1 -mr-1 rounded-full transition-colors"
                  type="button"
                  onClick={() => {
                    setSheetItem(item.name);
                    setSheetKey(item.key);
                  }}
                >
                  <Icon name="more_vert" className="text-[20px]" />
                </button>
              </div>
              {/* Location Availability Pill */}
              <div
                className={`px-space-xs py-1 rounded-lg flex items-center gap-1.5 font-caption text-caption ${item.pillClass}`}
              >
                <Icon name={item.pillIcon} className="text-[15px]" />
                <span className="font-medium truncate">{item.availabilityPill}</span>
                {item.pillExtra && (
                  <span className="ml-auto bg-surface-canvas text-secondary text-[11px] px-1.5 py-0.5 rounded shadow-xs font-medium shrink-0">
                    {item.pillExtra}
                  </span>
                )}
              </div>
              {/* Quick Action Deck */}
              <div className="flex items-center justify-between pt-space-2xs bg-surface-container-low/50 -mx-space-sm -mb-space-sm px-space-sm py-2 rounded-b-xl">
                <div className="flex items-center gap-2">
                  <button
                    aria-label={`Toggle stock for ${item.name}`}
                    className={`w-9 h-5 rounded-full transition-colors ${(live ? item.stockOn : stock[item.key] ?? item.stockOn) ? 'bg-primary-container' : 'bg-surface-dim'}`}
                    role="switch"
                    type="button"
                    onClick={() => {
                      if (live && toggleLiveItem(item.key)) return;
                      setStock((current) => ({ ...current, [item.key]: !(current[item.key] ?? item.stockOn) }));
                    }}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-surface-canvas shadow transition-transform ${
                        (live ? item.stockOn : stock[item.key] ?? item.stockOn) ? 'translate-x-[18px]' : 'translate-x-[2px]'
                      }`}
                    />
                  </button>
                  <span className="font-label-sm text-label-sm text-text-secondary">
                    {(live ? item.stockOn : stock[item.key] ?? item.stockOn) ? item.stockLabel : 'Off Shelf'}
                  </span>
                </div>
                <div className="flex items-center gap-space-2xs">
                  <button
                    className="flex items-center gap-1 px-space-xs py-1 rounded-md bg-primary-container shadow-sm text-on-primary font-label-sm text-label-sm font-semibold hover:bg-primary transition-colors"
                    type="button"
                    onClick={() => onBoost(item.name)}
                  >
                    <Icon name="rocket_launch" className="text-[15px]" />
                    <span>Boost</span>
                  </button>
                  <button
                    className="flex items-center gap-1 px-space-xs py-1 rounded-md bg-surface-canvas shadow-sm text-primary font-label-sm text-label-sm font-medium hover:bg-surface-container-high transition-colors"
                    type="button"
                    onClick={() => {
                      const liveItem = live ? liveById.get(item.key) : undefined;
                      if (importedKeys.has(item.key)) setView('importReview');
                      else if (liveItem && item.actionLabel === 'Edit') editLiveItem(liveItem);
                      else onOpenAssignment(live ? item.key : item.name);
                    }}
                  >
                    <Icon name={item.actionIcon} className="text-[15px]" />
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
              ...(live
                ? [
                    { icon: 'edit', iconClass: 'text-primary', label: 'Edit Details' },
                    { icon: 'local_offer', iconClass: 'text-badge-discount-text', label: 'Make a Deal' },
                  ]
                : []),
              { icon: 'content_copy', iconClass: 'text-primary', label: 'Duplicate Product' },
              { icon: 'price_change', iconClass: 'text-primary-container', label: 'Manage Location Pricing' },
              // No table-order QR per item yet — sample only.
              ...(live ? [] : [{ icon: 'qr_code_2', iconClass: 'text-secondary', label: 'View Table Order QR' }]),
              { icon: 'archive', iconClass: 'text-error', label: 'Archive from Catalogue', danger: true },
            ].map((action) => (
              <button
                className={`w-full flex items-center gap-space-sm px-space-sm py-space-sm rounded-xl font-body-md text-body-md transition-colors text-left ${
                  action.danger ? 'hover:bg-error-container text-error' : 'hover:bg-surface-container text-text-primary'
                }`}
                key={action.label}
                type="button"
                onClick={() => {
                  const liveItem = live && sheetKey ? liveById.get(sheetKey) : undefined;
                  if (action.label === 'Manage Location Pricing') {
                    setSheetItem(null);
                    onOpenAssignment(liveItem ? liveItem.id : sheetItem);
                  } else if (liveItem && action.label === 'Edit Details') {
                    setSheetItem(null);
                    editLiveItem(liveItem);
                  } else if (liveItem && action.label === 'Make a Deal') {
                    setSheetItem(null);
                    onMakeDeal?.(liveItem);
                  } else if (liveItem && action.label === 'Duplicate Product') {
                    setSheetItem(null);
                    duplicateLiveItem(liveItem);
                  } else if (liveItem && action.danger) {
                    setSheetItem(null);
                    update.mutate(
                      { id: liveItem.id, input: { status: 'archived' } },
                      {
                        onSuccess: () => showToast(`“${liveItem.name}” archived.`),
                        onError: (error) => showToast(apiErrorMessage(error, 'Could not archive this item.')),
                      },
                    );
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
            onClick={startService}
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
          setManualDraft({ ...(live ? BLANK_PRODUCT_DRAFT : INITIAL_PRODUCT_DRAFT) });
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

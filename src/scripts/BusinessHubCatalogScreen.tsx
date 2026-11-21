import { useEffect, useState } from 'react';
import { AppScreen } from '../components/ui/AppScreen';
import { FilterMenu } from '../components/FilterMenu';
import { Icon } from '../components/ui/Icon';
import { ProductImage } from '../components/ui/ProductImage';
import { BusinessTabBar, type BusinessTabKey } from '../components/BusinessTabBar';
import { BusinessHubHeader } from './BusinessHubHeader';
import { AddProductMethodsDialog } from '../components/import/AddProductMethodsDialog';
import { ProductImportWizard } from '../components/import/ProductImportWizard';
import { ImportedProductsReview } from '../components/import/ImportedProductsReview';
import { useImportedProducts, resolveProductDisplayImage, saveImportedProducts, publishImportedProducts } from './productImport/importedProductStore';
import { parseMoney } from './productImport/importRecords';
import { summariseImport } from './productImport/importSummary';
import { getCategoryImageByName, getCentralCategories, naira } from './catalogueData';
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
import { useCatalogueCategories } from '../hooks/business/useCatalogueCategories';
import { useOffers } from '../hooks/business/useOffers';
import { useOnboardingSync } from '../hooks/business/useOnboardingSync';
import { usePrimaryStoreQrLinks } from '../hooks/business/usePrimaryStoreQrLinks';
import { useBusinessBranch } from '../context/BusinessBranchContext';
import { CatalogProductInfoPanel } from '../components/CatalogProductInfoPanel';
import { CATALOG_PAGE_SIZE, CATALOG_SORT_CHOICES, paginateCatalogueRecords, sortCatalogueRecords, type CatalogSortKey } from './catalogSort';
import { apiErrorMessage } from '../services/errorMessages';
import { copyTextToClipboard } from './referralData';
import { itemToProductDraft, itemToServiceDraft, type CatalogueItem as LiveCatalogueItem } from '../services/catalogueItemsService';
import type { BusinessOffer } from '../services/offersService';
import {
  activeDealFor,
  availabilityLabel,
  dealBadgeLabel,
  firstUsableItemImage,
  isItemActive,
  isLowStock,
  itemComparePriceLabel,
  itemPriceLabel,
  stockLabel,
} from './catalogueLive';
import type { ProductDraft } from './productDraft';

interface BusinessHubCatalogScreenProps {
  /** Products and Services are separate pages; this screen renders one of them. */
  mode?: 'products' | 'services';
  /** Route mode: open the new-product wizard straight away. */
  startWithNewProduct?: boolean;
  /** Route mode: open the new-service wizard straight away. */
  startWithNewService?: boolean;
  onTab: (tab: BusinessTabKey) => void;
  onOpenAssignment: (itemName: string) => void;
  onBoost: (itemName: string) => void;
  /** Live: start a deal for this real item. */
  onMakeDeal?: (item: LiveCatalogueItem) => void;
  /** A message to show once when the screen opens (e.g. "pick an item"). */
  notice?: string | null;
}

const MOBILE_FILTER_CHIPS = [
  { key: 'all', label: 'All Status' },
  { key: 'deals', label: 'Active Deals' },
  { key: 'low', label: 'Low Stock' },
  { key: 'takeaway', label: 'Dine-In & Takeaway' },
] as const;

type MobileCatalogChip = (typeof MOBILE_FILTER_CHIPS)[number]['key'];

interface CatalogItem {
  key: string;
  category: string;
  sku: string;
  barcode?: string;
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
  filters?: MobileCatalogChip[];
  createdAt?: string | null;
  updatedAt?: string | null;
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

/** Maps a bulk-imported product onto the mobile catalogue card model. */
function importedToItem(product: ImportedProduct): CatalogItem {
  const published = product.status === 'published';
  const onSale = product.salePrice !== null && product.price !== null && product.salePrice < product.price;
  const stock = product.stock;
  return {
    key: product.id,
    category: product.category || 'General',
    sku: product.sku || '—',
    barcode: product.barcode || undefined,
    statusLabel: published ? 'Published' : product.needsReview ? 'Draft • Needs Review' : 'Imported Draft',
    statusDot: published ? 'bg-badge-discount-text' : 'bg-outline',
    statusClass: published ? 'text-badge-discount-text' : 'text-text-secondary',
    name: product.name || 'Untitled imported product',
    price: product.price !== null ? naira(onSale ? (product.salePrice as number) : product.price) : '—',
    comparePrice: onSale && product.price !== null ? naira(product.price) : undefined,
    baseNote: published ? undefined : 'draft',
    // Own image first, then the category image as a fallback (linked, not copied).
    img: resolveProductDisplayImage(product, getCategoryImageByName) ?? '',
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
    filters: ['all'],
  };
}

/** Maps a live catalogue item onto the mobile catalogue card model. */
function liveToItem(item: LiveCatalogueItem, offers: BusinessOffer[], branchCount: number): CatalogItem {
  const active = isItemActive(item);
  const deal = activeDealFor(item, offers);
  const low = isLowStock(item);
  const modes = item.fulfillmentModes ?? [];
  const dineInTakeaway =
    modes.some((mode) => mode === 'dine_in' || mode === 'pickup') ||
    /dine|take|pickup/i.test(item.serviceMode ?? '');
  return {
    key: item.id,
    category: item.category?.name || (item.itemType === 'service' ? 'Service' : 'Product'),
    sku: item.sku || '—',
    barcode: item.barcode ?? undefined,
    statusLabel: active ? 'Active & Published' : 'Hidden',
    statusDot: active ? 'bg-badge-discount-text' : 'bg-outline',
    statusClass: active ? 'text-badge-discount-text' : 'text-text-secondary',
    name: item.name,
    price: itemPriceLabel(item),
    comparePrice: itemComparePriceLabel(item),
    img: firstUsableItemImage(item) ?? '',
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
    filters: [
      'all',
      ...(deal ? (['deals'] as MobileCatalogChip[]) : []),
      ...(low ? (['low'] as MobileCatalogChip[]) : []),
      ...(dineInTakeaway ? (['takeaway'] as MobileCatalogChip[]) : []),
    ],
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

/** Demo cards still open the same panel; live mode always uses the real item below. */
function catalogItemToLive(item: CatalogItem): LiveCatalogueItem {
  return {
    id: item.key,
    name: item.name,
    price: parseMoney(item.price) ?? undefined,
    compareAtPrice: parseMoney(item.comparePrice ?? '') ?? undefined,
    mainImage: item.img,
    category: item.category ? { id: item.category, name: item.category } : null,
    status: item.statusLabel.toLowerCase().includes('draft') || item.statusLabel.toLowerCase().includes('pause') ? 'inactive' : 'active',
    itemType: 'product',
    sku: item.sku,
    barcode: item.barcode ?? undefined,
    shortDescription: item.note ?? undefined,
    description: item.alt,
    isSuspended: !item.stockOn,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

const matchesMobileChip = (item: CatalogItem, selected: MobileCatalogChip) => {
  if (selected === 'all') return true;
  if (item.filters) return item.filters.includes(selected);
  if (selected === 'deals') return Boolean(item.dealBadge);
  if (selected === 'low') return item.thumbBadge === 'Low' || /low stock|limited stock/i.test(item.note ?? '');
  return /dine-in|takeaway/i.test(item.note ?? '');
};

export function BusinessHubCatalogScreen({
  mode = 'products',
  startWithNewProduct = false,
  startWithNewService = false,
  onTab,
  onOpenAssignment,
  onBoost,
  onMakeDeal,
  notice,
}: BusinessHubCatalogScreenProps) {
  // Product-only rollout: service mode and the service wizard stay inactive.
  void mode;
  // Live: the active branch's real catalogue; demo keeps the sample cards.
  const live = hasApiConfig();
  const itemsQuery = useCatalogueItems();
  const categoriesQuery = useCatalogueCategories('product');
  const offersQuery = useOffers();
  const productLinks = usePrimaryStoreQrLinks();
  const { branches } = useBusinessBranch();
  const { create, update } = useCatalogueItemMutations();
  const sync = useOnboardingSync();
  const liveItems = itemsQuery.data ?? [];
  // Product-only rollout: both sources are already filtered to product categories.
  const categoryRows = live ? categoriesQuery.data ?? [] : getCentralCategories('product');
  const liveById = new Map(liveItems.map((item) => [item.id, item]));
  const [addOpen, setAddOpen] = useState(false);
  const [tab, setTab] = useState<'products' | 'categories'>('products');
  const [chip, setChip] = useState<MobileCatalogChip>('all');
  const [sort, setSort] = useState<CatalogSortKey>('newest');
  const [page, setPage] = useState(1);
  const [detailItem, setDetailItem] = useState<LiveCatalogueItem | null>(null);
  const [detailShowQr, setDetailShowQr] = useState(false);
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
  const [manualStep, setManualStep] = useState<0 | 1 | 2 | 3 | 4 | 5>(startWithNewProduct ? 1 : 0);
  const [manualDraft, setManualDraft] = useState<ProductDraft>({
    ...(startWithNewProduct && live ? BLANK_PRODUCT_DRAFT : INITIAL_PRODUCT_DRAFT),
  });
  // Add / edit a service: the same four steps as onboarding, published into the catalogue.
  // Product-only rollout: the service wizard is never entered.
  const [serviceStep, setServiceStep] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [serviceDraft, setServiceDraft] = useState<ServiceDraft>({
    ...(startWithNewService && live ? BLANK_SERVICE_DRAFT : INITIAL_SERVICE_DRAFT),
  });
  const startService = () => {
    setAddOpen(false);
    setServiceDraft({ ...(live ? BLANK_SERVICE_DRAFT : INITIAL_SERVICE_DRAFT) });
    setServiceStep(1);
  };
  void startService;
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
        .filter((item) => item.itemType !== 'service')
        .map((item) => liveToItem(item, offersQuery.data ?? [], branches.filter((branch) => branch.id).length))
    : CATALOG_ITEMS.filter((item) => !item.sku.startsWith('SRV-'));
  const allItems = live ? catalogItems : [...importedItems, ...catalogItems];
  const liveCount = (type: 'product' | 'service') =>
    live
      ? liveItems.filter((item) => (type === 'service' ? item.itemType === 'service' : item.itemType !== 'service')).length
      : type === 'product'
      ? catalogItems.length
      : 0;
  const liveDealCount = (offersQuery.data ?? []).filter((offer) => offer.status === 'active').length;
  const filterChips = MOBILE_FILTER_CHIPS.map((entry) => ({
    ...entry,
    label:
      entry.key === 'deals'
        ? `Active Deals (${live ? liveDealCount : allItems.filter((item) => Boolean(item.dealBadge)).length})`
        : entry.label,
  }));

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

  useEffect(() => {
    setPage(1);
  }, [chip, search, category, sort]);

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

  const filteredItems = allItems.filter((item) => {
    if (!matchesMobileChip(item, chip)) return false;
    if (category !== '' && item.category !== category) return false;
    const query = search.trim().toLowerCase();
    return (
      query === '' ||
      item.name.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.sku.toLowerCase().includes(query) ||
      (item.barcode ?? '').toLowerCase().includes(query)
    );
  });
  // Default newest-first, then paginate 10 per screen like the desktop table.
  const sortedItems = sortCatalogueRecords(filteredItems, sort);
  const pagination = paginateCatalogueRecords(sortedItems, page, CATALOG_PAGE_SIZE);
  const visibleItems = pagination.rows;

  const openProductDetails = (item: LiveCatalogueItem, showQr = false) => {
    setDetailShowQr(showQr);
    setDetailItem(item);
  };

  const openCardDetails = (card: CatalogItem, showQr = false) => {
    const item = live ? liveById.get(card.key) ?? catalogItemToLive(card) : catalogItemToLive(card);
    openProductDetails(item, showQr);
  };

  const copyCardUrl = async (card: CatalogItem) => {
    const url = productLinks.productUrl(card.key);
    if (!url) return showToast('The public product link is still loading.');
    const copied = await copyTextToClipboard(url);
    showToast(copied ? 'Public product URL copied.' : 'Could not copy the link. Open the product panel to copy it manually.');
  };

  const editDetailItem = () => {
    const item = detailItem;
    setDetailItem(null);
    if (item) editLiveItem(item);
  };

  const makeDealFromDetail = () => {
    const item = detailItem;
    setDetailItem(null);
    if (item && live) onMakeDeal?.(item);
  };

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
      sync.publishService(
        serviceDraft,
        () => {
          closeService();
          setServiceDraft({ ...BLANK_SERVICE_DRAFT });
          showToast(`“${name}” ${edited ? 'updated' : 'published to your catalogue'}.`);
        },
        { asDraft: false },
      );
    };
    /** Live: keep the work as a hidden service (needs a name); otherwise just close. */
    const saveServiceDraft = () => {
      const name = serviceDraft.title.trim();
      if (!live || !name) return closeService();
      sync.publishService(
        serviceDraft,
        () => {
          closeService();
          setServiceDraft({ ...BLANK_SERVICE_DRAFT });
          showToast(`“${name}” saved as a draft — hidden from customers until you publish it.`);
        },
        { asDraft: true },
      );
    };
    return (
      <AppScreen>
        {serviceStep === 1 && (
          <BusinessAddServiceStep1Screen
            draft={serviceDraft}
            onDraftChange={changeServiceDraft}
            onBack={closeService}
            onNext={() => setServiceStep(2)}
            onSaveDraft={saveServiceDraft}
          />
        )}
        {serviceStep === 2 && (
          <BusinessAddServiceStep2Screen
            draft={serviceDraft}
            onDraftChange={changeServiceDraft}
            onBack={() => setServiceStep(1)}
            onNext={() => setServiceStep(3)}
            onSaveDraft={saveServiceDraft}
          />
        )}
        {serviceStep === 3 && (
          <BusinessAddServiceStep3Screen
            draft={serviceDraft}
            onDraftChange={changeServiceDraft}
            onBack={() => setServiceStep(2)}
            onNext={() => setServiceStep(4)}
            onSaveDraft={saveServiceDraft}
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
            onSaveDraft={saveServiceDraft}
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
        const perBranch = manualDraft.pricingMode === 'custom';
        sync.publishProduct(
          manualDraft,
          () => {
            setManualStep(0);
            setManualDraft({ ...BLANK_PRODUCT_DRAFT });
            showToast(
              `“${manualDraft.title || 'Product'}” ${edited ? 'updated' : 'published to your catalogue'}.${
                perBranch ? ' Set its branch prices in the item options → Manage Location Pricing.' : ''
              }`,
            );
          },
          { asDraft: false },
        );
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
            barcode: manualDraft.barcode,
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
    /** Live: keep the work as a hidden product (needs a name); otherwise just close. */
    const saveManualDraft = () => {
      const name = manualDraft.title.trim();
      if (!live || !name) return setManualStep(0);
      sync.publishProduct(
        manualDraft,
        () => {
          setManualStep(0);
          setManualDraft({ ...BLANK_PRODUCT_DRAFT });
          showToast(`“${name}” saved as a draft — hidden from customers until you publish it.`);
        },
        { asDraft: true },
      );
    };
    return (
      <AppScreen>
        {manualStep === 1 && (
          <BusinessAddProductStep1Screen
            draft={manualDraft}
            onDraftChange={changeManualDraft}
            onBack={() => setManualStep(0)}
            onNext={() => setManualStep(2)}
            onSaveDraft={saveManualDraft}
          />
        )}
        {manualStep === 2 && (
          <BusinessAddProductStep2Screen
            draft={manualDraft}
            onDraftChange={changeManualDraft}
            onBack={() => setManualStep(1)}
            onNext={() => setManualStep(3)}
            onSaveDraft={saveManualDraft}
          />
        )}
        {manualStep === 3 && (
          <BusinessAddProductImageScreen
            draft={manualDraft}
            onDraftChange={changeManualDraft}
            onBack={() => setManualStep(2)}
            onNext={() => setManualStep(4)}
            onSaveDraft={saveManualDraft}
          />
        )}
        {manualStep === 4 && (
          <BusinessAddProductStep3Screen
            draft={manualDraft}
            onDraftChange={changeManualDraft}
            onBack={() => setManualStep(3)}
            onNext={() => setManualStep(5)}
            onSaveDraft={saveManualDraft}
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
            publishing={sync.saving}
            onSaveDraft={saveManualDraft}
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
                {/* Product-only rollout: the service add action is hidden. */}
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
              </div>
            )}
          </div>
        </div>

        {/* Segmented Tabs */}
        <div className="px-margin mb-space-xs">
          <div className="flex items-center bg-surface-container-high p-0.5 rounded-lg">
            {[
              { key: 'products' as const, label: `Products (${liveCount('product')})` },
              { key: 'categories' as const, label: `Categories (${categoryRows.length})` },
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
        {draftImportCount > 0 && tab === 'products' && (
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

        {tab === 'categories' && (
          <div className="px-margin flex flex-col gap-2 pb-space-2xl">
            {live && categoriesQuery.isLoading ? (
              <p className="py-space-lg text-center font-body-md text-body-md text-text-secondary">Loading categories…</p>
            ) : live && categoriesQuery.isError ? (
              <p role="alert" className="py-space-lg text-center font-body-md text-body-md text-error">
                {apiErrorMessage(categoriesQuery.error, 'Could not load your categories.')}
              </p>
            ) : categoryRows.length === 0 ? (
              <div className="py-space-xl flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-surface-container-high text-primary flex items-center justify-center mb-space-sm">
                  <Icon name="category" className="text-[32px]" />
                </div>
                <h4 className="font-heading-sm text-heading-sm text-text-primary">No categories yet</h4>
                <p className="font-body-md text-body-md text-text-secondary max-w-xs mt-1">
                  Create a category while adding a product to see it here.
                </p>
              </div>
            ) : (
              categoryRows.map((entry) => {
                const linkedItems = liveItems.filter(
                  (item) => item.categoryId === entry.id || item.category?.id === entry.id,
                ).length;
                return (
                  <div
                    key={entry.id}
                    className="bg-surface-canvas rounded-xl p-3 shadow-xs border border-border-subtle/50 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-surface-tint-blue text-primary flex items-center justify-center shrink-0">
                      <Icon name={entry.icon || 'category'} className="text-[20px]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block font-label-md text-label-md font-semibold text-text-primary truncate">{entry.name}</span>
                      <span className="font-caption text-caption text-text-secondary">
                        Product · {linkedItems} products
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {tab !== 'categories' && (
          <>
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
          <div className="flex items-center justify-between gap-space-xs">
            <span className="truncate font-caption text-caption text-text-secondary">
              Sorted by <span className="font-semibold text-text-primary">{CATALOG_SORT_CHOICES.find((choice) => choice.value === sort)?.label}</span>
            </span>
            <FilterMenu
              align="right"
              ariaLabel="Sort products"
              buttonClassName="flex items-center gap-1 rounded-lg bg-surface-container-high px-2 py-1 font-label-sm text-label-sm font-semibold text-on-surface hover:bg-surface-container-highest transition-colors"
              choices={CATALOG_SORT_CHOICES}
              icon="swap_vert"
              iconClassName="text-[15px]"
              label="Sort"
              onChange={(next) => setSort(next as CatalogSortKey)}
              title="Sort products"
              value={sort}
            />
          </div>
          <div className="flex items-center gap-space-2xs overflow-x-auto no-scrollbar py-space-2xs">
            {filterChips.map((filterChip) => {
              const active = chip === filterChip.key;
              return (
                <button
                  className={`flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                    active
                      ? 'bg-primary-fixed text-on-primary-fixed font-semibold'
                      : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                  }`}
                  key={filterChip.key}
                  type="button"
                  onClick={() => setChip(filterChip.key)}
                >
                  {filterChip.label}
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
                  <span className="font-mono text-outline text-[10px]">
                    {item.sku}{item.barcode ? ` · ${item.barcode}` : ''}
                  </span>
                </span>
                <div className="flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${item.statusDot}`} />
                  <span className={`font-medium ${item.statusClass}`}>{item.statusLabel}</span>
                </div>
              </div>
              {/* Main Row */}
              <div className="flex gap-2.5 items-start">
                <button
                  aria-label={`View ${item.name} details`}
                  className="relative block w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-surface-container shadow-xs"
                  onClick={() => openCardDetails(item)}
                  title="View product information"
                  type="button"
                >
                  <ProductImage
                    alt={item.alt}
                    className="h-full w-full"
                    iconClassName="text-[20px]"
                    imageClassName={`h-full w-full object-cover ${item.thumbOverlay ? 'grayscale-[40%]' : ''}`}
                    showLabel={false}
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
                </button>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <button
                      className={`font-label-md text-label-md font-semibold truncate text-left ${
                        item.key === 'bread' ? 'text-text-secondary' : 'text-text-primary'
                      }`}
                      onClick={() => openCardDetails(item)}
                      title="View product information"
                      type="button"
                    >
                      {item.name}
                    </button>
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
                  onClick={() => {
                    setSheetItem(item.name);
                    setSheetKey(item.key);
                  }}
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
                      const liveItem = live ? liveById.get(item.key) : undefined;
                      if (importedKeys.has(item.key)) setView('importReview');
                      else if (liveItem && item.actionLabel === 'Edit') editLiveItem(liveItem);
                      else onOpenAssignment(live ? item.key : item.name);
                    }}
                  >
                    <Icon name={item.actionIcon} className="text-[13px]" />
                    <span>{item.actionLabel}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredItems.length > 0 && (
            <div className="mt-space-sm flex items-center justify-between rounded-xl bg-surface-container-low px-space-sm py-space-2xs">
              <span className="font-caption text-caption text-text-secondary">
                {pagination.from}–{pagination.to} of {filteredItems.length}
              </span>
              <div className="flex items-center gap-space-2xs">
                <button
                  aria-label="Previous products page"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-canvas text-text-secondary shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={pagination.page <= 1}
                  onClick={() => setPage(pagination.page - 1)}
                  type="button"
                >
                  <Icon name="chevron_left" className="text-[18px]" />
                </button>
                <span className="min-w-16 text-center font-label-sm text-label-sm font-bold text-text-primary">
                  {pagination.page}/{pagination.totalPages}
                </span>
                <button
                  aria-label="Next products page"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-canvas text-text-secondary shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPage(pagination.page + 1)}
                  type="button"
                >
                  <Icon name="chevron_right" className="text-[18px]" />
                </button>
              </div>
            </div>
          )}
          {filteredItems.length === 0 && (
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
                    setChip('all');
                  }}
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>
          </>
        )}
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
              { icon: 'visibility', iconClass: 'text-primary', label: 'View Details' },
              { icon: 'content_copy', iconClass: 'text-secondary', label: 'Copy Public URL' },
              { icon: 'qr_code_2', iconClass: 'text-secondary', label: 'View QR Code' },
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
                  const sheetCard = sheetKey ? allItems.find((item) => item.key === sheetKey) : undefined;
                  if (action.label === 'View Details') {
                    setSheetItem(null);
                    if (sheetCard) openCardDetails(sheetCard);
                  } else if (action.label === 'Copy Public URL') {
                    setSheetItem(null);
                    if (sheetCard) void copyCardUrl(sheetCard);
                  } else if (action.label === 'View QR Code') {
                    setSheetItem(null);
                    if (sheetCard) openCardDetails(sheetCard, true);
                  } else if (action.label === 'Manage Location Pricing') {
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
          {/* Product-only rollout: only the product add action is shown. */}
          <button
            className="flex items-center gap-1.5 px-space-sm py-2 rounded-full bg-primary-container text-on-primary-container font-label-md text-label-md font-semibold shadow-md active:scale-95 transition-all"
            type="button"
            onClick={() => setAddMethodsOpen(true)}
          >
            <Icon name="add_circle" className="text-[18px]" />
            <span>+ Add Product</span>
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

      <CatalogProductInfoPanel
        item={detailItem}
        offers={offersQuery.data ?? []}
        branchCount={branches.filter((branch) => branch.id).length}
        initialShowQr={detailShowQr}
        onClose={() => setDetailItem(null)}
        onEdit={editDetailItem}
        onMakeDeal={live && onMakeDeal ? makeDealFromDetail : undefined}
        onNotify={showToast}
      />

      {toast && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[80] bg-inverse-surface text-inverse-on-surface px-space-md py-space-xs rounded-xl shadow-2xl font-label-md text-label-md max-w-[90vw] text-center">
          {toast}
        </div>
      )}
    </AppScreen>
  );
}

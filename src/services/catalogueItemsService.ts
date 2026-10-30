import { api } from './api/client';

/** `GET /catalogue/items` row — money fields may arrive as strings. */
export interface CatalogueItem {
  id: string;
  name: string;
  price?: number | string | null;
  compareAtPrice?: number | string | null;
  shortDescription?: string | null;
  description?: string | null;
  mainImage?: string | null;
  galleryImages?: string[] | null;
  category?: { id: string; name: string } | null;
  categoryId?: string | null;
  status: string;
  /** `product` or `service`. */
  itemType: string;
  sku?: string | null;
  stockQuantity?: number | null;
  minStock?: number | null;
  allowBackOrder?: boolean | null;
  duration?: string | null;
  serviceMode?: string | null;
  isBookable?: boolean | null;
  isSuspended?: boolean | null;
  costPrice?: number | string | null;
  brand?: string | null;
  tags?: string[] | null;
  variants?: ItemVariant[] | null;
  fulfillmentModes?: FulfillmentMode[] | null;
  pricingMode?: 'uniform' | 'per_branch' | null;
  priceType?: string | null;
  bookingRules?: BookingRules | null;
  branches?: { id: string; name?: string | null; isActive?: boolean | null }[] | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

/** One purchasable option of an item: a product size/cut or a service tier. */
export interface ItemVariant {
  id?: string;
  name: string;
  price: number | string;
  compareAtPrice?: number | string | null;
  sku?: string | null;
  stockQuantity?: number | null;
}

export type FulfillmentMode = 'pickup' | 'delivery' | 'dine_in';

/** Service booking settings (`BookingRulesDto`). */
export interface BookingRules {
  bufferMinutes?: number;
  leadMinutes?: number;
  horizonDays?: number;
  capacity?: number;
}

/** Mirrors `CreateCatalogueItemDto` (subset the web sends). `branchId` is required. */
export interface CatalogueItemInput {
  name: string;
  description: string;
  price?: number;
  compareAtPrice?: number;
  costPrice?: number;
  shortDescription?: string;
  mainImage?: string;
  galleryImages?: string[];
  categoryId?: string;
  sku?: string;
  itemType?: 'product' | 'service';
  stockQuantity?: number;
  minStock?: number;
  allowBackOrder?: boolean;
  brand?: string;
  tags?: string[];
  duration?: string;
  serviceMode?: 'location' | 'customer' | 'online' | 'flexible';
  isBookable?: boolean;
  bookingMethod?: 'vemtap' | 'call' | 'whatsapp' | 'external';
  variants?: ItemVariant[];
  fulfillmentModes?: FulfillmentMode[];
  pricingMode?: 'uniform' | 'per_branch';
  priceType?: 'fixed' | 'starting_from';
  bookingRules?: BookingRules;
  branchId: string;
}

export type CatalogueItemUpdate = Partial<CatalogueItemInput> & { status?: string; applyGlobally?: boolean };

const asList = (res: CatalogueItem[] | { data: CatalogueItem[] }) => (Array.isArray(res) ? res : res.data ?? []);

/** One branch's row of `GET/PUT /catalogue/items/:id/branch-pricing`. */
export interface BranchPricingRow {
  branchId: string;
  branchName: string;
  isMainBranch: boolean;
  isAvailable: boolean;
  price: number | string;
  compareAtPrice?: number | string | null;
  stockQuantity?: number | null;
  hasOverride?: boolean;
}

export interface ItemBranchPricing {
  itemId: string;
  pricingMode: 'uniform' | 'per_branch';
  basePrice: number | string;
  baseCompareAtPrice?: number | string | null;
  branches: BranchPricingRow[];
}

export interface SetBranchPricingInput {
  pricingMode: 'uniform' | 'per_branch';
  branches: { branchId: string; isAvailable: boolean; price?: number | null; compareAtPrice?: number | null; stockQuantity?: number | null }[];
}

export const catalogueItemsService = {
  /** Which branches carry an item and, when priced per branch, at what price. */
  branchPricing: (id: string) => api.get<ItemBranchPricing>(`/catalogue/items/${id}/branch-pricing`),
  setBranchPricing: (id: string, input: SetBranchPricingInput) => api.put<ItemBranchPricing>(`/catalogue/items/${id}/branch-pricing`, input),
  /** The API accepts `itemType` but does not apply it, so the type is also filtered here. */
  list: (query: { branchId?: string; itemType?: 'product' | 'service'; limit?: number } = {}) =>
    api
      .get<CatalogueItem[] | { data: CatalogueItem[] }>('/catalogue/items', { params: { ...query } })
      .then(asList)
      .then((items) => (query.itemType ? items.filter((item) => (item.itemType ?? 'product') === query.itemType) : items)),
  create: (input: CatalogueItemInput) => api.post<CatalogueItem>('/catalogue/items', input),
  /** `POST /catalogue/items/bulk` — creates many items at a branch; per-row success / error. */
  bulkCreate: (body: {
    branchId: string;
    items: {
      name: string;
      price: number;
      shortDescription?: string;
      description?: string;
      category?: string;
      stockQuantity?: number;
      sku?: string;
      barcode?: string;
    }[];
  }) =>
    api.post<{ created: number; failed: number; results: { row: number; success: boolean; itemId?: string; error?: string }[] }>(
      '/catalogue/items/bulk',
      body,
    ),
  update: (id: string, input: CatalogueItemUpdate) => api.patch<CatalogueItem>(`/catalogue/items/${id}`, input),
  /** Permanent delete everywhere; the backend needs `applyGlobally` (or a branchId). */
  remove: (id: string) => api.del<unknown>(`/catalogue/items/${id}`, { params: { applyGlobally: true } }),
};

/**
 * Switches an item on at exactly the branches the owner ticked (and off at the
 * rest). New items start at the active branch, so a create that ticked only
 * that branch needs no call; an update always applies the selection.
 */
export async function applyItemBranches(
  itemId: string,
  selected: string[],
  options: { branchIds: string[]; activeBranchId?: string; pricingMode?: 'uniform' | 'per_branch'; isUpdate?: boolean },
) {
  const chosen = selected.filter((id) => options.branchIds.includes(id));
  if (!chosen.length) return;
  const onlyActive = chosen.length === 1 && chosen[0] === options.activeBranchId;
  if (onlyActive && !options.isUpdate) return;
  await catalogueItemsService.setBranchPricing(itemId, {
    pricingMode: options.pricingMode ?? 'uniform',
    branches: options.branchIds.map((branchId) => ({ branchId, isAvailable: chosen.includes(branchId) })),
  });
}

// ---------------------------------------------------------------------------
// Draft → API mapping (shared by the dashboard catalogue and business setup)
// ---------------------------------------------------------------------------

/** "14,000" / "₦14,000" → 14000; undefined when blank or unreadable. */
export const toPrice = (value: string | number | undefined | null) => {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = typeof value === 'number' ? value : Number(String(value).replace(/[^0-9.]/g, ''));
  return Number.isFinite(parsed) ? parsed : undefined;
};

const clean = <T extends Record<string, unknown>>(input: T) =>
  Object.fromEntries(Object.entries(input).filter(([, v]) => v !== undefined && v !== '')) as T;

export interface ProductDraftLike {
  title: string;
  description: string;
  basePrice: string;
  comparePrice: string;
  costPrice: string;
  skuCode?: string;
  sku?: string;
  lowStock: string;
  backorder: boolean;
  producer?: string;
  unbranded?: boolean;
  variants?: Array<{ id?: string; name?: string; cut?: string; price?: string; inventory: string }>;
  variantsEnabled?: boolean;
  /** Uploaded photo URL (live). */
  mainImage?: string;
  /** Only real (UUID) category ids are sent; demo slugs are ignored. */
  categoryId?: string;
  /** How customers can get it (unset on drafts saved before this existed). */
  fulfillment?: { pickup: boolean; delivery: boolean };
  pricingMode?: 'uniform' | 'custom';
  tags?: string[];
  /** Units on hand when there are no variants. */
  stock?: string;
}

/** Variant label "Regular — 300g Cut": name and cut travel together as the API has one name field. */
const VARIANT_SEPARATOR = ' — ';

/** Variants with a name and a price (the API rejects anything less). */
const productVariants = (draft: ProductDraftLike): ItemVariant[] | undefined => {
  if (!draft.variantsEnabled || !draft.variants?.length) return undefined;
  const rows = draft.variants
    .map((variant) => ({
      ...(variant.id ? { id: variant.id } : {}),
      name: [variant.name?.trim(), variant.cut?.trim()].filter(Boolean).join(VARIANT_SEPARATOR),
      price: toPrice(variant.price) as number,
      stockQuantity: toPrice(variant.inventory),
    }))
    .filter((variant) => variant.name && variant.price !== undefined);
  return rows.length ? rows : undefined;
};

const fulfillmentModes = (fulfillment?: { pickup: boolean; delivery: boolean }): FulfillmentMode[] | undefined =>
  fulfillment
    ? ([fulfillment.pickup && 'pickup', fulfillment.delivery && 'delivery'].filter(Boolean) as FulfillmentMode[])
    : undefined;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const apiCategoryId = (id?: string) => (id && UUID.test(id) ? id : undefined);

export function productDraftToInput(draft: ProductDraftLike, branchId: string, extra: { mainImage?: string; categoryId?: string } = {}): CatalogueItemInput {
  const stock = draft.variantsEnabled && draft.variants?.length
    ? draft.variants.reduce((sum, v) => sum + (toPrice(v.inventory) ?? 0), 0)
    : toPrice(draft.stock);
  return clean({
    name: draft.title.trim(),
    // The backend requires a description; fall back to the name.
    description: draft.description.trim() || draft.title.trim(),
    price: toPrice(draft.basePrice),
    compareAtPrice: toPrice(draft.comparePrice),
    costPrice: toPrice(draft.costPrice),
    sku: (draft.skuCode || draft.sku || '').trim() || undefined,
    itemType: 'product' as const,
    stockQuantity: stock,
    minStock: toPrice(draft.lowStock),
    allowBackOrder: draft.backorder,
    brand: draft.unbranded ? undefined : draft.producer?.trim() || undefined,
    mainImage: extra.mainImage ?? draft.mainImage,
    categoryId: extra.categoryId ?? apiCategoryId(draft.categoryId),
    variants: productVariants(draft),
    tags: draft.tags?.length ? draft.tags : undefined,
    fulfillmentModes: fulfillmentModes(draft.fulfillment),
    pricingMode: draft.pricingMode ? (draft.pricingMode === 'custom' ? ('per_branch' as const) : ('uniform' as const)) : undefined,
    branchId,
  });
}

export interface ServiceDraftLike {
  title: string;
  description: string;
  basePrice: string;
  comparePrice: string;
  standardPrice?: string;
  durationMins: number;
  deliveryFormat: 'in-salon' | 'mobile' | 'both';
  skuCode?: string;
  image?: string;
  categoryId?: string;
  bufferMins?: number;
  tiersEnabled?: boolean;
  tiers?: Array<{ id?: string; name: string; duration: string; price: string }>;
  concurrentBookings?: number;
  /** Option labels such as "Same day (2 hrs)" or "24 hrs ahead". */
  leadNotice?: string;
  /** Option labels such as "14 days" or "30 days in advance". */
  bookingHorizon?: string;
}

/** "Same day (2 hrs)" → 120, "24 hrs ahead" → 1440; undefined when it names no hours. */
export const leadNoticeMinutes = (label?: string) => {
  const hours = label?.match(/(\d+)\s*hrs?/i);
  return hours ? Number(hours[1]) * 60 : undefined;
};

/** "30 days in advance" → 30; undefined when it names no days. */
export const horizonDays = (label?: string) => {
  const days = label?.match(/(\d+)\s*days?/i);
  return days ? Number(days[1]) : undefined;
};

const serviceTiers = (draft: ServiceDraftLike): ItemVariant[] | undefined => {
  if (!draft.tiersEnabled || !draft.tiers?.length) return undefined;
  const rows = draft.tiers
    .map((tier) => ({
      ...(tier.id ? { id: tier.id } : {}),
      name: [tier.name.trim(), tier.duration.trim()].filter(Boolean).join(VARIANT_SEPARATOR),
      price: toPrice(tier.price) as number,
    }))
    .filter((tier) => tier.name && tier.price !== undefined);
  return rows.length ? rows : undefined;
};

const SERVICE_MODE: Record<ServiceDraftLike['deliveryFormat'], CatalogueItemInput['serviceMode']> = {
  'in-salon': 'location',
  mobile: 'customer',
  both: 'flexible',
};

export function serviceDraftToInput(draft: ServiceDraftLike, branchId: string, extra: { categoryId?: string } = {}): CatalogueItemInput {
  const image = draft.image && /^https?:\/\//.test(draft.image) ? draft.image : undefined;
  const tiers = serviceTiers(draft);
  const rules = clean({
    bufferMinutes: draft.bufferMins,
    leadMinutes: leadNoticeMinutes(draft.leadNotice),
    horizonDays: horizonDays(draft.bookingHorizon),
    capacity: draft.concurrentBookings,
  }) as BookingRules;
  return clean({
    name: draft.title.trim(),
    description: draft.description.trim() || draft.title.trim(),
    price: toPrice(draft.standardPrice) ?? toPrice(draft.basePrice),
    compareAtPrice: toPrice(draft.comparePrice),
    sku: draft.skuCode?.trim() || undefined,
    itemType: 'service' as const,
    duration: draft.durationMins ? `${draft.durationMins} mins` : undefined,
    serviceMode: SERVICE_MODE[draft.deliveryFormat],
    isBookable: true,
    bookingMethod: 'vemtap' as const,
    mainImage: image,
    categoryId: extra.categoryId ?? apiCategoryId(draft.categoryId),
    variants: tiers,
    priceType: tiers ? ('starting_from' as const) : ('fixed' as const),
    bookingRules: Object.keys(rules).length ? rules : undefined,
    branchId,
  });
}

// ---------------------------------------------------------------------------
// API → draft (editing a saved item in the same forms that created it)
// ---------------------------------------------------------------------------

/** The option labels the service forms offer (both layouts). */
const LEAD_NOTICE_LABELS = ['Same day (2 hrs)', '12 hrs ahead', '24 hrs ahead'];
const HORIZON_LABELS = ['14 days', '30 days in advance', '60 days'];

const money = (value: number | string | null | undefined) => {
  const amount = toPrice(value ?? undefined);
  return amount === undefined ? '' : amount.toLocaleString('en-US');
};

const splitVariantName = (name: string) => {
  const [first, ...rest] = name.split(VARIANT_SEPARATOR);
  return { name: first, detail: rest.join(VARIANT_SEPARATOR) };
};

const soldAt = (item: CatalogueItem) =>
  (item.branches ?? []).filter((branch) => branch.isActive !== false).map((branch) => branch.id);

/** A saved product as product-form fields; merge onto a blank draft. */
export function itemToProductDraft(item: CatalogueItem) {
  const variants = (item.variants ?? []).map((variant, index) => {
    const label = splitVariantName(variant.name);
    return {
      id: variant.id ?? `variant-${index + 1}`,
      name: label.name,
      cut: label.detail,
      price: money(variant.price),
      inventory: variant.stockQuantity != null ? String(variant.stockQuantity) : '',
    };
  });
  const modes = item.fulfillmentModes ?? null;
  return {
    publishedItemId: item.id,
    title: item.name,
    description: item.description ?? '',
    mainImage: item.mainImage ?? undefined,
    categoryId: item.categoryId ?? item.category?.id ?? undefined,
    primaryCategory: item.category?.name ?? '',
    producer: item.brand ?? '',
    unbranded: !item.brand,
    basePrice: money(item.price),
    comparePrice: money(item.compareAtPrice),
    costPrice: money(item.costPrice),
    sku: item.sku ?? '',
    skuCode: item.sku ?? '',
    lowStock: item.minStock != null ? String(item.minStock) : '',
    backorder: Boolean(item.allowBackOrder),
    variantsEnabled: variants.length > 0,
    variants,
    tags: item.tags ?? [],
    stock: variants.length === 0 && item.stockQuantity != null ? String(item.stockQuantity) : '',
    branches: Object.fromEntries(soldAt(item).map((id) => [id, true])),
    pricingMode: item.pricingMode === 'per_branch' ? ('custom' as const) : ('uniform' as const),
    ...(modes ? { fulfillment: { pickup: modes.includes('pickup'), delivery: modes.includes('delivery') } } : {}),
  };
}

/** A saved service as service-form fields; merge onto a blank draft. */
export function itemToServiceDraft(item: CatalogueItem) {
  const tiers = (item.variants ?? []).map((variant, index) => {
    const label = splitVariantName(variant.name);
    return { id: variant.id ?? `tier-${index + 1}`, name: label.name, duration: label.detail, price: money(variant.price), note: '' };
  });
  const rules = item.bookingRules ?? {};
  const minutes = item.duration?.match(/(\d+)/);
  const locations = soldAt(item);
  return {
    publishedItemId: item.id,
    title: item.name,
    description: item.description ?? '',
    image: item.mainImage ?? '',
    categoryId: item.categoryId ?? item.category?.id ?? undefined,
    primaryCategory: item.category?.name ?? '',
    basePrice: money(item.price),
    standardPrice: money(item.price),
    comparePrice: money(item.compareAtPrice),
    skuCode: item.sku ?? '',
    deliveryFormat: (item.serviceMode === 'customer' ? 'mobile' : item.serviceMode === 'flexible' ? 'both' : 'in-salon') as
      | 'in-salon'
      | 'mobile'
      | 'both',
    ...(minutes ? { durationMins: Number(minutes[1]) } : {}),
    tiersEnabled: tiers.length > 0,
    tiers,
    ...(locations.length ? { locations } : {}),
    ...(rules.bufferMinutes != null ? { bufferMins: rules.bufferMinutes } : {}),
    ...(rules.capacity != null ? { concurrentBookings: rules.capacity } : {}),
    ...(rules.leadMinutes != null
      ? { leadNotice: LEAD_NOTICE_LABELS.find((label) => leadNoticeMinutes(label) === rules.leadMinutes) ?? LEAD_NOTICE_LABELS[0] }
      : {}),
    ...(rules.horizonDays != null
      ? { bookingHorizon: HORIZON_LABELS.find((label) => horizonDays(label) === rules.horizonDays) ?? HORIZON_LABELS[1] }
      : {}),
  };
}
